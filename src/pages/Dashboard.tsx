import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ClipboardList,
  Database,
  Loader2,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { tkjQuestions } from '../lib/seedData';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { profile } = useAuth();
  const [seeding, setSeeding] = React.useState(false);
  const [todayAttendance, setTodayAttendance] = React.useState<any>(null);
  const [loadingAttendance, setLoadingAttendance] = React.useState(false);

  React.useEffect(() => {
    if (profile?.id) {
      fetchTodayAttendance();
    }
  }, [profile]);

  const fetchTodayAttendance = async () => {
    if (!profile) return;
    setLoadingAttendance(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', profile.id)
        .eq('date', today)
        .single();
      
      if (data) setTodayAttendance(data);
    } catch (err) {
      console.error('Error fetching dashboard attendance:', err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const seedExamData = async () => {
    if (seeding) return;
    setSeeding(true);
    try {
      // 1. Create Exam
      const { data: exam, error: examError } = await supabase.from('exams').insert({
        title: 'Ujian Dasar Teknik Komputer & Jaringan (TKJ)',
        description: 'Ujian kompetensi dasar untuk mengukur pemahaman siswa tentang hardware, software, dan networking.',
        subject: 'TKJ',
        duration: 45,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        created_by: profile?.id
      }).select().single();

      if (examError) throw examError;

      // 2. Create Questions
      const questionsToInsert = tkjQuestions.map(q => ({
        ...q,
        exam_id: exam.id,
        points: 10
      }));

      const { error: qError } = await supabase.from('questions').insert(questionsToInsert);
      if (qError) throw qError;

      alert('Berhasil membuat ujian contoh dengan 30 soal!');
    } catch (err: any) {
      alert('Gagal membuat ujian contoh: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  const adminStats = [
    { label: 'Total Siswa', value: '1,240', icon: <Users />, color: 'blue' },
    { label: 'Total Guru', value: '45', icon: <GraduationCap />, color: 'purple' },
    { label: 'Ujian Aktif', value: '12', icon: <Calendar />, color: 'red' },
    { label: 'Selesai Hari Ini', value: '320', icon: <CheckCircle2 />, color: 'green' },
  ];

  const guruStats = [
    { label: 'Bank Soal', value: '1,502', icon: <BookOpen />, color: 'blue' },
    { label: 'Ujian Saya', value: '8', icon: <ClipboardList />, color: 'red' },
    { label: 'Koreksi Menunggu', value: '14', icon: <Clock />, color: 'orange' },
  ];

  const siswaStats = [
    { label: 'Tersedia', value: '3', icon: <Calendar />, color: 'red' },
    { label: 'Selesai', value: '12', icon: <CheckCircle2 />, color: 'green' },
    { label: 'Rata-rata Nilai', value: '88.5', icon: <ArrowUpRight />, color: 'blue' },
  ];

  const stats = profile?.role === 'admin' ? adminStats : profile?.role === 'guru' ? guruStats : siswaStats;

  return (
    <div className="space-y-6 flex flex-col h-full overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Halo, {profile?.full_name}! 👋</h1>
          <p className="text-xs text-slate-500">Berikut ringkasan aktivitas {profile?.role} sistem saat ini.</p>
        </div>
        <div className="bg-white px-3 py-1.5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          {profile?.role === 'admin' && (
            <button 
              onClick={seedExamData}
              disabled={seeding}
              className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors border-r border-slate-100 pr-4"
            >
              {seeding ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
              <span className="text-[10px] font-bold uppercase tracking-widest">Generate 30 Soal TKJ</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Sistem Berjalan Normal</span>
          </div>
        </div>
      </div>

      {/* Attendance Quick Action Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 shrink-0">
        <Link 
          to={profile?.role === 'siswa' ? '/app/attendance' : '/app/attendance-recap'}
          className={cn(
            "p-6 rounded-2xl border transition-all flex items-center justify-between group shadow-sm",
            profile?.role === 'siswa' 
              ? (todayAttendance ? "bg-green-50 border-green-100" : "bg-primary text-white border-primary shadow-lg shadow-rose-600/20")
              : "bg-white border-slate-200 hover:border-slate-300"
          )}
        >
          <div className="flex items-center gap-5">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shadow-inner",
              profile?.role === 'siswa' 
                ? (todayAttendance ? "bg-green-500 text-white" : "bg-white/20 text-white")
                : "bg-slate-100 text-primary"
            )}>
              <UserCheck size={28} />
            </div>
            <div>
              <h3 className={cn(
                "text-sm font-bold uppercase tracking-widest",
                profile?.role === 'siswa' && !todayAttendance ? "text-white" : "text-slate-800"
              )}>
                {profile?.role === 'siswa' 
                  ? (todayAttendance ? "Sudah Absen" : "Belum Absen") 
                  : "Rekap Absensi Siswa"}
              </h3>
              <p className={cn(
                "text-[10px] font-bold uppercase tracking-tight opacity-70",
                profile?.role === 'siswa' && !todayAttendance ? "text-white/80" : "text-slate-500"
              )}>
                {profile?.role === 'siswa' 
                  ? (todayAttendance ? `Jam Masuk: ${todayAttendance.time_in}` : "Klik di sini untuk absen hari ini") 
                  : "Monitor kehadiran harian siswa hari ini"}
              </p>
            </div>
          </div>
          <ChevronRight size={24} className={cn(
            "transition-transform group-hover:translate-x-1",
            profile?.role === 'siswa' && !todayAttendance ? "text-white/50" : "text-slate-300"
          )} />
        </Link>

        {/* Exam Notification / Recap */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
              <ClipboardList size={28} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
                {profile?.role === 'siswa' ? "Jadwal Ujian" : "Monitoring Ujian"}
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                {profile?.role === 'siswa' ? "Cek daftar ujian yang harus dikerjakan" : "Pantau statistik pengerjaan ujian siswa"}
              </p>
            </div>
          </div>
          <Link to={profile?.role === 'siswa' ? '/app/exams' : '/app/exam-management'} className="p-2 text-slate-400 hover:text-primary transition-colors">
            <ArrowUpRight size={24} />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden"
          >
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={cn(
              "text-2xl font-bold text-slate-900 leading-none",
              stat.color === 'red' && "text-primary"
            )}>{stat.value}</p>
            
            <div className={cn(
              "mt-3 text-[10px] font-bold px-2 py-0.5 rounded w-fit capitalize invisible sm:visible",
              stat.color === 'red' ? 'bg-rose-50 text-rose-600' :
              stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
              stat.color === 'purple' ? 'bg-purple-50 text-purple-600' :
              stat.color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
            )}>
              {stat.label.split(' ')[0]} Terkini
            </div>
            
            <div className={`absolute -bottom-4 -right-4 w-16 h-16 opacity-5 rotate-12 ${
               stat.color === 'red' ? 'text-rose-600' :
               stat.color === 'blue' ? 'text-blue-600' :
               stat.color === 'purple' ? 'text-purple-600' :
               stat.color === 'orange' ? 'text-orange-600' : 'text-green-600'
            }`}>
              {stat.icon}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex-1 grid lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Main Content Area (Role Specific News/Activity) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Pengumuman Terbaru</h3>
            <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">Lihat Semua</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {[
              { date: '21 Apr', title: 'Pelaksanaan Ujian Akhir Semester Genap', category: 'Akademik' },
              { date: '18 Apr', title: 'Pemeliharaan Server Database Jam 22:00', category: 'IT Support' },
              { date: '15 Apr', title: 'Update Kisi-kisi Ujian Kejuruan TKJ', category: 'Ujian' },
              { date: '12 Apr', title: 'Workshop Guru Pembimbing Industri', category: 'Guru' },
            ].map((news, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-slate-100 hover:border-slate-200 group">
                <div className="w-12 h-12 bg-slate-50 group-hover:bg-white rounded border border-slate-100 flex flex-col items-center justify-center text-slate-400 flex-shrink-0">
                  <span className="text-[10px] font-bold uppercase leading-none mb-1">{news.date.split(' ')[1]}</span>
                  <span className="text-sm font-bold text-slate-800 leading-none">{news.date.split(' ')[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest leading-none">{news.category}</span>
                  <h3 className="text-xs font-bold text-slate-800 leading-tight truncate mt-0.5">{news.title}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 italic truncate">Detail pengumuman akademik sekolah...</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4 overflow-hidden">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-1 border-b border-slate-50 pb-2">Profile Jurusan</h3>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {[
              { name: 'TKJ', students: 340, desc: 'Teknik Komputer & Jaringan: Networking, Server & Cybersecurity.' },
              { name: 'DKV', students: 210, desc: 'Desain Komunikasi Visual: Multimedia & Ilustrasi.' },
              { name: 'AK / BC', students: 420, desc: 'Akuntansi & Broadcasting: Keuangan & Produksi Media.' },
              { name: 'MPLB / BD', students: 278, desc: 'Manajemen Perkantoran & Bisnis Digital.' },
            ].map((j, i) => (
              <div key={i} className={cn(
                "p-3 rounded-lg border transition-all",
                i === 0 ? "bg-rose-50 border-rose-100 shadow-xs" : "bg-slate-50 border-slate-200"
              )}>
                <div className="flex justify-between items-center mb-1">
                  <span className={cn("text-xs font-bold", i === 0 ? "text-rose-700" : "text-slate-800")}>{j.name}</span>
                  <span className={cn("text-[10px]", i === 0 ? "text-rose-500" : "text-slate-500")}>{j.students} Siswa</span>
                </div>
                <p className={cn("text-[10px] leading-tight", i === 0 ? "text-rose-600/80" : "text-slate-500")}>{j.desc}</p>
              </div>
            ))}
          </div>
          <button className="w-full py-2.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-slate-800 transition-colors uppercase mt-auto tracking-widest shadow-sm">
            Lihat Detail Sekolah
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
