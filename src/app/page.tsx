// app/page.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const router = useRouter();

  const translations = {
    en: {
      welcome: "Welcome to Cameroon GCE Examination System",
      subtitle: "A comprehensive platform for GCE examination management",
      login: "Login",
      register: "Register",
      features: "Key Features",
      feature1: "Complete automation of the GCE examination process",
      feature2: "Support for both O Level and A Level examinations",
      feature3: "Secure, reliable, and transparent results processing",
      feature4: "Accessible interface for all stakeholders",
      userTypes: "User Types",
      admin: "System Administrators",
      examBoard: "Examination Board Officials",
      examiners: "Examiners/Markers",
      schools: "Schools and Teachers",
      students: "Students/Candidates",
      learnMore: "Learn More"
    },
    fr: {
      welcome: "Bienvenue au Système d'Examen GCE du Cameroun",
      subtitle: "Une plateforme complète pour la gestion des examens GCE",
      login: "Connexion",
      register: "S'inscrire",
      features: "Caractéristiques Principales",
      feature1: "Automatisation complète du processus d'examen GCE",
      feature2: "Prise en charge des examens de niveau O et de niveau A",
      feature3: "Traitement des résultats sécurisé, fiable et transparent",
      feature4: "Interface accessible pour toutes les parties prenantes",
      userTypes: "Types d'Utilisateurs",
      admin: "Administrateurs du Système",
      examBoard: "Responsables du Conseil d'Examen",
      examiners: "Examinateurs/Correcteurs",
      schools: "Écoles et Enseignants",
      students: "Étudiants/Candidats",
      learnMore: "En Savoir Plus"
    }
  };

  const t = translations[language];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
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

      {/* Header */}
      <header className="pt-20 pb-12 text-center">
        <div className="mx-auto max-w-7xl px-4">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-gray-200 p-3">
              <img
                src="/images/GCEB.png"
                alt="GCE Board Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.welcome}</h1>
          <p className="text-xl text-gray-600">{t.subtitle}</p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/auth/Login" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
              {t.login}
            </Link>
            <Link href="/auth/Register" className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition">
              {t.register}
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold text-center mb-8">{t.features}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-blue-50 rounded-lg">
              <div className="text-blue-600 text-xl mb-2">01</div>
              <p>{t.feature1}</p>
            </div>
            <div className="p-6 bg-blue-50 rounded-lg">
              <div className="text-blue-600 text-xl mb-2">02</div>
              <p>{t.feature2}</p>
            </div>
            <div className="p-6 bg-blue-50 rounded-lg">
              <div className="text-blue-600 text-xl mb-2">03</div>
              <p>{t.feature3}</p>
            </div>
            <div className="p-6 bg-blue-50 rounded-lg">
              <div className="text-blue-600 text-xl mb-2">04</div>
              <p>{t.feature4}</p>
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold text-center mb-8">{t.userTypes}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="font-bold text-xl mb-2">{t.admin}</h3>
              <ul className="list-disc pl-5 text-gray-600">
                <li>Full system access and configuration</li>
                <li>User management</li>
                <li>System monitoring</li>
              </ul>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="font-bold text-xl mb-2">{t.examBoard}</h3>
              <ul className="list-disc pl-5 text-gray-600">
                <li>Examination setup</li>
                <li>Subject management</li>
                <li>Results approval</li>
              </ul>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="font-bold text-xl mb-2">{t.examiners}</h3>
              <ul className="list-disc pl-5 text-gray-600">
                <li>Script marking</li>
                <li>Score entry</li>
                <li>Verification processes</li>
              </ul>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="font-bold text-xl mb-2">{t.schools}</h3>
              <ul className="list-disc pl-5 text-gray-600">
                <li>Candidate registration</li>
                <li>Results viewing</li>
                <li>Performance analytics</li>
              </ul>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="font-bold text-xl mb-2">{t.students}</h3>
              <ul className="list-disc pl-5 text-gray-600">
                <li>Registration confirmation</li>
                <li>Results access</li>
                <li>Certificate requests</li>
              </ul>
            </div>
            <div className="flex items-center justify-center p-6 bg-blue-600 text-white rounded-lg shadow">
              <Link href="/about" className="text-xl font-bold">
                {t.learnMore} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-800 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p>© {new Date().getFullYear()} Cameroon GCE Board. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}