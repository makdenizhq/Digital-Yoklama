
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Save, Globe, Building, Phone, Users, FileText, Trash2, Plus, Hash, LogOut } from 'lucide-react';
import { User, UserRole, IdGenerationFormat } from '../types';
import ImageUploader from '../components/ImageUploader';

const Settings = () => {
  const { settings, updateSettings, t, currentUser, users, addUser, deleteUser, logs, logout } = useAppContext();
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
    <div className="space-y-6">
      
      {/* Header & Tabs */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4">{t('settings')}</h2>
        <div className="flex gap-1 border-b border-slate-100 overflow-x-auto">
            <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} label="General" icon={Building} />
            {currentUser?.role === 'admin' && (
                <>
                <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Users" icon={Users} />
                <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} label="Logs" icon={FileText} />
                </>
            )}
        </div>
      </div>

      {/* GENERAL TAB */}
      {activeTab === 'general' && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 space-y-6 animate-in fade-in">
            
            {/* ID Generation */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <Hash size={16} /> ID Generation
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl space-y-4 border border-slate-200">
                     <div>
                         <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Format Strategy</label>
                         <select 
                            name="idFormat" 
                            value={formData.idFormat} 
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm border rounded-lg bg-white"
                         >
                             <option value="school_prefix">School Prefix (e.g. FTH2401)</option>
                             <option value="grade_prefix">Grade Prefix (e.g. 102401)</option>
                             <option value="standard">Standard (e.g. 202401)</option>
                         </select>
                     </div>
                     {formData.idFormat === 'school_prefix' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Prefix Code</label>
                            <input 
                                name="schoolPrefix" 
                                value={formData.schoolPrefix} 
                                onChange={handleChange} 
                                placeholder="e.g. FTH"
                                className="w-full px-3 py-2 text-sm border rounded-lg uppercase"
                                maxLength={4}
                            />
                        </div>
                     )}
                </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <Globe size={16} /> Language
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <label className={`cursor-pointer border p-3 rounded-xl flex items-center gap-2 transition-all ${formData.language === 'en' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'hover:bg-slate-50'}`}>
                        <input type="radio" name="language" value="en" checked={formData.language === 'en'} onChange={handleChange} className="w-4 h-4" />
                        <span className="text-sm font-medium">English</span>
                    </label>
                    <label className={`cursor-pointer border p-3 rounded-xl flex items-center gap-2 transition-all ${formData.language === 'tr' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'hover:bg-slate-50'}`}>
                        <input type="radio" name="language" value="tr" checked={formData.language === 'tr'} onChange={handleChange} className="w-4 h-4" />
                        <span className="text-sm font-medium">Türkçe</span>
                    </label>
                </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <Building size={16} /> School Info
                </h3>
                
                <div className="space-y-3">
                    <input name="schoolName" value={formData.schoolName} onChange={handleChange} className="w-full px-3 py-2 text-sm border rounded-lg" placeholder="School Name"/>
                    <input name="schoolAddress" value={formData.schoolAddress} onChange={handleChange} className="w-full px-3 py-2 text-sm border rounded-lg" placeholder="Address"/>
                    <input name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="w-full px-3 py-2 text-sm border rounded-lg" placeholder="Phone"/>
                    
                    <ImageUploader 
                        label="School Logo" 
                        image={formData.schoolLogoUrl} 
                        onImageChange={(base64) => setFormData({...formData, schoolLogoUrl: base64})}
                        onRemove={() => setFormData({...formData, schoolLogoUrl: ''})}
                    />
                </div>
            </div>

            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm">
                <Save size={18} /> {t('save')}
            </button>
            {msg && <p className="text-center text-green-600 font-medium text-sm">{msg}</p>}

             <div className="pt-6 border-t border-slate-100">
                <button type="button" onClick={logout} className="w-full py-3 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 transition flex items-center justify-center gap-2 text-sm">
                    <LogOut size={18} /> Logout
                </button>
            </div>
        </form>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && currentUser?.role === 'admin' && (
          <div className="space-y-6 animate-in fade-in">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><Plus size={16}/> Add User</h3>
                  <form onSubmit={handleCreateUser} className="space-y-3">
                      <input required placeholder="Username" className="w-full px-3 py-2 text-sm border rounded-lg" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                      <input required placeholder="Password" type="password" className="w-full px-3 py-2 text-sm border rounded-lg" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                      <div className="grid grid-cols-2 gap-3">
                        <input required placeholder="Full Name" className="px-3 py-2 text-sm border rounded-lg" value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} />
                        <select className="px-3 py-2 text-sm border rounded-lg" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}>
                            <option value="teacher">Teacher</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                      </div>
                      <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-sm hover:bg-slate-800">Create</button>
                  </form>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                  {users.map(u => (
                      <div key={u.id} className="p-4 border-b border-slate-100 flex items-center justify-between last:border-0">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden"><img src={u.photoUrl} className="w-full h-full object-cover"/></div>
                              <div>
                                  <p className="font-bold text-sm text-slate-900">{u.fullName}</p>
                                  <p className="text-xs text-slate-500">{u.role} • {u.username}</p>
                              </div>
                          </div>
                          {u.id !== '1' && u.id !== currentUser.id && (
                              <button onClick={() => deleteUser(u.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* LOGS TAB */}
      {activeTab === 'logs' && currentUser?.role === 'admin' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 font-semibold text-slate-700 sticky top-0">
                        <tr>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td className="px-4 py-3 text-slate-500">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                    <div className="font-bold text-slate-900">{log.userName}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="font-bold text-blue-600 block mb-0.5">{log.action}</span>
                                    <span className="text-slate-600">{log.details}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
          </div>
      )}

    </div>
  );
};

const TabButton = ({ active, onClick, label, icon: Icon }: any) => (
    <button onClick={onClick} className={`px-4 py-2 text-xs font-bold uppercase tracking-wide flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
        <Icon size={14} /> {label}
    </button>
);

export default Settings;
