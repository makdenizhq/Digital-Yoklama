import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Save, Camera } from 'lucide-react';

const Profile = () => {
  const { currentUser, updateUser, t } = useAppContext();
  const [formData, setFormData] = useState({
      fullName: '',
      title: '',
      photoUrl: ''
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
      if (currentUser) {
          setFormData({
              fullName: currentUser.fullName,
              title: currentUser.title,
              photoUrl: currentUser.photoUrl || ''
          });
      }
  }, [currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (currentUser) {
          updateUser({
              ...currentUser,
              fullName: formData.fullName,
              title: formData.title,
              photoUrl: formData.photoUrl
          });
          setMsg('Profile updated successfully.');
          setTimeout(() => setMsg(''), 3000);
      }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <User size={24} />
        </div>
        <div>
            <h2 className="text-xl font-bold text-slate-800">{t('profile')}</h2>
            <p className="text-sm text-slate-500">Manage your personal information</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-center mb-8">
              <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-200">
                      <img src={formData.photoUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="text-white" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Photo URL" 
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({...formData, photoUrl: e.target.value})}
                    className="absolute -bottom-8 left-0 right-0 text-xs text-center border p-1 rounded opacity-0 group-hover:opacity-100"
                  />
              </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input 
                    required 
                    value={formData.fullName} 
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                  <input 
                    required 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
              </div>
              
              <div className="pt-4">
                <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                    <Save size={18} /> Update Profile
                </button>
              </div>

              {msg && <p className="text-center text-green-600 font-medium">{msg}</p>}
          </form>
      </div>
    </div>
  );
};

export default Profile;