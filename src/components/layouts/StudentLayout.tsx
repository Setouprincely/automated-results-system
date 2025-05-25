'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  FileText,
  Calendar,
  Trophy,
  Award,
  BarChart3,
  User,
  Settings,
  LogOut,
  Bell,
  Globe,
  Menu,
  X,
} from 'lucide-react';

interface NavigationItem {
  name: string;
  nameEn: string;
  nameFr: string;
  href: string;
  icon: any;
  current: boolean;
}

interface StudentLayoutProps {
  children: React.ReactNode;
}

function StudentLayout({ children }: StudentLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const pathname = usePathname();
  const router = useRouter();

  // Translation function
  const t = useCallback((en: string, fr: string) => language === 'en' ? en : fr, [language]);

  // Navigation items for students - memoized to prevent recreation on every render
  const navigation: NavigationItem[] = useMemo(() => [
    {
      name: t('Dashboard', 'Tableau de Bord'),
      nameEn: 'Dashboard',
      nameFr: 'Tableau de Bord',
      href: '/Student/dashboard',
      icon: Home,
      current: pathname === '/Student/dashboard',
    },
    {
      name: t('Registration', 'Inscription'),
      nameEn: 'Registration',
      nameFr: 'Inscription',
      href: '/Student/registration',
      icon: FileText,
      current: pathname === '/Student/registration',
    },
    {
      name: t('Exam Schedule', 'Calendrier d\'Examen'),
      nameEn: 'Exam Schedule',
      nameFr: 'Calendrier d\'Examen',
      href: '/Student/exam',
      icon: Calendar,
      current: pathname === '/Student/exam',
    },
    {
      name: t('Results', 'Résultats'),
      nameEn: 'Results',
      nameFr: 'Résultats',
      href: '/Student/results',
      icon: Trophy,
      current: pathname === '/Student/results',
    },
    {
      name: t('Performance', 'Performance'),
      nameEn: 'Performance',
      nameFr: 'Performance',
      href: '/Student/performance',
      icon: BarChart3,
      current: pathname === '/Student/performance',
    },
    {
      name: t('Certificates', 'Certificats'),
      nameEn: 'Certificates',
      nameFr: 'Certificats',
      href: '/Student/certificate',
      icon: Award,
      current: pathname === '/Student/certificate',
    },
  ], [pathname, t]);

  const userNavigation = useMemo(() => [
    { name: t('Profile', 'Profil'), href: '/common/profile' },
    { name: t('Settings', 'Paramètres'), href: '/Student/settings' },
    { name: t('Sign out', 'Déconnexion'), href: '/auth/Login' },
  ], [t]);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === 'en' ? 'fr' : 'en');
  }, []);

  const handleLogout = useCallback(() => {
    // Add logout logic here
    router.push('/auth/Login');
  }, [router]);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  return (
    <>
      <div>
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300"
              onClick={closeSidebar}
            />
            <div className="fixed inset-0 flex">
              <div className={`relative mr-16 flex w-full max-w-xs flex-1 transform transition-transform duration-300 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}>
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button
                    type="button"
                    className="-m-2.5 p-2.5"
                    onClick={closeSidebar}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <X className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
                {/* Sidebar component for mobile */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">GCE</span>
                      </div>
                      <span className="ml-2 text-xl font-bold text-gray-900">
                        {t('Student Portal', 'Portail Étudiant')}
                      </span>
                    </div>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                onClick={closeSidebar}
                                className={`${
                                  item.current
                                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                    : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                                } group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors duration-200`}
                              >
                                <item.icon
                                  className={`${
                                    item.current ? 'text-blue-700' : 'text-gray-400 group-hover:text-blue-700'
                                  } h-6 w-6 shrink-0`}
                                  aria-hidden="true"
                                />
                                {language === 'en' ? item.nameEn : item.nameFr}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">GCE</span>
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">
                  {t('Student Portal', 'Portail Étudiant')}
                </span>
              </div>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`${
                            item.current
                              ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                              : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                          } group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-all duration-200`}
                        >
                          <item.icon
                            className={`${
                              item.current ? 'text-blue-700' : 'text-gray-400 group-hover:text-blue-700'
                            } h-6 w-6 shrink-0`}
                            aria-hidden="true"
                          />
                          {language === 'en' ? item.nameEn : item.nameFr}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-72">
          {/* Top navigation */}
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={openSidebar}>
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="relative flex flex-1 items-center">
                <h1 className="text-lg font-semibold text-gray-900">
                  {useMemo(() =>
                    navigation.find(item => item.current)?.name || t('Student Portal', 'Portail Étudiant'),
                    [navigation, t]
                  )}
                </h1>
              </div>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                {/* Language toggle */}
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="flex items-center gap-x-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  <Globe className="h-4 w-4" />
                  {language === 'en' ? 'FR' : 'EN'}
                </button>

                {/* Notifications */}
                <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Separator */}
                <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    onClick={() => router.push('/common/profile')}
                  >
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <span className="hidden lg:block">{t('Profile', 'Profil')}</span>
                  </button>
                </div>

                {/* Logout button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-x-1 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:block">{t('Logout', 'Déconnexion')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <main className="py-6">
            <div className="px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default memo(StudentLayout);
