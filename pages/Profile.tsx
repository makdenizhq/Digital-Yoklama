
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Save } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';

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
          setMsg(t('update') + ' ' + t('verified'));
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
          
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
              
              <ImageUploader 
                  label={t('profile')}
                  image={formData.photoUrl}
                  onImageChange={(base64) => setFormData({...formData, photoUrl: base64})}
                  onRemove={() => setFormData({...formData, photoUrl: ''})}
                  isCircular={true}
                  className="mb-6"
              />

              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('fullName')}</label>
                  <input 
                    required 
                    value={formData.fullName} 
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
                  />
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('jobTitle')}</label>
                  <input 
                    required 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
                  />
              </div>
              
              <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 mt-4 text-sm">
                    <Save size={18} /> {t('update')}
              </button>

              {msg && <p className="text-center text-green-600 font-bold text-xs">{msg}</p>}
          </form>
      </div>
    </div>
  );
};

export default Profile;
