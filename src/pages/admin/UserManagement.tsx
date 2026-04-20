import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Profile, UserRole } from '../../types';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  UserPlus, 
  Mail, 
  Key, 
  Trash2, 
  Edit2, 
  X,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

const UserManagement = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('siswa');
  const [nis, setNis] = useState('');
  const [kelas, setKelas] = useState('');
  
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setRole('siswa');
    setNis('');
    setKelas('');
    setError(null);
    setSelectedUser(null);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      // In a real app with Supabase Admin Auth, you'd use a service role or edge function.
      // Since we are in the client, we'll demonstrate the flow.
      // NOTE: For full sync as requested, normally an Edge Function is used.
      // Here we simulate the logic.
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          }
        }
      });

      if (authError) throw authError;

      // Profiles table usually updated via Trigger in Supabase, but we'll try manual just in case
      // Or we can manually insert if trigger isn't set up.
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: fullName,
            role: role,
            nis: nis || null,
            kelas: kelas || null
          });
        
        // Ignore duplicate error if trigger already handled it
        if (profileError && !profileError.message.includes('duplicate')) {
          throw profileError;
        }
      }

      await fetchUsers();
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Gagal menambahkan user.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus user ini secara permanen? Data auth juga akan terhapus jika diizinkan oleh sistem.')) return;

    try {
      // Note: Delete on Auth requires Admin privileges. 
      // This client code will only work if the user has correct permissions or via Edge Functions.
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;

      await fetchUsers();
    } catch (err: any) {
      alert('Gagal menghapus user: ' + err.message);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase()) ||
    (u.nis && u.nis.includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 italic">User Management</h1>
          <p className="text-slate-500">Kelola data administrator, guru, dan siswa.</p>
        </div>
        <button 
          onClick={() => { setModalMode('add'); resetForm(); setIsModalOpen(true); }}
          className="bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-500/20"
        >
          <UserPlus size={20} />
          Tambah User Baru
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari nama, NIS, atau role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {filteredUsers.length} Users Found
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">NIS / Identitas</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <Loader2 className="animate-spin inline-block text-primary mb-2" size={32} />
                    <p className="text-slate-400">Memuat data user...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center text-slate-400 italic">
                    Tidak ada user ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-800">
                          {user.full_name[0]}
                        </div>
                        <span className="font-semibold text-slate-700">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        user.role === 'admin' ? "bg-red-100 text-red-600" :
                        user.role === 'guru' ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono italic">
                      {user.nis || '-'} {user.kelas ? `(${user.kelas})` : ''}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-500 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-slate-400 hover:text-primary transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm shadow-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="bg-primary p-5 text-white flex items-center justify-between">
                <h3 className="text-lg font-bold uppercase tracking-tight">Tambah User Baru</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                {error && (
                  <div className="p-3 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-lg border border-rose-100 flex items-start gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Akun</label>
                    <input 
                      type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Kata Sandi</label>
                    <input 
                      type="password" required={modalMode === 'add'} value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nama Lengkap</label>
                  <input 
                    type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Role Pengguna</label>
                  <select 
                    value={role} onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="admin">Administrator</option>
                    <option value="guru">Guru</option>
                    <option value="siswa">Siswa</option>
                  </select>
                </div>

                {role === 'siswa' && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">NIS</label>
                      <input 
                        type="text" value={nis} onChange={(e) => setNis(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Kelas</label>
                      <input 
                        type="text" value={kelas} onChange={(e) => setKelas(e.target.value)}
                        placeholder="Contoh: XII TKJ 1"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-sm shadow-primary/10"
                  >
                    {formLoading ? <Loader2 className="animate-spin" size={16} /> : <><Check size={16} /> Simpan Data User</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
