import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Exam, Question, ExamAttempt, ExamResponse } from '../../types';
import { 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  ArrowLeft, 
  Clock, 
  BookOpen,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface QuestionWithResponse extends Question {
  selected_option?: string;
  is_correct?: boolean;
}

const ExamDetailResult = () => {
  const { attemptId } = useParams();
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<QuestionWithResponse[]>([]);
  const [stats, setStats] = useState({ correct: 0, wrong: 0, unanswered: 0 });

  useEffect(() => {
    fetchResultDetail();
  }, [attemptId]);

  const fetchResultDetail = async () => {
    if (!attemptId) return;
    setLoading(true);
    try {
      const { data: attemptData, error: attemptError } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('id', attemptId)
        .single();
      
      if (attemptError) throw attemptError;
      setAttempt(attemptData);

      const { data: examData } = await supabase
        .from('exams')
        .select('*')
        .eq('id', attemptData.exam_id)
        .single();
      setExam(examData);

      const { data: qData } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', attemptData.exam_id);
      
      const { data: rData } = await supabase
        .from('exam_responses')
        .select('*')
        .eq('attempt_id', attemptId);

      if (qData) {
        let correct = 0;
        let wrong = 0;
        let unanswered = 0;

        const combined: QuestionWithResponse[] = qData.map(q => {
          const resp = rData?.find(r => r.question_id === q.id);
          const isCorrect = resp ? resp.selected_option === q.correct_answer : false;
          
          if (!resp) unanswered++;
          else if (isCorrect) correct++;
          else wrong++;

          return {
            ...q,
            selected_option: resp?.selected_option,
            is_correct: isCorrect
          };
        });

        setQuestions(combined);
        setStats({ correct, wrong, unanswered });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center h-full"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!attempt || !exam) return <div className="p-8 text-center text-xs font-bold uppercase text-slate-400">Data hasil tidak ditemukan.</div>;

  return (
    <div className="space-y-6 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <Link to="/app/exam-results" className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors font-bold text-[10px] uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
          <ArrowLeft size={14} /> Kembali ke Riwayat
        </Link>
      </div>

      <div className="flex-1 grid lg:grid-cols-4 gap-6 overflow-hidden">
        {/* Score Summary Card */}
        <div className="lg:col-span-1 space-y-4 flex flex-col overflow-hidden">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col shrink-0">
            <div className="bg-primary p-6 text-white text-center relative overflow-hidden">
              <div className="relative z-10">
                <Trophy size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-white/60 text-[9px] font-bold uppercase tracking-[0.2em] mb-1">Skor Akhir</p>
                <h2 className="text-5xl font-black mb-1">{Math.round(attempt.score || 0)}</h2>
                <div className="h-0.5 w-12 bg-white/20 mx-auto rounded-full"></div>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 -rotate-45 translate-x-8 -translate-y-8 rounded-full"></div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 p-3 rounded-lg border border-green-100 flex flex-col items-center">
                  <span className="text-lg font-black text-green-700 leading-none">{stats.correct}</span>
                  <span className="text-[8px] font-bold text-green-600 uppercase tracking-widest mt-1">Benar</span>
                </div>
                <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 flex flex-col items-center">
                  <span className="text-lg font-black text-primary leading-none">{stats.wrong}</span>
                  <span className="text-[8px] font-bold text-rose-600 uppercase tracking-widest mt-1">Salah</span>
                </div>
              </div>
              
              <div className="space-y-3 pt-3 border-t border-slate-50">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Durasi</span>
                  <span className="text-slate-800 font-bold">{exam.duration}m</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Pelajaran</span>
                  <span className="text-primary font-bold uppercase">{exam.subject}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 flex-1 overflow-hidden">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Status Capaian</h3>
            <div className="flex-1 overflow-y-auto pr-1">
               <p className="text-xs font-semibold text-slate-700 leading-relaxed italic">
                 "{attempt.score && attempt.score >= 75 ? 'Hasil yang luar biasa! Pertahankan konsistensi belajarmu.' : 'Jangan menyerah. Analisis kembali jawaban yang salah dan pelajari materinya lagi.'}"
               </p>
            </div>
          </div>
        </div>

        {/* Question Breakdown List */}
        <div className="lg:col-span-3 flex flex-col overflow-hidden">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
             <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
               <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight">Analisis Setiap Jawaban</h3>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-3 pr-2">
                {questions.map((q, idx) => (
                  <div key={q.id} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50/30 transition-all group">
                    <div className="flex gap-4">
                       <span className="w-7 h-7 rounded bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 border border-slate-200">
                         {idx + 1}
                       </span>
                       <div className="flex-1 space-y-4 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <p className="font-bold text-slate-800 text-sm leading-relaxed">{q.question_text}</p>
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-[0.2em] shrink-0 w-fit h-fit border",
                              q.is_correct ? "bg-green-50 border-green-200 text-green-700" : "bg-rose-50 border-rose-200 text-primary"
                            )}>
                              {q.is_correct ? "BENAR" : "SALAH"}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                             {Object.entries(q.options).map(([key, value]) => {
                               const isCorrect = q.correct_answer === key;
                               const isSelected = q.selected_option === key;
                               return (
                                 <div key={key} className={cn(
                                   "px-3 py-2 rounded-lg border text-[11px] font-medium transition-all flex items-center gap-3",
                                   isCorrect ? "bg-green-50 border-green-200 text-green-700 shadow-xs" : 
                                   isSelected ? "bg-rose-50 border-rose-200 text-primary" : "bg-white border-slate-100 text-slate-400"
                                 )}>
                                   <div className={cn(
                                     "w-5 h-5 rounded flex items-center justify-center shrink-0 font-bold border",
                                     isCorrect ? "bg-green-500 border-green-600 text-white" : 
                                     isSelected ? "bg-primary border-rose-600 text-white" : "bg-slate-50 border-slate-200 text-slate-400"
                                   )}>
                                     {key}
                                   </div>
                                   <span className="truncate">{value}</span>
                                   {isCorrect && <CheckCircle2 size={12} className="ml-auto opacity-70" />}
                                   {!isCorrect && isSelected && <XCircle size={12} className="ml-auto opacity-70" />}
                                 </div>
                               );
                             })}
                          </div>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDetailResult;
