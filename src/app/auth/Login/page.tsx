// app/auth/login/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Login() {
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [userType, setUserType] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const translations = {
    en: {
      login: "Sign In",
      welcomeBack: "Welcome Back",
      subtitle: "Please sign in to your account to continue",
      email: "Email Address",
      password: "Password",
      forgotPassword: "Forgot Password?",
      loginButton: "Sign In",
      register: "Don't have an account? Create one",
      selectUserType: "Account Type",
      admin: "Administrator",
      examBoard: "Examination Board Official",
      examiner: "Examiner/Marker",
      school: "School/Teacher",
      student: "Student/Candidate",
      errorInvalid: "Invalid email or password",
      showPassword: "Show password",
      hidePassword: "Hide password"
    },
    fr: {
      login: "Connexion",
      welcomeBack: "Bon Retour",
      subtitle: "Veuillez vous connecter à votre compte pour continuer",
      email: "Adresse Email",
      password: "Mot de Passe",
      forgotPassword: "Mot de passe oublié?",
      loginButton: "Se Connecter",
      register: "Vous n'avez pas de compte? Créer un",
      selectUserType: "Type de Compte",
      admin: "Administrateur",
      examBoard: "Officiel du Conseil d'Examen",
      examiner: "Examinateur/Correcteur",
      school: "École/Enseignant",
      student: "Étudiant/Candidat",
      errorInvalid: "Email ou mot de passe invalide",
      showPassword: "Afficher le mot de passe",
      hidePassword: "Masquer le mot de passe"
    }
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // This would be replaced with your actual authentication API call
      // Remove artificial delay for better performance

      // Redirect to appropriate dashboard based on user type
      switch(userType) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'examBoard':
          router.push('/Examination/Examboard');
          break;
        case 'examiner':
          router.push('/Examinar/dashboard');
          break;
        case 'school':
          router.push('/Schools/dashboard');
          break;
        case 'student':
        default:
          router.push('/Student/dashboard');
          break;
      }
    } catch (err) {
      setError(t.errorInvalid);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,_rgba(120,119,198,0.3),_transparent_50%),radial-gradient(circle_at_80%_20%,_rgba(255,255,255,0.3),_transparent_50%),radial-gradient(circle_at_40%_40%,_rgba(120,119,198,0.15),_transparent_50%)]"></div>
      </div>

      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-lg border border-white/20">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                language === 'en'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('fr')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                language === 'fr'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              FR
            </button>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-blue-500/20 p-2">
                <img
                  src="/images/GCEB.png"
                  alt="GCE Board Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-blue-600/20 to-indigo-700/20 rounded-3xl blur-xl"></div>
            </div>
          </div>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
            {t.welcomeBack}
          </h1>
          <p className="text-slate-600 text-base">
            {t.subtitle}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl py-10 px-8 shadow-2xl sm:rounded-3xl border border-white/20 relative">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/30 rounded-3xl"></div>

          <div className="relative">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="userType" className="block text-sm font-semibold text-slate-700 mb-3">
                  {t.selectUserType}
                </label>
                <div className="relative">
                  <select
                    id="userType"
                    name="userType"
                    className="block w-full pl-4 pr-10 py-3 text-base border-0 bg-slate-50/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white sm:text-sm rounded-xl transition-all duration-200 font-medium text-slate-700 shadow-sm"
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                  >
                    <option value="student">{t.student}</option>
                    <option value="school">{t.school}</option>
                    <option value="examiner">{t.examiner}</option>
                    <option value="examBoard">{t.examBoard}</option>
                    <option value="admin">{t.admin}</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-3">
                  {t.email}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 border-0 bg-slate-50/50 backdrop-blur-sm rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white sm:text-sm transition-all duration-200 font-medium"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-3">
                  {t.password}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-3 border-0 bg-slate-50/50 backdrop-blur-sm rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white sm:text-sm transition-all duration-200 font-medium"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L7.758 7.758M12 12l2.122 2.122m-2.122-2.122L16.242 16.242M12 12l4.242 4.242M7.758 7.758L9.88 9.88m6.364 6.362L14.12 14.12m-4.242-4.242L7.758 7.758m8.484 8.484l2.122 2.122" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <div className="text-sm">
                  <Link href="/auth/Forgot" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    {t.forgotPassword}
                  </Link>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50/80 backdrop-blur-sm p-4 border border-red-200/50">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {error}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    {loading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-white group-hover:text-blue-100 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    )}
                  </span>
                  {t.loginButton}
                </button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-8 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-sm text-slate-700 font-medium rounded-full border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                    <Link href="/auth/Register" className="text-blue-600 hover:text-blue-700 transition-all duration-200 font-bold text-base hover:underline decoration-2 underline-offset-2 flex items-center gap-2">
                      {t.register}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}