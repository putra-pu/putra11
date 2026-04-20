import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Exam, ExamAttempt } from '../../types';
import { useNavigate, Link } from 'react-router-dom';
import { Clock, Calendar, ChevronRight, CheckCircle2, History, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ExamList = () => {
  const { profile } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExamsAndAttempts();
  }, [profile]);

  const fetchExamsAndAttempts = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      // Fetch available exams
      const { data: examData } = await supabase.from('exams').select('*').order('start_time', { ascending: true });
      if (examData) setExams(examData);

      // Fetch student attempts
      const { data: attemptData } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('student_id', profile.id);
      if (attemptData) setAttempts(attemptData);
    } finally {
      setLoading(false);
    }
  };

  const isAttempted = (examId: string) => attempts.find(a => a.exam_id === examId && a.status === 'submitted');
  const isOngoing = (examId: string) => attempts.find(a => a.exam_id === examId && a.status === 'ongoing');

  const canTake = (exam: Exam) => {
    const now = new Date();
    const start = new Date(exam.start_time);
    const end = new Date(exam.end_time);
    return now >= start && now <= end && !isAttempted(exam.id);
  };

  return (
    <div className="space-y-6 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Daftar Ujian Tersedia</h1>
          <p className="text-xs text-slate-500">Silakan pilih ujian yang ingin dikerjakan sesuai jadwal.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-8 pr-1">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Memuat daftar ujian...</div>
        ) : exams.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center">
            <AlertCircle size={40} className="text-slate-200 mb-3 opacity-50" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Belum ada jadwal ujian</p>
          </div>
        ) : (
          exams.map(exam => {
            const attempted = isAttempted(exam.id);
            const activeAttempt = isOngoing(exam.id);
            const available = canTake(exam);
            const future = new Date() < new Date(exam.start_time);
            const passed = new Date() > new Date(exam.end_time) && !attempted;

            return (
              <div key={exam.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-5 hover:shadow-sm transition-all group">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                  attempted ? 'bg-green-50 border-green-100 text-green-500' : 
                  available ? 'bg-rose-50 border-rose-100 text-primary animate-pulse' : 'bg-slate-50 border-slate-100 text-slate-400'
                }`}>
                  {attempted ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                </div>

                <div className="flex-1 text-center md:text-left min-w-0">
                  <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mb-1.5">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-widest rounded leading-none border border-slate-200">{exam.subject}</span>
                    {attempted && <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[9px] font-bold uppercase tracking-widest rounded leading-none border border-green-200">Selesai</span>}
                    {activeAttempt && <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[9px] font-bold uppercase tracking-widest rounded leading-none border border-blue-200 animate-pulse">Berlangsung</span>}
                    {future && <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[9px] font-bold uppercase tracking-widest rounded leading-none border border-orange-200">Mendatang</span>}
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 truncate uppercase tracking-tight">{exam.title}</h3>
                  <div className="flex items-center justify-center md:justify-start gap-4 mt-1.5 text-slate-400 text-[10px] font-bold tracking-wider uppercase">
                    <span className="flex items-center gap-1.5"><Calendar size={12}/> {new Date(exam.start_time).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                    <span className="flex items-center gap-1.5"><Clock size={12}/> {exam.duration} Menit</span>
                  </div>
                </div>

                <div className="w-full md:w-auto shrink-0">
                  {available || activeAttempt ? (
                    <button
                      onClick={() => navigate(`/take-exam/${exam.id}`)}
                      className="w-full md:w-auto bg-primary text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all active:scale-95 shadow-sm shadow-red-500/10 uppercase tracking-widest"
                    >
                      {activeAttempt ? 'Lanjutkan' : 'Kerjakan'} <ChevronRight size={16} />
                    </button>
                  ) : attempted ? (
                    <Link 
                      to={`/app/exam-results/${attempted.id}`}
                      className="flex flex-col items-center md:items-end group/btn"
                    >
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-0.5">Skor</p>
                      <div className="flex items-baseline gap-1">
                        <p className="text-xl font-black text-green-600 leading-none">{attempted.score?.toFixed(1) || '0.0'}</p>
                        <ChevronRight size={14} className="text-slate-300 group-hover/btn:text-primary transition-colors" />
                      </div>
                    </Link>
                  ) : future ? (
                    <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px] bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">Mendatang</div>
                  ) : (
                    <div className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">Ujian Berakhir</div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExamList;
