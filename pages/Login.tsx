import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { School, Lock, User as UserIcon, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen w-full flex bg-slate-50">
      
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
          <div className="absolute inset-0 opacity-40">
              <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" alt="School" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-purple-900/90 mix-blend-multiply"></div>
          
          <div className="relative z-10 p-12 text-white max-w-lg">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-2xl">
                  {settings.schoolLogoUrl ? <img src={settings.schoolLogoUrl} className="w-10 h-10 object-contain"/> : <School size={32}/>}
              </div>
              <h1 className="text-5xl font-black tracking-tight mb-6 leading-tight">Future of <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Education</span> Management.</h1>
              <p className="text-lg text-blue-100/80 leading-relaxed font-light">
                  Secure attendance tracking, academic analytics, and smart scheduling all in one unified platform.
              </p>
              
              <div className="flex gap-4 mt-10">
                  <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-400"/> Secure Access
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <Lock size={14} className="text-blue-400"/> Encrypted Data
                  </div>
              </div>
          </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-white to-slate-100">
        <div className="w-full max-w-md animate-fade-in">
            <div className="text-center mb-10">
                <div className="inline-flex justify-center mb-6 p-4 bg-white rounded-3xl shadow-xl shadow-indigo-500/10 border border-slate-100">
                    {settings.schoolLogoUrl ? (
                        <img 
                            src={settings.schoolLogoUrl} 
                            alt={settings.schoolName} 
                            className="h-12 w-auto object-contain"
                        />
                    ) : (
                        <School size={32} className="text-indigo-600" />
                    )}
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                 Welcome Back
                </h2>
                <p className="text-slate-500 text-sm">Please sign in to your account</p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">{t('username')}</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <UserIcon size={20} />
                        </div>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none shadow-sm group-hover:border-slate-300"
                            placeholder="username"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">{t('password')}</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <Lock size={20} />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none shadow-sm group-hover:border-slate-300"
                            placeholder="••••••"
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-xl text-center flex items-center justify-center gap-2 border border-red-100 animate-in zoom-in duration-300">
                        <AlertCircle size={16}/>
                        {error}
                    </div>
                )}

                <button type="submit" className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl shadow-lg shadow-indigo-600/30 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:translate-y-0">
                    {t('signIn')} <ArrowRight size={18} />
                </button>
            </form>
            
            <p className="text-center text-xs text-slate-400 mt-8 font-medium">
                Protected by Enterprise Grade Security
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;