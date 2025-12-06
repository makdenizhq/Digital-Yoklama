
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Save, Globe, Building, Phone, Users, FileText, Trash2, Plus, Hash, LogOut, Edit, X, Archive, RefreshCcw, Shield, Check, UserPlus, ArrowRight, ShieldPlus } from 'lucide-react';
import { User, UserRole, UserPermission } from '../types';
import ImageUploader from '../components/ImageUploader';

const Settings = () => {
  const { settings, updateSettings, updateRolePermissions, addRole, deleteRole, t, currentUser, users, addUser, deleteUser, restoreUser, deleteUserPermanently, updateUser, logs, logout } = useAppContext();
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'roles' | 'logs'>('general');
  const [formData, setFormData] = useState(settings);
  const [msg, setMsg] = useState('');

  // User Management State
  const [userViewMode, setUserViewMode] = useState<'active' | 'archived'>('active');
  const [newUser, setNewUser] = useState<Partial<User>>({ 
      role: 'staff', 
      permissions: [] // Default will be set by context
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Roles Management State
  const [selectedRole, setSelectedRole] = useState<UserRole>('staff');
  const [isAssignUserModalOpen, setIsAssignUserModalOpen] = useState(false);
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [tempPermissions, setTempPermissions] = useState<UserPermission[]>([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [isAddRoleMode, setIsAddRoleMode] = useState(false);

  const availablePermissions: {id: UserPermission, label: string}[] = [
      { id: 'dashboard', label: t('dashboard') },
      { id: 'scan', label: t('scan') },
      { id: 'register', label: t('register') },
      { id: 'students', label: t('students') },
      { id: 'reports', label: t('reports') },
      { id: 'settings', label: t('settings') },
  ];

  // Fallback default permissions if not in settings
  const roleDefaultPermissions: Record<string, UserPermission[]> = {
      admin: ['dashboard', 'scan', 'register', 'students', 'reports', 'settings'],
      director: ['dashboard', 'students', 'reports', 'register', 'settings'],
      manager: ['dashboard', 'students', 'reports', 'register'],
      deputy_manager: ['dashboard', 'students', 'reports', 'scan'],
      staff: ['dashboard', 'scan', 'students']
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setMsg(t('settings') + ' ' + t('save'));
    setTimeout(() => setMsg(''), 3000);
  };

  // Helper to toggle permission in array
  const togglePermission = (
      currentPermissions: UserPermission[] | undefined, 
      perm: UserPermission, 
      setter: (p: UserPermission[]) => void
  ) => {
      const current = currentPermissions || [];
      if (current.includes(perm)) {
          setter(current.filter(p => p !== perm));
      } else {
          setter([...current, perm]);
      }
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
              role: (newUser.role as UserRole) || 'staff',
              photoUrl: 'https://via.placeholder.com/150',
              permissions: newUser.permissions
          });
          setNewUser({ role: 'staff', username: '', password: '', fullName: '', title: '', permissions: [] });
      }
  };

  const handleUpdateUser = (e: React.FormEvent) => {
      e.preventDefault();
      if(editingUser) {
          updateUser(editingUser);
          setEditingUser(null);
      }
  };

  const handleAssignUserRole = (userId: string) => {
      const targetUser = users.find(u => u.id === userId);
      if (targetUser) {
          updateUser({
              ...targetUser,
              role: selectedRole,
              permissions: settings.rolePermissions?.[selectedRole] || roleDefaultPermissions['staff']
          });
          setIsAssignUserModalOpen(false);
      }
  };

  // Role Permissions Handlers
  const startEditingPermissions = () => {
      const currentPerms = settings.rolePermissions?.[selectedRole] || roleDefaultPermissions[selectedRole] || roleDefaultPermissions['staff'];
      setTempPermissions([...currentPerms]);
      setIsEditingPermissions(true);
  };

  const handleToggleTempPermission = (permId: UserPermission) => {
      if (tempPermissions.includes(permId)) {
          setTempPermissions(prev => prev.filter(p => p !== permId));
      } else {
          setTempPermissions(prev => [...prev, permId]);
      }
  };

  const savePermissions = () => {
      updateRolePermissions(selectedRole, tempPermissions);
      setIsEditingPermissions(false);
  };

  const cancelEditPermissions = () => {
      setIsEditingPermissions(false);
  };

  const handleAddRole = (e: React.FormEvent) => {
      e.preventDefault();
      if (newRoleName.trim()) {
          addRole(newRoleName.trim());
          setNewRoleName('');
          setIsAddRoleMode(false);
      }
  };

  const filteredUsers = useMemo(() => {
      return users.filter(u => userViewMode === 'active' ? !u.isArchived : u.isArchived);
  }, [users, userViewMode]);

  const usersInSelectedRole = useMemo(() => {
      return users.filter(u => u.role === selectedRole && !u.isArchived);
  }, [users, selectedRole]);

  const usersNotInSelectedRole = useMemo(() => {
      return users.filter(u => u.role !== selectedRole && !u.isArchived);
  }, [users, selectedRole]);

  return (
    <div className="space-y-6">
      
      {/* Header & Tabs */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4">{t('settings')}</h2>
        <div className="flex gap-1 border-b border-slate-100 overflow-x-auto">
            <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} label={t('general')} icon={Building} />
            {currentUser?.role === 'admin' && (
                <>
                <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label={t('users')} icon={Users} />
                <TabButton active={activeTab === 'roles'} onClick={() => setActiveTab('roles')} label={t('roles')} icon={Shield} />
                <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} label={t('logs')} icon={FileText} />
                </>
            )}
        </div>
      </div>

      {/* GENERAL TAB */}
      {activeTab === 'general' && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 space-y-6 animate-in fade-in">
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <Globe size={16} /> {t('language')}
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="language" 
                                value="en" 
                                checked={formData.language === 'en'} 
                                onChange={handleChange} 
                                className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-bold text-slate-700">{t('english')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="language" 
                                value="tr" 
                                checked={formData.language === 'tr'} 
                                onChange={handleChange} 
                                className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-bold text-slate-700">{t('turkish')}</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <Hash size={16} /> {t('idGeneration')}
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
                    <Building size={16} /> {t('schoolInfo')}
                </h3>
                
                <div className="space-y-3">
                    <input name="schoolName" value={formData.schoolName} onChange={handleChange} className="w-full px-3 py-2 text-sm border rounded-lg" placeholder={t('schoolName')}/>
                    <input name="schoolAddress" value={formData.schoolAddress} onChange={handleChange} className="w-full px-3 py-2 text-sm border rounded-lg" placeholder={t('schoolAddress')}/>
                    <input name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="w-full px-3 py-2 text-sm border rounded-lg" placeholder={t('phone')}/>
                    
                    <ImageUploader 
                        label={t('schoolLogo')} 
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
                    <LogOut size={18} /> {t('logout')}
                </button>
            </div>
        </form>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && currentUser?.role === 'admin' && (
          <div className="space-y-6 animate-in fade-in">
              
              {/* Active / Archive Toggle */}
              <div className="flex justify-end gap-2">
                  <button onClick={() => setUserViewMode('active')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${userViewMode === 'active' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>{t('active')}</button>
                  <button onClick={() => setUserViewMode('archived')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${userViewMode === 'archived' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{t('archived')}</button>
              </div>

              {/* Create User Form */}
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
                                {settings.roles.map(r => (
                                    <option key={r} value={r}>{r.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-sm hover:bg-slate-800">{t('add')}</button>
                    </form>
                </div>
              )}

              {/* User List */}
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
                                      <span className={`capitalize font-bold ${u.role === 'admin' ? 'text-purple-600' : 'text-blue-600'}`}>{u.role.replace('_', ' ')}</span>
                                      <span className="text-slate-400">• {u.title}</span>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="flex gap-2">
                             {userViewMode === 'active' ? (
                                <>
                                    <button onClick={() => setEditingUser(u)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title={t('edit')}>
                                        <Edit size={16}/>
                                    </button>
                                    {u.id !== '1' && u.id !== currentUser.id && (
                                        <button onClick={() => deleteUser(u.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition" title={t('archive')}>
                                            <Trash2 size={16}/>
                                        </button>
                                    )}
                                </>
                             ) : (
                                <>
                                    <button onClick={() => restoreUser(u.id)} className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title={t('restore')}>
                                        <RefreshCcw size={16}/>
                                    </button>
                                    <button onClick={() => { if(confirm("Permanent Delete?")) deleteUserPermanently(u.id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title={t('delete')}>
                                        <X size={16}/>
                                    </button>
                                </>
                             )}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* ROLES & PERMISSIONS TAB */}
      {activeTab === 'roles' && currentUser?.role === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in h-[calc(100vh-200px)]">
              
              {/* Roles Sidebar */}
              <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm"><Shield size={16}/> {t('roles')}</h3>
                      <button onClick={() => setIsAddRoleMode(true)} className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"><Plus size={16}/></button>
                  </div>
                  
                  {isAddRoleMode && (
                      <form onSubmit={handleAddRole} className="p-2 border-b border-slate-100 bg-blue-50/50">
                          <input 
                            autoFocus
                            placeholder="Role Name..." 
                            className="w-full px-2 py-1 text-xs border rounded mb-2"
                            value={newRoleName}
                            onChange={e => setNewRoleName(e.target.value)}
                          />
                          <div className="flex gap-2">
                              <button type="submit" className="flex-1 bg-blue-600 text-white text-[10px] py-1 rounded font-bold">{t('add')}</button>
                              <button type="button" onClick={() => setIsAddRoleMode(false)} className="flex-1 bg-slate-200 text-slate-600 text-[10px] py-1 rounded font-bold">{t('cancel')}</button>
                          </div>
                      </form>
                  )}

                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                      {settings.roles.map(role => (
                          <button
                            key={role}
                            onClick={() => { setSelectedRole(role); setIsEditingPermissions(false); }}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold capitalize transition flex items-center justify-between group
                                ${selectedRole === role ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}
                            `}
                          >
                              <span>{role.replace('_', ' ')}</span>
                              <div className="flex items-center gap-1">
                                  {role !== 'admin' && (
                                      <div 
                                        role="button" 
                                        onClick={(e) => { e.stopPropagation(); if(confirm('Delete this role? Users will become Staff.')) deleteRole(role); }}
                                        className={`opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500 hover:text-white rounded transition ${selectedRole === role ? 'text-blue-200' : 'text-slate-400'}`}
                                      >
                                          <Trash2 size={12} />
                                      </div>
                                  )}
                                  {selectedRole === role && <ArrowRight size={14}/>}
                              </div>
                          </button>
                      ))}
                  </div>
              </div>

              {/* Role Details */}
              <div className="md:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div>
                          <h3 className="text-xl font-black text-slate-900 capitalize">{selectedRole.replace('_', ' ')} Role</h3>
                          <p className="text-slate-500 text-xs mt-1">Manage permissions and users for this role</p>
                      </div>
                      <div className="flex gap-2">
                        {isEditingPermissions ? (
                            <>
                                <button onClick={cancelEditPermissions} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-300 transition">{t('cancel')}</button>
                                <button onClick={savePermissions} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition"><Save size={14}/> {t('savePermissions')}</button>
                            </>
                        ) : (
                            <button 
                                onClick={startEditingPermissions}
                                className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition shadow-sm"
                            >
                                <Edit size={14}/> {t('editPermissions')}
                            </button>
                        )}
                        <button 
                            onClick={() => setIsAssignUserModalOpen(true)}
                            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition"
                        >
                            <UserPlus size={14}/> {t('assignUser')}
                        </button>
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                      
                      {/* Permissions View */}
                      <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t('effectivePermissions')}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {availablePermissions.map(perm => {
                                  const currentPerms = settings.rolePermissions?.[selectedRole] || roleDefaultPermissions[selectedRole] || roleDefaultPermissions['staff'];
                                  const hasPerm = isEditingPermissions ? tempPermissions.includes(perm.id) : currentPerms.includes(perm.id);
                                  
                                  return (
                                      <div 
                                        key={perm.id} 
                                        onClick={() => isEditingPermissions && handleToggleTempPermission(perm.id)}
                                        className={`
                                            flex items-center gap-3 p-3 rounded-xl border transition select-none
                                            ${isEditingPermissions ? 'cursor-pointer hover:border-blue-300' : 'cursor-default'}
                                            ${hasPerm ? 'border-green-200 bg-green-50' : 'border-slate-100 bg-slate-50 opacity-60'}
                                        `}
                                      >
                                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${hasPerm ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                              {hasPerm ? <Check size={12}/> : <X size={12}/>}
                                          </div>
                                          <span className={`text-xs font-bold ${hasPerm ? 'text-green-800' : 'text-slate-500'}`}>{perm.label}</span>
                                      </div>
                                  )
                              })}
                          </div>
                      </div>

                      {/* Users List */}
                      <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Assigned Users ({usersInSelectedRole.length})</h4>
                          <div className="space-y-2">
                              {usersInSelectedRole.length === 0 && <p className="text-slate-400 text-sm italic">No users assigned to this role.</p>}
                              {usersInSelectedRole.map(u => (
                                  <div key={u.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 transition bg-white group">
                                      <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden">
                                              {u.photoUrl && <img src={u.photoUrl} className="w-full h-full object-cover"/>}
                                          </div>
                                          <div>
                                              <p className="text-sm font-bold text-slate-900">{u.fullName}</p>
                                              <p className="text-xs text-slate-500">{u.title}</p>
                                          </div>
                                      </div>
                                      {u.id !== '1' && u.id !== currentUser.id && (
                                          <button 
                                            onClick={() => {
                                                if(confirm(`Remove ${u.fullName} from ${selectedRole}? They will become Staff.`)) {
                                                    updateUser({...u, role: 'staff', permissions: settings.rolePermissions?.['staff'] || roleDefaultPermissions['staff']});
                                                }
                                            }}
                                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-2"
                                            title="Remove from role"
                                          >
                                              <Trash2 size={16}/>
                                          </button>
                                      )}
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* ASSIGN USER MODAL */}
      {isAssignUserModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800">{t('assignUser')}</h3>
                      <button onClick={() => setIsAssignUserModalOpen(false)}><X size={20}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2">
                      {usersNotInSelectedRole.length === 0 ? (
                          <p className="p-6 text-center text-slate-500 text-sm">All active users are already {selectedRole}s.</p>
                      ) : (
                          usersNotInSelectedRole.map(u => (
                              <button 
                                key={u.id} 
                                onClick={() => handleAssignUserRole(u.id)}
                                className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition group text-left"
                              >
                                  <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                                          {u.photoUrl && <img src={u.photoUrl} className="w-full h-full object-cover"/>}
                                      </div>
                                      <div>
                                          <p className="text-sm font-bold text-slate-900">{u.fullName}</p>
                                          <p className="text-xs text-slate-500 capitalize">Current: {u.role}</p>
                                      </div>
                                  </div>
                                  <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-600"/>
                              </button>
                          ))
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                  <div className="flex justify-between items-center p-6 border-b border-slate-100">
                      <h3 className="text-lg font-bold text-slate-800">{t('editUser')}</h3>
                      <button onClick={() => setEditingUser(null)}><X size={20}/></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form onSubmit={handleUpdateUser} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('fullName')}</label>
                            <input required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={editingUser.fullName} onChange={e => setEditingUser({...editingUser, fullName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('jobTitle')}</label>
                            <input required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={editingUser.title} onChange={e => setEditingUser({...editingUser, title: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('role')}</label>
                            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm capitalize" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as UserRole})}>
                                {settings.roles.map(r => (
                                    <option key={r} value={r}>{r.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('password')}</label>
                            <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="New Password (optional)" onChange={e => setEditingUser({...editingUser, password: e.target.value})} />
                        </div>

                        {/* Edit Permissions (User Override) */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Module Access (User Override)</label>
                            <div className="grid grid-cols-2 gap-3">
                                {availablePermissions.map(perm => (
                                    <label key={perm.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition">
                                        <input 
                                            type="checkbox" 
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                            checked={editingUser.permissions?.includes(perm.id)}
                                            onChange={() => togglePermission(editingUser.permissions, perm.id, (p) => setEditingUser({...editingUser, permissions: p}))}
                                        />
                                        <span className="text-xs font-medium text-slate-700">{perm.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-4 hover:bg-blue-700">{t('update')}</button>
                    </form>
                  </div>
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
