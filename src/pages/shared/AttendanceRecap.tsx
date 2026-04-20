import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  UserCheck, 
  Search, 
  Download, 
  Filter,
  Loader2,
  Calendar
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface AttendanceWithProfile {
  id: string;
  date: string;
  time_in: string;
  status: string;
  profiles: {
    full_name: string;
    kelas: string;
    nis: string;
  };
}

const AttendanceRecap = () => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AttendanceWithProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    late: 0,
    absent: 0
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      // 1. Get all students count
      const { count: studentCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'siswa');

      // 2. Get today's records
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('attendance')
        .select('*, profiles(full_name, kelas, nis)')
        .order('date', { ascending: false })
        .order('time_in', { ascending: false });

      if (data) {
        setRecords(data as any);
        
        // Calculate stats for today
        const todayRecords = data.filter((r: any) => r.date === today);
        const present = todayRecords.filter((r: any) => r.status === 'present').length;
        const late = todayRecords.filter((r: any) => r.status === 'late').length;
        const totalSiswa = studentCount || 0;
        
        setStats({
          total: totalSiswa,
          present,
          late,
          absent: Math.max(0, totalSiswa - (present + late))
        });
      }
    } catch (err) {
      console.error('Error fetching records:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(r => 
    r.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.profiles?.kelas?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.profiles?.nis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 flex flex-col h-full overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Dashboard & Rekap Absensi</h1>
          <p className="text-xs text-slate-500">Monitor kehadiran siswa SMK Prima Unggul secara real-time.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchRecords}
            className="bg-white px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all"
          >
            <Loader2 size={14} className={cn(loading && "animate-spin")} /> Refresh Data
          </button>
          <button className="bg-slate-900 border-slate-900 text-white px-3 py-2 rounded-lg border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all">
            <Download size={14} /> Export XLS
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Siswa</p>
          <div className="flex items-end justify-between">
            <h4 className="text-2xl font-black text-slate-900 leading-none">{stats.total}</h4>
            <span className="text-[10px] font-bold text-slate-400">SISWA</span>
          </div>
        </div>
        <div className="bg-green-50 p-5 rounded-2xl border border-green-100 shadow-sm shadow-green-500/5">
          <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Hadir Tepat Waktu</p>
          <div className="flex items-end justify-between">
            <h4 className="text-2xl font-black text-green-700 leading-none">{stats.present}</h4>
            <span className="text-[10px] font-bold text-green-600">{Math.round((stats.present / (stats.total || 1)) * 100)}%</span>
          </div>
        </div>
        <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 shadow-sm shadow-orange-500/5">
          <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1">Siswa Terlambat</p>
          <div className="flex items-end justify-between">
            <h4 className="text-2xl font-black text-orange-700 leading-none">{stats.late}</h4>
            <span className="text-[10px] font-bold text-orange-600">{Math.round((stats.late / (stats.total || 1)) * 100)}%</span>
          </div>
        </div>
        <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 shadow-sm shadow-rose-500/5">
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-1">Belum Absen</p>
          <div className="flex items-end justify-between">
            <h4 className="text-2xl font-black text-rose-700 leading-none">{stats.absent}</h4>
            <span className="text-[10px] font-bold text-rose-600">{Math.round((stats.absent / (stats.total || 1)) * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden flex-1">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 bg-slate-50/30">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari Nama, NIS, atau Kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50">
            <Filter size={14} /> Filter Tanggal
          </button>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Tanggal</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Siswa</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Kelas</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Jam Masuk</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="animate-spin inline-block mr-2" size={16} /> Memuat data...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Tidak ada data absensi ditemukan.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-300" />
                        <span className="text-xs font-bold text-slate-700">{new Date(record.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900">{record.profiles.full_name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">NIS: {record.profiles.nis || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100">{record.profiles.kelas || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar size={14} className="opacity-30" />
                        <span className="text-xs font-mono font-bold tracking-tight">{record.time_in}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest border",
                        record.status === 'present' ? "bg-green-50 text-green-700 border-green-100" :
                        record.status === 'late' ? "bg-orange-50 text-orange-700 border-orange-100" :
                        record.status === 'sick' ? "bg-amber-50 text-amber-700 border-amber-100" :
                        record.status === 'excused' ? "bg-blue-50 text-blue-700 border-blue-100" :
                        "bg-rose-50 text-primary border-rose-100"
                      )}>
                        {record.status === 'present' ? 'Hadir' : 
                         record.status === 'late' ? 'Terlambat' : 
                         record.status === 'sick' ? 'Sakit' : 
                         record.status === 'excused' ? 'Izin' : 'Absen'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceRecap;
