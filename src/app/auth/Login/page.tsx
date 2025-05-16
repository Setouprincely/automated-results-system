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
  
  const router = useRouter();

  const translations = {
    en: {
      login: "Login",
      email: "Email Address",
      password: "Password",
      forgotPassword: "Forgot Password?",
      loginButton: "Login",
      register: "Don't have an account? Register",
      selectUserType: "Select User Type",
      admin: "Administrator",
      examBoard: "Examination Board Official",
      examiner: "Examiner/Marker",
      school: "School/Teacher",
      student: "Student/Candidate",
      errorInvalid: "Invalid email or password"
    },
    fr: {
      login: "Connexion",
      email: "Adresse Email",
      password: "Mot de Passe",
      forgotPassword: "Mot de passe oublié?",
      loginButton: "Se Connecter",
      register: "Vous n'avez pas de compte? S'inscrire",
      selectUserType: "Sélectionner le Type d'Utilisateur",
      admin: "Administrateur",
      examBoard: "Officiel du Conseil d'Examen",
      examiner: "Examinateur/Correcteur",
      school: "École/Enseignant",
      student: "Étudiant/Candidat",
      errorInvalid: "Email ou mot de passe invalide"
    }
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // This would be replaced with your actual authentication API call
      // For now, we'll simulate a login process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to appropriate dashboard based on user type
      switch(userType) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'examBoard':
          router.push('/exam-board/dashboard');
          break;
        case 'examiner':
          router.push('/examiner/dashboard');
          break;
        case 'school':
          router.push('/school/dashboard');
          break;
        case 'student':
        default:
          router.push('/student/dashboard');
          break;
      }
    } catch (err) {
      setError(t.errorInvalid);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <button 
          onClick={() => setLanguage('en')} 
          className={`px-2 py-1 rounded ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          English
        </button>
        <button 
          onClick={() => setLanguage('fr')} 
          className={`px-2 py-1 rounded ${language === 'fr' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Français
        </button>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              GCE
            </div>
          </div>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t.login}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                {t.selectUserType}
              </label>
              <select
                id="userType"
                name="userType"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
              >
                <option value="student">{t.student}</option>
                <option value="school">{t.school}</option>
                <option value="examiner">{t.examiner}</option>
                <option value="examBoard">{t.examBoard}</option>
                <option value="admin">{t.admin}</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t.email}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t.password}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                  {t.forgotPassword}
                </Link>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
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
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {t.loginButton}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
                    {t.register}
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}