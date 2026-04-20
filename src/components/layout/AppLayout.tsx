import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BookMarked, 
  FileCheck, 
  ClipboardList, 
  History,
  LogOut,
  ChevronRight,
  Menu,
  X,
  UserCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Navbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-2 text-slate-500 -ml-2">
          <Menu size={20} />
        </button>
        <div className="hidden lg:flex items-center gap-2 text-xs font-medium">
          <span className="text-slate-400">App</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold uppercase tracking-tight">
            {profile?.role === 'admin' ? 'Dashboard Admin' : profile?.role === 'guru' ? 'Panel Guru' : 'Beranda Siswa'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right mr-2 hidden sm:flex flex-col items-end">
          <p className="text-xs font-bold text-slate-900 leading-none">{profile?.full_name}</p>
          <p className="text-[10px] text-green-500 flex items-center gap-1 font-bold mt-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
          </p>
        </div>
        <button 
          onClick={handleSignOut}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-[10px] font-bold rounded shadow-sm shadow-primary/20 transition-all uppercase tracking-wider active:scale-95"
          title="Logout"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { profile } = useAuth();
  const location = useLocation();

  const menuItems = [
    { 
      title: 'Dashboard', 
      icon: <LayoutDashboard size={20} />, 
      path: '/app', 
      roles: ['admin', 'guru', 'siswa'] 
    },
    // Admin & Guru Section
    { 
      title: 'Data Siswa (User)', 
      icon: <Users size={20} />, 
      path: '/app/users', 
      roles: ['admin'],
      header: 'Administrasi'
    },
    { 
      title: 'Bank Soal', 
      icon: <BookMarked size={20} />, 
      path: '/app/question-bank', 
      roles: ['admin', 'guru'] 
    },
    { 
      title: 'Manajemen Ujian', 
      icon: <ClipboardList size={20} />, 
      path: '/app/exam-management', 
      roles: ['admin', 'guru'] 
    },
    { 
      title: 'Dashboard & Rekap', 
      icon: <UserCheck size={20} />, 
      path: '/app/attendance-recap', 
      roles: ['admin', 'guru'] 
    },
    { 
      title: 'Rekap Hasil', 
      icon: <FileCheck size={20} />, 
      path: '/app/results', 
      roles: ['admin', 'guru'] 
    },
    // Siswa Section
    { 
      title: 'Absensi Siswa', 
      icon: <UserCheck size={20} />, 
      path: '/app/attendance', 
      roles: ['siswa'],
      header: 'Menu Siswa'
    },
    { 
      title: 'Soal Ujian', 
      icon: <ClipboardList size={20} />, 
      path: '/app/exams', 
      roles: ['siswa'] 
    },
    { 
      title: 'Riwayat Ujian', 
      icon: <History size={20} />, 
      path: '/app/exam-results', 
      roles: ['siswa'] 
    },
  ];

  const filteredMenu = menuItems.filter(item => profile && item.roles.includes(profile.role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">SPU</div>
          <div>
            <h1 className="text-sm font-bold leading-tight uppercase tracking-tight">SMK Prima</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Unggul Mandiri</p>
          </div>
          <button onClick={onClose} className="lg:hidden ml-auto p-2 text-slate-500">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {filteredMenu.map((item, idx) => {
            const isActive = location.pathname === item.path;
            const hasHeader = 'header' in item && item.header;

            return (
              <React.Fragment key={idx}>
                {hasHeader && (
                  <div className="px-3 pt-6 pb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      {item.header}
                    </p>
                  </div>
                )}
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm font-medium",
                    isActive 
                      ? "sidebar-item-active"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <span className={cn(
                    "transition-colors",
                    isActive ? "text-primary" : "text-slate-400"
                  )}>
                    {item.icon}
                  </span>
                  {item.title}
                </Link>
              </React.Fragment>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
            <p className="text-[10px] text-primary font-bold mb-1 uppercase">ROLE: {profile?.role}</p>
            <p className="text-xs text-slate-700 font-semibold truncate leading-none">{profile?.full_name}</p>
          </div>
        </div>
      </aside>
    </>
  );
};

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-8 bg-slate-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
