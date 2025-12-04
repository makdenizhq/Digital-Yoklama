import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Save, Globe, Building, Phone, Users, FileText, Trash2, Plus, Shield } from 'lucide-react';
import { User, UserRole } from '../types';

const Settings = () => {
  const { settings, updateSettings, t, currentUser, users, addUser, deleteUser, logs } = useAppContext();
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'logs'>('general');
  const [formData, setFormData] = useState(settings);
  const [msg, setMsg] = useState('');

  // User Form
  const [newUser, setNewUser] = useState<Partial<User>>({ role: 'teacher' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setMsg('Settings saved successfully!');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
      e.preventDefault();
      if(newUser.username && newUser.password && newUser.fullName) {
          addUser({
              id: Date.now().toString(),
              username: newUser.username!,
              password: newUser.password!,
              fullName: newUser.fullName!,
              title: newUser.title || 'Staff',
              role: (newUser.role as UserRole) || 'teacher',
              photoUrl: 'https://via.placeholder.com/150'
          });
          setNewUser({ role: 'teacher', username: '', password: '', fullName: '', title: '' });
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header & Tabs */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-slate-100 rounded-full">
                <SettingsIcon size={24} className="text-slate-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">{t('settings')}</h2>
        </div>
        
        <div className="flex gap-2 border-b border-slate-100">
            <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} label="General" icon={Building} />
            {currentUser?.role === 'admin' && (
                <>
                <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Users" icon={Users} />
                <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} label="Audit Logs" icon={FileText} />
                </>
            )}
        </div>
      </div>

      {/* GENERAL TAB */}
      {activeTab === 'general' && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 space-y-6 animate-in fade-in">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Globe size={18} /> Application Language
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-3 transition-all ${formData.language === 'en' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'hover:bg-slate-50'}`}>
                        <input type="radio" name="language" value="en" checked={formData.language === 'en'} onChange={handleChange} className="w-4 h-4" />
                        <span className="font-medium">English</span>
                    </label>
                    <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-3 transition-all ${formData.language === 'tr' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'hover:bg-slate-50'}`}>
                        <input type="radio" name="language" value="tr" checked={formData.language === 'tr'} onChange={handleChange} className="w-4 h-4" />
                        <span className="font-medium">Türkçe</span>
                    </label>
                </div>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Building size={18} /> {t('schoolInfo')}
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">School Name</label>
                        <input name="schoolName" value={formData.schoolName} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <input name="schoolAddress" value={formData.schoolAddress} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                        <input name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                </div>
            </div>

            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <Save size={18} /> {t('save')}
            </button>
            {msg && <p className="text-center text-green-600 font-medium">{msg}</p>}
        </form>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && currentUser?.role === 'admin' && (
          <div className="space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Plus size={18}/> Add New User</h3>
                  <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input required placeholder="Username" className="px-4 py-2 border rounded-lg" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                      <input required placeholder="Password" type="password" className="px-4 py-2 border rounded-lg" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                      <input required placeholder="Full Name" className="px-4 py-2 border rounded-lg" value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} />
                      <input required placeholder="Job Title" className="px-4 py-2 border rounded-lg" value={newUser.title} onChange={e => setNewUser({...newUser, title: e.target.value})} />
                      <select className="px-4 py-2 border rounded-lg" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}>
                          <option value="teacher">Teacher</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                      </select>
                      <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800">Create User</button>
                  </form>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 font-semibold text-slate-700">
                          <tr>
                              <th className="px-6 py-4">User</th>
                              <th className="px-6 py-4">Role</th>
                              <th className="px-6 py-4">Username</th>
                              <th className="px-6 py-4">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {users.map(u => (
                              <tr key={u.id}>
                                  <td className="px-6 py-4 flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden"><img src={u.photoUrl} className="w-full h-full object-cover"/></div>
                                      <div>
                                          <p className="font-bold text-slate-900">{u.fullName}</p>
                                          <p className="text-xs text-slate-500">{u.title}</p>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4"><span className="uppercase text-xs font-bold bg-slate-100 px-2 py-1 rounded">{u.role}</span></td>
                                  <td className="px-6 py-4 font-mono">{u.username}</td>
                                  <td className="px-6 py-4">
                                      {u.id !== '1' && u.id !== currentUser.id && (
                                          <button onClick={() => deleteUser(u.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                                      )}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* LOGS TAB */}
      {activeTab === 'logs' && currentUser?.role === 'admin' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
               <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 font-semibold text-slate-700">
                          <tr>
                              <th className="px-6 py-4">Time</th>
                              <th className="px-6 py-4">User</th>
                              <th className="px-6 py-4">Action</th>
                              <th className="px-6 py-4">Details</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {logs.map(log => (
                              <tr key={log.id}>
                                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                  <td className="px-6 py-4 font-medium text-slate-900">{log.userName}</td>
                                  <td className="px-6 py-4"><span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded uppercase">{log.action}</span></td>
                                  <td className="px-6 py-4 text-slate-600">{log.details}</td>
                              </tr>
                          ))}
                          {logs.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-slate-400">No logs found.</td></tr>}
                      </tbody>
               </table>
          </div>
      )}

    </div>
  );
};

const TabButton = ({ active, onClick, label, icon: Icon }: any) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
        <Icon size={16} /> {label}
    </button>
);

const SettingsIcon = ({ size, className }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);

export default Settings;