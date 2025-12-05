
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Save } from 'lucide-react';

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
          setMsg('Profile updated.');
          setTimeout(() => setMsg(''), 3000);
      }
  };

  return (
    <div className="space-y-6">
       <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <User size={20} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">{t('profile')}</h2>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-200 mb-3">
                  <img src={formData.photoUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
              </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input 
                    required 
                    value={formData.fullName} 
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
                  />
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Job Title</label>
                  <input 
                    required 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
                  />
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Photo URL</label>
                  <input 
                    type="url"
                    value={formData.photoUrl} 
                    onChange={(e) => setFormData({...formData, photoUrl: e.target.value})} 
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-xs font-mono"
                  />
              </div>
              
              <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 mt-4 text-sm">
                    <Save size={18} /> Update
              </button>

              {msg && <p className="text-center text-green-600 font-bold text-xs">{msg}</p>}
          </form>
      </div>
    </div>
  );
};

export default Profile;
