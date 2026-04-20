import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Exam } from '../../types';
import { 
  Plus, 
  Calendar, 
  Clock, 
  BookOpen, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  Loader2,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';

const ExamManagement = () => {
  const { profile } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState(60);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const query = supabase.from('exams').select('*');
      if (profile?.role === 'guru') {
        query.eq('created_by', profile.id);
      }
      const { data } = await query;
      if (data) setExams(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const { error } = await supabase.from('exams').insert({
        title,
        description,
        subject,
        duration,
        start_time: startTime,
        end_time: endTime,
        created_by: profile.id
      });

      if (error) throw error;
      setIsModalOpen(false);
      fetchExams();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus ujian ini? Semua soal terkait akan tetap ada di bank soal (jika unlinked) namun ujian ini tidak bisa lagi diakses.')) return;
    await supabase.from('exams').delete().eq('id', id);
    fetchExams();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Manajemen Ujian</h1>
          <p className="text-xs text-slate-500">Jadwalkan dan kelola ujian sekolah secara real-time.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-primary-dark transition-all shadow-sm shadow-primary/20 uppercase tracking-widest"
        >
          <Plus size={16} /> Buat Ujian Baru
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin inline text-primary" size={24} /></div>
        ) : exams.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 italic text-xs">Belum ada ujian terjadwal.</div>
        ) : (
          exams.map((exam) => (
            <div key={exam.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-primary text-[9px] font-bold uppercase tracking-[0.15em] rounded">
                    {exam.subject}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-slate-400 hover:text-blue-600 transition-colors"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(exam.id)} className="text-slate-400 hover:text-primary transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">{exam.title}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 mb-6 font-medium leading-relaxed">{exam.description || 'Tidak ada deskripsi ujian.'}</p>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <Clock size={12} className="text-slate-400" />
                  <span>{exam.duration} Menit</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <CalendarDays size={12} className="text-slate-400" />
                  <span className="truncate">Mulai: {new Date(exam.start_time).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Basic modal for creation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-slate-200 shadow-2xl flex flex-col"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-base uppercase tracking-tight">Buat Ujian Baru</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateExam} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Judul Ujian</label>
                  <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Mata Pelajaran</label>
                  <input required value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="TKJ, DKV, etc." />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Deskripsi</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Durasi (Menit)</label>
                  <input type="number" required value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Waktu Mulai</label>
                  <input type="datetime-local" required value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Waktu Berakhir</label>
                <input type="datetime-local" required value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest mt-4 shadow-sm shadow-primary/20 active:scale-95 transition-all"
              >
                Publish Ujian
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ExamManagement;
