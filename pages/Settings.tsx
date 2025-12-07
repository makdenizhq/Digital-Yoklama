
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Save, Globe, Building, Phone, Users, FileText, Trash2, Plus, Hash, LogOut, Edit, X, RefreshCcw, Shield, Check, UserPlus, ArrowRight, CreditCard, DollarSign, ScanFace, BookOpen } from 'lucide-react';
import { User, UserRole, UserPermission, FeeType } from '../types';
import ImageUploader from '../components/ImageUploader';

const Settings = () => {
  const { settings, updateSettings, updateRolePermissions, addRole, deleteRole, t, currentUser, users, addUser, deleteUser, restoreUser, deleteUserPermanently, updateUser, logs, logout } = useAppContext();
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'roles' | 'logs' | 'lessons'>('general');
  const [formData, setFormData] = useState(settings);
  const [msg, setMsg] = useState('');

  // User/Role State
  const [userViewMode, setUserViewMode] = useState<'active' | 'archived'>('active');
  const [newUser, setNewUser] = useState<Partial<User>>({ role: 'staff', permissions: [] });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('staff');
  const [isAssignUserModalOpen, setIsAssignUserModalOpen] = useState(false);
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [tempPermissions, setTempPermissions] = useState<UserPermission[]>([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [isAddRoleMode, setIsAddRoleMode] = useState(false);

  // Lesson State
  const [selectedGradeForLessons, setSelectedGradeForLessons] = useState<string>('9');
  const [newSubject, setNewSubject] = useState('');

  // Fee State
  const [newFee, setNewFee] = useState<Partial<FeeType>>({ name: '', amount: 0, frequency: 'monthly' });

  const availablePermissions: {id: UserPermission, label: string}[] = [
      { id: 'dashboard', label: t('dashboard') },
      { id: 'scan', label: t('scan') },
      { id: 'register', label: t('register') },
      { id: 'students', label: t('students') },
      { id: 'reports', label: t('reports') },
      { id: 'education', label: t('education') },
      { id: 'calendar', label: t('calendar') },
      { id: 'finance', label: t('finance') },
      { id: 'settings', label: t('settings') },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  // Fee Management
  const handleAddFee = () => {
      if (newFee.name && newFee.amount) {
          const fees = [...formData.feeStructure, { ...newFee, id: Date.now().toString() } as FeeType];
          setFormData({ ...formData, feeStructure: fees });
          setNewFee({ name: '', amount: 0, frequency: 'monthly' });
      }
  };

  const handleDeleteFee = (id: string) => {
      const fees = formData.feeStructure.filter(f => f.id !== id);
      setFormData({ ...formData, feeStructure: fees });
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); updateSettings(formData); setMsg(t('settings') + ' ' + t('save')); setTimeout(() => setMsg(''), 3000); };
  
  const handleCreateUser = (e: React.FormEvent) => {
      e.preventDefault();
      if(newUser.username && newUser.password && newUser.fullName) {
          addUser({ ...newUser as User, id: Date.now().toString(), role: (newUser.role as UserRole) || 'staff', photoUrl: 'https://via.placeholder.com/150' });
          setNewUser({ role: 'staff', username: '', password: '', fullName: '', title: '', permissions: [] });
      }
  };
  const handleUpdateUser = (e: React.FormEvent) => { e.preventDefault(); if(editingUser) { updateUser(editingUser); setEditingUser(null); } };
  const handleAssignUserRole = (userId: string) => { const target = users.find(u => u.id === userId); if (target) { updateUser({...target, role: selectedRole}); setIsAssignUserModalOpen(false); } };
  const startEditingPermissions = () => { setTempPermissions([...(settings.rolePermissions?.[selectedRole] || [])]); setIsEditingPermissions(true); };
  const handleToggleTempPermission = (id: UserPermission) => setTempPermissions(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  const savePermissions = () => { updateRolePermissions(selectedRole, tempPermissions); setIsEditingPermissions(false); };
  const cancelEditPermissions = () => setIsEditingPermissions(false);
  const handleAddRole = (e: React.FormEvent) => { e.preventDefault(); if (newRoleName.trim()) { addRole(newRoleName.trim()); setNewRoleName(''); setIsAddRoleMode(false); } };
  const deleteRoleHandler = (r: string) => { if(confirm('Delete role? Users will be moved to Staff role.')) deleteRole(r); };

  // Lessons Logic
  const handleAddSubject = () => {
      if (!newSubject.trim()) return;
      const currentLessons = formData.lessons?.[selectedGradeForLessons] || [];
      if (!currentLessons.includes(newSubject.trim())) {
          const updatedLessons = { ...formData.lessons, [selectedGradeForLessons]: [...currentLessons, newSubject.trim()] };
          setFormData({ ...formData, lessons: updatedLessons });
          setNewSubject('');
      }
  };

  const handleRemoveSubject = (subject: string) => {
      const currentLessons = formData.lessons?.[selectedGradeForLessons] || [];
      const updatedLessons = { ...formData.lessons, [selectedGradeForLessons]: currentLessons.filter(s => s !== subject) };
      setFormData({ ...formData, lessons: updatedLessons });
  };

  const filteredUsers = useMemo(() => users.filter(u => userViewMode === 'active' ? !u.isArchived : u.isArchived), [users, userViewMode]);
  const usersInSelectedRole = useMemo(() => users.filter(u => u.role === selectedRole && !u.isArchived), [users, selectedRole]);
  const usersNotInSelectedRole = useMemo(() => users.filter(u => u.role !== selectedRole && !u.isArchived), [users, selectedRole]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4">{t('settings')}</h2>
        <div className="flex gap-1 border-b border-slate-100 overflow-x-auto custom-scrollbar">
            <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} label={t('general')} icon={Building} />
            <TabButton active={activeTab === 'lessons'} onClick={() => setActiveTab('lessons')} label={t('lessons')} icon={BookOpen} />
            {currentUser?.role === 'admin' && (
                <>
                <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label={t('users')} icon={Users} />
                <TabButton active={activeTab === 'roles'} onClick={() => setActiveTab('roles')} label={t('roles')} icon={Shield} />
                <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} label={t('logs')} icon={FileText} />
                </>
            )}
        </div>
      </div>

      {activeTab === 'general' && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 space-y-6 animate-in fade-in">
            {/* Language & ID Format */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2"><Globe size={16}/> {t('language')}</h3>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="language" value="en" checked={formData.language === 'en'} onChange={handleChange} className="text-blue-600"/> <span className="text-sm font-bold">{t('english')}</span></label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="language" value="tr" checked={formData.language === 'tr'} onChange={handleChange} className="text-blue-600"/> <span className="text-sm font-bold">{t('turkish')}</span></label>
                    </div>
                </div>
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2"><Hash size={16}/> {t('idGeneration')}</h3>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                         <select name="idFormat" value={formData.idFormat} onChange={handleChange} className="w-full px-3 py-2 text-sm border rounded-lg"><option value="school_prefix">School Prefix</option><option value="grade_prefix">Grade Prefix</option><option value="standard">Standard</option></select>
                         {formData.idFormat === 'school_prefix' && <input name="schoolPrefix" value={formData.schoolPrefix} onChange={handleChange} placeholder="Prefix (e.g. FTH)" className="w-full px-3 py-2 text-sm border rounded-lg uppercase" maxLength={4}/>}
                    </div>
                </div>
            </div>

            {/* School Info */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2"><Building size={16}/> {t('schoolInfo')}</h3>
                <div className="space-y-3">
                    <input name="schoolName" value={formData.schoolName} onChange={handleChange} className="w-full px-3 py-2 text-sm border rounded-lg" placeholder={t('schoolName')}/>
                    <input name="schoolAddress" value={formData.schoolAddress} onChange={handleChange} className="w-full px-3 py-2 text-sm border rounded-lg" placeholder={t('schoolAddress')}/>
                    <input name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="w-full px-3 py-2 text-sm border rounded-lg" placeholder={t('phone')}/>
                    <ImageUploader label={t('schoolLogo')} image={formData.schoolLogoUrl} onImageChange={(b) => setFormData({...formData, schoolLogoUrl: b})} onRemove={() => setFormData({...formData, schoolLogoUrl: ''})}/>
                </div>
            </div>

            {/* Facial Verification Settings */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2"><ScanFace size={16}/> {t('verificationThreshold')}</h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <select name="verificationThreshold" value={formData.verificationThreshold || 'medium'} onChange={handleChange} className="w-full px-3 py-2 text-sm border rounded-lg">
                        <option value="strict">{t('strict')}</option>
                        <option value="medium">{t('medium')}</option>
                        <option value="lenient">{t('lenient')}</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-2">
                        Adjust how strict the AI checks for a match. 'Strict' requires a high-quality match, 'Lenient' allows for more variation (lighting, glasses, etc.).
                    </p>
                </div>
            </div>

            {/* Finance Toggle & Fees */}
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><CreditCard size={20}/></div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800">{t('enableFinance')}</h4>
                            <p className="text-xs text-slate-500">Track tuition fees and payments.</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={formData.isPaidSchool} onChange={e => setFormData({...formData, isPaidSchool: e.target.checked})} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                </div>
                
                {formData.isPaidSchool && (
                    <div className="pt-2 animate-in slide-in-from-top space-y-4">
                        <h4 className="text-xs font-bold text-emerald-700 uppercase flex items-center gap-2"><DollarSign size={14}/> {t('fees')}</h4>
                        
                        {/* New Fee Form */}
                        <div className="flex gap-2 items-end bg-white p-3 rounded-lg border border-emerald-100">
                            <div className="flex-1">
                                <label className="text-[10px] text-slate-400 block mb-1">Fee Name</label>
                                <input placeholder="e.g. Bus Fee" className="w-full text-xs px-2 py-1.5 border rounded" value={newFee.name} onChange={e => setNewFee({...newFee, name: e.target.value})} />
                            </div>
                            <div className="w-24">
                                <label className="text-[10px] text-slate-400 block mb-1">Amount</label>
                                <input type="number" placeholder="0.00" className="w-full text-xs px-2 py-1.5 border rounded" value={newFee.amount} onChange={e => setNewFee({...newFee, amount: Number(e.target.value)})} />
                            </div>
                            <div className="w-28">
                                <label className="text-[10px] text-slate-400 block mb-1">Frequency</label>
                                <select className="w-full text-xs px-2 py-1.5 border rounded" value={newFee.frequency} onChange={e => setNewFee({...newFee, frequency: e.target.value as any})}>
                                    <option value="one_time">One Time</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                    <option value="per_use">Per Use</option>
                                </select>
                            </div>
                            <button type="button" onClick={handleAddFee} className="bg-emerald-600 text-white p-1.5 rounded hover:bg-emerald-700"><Plus size={16}/></button>
                        </div>

                        {/* Fee List */}
                        <div className="space-y-2">
                            {formData.feeStructure.map((fee) => (
                                <div key={fee.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-emerald-100 shadow-sm">
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">{fee.name}</p>
                                        <p className="text-[10px] text-slate-400 capitalize">{fee.frequency.replace('_', ' ')}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-bold text-emerald-600">${fee.amount}</span>
                                        <button type="button" onClick={() => handleDeleteFee(fee.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm"><Save size={18} /> {t('save')}</button>
            {msg && <p className="text-center text-green-600 font-medium text-sm">{msg}</p>}
            
            <div className="pt-6 border-t border-slate-100">
                <button type="button" onClick={logout} className="w-full py-3 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 transition flex items-center justify-center gap-2 text-sm"><LogOut size={18} /> {t('logout')}</button>
            </div>
        </form>
      )}

      {/* LESSONS TAB */}
      {activeTab === 'lessons' && (
          <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 space-y-6 animate-in fade-in">
              <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2"><BookOpen size={16}/> {t('lessons')} Configuration</h3>
                  
                  {/* Grade Selector */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Grade Level</label>
                      <div className="flex gap-2 flex-wrap">
                          {['9', '10', '11', '12'].map(g => (
                              <button 
                                type="button"
                                key={g}
                                onClick={() => setSelectedGradeForLessons(g)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${selectedGradeForLessons === g ? 'bg-purple-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                              >
                                  Grade {g}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Subject Management */}
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-800 mb-3">Subjects for Grade {selectedGradeForLessons}</h4>
                      
                      {/* Add Subject Input */}
                      <div className="flex gap-2 mb-4">
                          <input 
                            placeholder="New Subject (e.g. History)" 
                            className="flex-1 px-3 py-2 text-sm border rounded-lg"
                            value={newSubject}
                            onChange={e => setNewSubject(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                          />
                          <button type="button" onClick={handleAddSubject} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-700 flex items-center gap-2">
                              <Plus size={16}/> Add
                          </button>
                      </div>

                      {/* Subject List */}
                      <div className="flex flex-wrap gap-2">
                          {(formData.lessons?.[selectedGradeForLessons] || []).map((subject, idx) => (
                              <div key={idx} className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-purple-100 flex items-center gap-2">
                                  {subject}
                                  <button type="button" onClick={() => handleRemoveSubject(subject)} className="text-purple-400 hover:text-purple-600 transition"><X size={14}/></button>
                              </div>
                          ))}
                          {(formData.lessons?.[selectedGradeForLessons] || []).length === 0 && (
                              <p className="text-sm text-slate-400 italic">No subjects added for this grade yet.</p>
                          )}
                      </div>
                  </div>
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm"><Save size={18} /> {t('save')}</button>
              {msg && <p className="text-center text-green-600 font-medium text-sm">{msg}</p>}
          </form>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && currentUser?.role === 'admin' && (
          <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-end gap-2">
                  <button onClick={() => setUserViewMode('active')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${userViewMode === 'active' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>{t('active')}</button>
                  <button onClick={() => setUserViewMode('archived')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${userViewMode === 'archived' ? 'bg-orange-500 text-white' : 'bg-slate-100'}`}>{t('archived')}</button>
              </div>
              {userViewMode === 'active' && (
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><Plus size={16}/> {t('addUser')}</h3>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input required placeholder={t('username')} className="w-full px-3 py-2 text-sm border rounded-lg" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                            <input required placeholder={t('password')} type="password" className="w-full px-3 py-2 text-sm border rounded-lg" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input required placeholder={t('fullName')} className="px-3 py-2 text-sm border rounded-lg" value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} />
                            <input required placeholder={t('jobTitle')} className="px-3 py-2 text-sm border rounded-lg" value={newUser.title} onChange={e => setNewUser({...newUser, title: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('role')}</label>
                            <select className="px-3 py-2 text-sm border rounded-lg capitalize" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}>
                                {settings.roles.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-sm hover:bg-slate-800">{t('add')}</button>
                    </form>
                </div>
              )}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                  {filteredUsers.map(u => (
                      <div key={u.id} className="p-4 border-b border-slate-100 flex items-center justify-between last:border-0 hover:bg-slate-50 transition">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-white shadow-sm">
                                  {u.photoUrl ? <img src={u.photoUrl} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-slate-300"/>}
                              </div>
                              <div>
                                  <p className="font-bold text-sm text-slate-900">{u.fullName}</p>
                                  <div className="flex gap-2 text-xs text-slate-500 items-center">
                                      <span className="font-mono bg-slate-100 px-1 rounded">{u.username}</span>
                                      <span className="font-bold text-blue-600">{u.title}</span>
                                      <span className={`capitalize px-1.5 py-0.5 rounded text-[10px] font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{u.role.replace('_', ' ')}</span>
                                  </div>
                              </div>
                          </div>
                          <div className="flex gap-2">
                             {userViewMode === 'active' ? (
                                <><button onClick={() => setEditingUser(u)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg"><Edit size={16}/></button>
                                {u.id !== '1' && u.id !== currentUser.id && <button onClick={() => deleteUser(u.id)} className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg"><Trash2 size={16}/></button>}</>
                             ) : (
                                <><button onClick={() => restoreUser(u.id)} className="p-2 text-green-600 bg-green-50 rounded-lg"><RefreshCcw size={16}/></button>
                                <button onClick={() => deleteUserPermanently(u.id)} className="p-2 text-red-600 bg-red-50 rounded-lg"><X size={16}/></button></>
                             )}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Roles Tab (Interactive) */}
      {activeTab === 'roles' && currentUser?.role === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in h-[calc(100vh-200px)]">
              <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm"><Shield size={16}/> {t('roles')}</h3>
                      <button onClick={() => setIsAddRoleMode(true)} className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"><Plus size={16}/></button>
                  </div>
                  {isAddRoleMode && (
                      <form onSubmit={handleAddRole} className="p-2 border-b border-slate-100 bg-blue-50/50">
                          <input autoFocus placeholder="Role Name..." className="w-full px-2 py-1 text-xs border rounded mb-2" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} />
                          <div className="flex gap-2"><button type="submit" className="flex-1 bg-blue-600 text-white text-[10px] py-1 rounded">{t('add')}</button><button type="button" onClick={() => setIsAddRoleMode(false)} className="flex-1 bg-slate-200 text-slate-600 text-[10px] py-1 rounded">{t('cancel')}</button></div>
                      </form>
                  )}
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                      {settings.roles.map(role => (
                          <button key={role} onClick={() => { setSelectedRole(role); setIsEditingPermissions(false); }} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold capitalize transition flex items-center justify-between group ${selectedRole === role ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
                              <span>{role.replace('_', ' ')}</span>
                              <div className="flex items-center gap-1">
                                  {role !== 'admin' && <div role="button" onClick={(e) => { e.stopPropagation(); deleteRoleHandler(role); }} className={`opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500 hover:text-white rounded transition ${selectedRole === role ? 'text-blue-200' : 'text-slate-400'}`}><Trash2 size={12} /></div>}
                                  {selectedRole === role && <ArrowRight size={14}/>}
                              </div>
                          </button>
                      ))}
                  </div>
              </div>
              <div className="md:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div><h3 className="text-xl font-black text-slate-900 capitalize">{selectedRole.replace('_', ' ')} Role</h3><p className="text-slate-500 text-xs mt-1">Manage permissions</p></div>
                      <div className="flex gap-2">
                        {isEditingPermissions ? (
                            <><button onClick={cancelEditPermissions} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold">{t('cancel')}</button><button onClick={savePermissions} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"><Save size={14}/> {t('save')}</button></>
                        ) : (
                            <button onClick={startEditingPermissions} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-50"><Edit size={14}/> {t('editPermissions')}</button>
                        )}
                        <button onClick={() => setIsAssignUserModalOpen(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-800"><UserPlus size={14}/> {t('assignUser')}</button>
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                      <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t('effectivePermissions')}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {availablePermissions.map(perm => {
                                  const currentPerms = settings.rolePermissions?.[selectedRole] || [];
                                  const hasPerm = isEditingPermissions ? tempPermissions.includes(perm.id) : currentPerms.includes(perm.id);
                                  return (
                                      <div key={perm.id} onClick={() => isEditingPermissions && handleToggleTempPermission(perm.id)} className={`flex items-center gap-3 p-3 rounded-xl border transition select-none ${isEditingPermissions ? 'cursor-pointer hover:border-blue-300' : 'cursor-default'} ${hasPerm ? 'border-green-200 bg-green-50' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${hasPerm ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}`}>{hasPerm ? <Check size={12}/> : <X size={12}/>}</div>
                                          <span className={`text-xs font-bold ${hasPerm ? 'text-green-800' : 'text-slate-500'}`}>{perm.label}</span>
                                      </div>
                                  )
                              })}
                          </div>
                      </div>
                      <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Assigned Users</h4>
                          <div className="space-y-2">{usersInSelectedRole.map(u => (<div key={u.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100"><span className="text-sm font-bold">{u.fullName}</span><span className="text-xs text-slate-500">{u.title}</span></div>))}</div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && currentUser?.role === 'admin' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full text-left text-xs"><thead className="bg-slate-50 font-semibold text-slate-700 sticky top-0"><tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{logs.map(log => (<tr key={log.id}><td className="px-4 py-3 text-slate-500">{new Date(log.timestamp).toLocaleTimeString()} <div className="font-bold text-slate-900">{log.userName}</div></td><td className="px-4 py-3"><span className="font-bold text-blue-600 block mb-0.5">{log.action}</span><span className="text-slate-600">{log.details}</span></td></tr>))}</tbody></table>
              </div>
          </div>
      )}

      {/* Assign User Modal */}
      {isAssignUserModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center"><h3 className="font-bold text-slate-800">{t('assignUser')}</h3><button onClick={() => setIsAssignUserModalOpen(false)}><X size={20}/></button></div>
                  <div className="flex-1 overflow-y-auto p-2">{usersNotInSelectedRole.map(u => (<button key={u.id} onClick={() => handleAssignUserRole(u.id)} className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition group text-left"><span className="text-sm font-bold">{u.fullName}</span><ArrowRight size={16} className="text-slate-300 group-hover:text-blue-600"/></button>))}</div>
              </div>
          </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, label, icon: Icon }: any) => (
    <button onClick={onClick} className={`px-4 py-2 text-xs font-bold uppercase tracking-wide flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><Icon size={14} /> {label}</button>
);

export default Settings;
