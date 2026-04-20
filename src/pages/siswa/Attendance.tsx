import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  UserCheck, 
  Clock, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  time_in: string;
  status: 'present' | 'late' | 'absent' | 'excused' | 'sick';
  notes?: string;
  location?: string;
}

const Attendance = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nameNote, setNameNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'present' | 'excused' | 'sick'>('present');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchAttendanceData();
    return () => clearInterval(timer);
  }, [profile]);

  const fetchAttendanceData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch Today's Attendance
      const { data: todayData } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', profile.id)
        .eq('date', today)
        .single();

      if (todayData) setTodayAttendance(todayData);

      // Fetch History
      const { data: historyData } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', profile.id)
        .order('date', { ascending: false })
        .limit(10);
      
      if (historyData) setHistory(historyData);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    if (!profile || submitting) return;
    if (!nameNote.trim()) {
      alert('Silakan tulis nama Anda untuk verifikasi.');
      return;
    }

    setSubmitting(true);
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const timeIn = now.toLocaleTimeString('id-ID', { hour12: false });
      
      let finalStatus: 'present' | 'late' | 'excused' | 'sick' = selectedStatus === 'present' ? 'present' : selectedStatus;
      
      if (selectedStatus === 'present') {
        const hour = now.getHours();
        const minutes = now.getMinutes();
        if (hour > 8 || (hour === 8 && minutes > 0)) {
          finalStatus = 'late';
        }
      }

      const { data, error } = await supabase
        .from('attendance')
        .insert({
          student_id: profile.id,
          date: today,
          time_in: timeIn,
          status: finalStatus,
          notes: nameNote,
          location: 'SMK Prima Unggul'
        })
        .select()
        .single();

      if (error) throw error;
      setTodayAttendance(data);
      setHistory(prev => [data, ...prev]);
      alert('Presensi berhasil dicatat!');
    } catch (err: any) {
      alert('Gagal mencatat presensi: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Presensi Harian</h1>
          <p className="text-xs text-slate-500">Lakukan presensi kehadiran sebelum memulai kegiatan belajar.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Clock In Card */}
        <div className="lg:col-span-1 flex flex-col gap-6 overflow-hidden">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Waktu Sekarang</p>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight tabular-nums">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </h2>
              <p className="text-xs font-bold text-primary uppercase tracking-widest leading-none mt-2">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="w-full pt-6 border-t border-slate-50 space-y-4">
              {!todayAttendance && !loading && (
                <div className="space-y-4 text-left">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Verifikasi Nama</label>
                    <input 
                      type="text" 
                      value={nameNote}
                      onChange={(e) => setNameNote(e.target.value)}
                      placeholder="Tulis nama lengkap Anda..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Keterangan Kehadiran</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'present', label: 'Hadir', color: 'bg-green-500' },
                        { id: 'excused', label: 'Izin', color: 'bg-blue-500' },
                        { id: 'sick', label: 'Sakit', color: 'bg-orange-500' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedStatus(s.id as any)}
                          className={cn(
                            "py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border-2",
                            selectedStatus === s.id 
                              ? `border-${s.color.split('-')[1]}-200 ${s.color} text-white shadow-sm` 
                              : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="animate-spin text-primary" size={24} />
                </div>
              ) : todayAttendance ? (
                <div className={cn(
                  "border rounded-xl p-6 flex flex-col items-center gap-4",
                  todayAttendance.status === 'present' ? "bg-green-50 border-green-100" :
                  todayAttendance.status === 'late' ? "bg-orange-50 border-orange-100" :
                  todayAttendance.status === 'sick' ? "bg-amber-50 border-amber-100" : "bg-blue-50 border-blue-100"
                )}>
                  <div className={cn(
                    "w-12 h-12 text-white rounded-full flex items-center justify-center shadow-lg",
                    todayAttendance.status === 'present' ? "bg-green-500 shadow-green-500/20" :
                    todayAttendance.status === 'late' ? "bg-orange-500 shadow-orange-500/20" :
                    todayAttendance.status === 'sick' ? "bg-amber-500 shadow-amber-500/20" : "bg-blue-500 shadow-blue-500/20"
                  )}>
                    <CheckCircle2 size={28} />
                  </div>
                  <div className="text-center">
                    <p className={cn(
                      "text-[10px] font-bold uppercase tracking-widest mb-1",
                      todayAttendance.status === 'present' ? "text-green-600" :
                      todayAttendance.status === 'late' ? "text-orange-600" :
                      todayAttendance.status === 'sick' ? "text-amber-600" : "text-blue-600"
                    )}>Presensi Tercatat</p>
                    <p className="text-2xl font-black text-slate-900 leading-none">{todayAttendance.time_in}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-2">"{todayAttendance.notes}"</p>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.15em]",
                    todayAttendance.status === 'present' ? "bg-green-100 text-green-700" :
                    todayAttendance.status === 'late' ? "bg-orange-100 text-orange-700" :
                    todayAttendance.status === 'sick' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {todayAttendance.status === 'present' ? 'Tepat Waktu' :
                     todayAttendance.status === 'late' ? 'Terlambat' :
                     todayAttendance.status === 'sick' ? 'Sakit' : 'Izin'}
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleClockIn}
                  disabled={submitting}
                  className="w-full bg-primary hover:bg-primary-dark text-white p-5 rounded-2xl font-black text-sm uppercase tracking-[0.15em] shadow-lg shadow-rose-600/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : <UserCheck size={20} />}
                  Kirim Presensi
                </button>
              )}
            </div>

            <div className="flex flex-col items-center gap-2 pt-2">
               <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[9px] tracking-widest">
                  <MapPin size={12} /> SMK Prima Unggul (Area Sekolah)
               </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 flex items-center gap-2">
              <AlertCircle size={14} /> Aturan Presensi
            </h3>
            <ul className="space-y-2">
              <li className="flex gap-3 text-[10px] items-start">
                <span className="w-4 h-4 bg-slate-100 rounded flex items-center justify-center font-bold text-slate-400 shrink-0 mt-0.5">1</span>
                <span className="text-slate-600 leading-relaxed">Presensi masuk dibuka mulai pukul 06:30 WIB.</span>
              </li>
              <li className="flex gap-3 text-[10px] items-start">
                <span className="w-4 h-4 bg-slate-100 rounded flex items-center justify-center font-bold text-slate-400 shrink-0 mt-0.5">2</span>
                <span className="text-slate-600 leading-relaxed">Dinyatakan terlambat jika melakukan presensi setelah pukul 08:00 WIB.</span>
              </li>
              <li className="flex gap-3 text-[10px] items-start">
                <span className="w-4 h-4 bg-slate-100 rounded flex items-center justify-center font-bold text-slate-400 shrink-0 mt-0.5">3</span>
                <span className="text-slate-600 leading-relaxed">Verifikasi nama wajib diisi sesuai identitas asli.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Attendance History / Summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight">Riwayat Presensi Terbaru</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Calendar size={48} className="text-slate-100 mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Belum ada riwayat kehadiran.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {history.map((record) => (
                  <div key={record.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase tracking-widest border",
                        record.status === 'present' ? "bg-green-50 border-green-100 text-green-600" :
                        record.status === 'late' ? "bg-orange-50 border-orange-100 text-orange-600" :
                        record.status === 'sick' ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-blue-50 border-blue-100 text-blue-600"
                      )}>
                        {record.status === 'present' ? 'H' : 
                         record.status === 'late' ? 'T' : 
                         record.status === 'sick' ? 'S' : 'I'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{new Date(record.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                          <Clock size={10} className="inline mr-1" /> {record.time_in} • {record.notes}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border",
                      record.status === 'present' ? "bg-green-100 border-green-200 text-green-700" :
                      record.status === 'late' ? "bg-orange-100 border-orange-200 text-orange-700" :
                      record.status === 'sick' ? "bg-amber-100 border-amber-200 text-amber-700" : "bg-blue-100 border-blue-200 text-blue-700"
                    )}>
                      {record.status === 'present' ? 'HADIR' : 
                       record.status === 'late' ? 'TERLAMBAT' : 
                       record.status === 'sick' ? 'SAKIT' : 'IZIN'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
