
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { School, Lock, User as UserIcon, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login, settings, t } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      setError('');
    } else {
      setError(t('invalidCredentials'));
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
                {settings.schoolLogoUrl ? (
                    <img 
                        src={settings.schoolLogoUrl} 
                        alt={settings.schoolName} 
                        className="h-24 w-auto object-contain drop-shadow-md"
                    />
                ) : (
                    <div className="bg-blue-600 p-5 rounded-2xl shadow-xl shadow-blue-600/20">
                        <School size={40} className="text-white" />
                    </div>
                )}
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight px-4">
             {settings.schoolName || "Smart School"}
            </h2>
        </div>

        <div className="bg-white py-10 px-8 shadow-2xl shadow-slate-200/50 rounded-3xl border border-slate-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('username')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon size={20} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 border-slate-200 rounded-xl py-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('password')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={20} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 border-slate-200 rounded-xl py-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="••••••"
                />
              </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-xl text-center flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block"></span>
                    {error}
                </div>
            )}

            <button type="submit" className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl shadow-lg shadow-slate-900/20 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]">
                {t('signIn')} <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
