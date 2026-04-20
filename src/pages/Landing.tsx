import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Users, GraduationCap, ArrowRight, Laptop, Camera, Calculator, Monitor, Building2, Layers } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const jurusans = [
    { title: 'TKJ', desc: 'Teknik Komputer & Jaringan: Networking, Server & Cybersecurity.', icon: <Laptop size={20} /> },
    { title: 'DKV', desc: 'Desain Komunikasi Visual: Multimedia, Ilustrasi & Branding.', icon: <Camera size={20} /> },
    { title: 'AK', desc: 'Akuntansi', icon: <Calculator size={20} /> },
    { title: 'BC', desc: 'Broadcasting', icon: <Monitor size={20} /> },
    { title: 'MPLB', desc: 'Manajemen Perkantoran & Bisnis Digital.', icon: <Building2 size={20} /> },
    { title: 'BD', desc: 'Bisnis Digital', icon: <Layers size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-primary/20">
              PU
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-sm tracking-tight text-slate-900 uppercase">SMK Prima</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Unggul Mandiri</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all shadow-sm shadow-primary/20 active:scale-95"
          >
            Masuk ke Aplikasi
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 shrink-0 h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-3 py-1 bg-rose-50 border border-rose-100 rounded-full text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-6">
                Pendidikan Vokasi Unggul
              </div>
              <h1 className="text-5xl font-black leading-[0.95] mb-6 text-slate-900 uppercase tracking-tighter">
                Unggul <br /> <span className="text-primary italic">& Mandiri</span> <br /> Dalam Digital.
              </h1>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-sm font-medium">
                Berkomitmen mencetak lulusan kompeten dengan standar industri global melalui sistem pembelajaran terpadu.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-slate-900 text-white px-8 py-3.5 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-black/10 group"
                >
                  Mulai Sekarang <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative hidden lg:block"
            >
              <div className="aspect-[4/5] bg-white p-3 rounded-2xl shadow-2xl border border-slate-100 group">
                <div className="w-full h-full rounded-xl overflow-hidden relative grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700">
                  <img 
                    src="https://picsum.photos/seed/vokasi/1000/1250" 
                    alt="School" 
                    className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                    <div className="text-white">
                       <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Fasilitas Modern</p>
                       <h3 className="text-2xl font-bold uppercase tracking-tighter">Lab Praktik Industri</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -z-10 top-20 -right-10 w-64 h-64 bg-primary/20 blur-3xl opacity-50"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats - Grid Pattern */}
      <section className="bg-slate-900 py-16 text-white border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Siswa Aktif', value: '1,200+' },
              { label: 'Alumni Sukses', value: '5,000+' },
              { label: 'Jurusan', value: '06' },
              { label: 'Mitra Industri', value: '45+' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-4xl font-black tracking-tighter">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Keahlian Section */}
      <section className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[10px] font-bold text-primary mb-2 uppercase tracking-widest italic">Core Competency</p>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Program Keahlian</h2>
            </div>
            <div className="w-24 h-px bg-slate-200 hidden sm:block"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {jurusans.map((j, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className="p-6 bg-white border border-slate-100 rounded-xl hover:shadow-xl hover:shadow-rose-100/20 transition-all flex flex-col gap-6 group"
              >
                <div className="w-10 h-10 bg-slate-900 group-hover:bg-primary text-white rounded flex items-center justify-center transition-colors shadow-lg shadow-black/5">
                  {j.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-tight mb-2 text-slate-800">{j.title}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{j.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold text-lg">PU</div>
             <div className="text-white">
                <p className="text-xs font-bold uppercase tracking-tight leading-none">Prima Unggul</p>
                <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] mt-1 font-bold">Official Exam System</p>
             </div>
          </div>
          <div className="flex gap-8 text-[10px] uppercase font-bold text-white/40 tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">Facebook</a>
            <a href="#" className="hover:text-primary transition-colors">Instagram</a>
            <a href="#" className="hover:text-primary transition-colors">YouTube</a>
          </div>
          <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest italic">© 2026 SMK Prima Unggul. All Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
