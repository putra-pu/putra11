import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Exam, Question, ExamAttempt } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Clock, 
  Loader2, 
  AlertTriangle,
  MonitorOff,
  Maximize,
  ArrowLeft,
  ClipboardList
} from 'lucide-react';

const ExamTake = () => {
  const { examId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevention mechanism
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    const initExam = async () => {
      if (!profile || !examId) return;
      setLoading(true);

      try {
        // 1. Fetch exam details
        const { data: examData } = await supabase.from('exams').select('*').eq('id', examId).single();
        if (!examData) throw new Error('Ujian tidak ditemukan');
        setExam(examData);

        // 2. Fetch questions
        const { data: questionData } = await supabase.from('questions').select('*').eq('exam_id', examId);
        if (!questionData) throw new Error('Gagal memuat soal');
        setQuestions(questionData);

        // 3. Check or Create attempt
        let currentAttempt: ExamAttempt;
        const { data: attemptList } = await supabase
          .from('exam_attempts')
          .select('*')
          .eq('exam_id', examId)
          .eq('student_id', profile.id);

        if (attemptList && attemptList.length > 0) {
          currentAttempt = attemptList[0] as ExamAttempt;
          if (currentAttempt.status === 'submitted') {
            navigate('/app/exams');
            return;
          }
        } else {
          const { data: newAttempt, error: createError } = await supabase
            .from('exam_attempts')
            .insert({
              exam_id: examId,
              student_id: profile.id,
              status: 'ongoing',
              start_time: new Date().toISOString()
            })
            .select()
            .single();
          
          if (createError) throw createError;
          currentAttempt = newAttempt as ExamAttempt;
        }
        setAttempt(currentAttempt);

        // 4. Fetch existing responses
        const { data: responses } = await supabase
          .from('exam_responses')
          .select('*')
          .eq('attempt_id', currentAttempt.id);
        
        if (responses) {
          const initialAnswers: Record<string, string> = {};
          responses.forEach(r => {
            initialAnswers[r.question_id] = r.selected_option;
          });
          setAnswers(initialAnswers);
        }

        // 5. Setup Timer
        const storedStartTime = localStorage.getItem(`exam_start_${currentAttempt.id}`);
        const startTime = storedStartTime ? new Date(storedStartTime).getTime() : new Date(currentAttempt.start_time).getTime();
        
        if (!storedStartTime) {
          localStorage.setItem(`exam_start_${currentAttempt.id}`, currentAttempt.start_time);
        }

        const durationInSeconds = examData.duration * 60;
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, durationInSeconds - elapsed);
        
        setTimeLeft(remaining);

      } catch (err: any) {
        console.error(err);
        alert('Kesalahan: ' + err.message);
        navigate('/app/exams');
      } finally {
        setLoading(false);
      }
    };

    initExam();
  }, [examId, profile]);

  // Timer loop
  useEffect(() => {
    if (timeLeft <= 0 && !loading && attempt) {
      handleSubmit(true); // Auto-submit when time's up
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, attempt]);

  const handleSelectAnswer = async (questionId: string, option: string) => {
    if (!attempt) return;
    
    // Optimistic update
    setAnswers(prev => ({ ...prev, [questionId]: option }));

    // Persist to DB
    try {
      await supabase.from('exam_responses').upsert({
        attempt_id: attempt.id,
        question_id: questionId,
        selected_option: option
      }, { onConflict: 'attempt_id,question_id' });
    } catch (err) {
      console.error('Failed to save answer:', err);
    }
  };

  const handleSubmit = async (isAuto = false) => {
    if (!attempt || isSubmitting) return;
    if (!isAuto && !window.confirm('Apakah Anda yakin ingin mengakhiri ujian dan mengumpulkan seluruh jawaban?')) return;

    setIsSubmitting(true);
    try {
      // Calculate score
      let correctCount = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correct_answer) {
          correctCount++;
        }
      });
      const score = (correctCount / questions.length) * 100;

      await supabase.from('exam_attempts').update({
        status: 'submitted',
        end_time: new Date().toISOString(),
        score
      }).eq('id', attempt.id);

      localStorage.removeItem(`exam_start_${attempt.id}`);
      navigate(`/app/exam-results/${attempt.id}`);
    } catch (err) {
      alert('Gagal mengirimkan jawaban. Periksa koneksi internet Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" size={48} /></div>;
  if (!exam) return <div>Ujian tidak ditemukan.</div>;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      {/* Exam Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-primary/20">PU</div>
            <div className="border-l border-slate-200 h-6 mx-1"></div>
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-sm leading-none uppercase tracking-tight truncate max-w-[200px] sm:max-w-md">{exam.title}</h1>
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-1">{exam.subject}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className={`px-4 py-1.5 rounded-lg flex items-center gap-2 border shadow-xs ${
            timeLeft < 300 ? "bg-rose-50 border-rose-200 text-primary animate-pulse" : "bg-white border-slate-100 text-slate-600"
          }`}>
            <Clock size={16} className="opacity-70" />
            <span className="font-mono text-base font-bold tabular-nums tracking-tight">{formatTime(timeLeft)}</span>
          </div>
          <button 
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-sm shadow-green-600/20"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <><Send size={14} /> Selesai</>}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Main Section: Questions */}
        <div className="flex-1 overflow-hidden flex flex-col gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white p-6 sm:p-10 rounded-2xl shadow-xs border border-slate-200 flex-1 flex flex-col min-h-0 overflow-y-auto"
            >
              <div className="flex items-center gap-3 mb-8">
                <span className="px-3 py-1 bg-slate-900 text-white flex items-center justify-center rounded-md font-bold text-[10px] uppercase tracking-widest">SOAL {currentIndex + 1}</span>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>

              <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full">
                <p className="text-lg font-bold text-slate-800 mb-10 leading-relaxed font-sans text-center">
                  {currentQuestion?.question_text}
                </p>

                <div className="grid gap-3">
                  {currentQuestion && Object.entries(currentQuestion.options).map(([key, value]) => {
                    const isSelected = answers[currentQuestion.id] === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleSelectAnswer(currentQuestion.id, key)}
                        className={`w-full p-4 sm:p-5 rounded-xl border transition-all flex items-center gap-4 group ${
                          isSelected 
                            ? "border-primary bg-rose-50/50 text-slate-900 shadow-sm" 
                            : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs transition-all shrink-0 ${
                          isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                        }`}>
                          {key}
                        </div>
                        <span className="font-semibold text-sm">{value}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between px-2 shrink-0">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-950 transition-colors disabled:opacity-20 text-[10px] uppercase tracking-widest"
            >
              <ChevronLeft size={20} /> Sebelumnya
            </button>
            <div className="text-slate-400 font-bold text-[9px] tracking-[0.2em] uppercase hidden sm:block">
              {currentIndex + 1} / {questions.length} Questions
            </div>
            <button
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-950 transition-colors disabled:opacity-20 text-[10px] uppercase tracking-widest"
            >
              Selanjutnya <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Sidebar: Question Map */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col lg:h-full">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col h-full overflow-hidden">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-widest text-[10px] shrink-0">
              <ClipboardList size={14} className="text-slate-400" /> Navigasi Ujian
            </h3>
            <div className="flex-1 overflow-y-auto grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2 pr-1 content-start py-1">
              {questions.map((q, idx) => {
                const isCurrent = currentIndex === idx;
                const isAnswered = !!answers[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`aspect-square rounded-lg text-[11px] font-bold transition-all border ${
                      isCurrent && isAnswered ? "bg-primary border-primary text-white shadow-sm" :
                      isCurrent ? "border-primary text-primary bg-white ring-2 ring-primary/10" :
                      isAnswered ? "bg-slate-800 border-slate-800 text-white" :
                      "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3 shrink-0">
               <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="w-2.5 h-2.5 bg-slate-800 rounded-sm"></div>
                  <span>Terjawab</span>
               </div>
               <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="w-2.5 h-2.5 bg-white border border-slate-200 rounded-sm"></div>
                  <span>Kosong</span>
               </div>
               <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="w-2.5 h-2.5 border-2 border-primary rounded-sm"></div>
                  <span>Sedang Dibuka</span>
               </div>
            </div>

            <button 
              onClick={() => handleSubmit(false)}
              className="lg:hidden w-full mt-6 bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-sm shadow-green-600/20"
            >
              <Send size={16} /> Kirim Jawaban
            </button>
          </div>
        </div>
      </main>
      
      {/* Footer Info */}
      <footer className="h-10 bg-slate-900 text-white flex items-center justify-center text-[9px] uppercase font-bold tracking-[0.25em] px-4 text-center shrink-0">
        SMK Prima Unggul Online Examination System • {profile?.full_name}
      </footer>
    </div>
  );
};

export default ExamTake;
