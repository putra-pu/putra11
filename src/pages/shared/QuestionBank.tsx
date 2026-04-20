import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Exam, Question } from '../../types';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  PlusCircle, 
  ChevronDown, 
  ChevronUp, 
  Save,
  Loader2,
  Trash
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';

const QuestionBank = () => {
  const { profile } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // New Question Form
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchQuestions(selectedExamId);
    }
  }, [selectedExamId]);

  const fetchExams = async () => {
    const { data } = await supabase.from('exams').select('*');
    if (data) setExams(data);
  };

  const fetchQuestions = async (examId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('exam_id', examId);
    
    if (data) setQuestions(data);
    setLoading(false);
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId) return alert('Pilih ujian terlebih dahulu!');

    setLoading(true);
    try {
      const { error } = await supabase.from('questions').insert({
        exam_id: selectedExamId,
        question_text: questionText,
        options: { A: optionA, B: optionB, C: optionC, D: optionD },
        correct_answer: correctAnswer,
        points: 10 // default
      });

      if (error) throw error;
      
      setQuestionText('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setIsAdding(false);
      await fetchQuestions(selectedExamId);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('Hapus soal ini?')) return;
    await supabase.from('questions').delete().eq('id', id);
    fetchQuestions(selectedExamId);
  };

  return (
    <div className="space-y-6 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Bank Soal</h1>
          <p className="text-xs text-slate-500">Kelola dan organisasi daftar pertanyaan ujian SMK.</p>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-4 gap-6 overflow-hidden">
        {/* Exam Selection Sidebar */}
        <div className="space-y-3 flex flex-col overflow-hidden">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Pilih Mata Ujian</h3>
          <div className="flex-1 space-y-2 overflow-y-auto pr-2">
            {exams.map(exam => (
              <button
                key={exam.id}
                onClick={() => setSelectedExamId(exam.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  selectedExamId === exam.id 
                    ? "bg-rose-50 border-primary text-primary font-bold shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 shadow-xs"
                }`}
              >
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">{exam.subject}</p>
                <p className="text-xs font-semibold leading-tight">{exam.title}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Questions List */}
        <div className="lg:col-span-3 flex flex-col overflow-hidden">
          {!selectedExamId ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border-2 border-dashed border-slate-200 text-slate-400 italic text-xs">
              <BookOpen size={40} className="mb-4 opacity-10" />
              Pilih ujian di sebelah kiri untuk mengelola soal.
            </div>
          ) : (
            <div className="flex flex-col h-full space-y-4">
              <div className="flex items-center justify-between shrink-0 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="font-bold text-slate-800 text-sm uppercase tracking-tight">Daftar Soal ({questions.length})</h2>
                <button 
                  onClick={() => setIsAdding(!isAdding)}
                  className="bg-primary text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary-dark transition-all"
                >
                  <PlusCircle size={14} />
                  {isAdding ? 'Batal' : 'Tambah Soal'}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {isAdding && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-xl border border-primary/20 shadow-md space-y-5"
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Pertanyaan</label>
                      <textarea 
                        required value={questionText} onChange={(e) => setQuestionText(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-none font-medium"
                        placeholder="Contoh: Apa yang dimaksud dengan topologi star?"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {(['A', 'B', 'C', 'D'] as const).map(opt => (
                        <div key={opt} className="space-y-1 text-xs">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Opsi {opt}</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" required 
                              value={opt === 'A' ? optionA : opt === 'B' ? optionB : opt === 'C' ? optionC : optionD}
                              onChange={(e) => {
                                if (opt === 'A') setOptionA(e.target.value);
                                if (opt === 'B') setOptionB(e.target.value);
                                if (opt === 'C') setOptionC(e.target.value);
                                if (opt === 'D') setOptionD(e.target.value);
                              }}
                              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                            />
                            <button 
                              type="button"
                              onClick={() => setCorrectAnswer(opt)}
                              className={`w-10 rounded-lg font-bold transition-all text-xs border ${
                                correctAnswer === opt ? "bg-green-500 border-green-600 text-white shadow-sm" : "bg-white border-slate-200 text-slate-400"
                              }`}
                            >
                              {opt}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleAddQuestion}
                        disabled={loading}
                        className="bg-primary text-white px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50 shadow-sm shadow-primary/20"
                      >
                        {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                        Simpan Soal
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative group hover:shadow-sm transition-all">
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => handleDeleteQuestion(q.id)} className="p-1.5 text-slate-400 hover:text-primary transition-colors"><Trash2 size={14} /></button>
                      </div>
                      <div className="flex gap-4">
                        <span className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="space-y-3 flex-1 min-w-0">
                          <p className="font-bold text-slate-800 text-sm leading-relaxed">{q.question_text}</p>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {Object.entries(q.options).map(([key, val]) => (
                              <div key={key} className={`px-3 py-2 rounded-lg border text-[11px] font-medium transition-colors ${
                                q.correct_answer === key 
                                  ? "bg-green-50 border-green-200 text-green-700 font-bold" 
                                  : "bg-white border-slate-100 text-slate-500"
                              }`}>
                                <span className="mr-2 uppercase opacity-50">{key}.</span> {val}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BookOpen = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a4 4 0 0 0-4-4H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a4 4 0 0 1 4-4h6z" />
  </svg>
);

export default QuestionBank;
