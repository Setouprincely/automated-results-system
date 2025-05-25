'use client';

import React, { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Users,
  FileText,
  BarChart3,
  MessageCircle,
  CreditCard,
  Menu,
  X,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Globe
} from 'lucide-react';

interface NavigationItem {
  name: string;
  nameEn: string;
  nameFr: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
}

interface SchoolsLayoutProps {
  children: React.ReactNode;
}

export default function SchoolsLayout({ children }: SchoolsLayoutProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'fr'>('en');

  // Translation helper function
  const t = (en: string, fr: string) => language === 'en' ? en : fr;

  // Toggle language function
  const handleLanguageToggle = () => {
    setLanguage(prev => prev === 'en' ? 'fr' : 'en');
  };

  // Navigation items for schools - memoized to prevent recreation on every render
  const navigation: NavigationItem[] = useMemo(() => [
    {
      name: t('Dashboard', 'Tableau de Bord'),
      nameEn: 'Dashboard',
      nameFr: 'Tableau de Bord',
      href: '/Schools/dashboard',
      icon: Home,
      current: pathname === '/Schools/dashboard',
    },
    {
      name: t('Registration', 'Inscription'),
      nameEn: 'Registration',
      nameFr: 'Inscription',
      href: '/Schools/registration',
      icon: Users,
      current: pathname === '/Schools/registration',
    },
    {
      name: t('Results', 'Résultats'),
      nameEn: 'Results',
      nameFr: 'Résultats',
      href: '/Schools/results',
      icon: FileText,
      current: pathname === '/Schools/results',
    },
    {
      name: t('Performance', 'Performance'),
      nameEn: 'Performance',
      nameFr: 'Performance',
      href: '/Schools/performance',
      icon: BarChart3,
      current: pathname === '/Schools/performance',
    },
    {
      name: t('Communication', 'Communication'),
      nameEn: 'Communication',
      nameFr: 'Communication',
      href: '/Schools/communication',
      icon: MessageCircle,
      current: pathname === '/Schools/communication',
    },
    {
      name: t('Fee Management', 'Gestion des Frais'),
      nameEn: 'Fee Management',
      nameFr: 'Gestion des Frais',
      href: '/Schools/fee',
      icon: CreditCard,
      current: pathname === '/Schools/fee',
    },
  ], [pathname, language]);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4">
            <img className="h-8 w-auto" src="/images/GCEB.png" alt="GCE System" />
            <span className="ml-2 text-gray-900 font-medium text-lg">
              {t('Schools Portal', 'Portail Scolaire')}
            </span>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  item.current
                    ? 'bg-blue-100 text-blue-600 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    item.current ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Language Toggle & User Menu */}
          <div className="flex-shrink-0 px-2 pb-4 space-y-2">
            {/* Language Toggle */}
            <button
              onClick={handleLanguageToggle}
              className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            >
              <Globe className="mr-3 h-5 w-5 text-gray-400" />
              {language === 'en' ? 'Français' : 'English'}
            </button>

            {/* User Menu */}
            <div className="border-t border-gray-200 pt-2">
              <div className="px-2 py-2">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {t('School Account', 'Compte Scolaire')}
                </div>
                <div className="mt-1 text-sm font-medium text-gray-900">
                  Saint Joseph's College Sasse
                </div>
              </div>

              <Link
                href="/Schools/settings"
                className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
              >
                <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                {t('Settings', 'Paramètres')}
              </Link>

              <button className="w-full group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200">
                <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                {t('Sign Out', 'Déconnexion')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 flex z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <img className="h-8 w-auto" src="/images/GCEB.png" alt="GCE System" />
                <span className="ml-2 text-gray-900 font-medium text-lg">
                  {t('Schools Portal', 'Portail Scolaire')}
                </span>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      item.current
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon
                      className={`mr-4 h-6 w-6 ${
                        item.current ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1 flex">
              <h1 className="text-xl font-semibold text-gray-900">
                {navigation.find(item => item.current)?.name || t('Schools Portal', 'Portail Scolaire')}
              </h1>
            </div>

            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Language Toggle for Desktop */}
              <button
                onClick={handleLanguageToggle}
                className="hidden md:flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
              >
                <Globe className="mr-2 h-4 w-4" />
                {language === 'en' ? 'FR' : 'EN'}
              </button>

              {/* Notifications */}
              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Bell className="h-6 w-6" />
              </button>

              {/* School Info */}
              <div className="hidden md:block text-sm text-gray-600">
                Saint Joseph's College Sasse
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
