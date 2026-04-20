import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { LogIn, User, Lock, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/app';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Gagal masuk. Silakan periksa kembali email dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200"
      >
        <div className="bg-primary p-6 text-white relative">
          <button 
            onClick={() => navigate('/')}
            className="absolute top-6 left-6 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col items-center text-center mt-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center mb-3">
              <LogIn size={24} />
            </div>
            <h1 className="text-xl font-bold uppercase tracking-tight">Selamat Datang</h1>
            <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-1">Sistem Ujian SMK Prima Unggul</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 text-[11px] font-bold rounded-lg border border-rose-100 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Sekolah</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@smkprimaunggul.sch.id"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 shadow-sm shadow-primary/20"
          >
            {loading ? <Loader2 className="animate-spin text-white" size={20} /> : 'Masuk Sekarang'}
          </button>
          
          <div className="text-center mt-4">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
              Lupa kata sandi? Hubungi Bagian Admin/IT Sekolah.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
