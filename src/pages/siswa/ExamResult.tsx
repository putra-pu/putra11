import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { ExamAttempt, Exam } from '../../types';
import { Trophy, CheckCircle2, XCircle, ArrowRight, History, Calendar, Clock, Loader2, ClipboardX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface AttemptWithExam extends ExamAttempt {
  exams: Exam;
}

const ExamResult = () => {
  const { profile } = useAuth();
  const [attempts, setAttempts] = useState<AttemptWithExam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttempts();
  }, [profile]);

  const fetchAttempts = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exam_attempts')
        .select('*, exams (*)')
        .eq('student_id', profile.id)
        .eq('status', 'submitted')
        .order('end_time', { ascending: false });
      
      if (data) setAttempts(data as any);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Riwayat Ujian</h1>
          <p className="text-xs text-slate-500">Lihat pencapaian dan analisis hasil ujian kamu.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pb-8">
        {/* Banner Section */}
        <div className="bg-primary p-6 rounded-2xl text-white flex flex-col md:flex-row items-center gap-6 shadow-lg shadow-rose-600/10 relative overflow-hidden shrink-0">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 animate-bounce">
            <Trophy size={32} />
          </div>
          <div>
             <h2 className="text-lg font-bold mb-1 uppercase tracking-tight">Evaluasi Belajar Mandiri</h2>
             <p className="text-white/80 text-[11px] max-w-lg leading-relaxed font-medium">Nilai ujian adalah cerminan dari usahamu. Analisis jawaban kamu untuk mengetahui bagian mana yang perlu diperbaiki.</p>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 -rotate-45 translate-x-20 -translate-y-20 rounded-full"></div>
        </div>

        {loading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin text-primary mx-auto" /></div>
        ) : attempts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-xl border-2 border-dashed border-slate-200">
             <ClipboardX size={48} className="text-slate-200 mx-auto mb-4" />
             <p className="text-slate-400 font-bold text-sm">Belum ada riwayat ujian.</p>
             <Link to="/app/exams" className="text-primary font-bold text-xs hover:underline mt-4 inline-block uppercase tracking-widest">Mulai Ujian Sekarang</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attempts.map((attempt, i) => (
              <motion.div
                key={attempt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-primary text-[9px] font-bold uppercase tracking-[0.15em] rounded">
                      {attempt.exams.subject}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {new Date(attempt.end_time!).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 leading-tight mb-2 group-hover:text-primary transition-colors">
                    {attempt.exams.title}
                  </h3>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Skor</span>
                      <span className="text-2xl font-black text-slate-900 leading-tight">{Math.round(attempt.score || 0)}</span>
                    </div>
                    <div className="h-8 w-px bg-slate-100 mx-1"></div>
                    <div className="flex gap-2">
                       <div className="flex flex-col">
                         <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Durasi</span>
                         <span className="text-[11px] font-bold text-slate-700 mt-1">{attempt.exams.duration}m</span>
                       </div>
                    </div>
                  </div>
                </div>

                <Link 
                  to={`/app/exam-results/${attempt.id}`}
                  className="w-full py-2 bg-slate-950 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors uppercase tracking-widest"
                >
                  Detail Jawaban <ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamResult;
