import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Exam, ExamAttempt, Profile } from '../../types';
import { 
  Search, 
  Download, 
  Filter, 
  FileCheck, 
  User, 
  Loader2,
  Trophy
} from 'lucide-react';

const ResultRecap = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [attempts, setAttempts] = useState<(ExamAttempt & { profiles: Profile })[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchResults(selectedExamId);
    }
  }, [selectedExamId]);

  const fetchExams = async () => {
    const { data } = await supabase.from('exams').select('*');
    if (data) setExams(data);
  };

  const fetchResults = async (examId: string) => {
    setLoading(true);
    // Join with profiles
    const { data, error } = await supabase
      .from('exam_attempts')
      .select('*, profiles(*)')
      .eq('exam_id', examId)
      .eq('status', 'submitted');
    
    if (data) setAttempts(data as any);
    setLoading(false);
  };

  const filteredResults = attempts.filter(a => 
    a.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.profiles?.nis?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold italic">Rekap Hasil Ujian</h1>
          <p className="text-slate-500">Lihat dan unduh data nilai siswa.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-600 font-bold flex items-center gap-2 hover:bg-slate-50 transition-all">
            <Download size={18} /> Export Excel
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Daftar Ujian</h3>
          <div className="space-y-2">
            {exams.map(exam => (
              <button
                key={exam.id}
                onClick={() => setSelectedExamId(exam.id)}
                className={`w-full text-left px-5 py-4 rounded-2xl border transition-all ${
                  selectedExamId === exam.id 
                    ? "bg-slate-900 border-slate-900 text-white font-bold shadow-md ring-4 ring-slate-100"
                    : "bg-white border-slate-100 text-slate-600 hover:border-slate-300 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                   <div className={`w-2 h-2 rounded-full ${selectedExamId === exam.id ? 'bg-primary' : 'bg-slate-200'}`}></div>
                   <p className="text-[10px] font-bold uppercase tracking-tighter opacity-70">{exam.subject}</p>
                </div>
                <div className="text-sm truncate">{exam.title}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {!selectedExamId ? (
            <div className="h-64 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 text-slate-400 italic shadow-sm">
              <FileCheck size={48} className="mb-4 opacity-10" />
              Pilih ujian untuk melihat rekap nilai.
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Cari Siswa..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredResults.length} Siswa Mengerjakan</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Siswa</th>
                      <th className="px-6 py-4">Selesai Pada</th>
                      <th className="px-6 py-4 text-right">Skor Akhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {loading ? (
                      <tr><td colSpan={3} className="p-12 text-center"><Loader2 className="animate-spin inline" /></td></tr>
                    ) : filteredResults.length === 0 ? (
                      <tr><td colSpan={3} className="p-12 text-center text-slate-400 italic">Belum ada data nilai.</td></tr>
                    ) : (
                      filteredResults.map(a => (
                        <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">{a.profiles?.full_name?.[0]}</div>
                              <div>
                                <p className="font-bold text-slate-700">{a.profiles?.full_name}</p>
                                <p className="text-[10px] text-slate-400 font-mono italic uppercase">{a.profiles?.nis} - {a.profiles?.kelas}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 italic">
                            {a.end_time ? new Date(a.end_time).toLocaleString('id-ID') : '-'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`px-4 py-2 rounded-2xl font-bold text-lg ${
                              (a.score || 0) >= 75 ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-primary border border-red-100"
                            }`}>
                              {a.score?.toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultRecap;
