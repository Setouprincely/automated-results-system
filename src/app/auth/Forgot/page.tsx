// pages/forgot-password.js
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ Correct for app/
import Link from 'next/link';
import Head from 'next/head';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const router = useRouter();
  const [language, setLanguage] = useState('en');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const translations = {
    en: {
      title: 'Forgot Password',
      subtitle: 'Enter your email address and we will send you a link to reset your password.',
      email: 'Email Address',
      sendResetLink: 'Send Reset Link',
      backToLogin: 'Back to Login',
      resetLinkSent: 'Password reset link sent!',
      checkEmail: 'Please check your email for the reset link.',
      emailRequired: 'Email address is required',
      invalidEmail: 'Please enter a valid email address',
      unexpectedError: 'An unexpected error occurred. Please try again.'
    },
    fr: {
      title: 'Mot de Passe Oublié',
      subtitle: 'Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.',
      email: 'Adresse Email',
      sendResetLink: 'Envoyer le Lien de Réinitialisation',
      backToLogin: 'Retour à la Connexion',
      resetLinkSent: 'Lien de réinitialisation envoyé!',
      checkEmail: 'Veuillez vérifier votre email pour le lien de réinitialisation.',
      emailRequired: 'L\'adresse email est requise',
      invalidEmail: 'Veuillez entrer une adresse email valide',
      unexpectedError: 'Une erreur inattendue s\'est produite. Veuillez réessayer.'
    }
  };

  const t = translations[language];

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset error
    setError('');

    // Validate email
    if (!email) {
      setError(t.emailRequired);
      return;
    }

    if (!validateEmail(email)) {
      setError(t.invalidEmail);
      return;
    }

    setLoading(true);

    try {
      // API call would go here
      // const response = await fetch('/api/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate successful submission
      setSubmitted(true);
    } catch (error) {
      console.error('Password reset error:', error);
      setError(t.unexpectedError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>GCE Cameroon - {t.title}</title>
        <meta name="description" content="Forgot password page for GCE Examination System" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-end mb-4 mx-4">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('fr')}
              className={`px-3 py-1 rounded ml-2 ${language === 'fr' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              FR
            </button>
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-200 p-2">
              <img
                src="/images/GCEB.png"
                alt="GCE Board Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t.title}
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {!submitted ? (
              <>
                <p className="text-sm text-gray-600 mb-6 text-center">
                  {t.subtitle}
                </p>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      {t.email}
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`block w-full pl-10 py-3 border ${
                          error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-md shadow-sm`}
                        placeholder="example@email.com"
                      />
                    </div>
                    {error && (
                      <p className="mt-2 text-sm text-red-600">{error}</p>
                    )}
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        t.sendResetLink
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">{t.resetLinkSent}</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {t.checkEmail}
                </p>
              </div>
            )}

            <div className="mt-6">
              <Link href="/auth/Login"
                className="flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.backToLogin}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}