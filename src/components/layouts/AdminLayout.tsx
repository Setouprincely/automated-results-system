'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  Bell,
  User,
  LogOut,
  Settings,
  HelpCircle,
  Home,
  Users,
  FileText,
  Shield,
  ChevronDown,
  Sun,
  Moon,
  Info,
  Server,
  BookOpen,
  Globe,
  BarChart3
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin layout component with sidebar navigation, dark mode toggle, notifications, and user menu
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname() || '';
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [expandedSections, setExpandedSections] = useState<string[]>(['examinations', 'management', 'system']);
  const [notifications, setNotifications] = useState([
    { id: 1, content: 'New user registered', time: '5 min ago', read: false },
    { id: 2, content: 'System update scheduled', time: '1 hour ago', read: false },
    { id: 3, content: 'Backup completed successfully', time: '3 hours ago', read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Translation helper function
  const t = (en: string, fr: string) => language === 'en' ? en : fr;

  // Toggle language function
  const handleLanguageToggle = () => {
    setLanguage(prev => prev === 'en' ? 'fr' : 'en');
  };

  // Toggle section expansion
  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionName)
        ? prev.filter(s => s !== sectionName)
        : [...prev, sectionName]
    );
  };

  // Toggle dark mode and save preference
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  // Check for saved dark mode preference on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Check screen size and adjust sidebar on mount and resize
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation items with nested subitems
  const navigation = [
    {
      name: t('Dashboard', 'Tableau de Bord'),
      href: '/admin/dashboard',
      icon: Home,
      current: pathname === '/admin/dashboard'
    },
    {
      name: t('User Management', 'Gestion des Utilisateurs'),
      href: '/admin/user',
      icon: Users,
      current: pathname.includes('/admin/user'),
      subitems: [
        { name: t('All Users', 'Tous les Utilisateurs'), href: '/admin/user' },
        { name: t('Roles & Permissions', 'Rôles et Permissions'), href: '/admin/roles' },
        { name: t('User Activity', 'Activité des Utilisateurs'), href: '/admin/user-activity' }
      ]
    },
    {
      name: t('Examinations', 'Examens'),
      href: '#',
      icon: FileText,
      current: pathname.includes('/Examination') || pathname.includes('/admin/examination'),
      subitems: [
        { name: t('Exam Setup', 'Configuration d\'Examen'), href: '/Examination/Examsetup' },
        { name: t('Exam Centers', 'Centres d\'Examen'), href: '/Examination/Centers' },
        { name: t('Subject Management', 'Gestion des Matières'), href: '/Examination/Subjectmanagement' }
      ]
    },
    {
      name: t('Management', 'Gestion'),
      href: '#',
      icon: BookOpen,
      current: pathname.includes('/management'),
      subitems: [
        { name: t('Question Papers', 'Sujets d\'Examen'), href: '/management/question' },
        { name: t('Materials', 'Matériels'), href: '/management/materials' },
        { name: t('Attendance', 'Présence'), href: '/management/attendance' },
        { name: t('Invigilators', 'Surveillants'), href: '/management/invigilator' }
      ]
    },
    {
      name: t('System', 'Système'),
      href: '#',
      icon: Server,
      current: pathname.includes('/admin/system') || pathname.includes('/admin/data-backup') || pathname.includes('/admin/logs'),
      subitems: [
        { name: t('Configuration', 'Configuration'), href: '/admin/system-configuration' },
        { name: t('Monitoring', 'Surveillance'), href: '/admin/system-monitoring' },
        { name: t('Backup & Restore', 'Sauvegarde et Restauration'), href: '/admin/data-backup' },
        { name: t('Logs & Audit', 'Journaux et Audit'), href: '/admin/logs-audit' }
      ]
    },
    {
      name: t('Analytics', 'Analytiques'),
      href: '/admin/analytics',
      icon: BarChart3,
      current: pathname === '/admin/analytics'
    },
    {
      name: t('Security', 'Sécurité'),
      href: '/admin/security',
      icon: Shield,
      current: pathname === '/admin/security'
    },
  ];

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  // Get the current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return now.toLocaleDateString('en-US', options);
  };

  // Handle global search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Searching for: ${searchQuery}`);
      // In a real app, this would redirect to search results page
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K for search focus
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Ctrl/Cmd + B for sidebar toggle
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        setSidebarOpen(!sidebarOpen);
      }

      // Ctrl/Cmd + D for dark mode toggle
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        toggleDarkMode();
      }

      // Escape to close dropdowns
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowUserMenu(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, darkMode]);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar for desktop */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } hidden lg:block transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="h-full flex flex-col">
            {/* Header with logo and toggle */}
            <div className={`flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800`}>
              <div className="flex items-center">
                <div className="relative">
                  <img className="h-8 w-auto transition-transform duration-300 hover:scale-110" src="/images/GCEB.png" alt="GCE System" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                {sidebarOpen && (
                  <span className="ml-3 text-lg font-bold text-white transition-all duration-300 transform">
                    {t('GCE Admin', 'Admin GCE')}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 transform hover:scale-110"
                title={sidebarOpen ? t('Collapse sidebar', 'Réduire la barre latérale') : t('Expand sidebar', 'Étendre la barre latérale')}
              >
                <Menu className={`h-5 w-5 transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Quick stats bar */}
            {sidebarOpen && (
              <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-gray-600 dark:text-gray-300">{t('System Online', 'Système En Ligne')}</span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              <nav className="space-y-1 px-2">
                {navigation.map((item, index) => {
                  const isActive = pathname === item.href || (item.subitems && item.subitems.some(subitem => subitem.href === pathname));
                  const sectionKey = item.name.toLowerCase().replace(/\s+/g, '-');
                  const isExpanded = expandedSections.includes(sectionKey);

                  return (
                    <div
                      key={item.name}
                      className="relative"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {item.subitems ? (
                        <button
                          onClick={() => toggleSection(sectionKey)}
                          className={`${
                            isActive
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                              : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:text-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600'
                          } ${sidebarOpen ? 'justify-between' : 'justify-center'} group flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-md relative overflow-hidden`}
                        >
                          {/* Animated background */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 to-blue-600/0 group-hover:from-blue-400/10 group-hover:to-blue-600/10 transition-all duration-300"></div>

                          <div className="flex items-center relative z-10">
                            <div className="relative">
                              <item.icon className={`${sidebarOpen ? 'mr-3' : ''} flex-shrink-0 h-5 w-5 transition-all duration-200 ${isActive ? 'animate-pulse' : ''}`} aria-hidden="true" />
                              {isActive && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                              )}
                            </div>
                            {sidebarOpen && (
                              <span className="transition-all duration-200 font-medium">{item.name}</span>
                            )}
                          </div>
                          {sidebarOpen && (
                            <ChevronDown className={`h-4 w-4 transition-all duration-300 transform ${isExpanded ? 'rotate-180 text-blue-300' : ''} relative z-10`} />
                          )}

                          {/* Active indicator */}
                          {isActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400 rounded-r-full"></div>
                          )}
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          className={`${
                            isActive
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                              : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:text-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600'
                          } ${sidebarOpen ? 'justify-start' : 'justify-center'} group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-md relative overflow-hidden`}
                        >
                          {/* Animated background */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 to-blue-600/0 group-hover:from-blue-400/10 group-hover:to-blue-600/10 transition-all duration-300"></div>

                          <div className="relative z-10">
                            <item.icon className={`${sidebarOpen ? 'mr-3' : ''} flex-shrink-0 h-5 w-5 transition-all duration-200 ${isActive ? 'animate-pulse' : ''}`} aria-hidden="true" />
                            {isActive && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                            )}
                          </div>
                          {sidebarOpen && (
                            <span className="transition-all duration-200 font-medium relative z-10">{item.name}</span>
                          )}

                          {/* Active indicator */}
                          {isActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400 rounded-r-full"></div>
                          )}
                        </Link>
                      )}

                      {/* Subitems with slide animation */}
                      {item.subitems && sidebarOpen && (
                        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                          <div className="mt-2 ml-6 space-y-1 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
                            {item.subitems.map((subitem, subIndex) => (
                              <Link
                                key={subitem.name}
                                href={subitem.href}
                                className={`${
                                  pathname === subitem.href
                                    ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-500 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
                                } block px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 transform hover:translate-x-1 hover:shadow-sm relative`}
                                style={{ animationDelay: `${subIndex * 30}ms` }}
                              >
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-3 transition-colors duration-200"></div>
                                  {subitem.name}
                                </div>
                                {pathname === subitem.href && (
                                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Language Toggle & User profile section */}
            <div className="border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
              {sidebarOpen ? (
                <div className="p-4 space-y-3">
                  {/* Language Toggle */}
                  <button
                    onClick={handleLanguageToggle}
                    className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md group"
                  >
                    <div className="relative">
                      <Globe className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <span className="group-hover:text-blue-600 transition-colors duration-200">
                      {language === 'en' ? 'Français' : 'English'}
                    </span>
                    <div className="ml-auto">
                      <div className="w-6 h-3 bg-gray-300 rounded-full relative">
                        <div className={`w-3 h-3 bg-blue-500 rounded-full absolute transition-transform duration-300 ${language === 'en' ? 'translate-x-0' : 'translate-x-3'}`}></div>
                      </div>
                    </div>
                  </button>

                  {/* User Profile */}
                  <div className="flex items-center p-3 bg-white dark:bg-gray-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 group cursor-pointer">
                    <div className="flex-shrink-0 relative">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-200">
                        <span className="font-medium text-sm">AD</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors duration-200">
                        {t('Admin User', 'Utilisateur Admin')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">admin@gce.cm</p>
                    </div>
                    <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-2 flex flex-col items-center space-y-3">
                  {/* Collapsed Language Toggle */}
                  <button
                    onClick={handleLanguageToggle}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-110 group"
                    title={language === 'en' ? 'Switch to Français' : 'Switch to English'}
                  >
                    <Globe className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                  </button>

                  {/* Collapsed User Profile */}
                  <div className="relative group cursor-pointer">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-200 transform group-hover:scale-110">
                      <span className="font-medium text-xs">AD</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <img className="h-8 w-auto" src="/images/GCEB.png" alt="GCE System" />
                  <span className="ml-2 text-lg font-bold text-blue-600 dark:text-blue-400">
                    {t('GCE Admin', 'Admin GCE')}
                  </span>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                      <div key={item.name}>
                        <Link
                          href={item.href}
                          className={`${
                            isActive
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                          } group flex items-center px-3 py-2 text-base font-medium rounded-md`}
                        >
                          <item.icon className="mr-3 flex-shrink-0 h-6 w-6" aria-hidden="true" />
                          {item.name}
                        </Link>

                        {/* Subitems for mobile */}
                        {item.subitems && isActive && (
                          <div className="mt-1 ml-6 space-y-1">
                            {item.subitems.map((subitem) => (
                              <Link
                                key={subitem.name}
                                href={subitem.href}
                                className={`${
                                  pathname === subitem.href
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                } block px-3 py-2 text-sm font-medium rounded-md`}
                              >
                                {subitem.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>

              <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      <span className="font-medium text-sm">AD</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Admin User</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">admin@example.com</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 w-14" aria-hidden="true">
              {/* Force sidebar to shrink to fit close icon */}
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Enhanced Top navigation */}
          <header className="bg-white dark:bg-gray-800 shadow-lg z-10 relative overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-indigo-50/30 to-purple-50/30 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800"></div>

            <div className="relative z-10 h-16 flex items-center justify-between px-4 sm:px-6">
              <div className="flex items-center space-x-4">
                {/* Enhanced Mobile menu button */}
                <button
                  type="button"
                  className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-white/80 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-md"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <span className="sr-only">Open sidebar</span>
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Page title with breadcrumb */}
                <div className="hidden sm:block">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {navigation.find(item =>
                        item.href === pathname ||
                        (item.subitems && item.subitems.some(sub => sub.href === pathname))
                      )?.name || t('Dashboard', 'Tableau de Bord')}
                    </h1>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Enhanced Search bar */}
                <form onSubmit={handleSearch} className="hidden md:block ml-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className={`h-5 w-5 transition-colors duration-200 ${searchFocused ? 'text-blue-500' : 'text-gray-400'}`} aria-hidden="true" />
                      </div>
                      <input
                        type="text"
                        placeholder={t('Search admin panel...', 'Rechercher dans le panneau admin...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 transform focus:scale-105 shadow-sm focus:shadow-lg sm:text-sm"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          <X className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              <div className="flex items-center space-x-3">
                {/* Enhanced Dark mode toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-700 group"
                  title={darkMode ? t('Switch to light mode', 'Passer en mode clair') : t('Switch to dark mode', 'Passer en mode sombre')}
                >
                  <div className="relative">
                    {darkMode ? (
                      <Sun className="h-5 w-5 transition-transform duration-300 group-hover:rotate-180" aria-hidden="true" />
                    ) : (
                      <Moon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" aria-hidden="true" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </button>

                {/* Language toggle for desktop */}
                <button
                  onClick={handleLanguageToggle}
                  className="hidden lg:flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md group"
                  title={language === 'en' ? 'Switch to Français' : 'Switch to English'}
                >
                  <Globe className="mr-2 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                  <span className="group-hover:text-blue-600 transition-colors duration-200">
                    {language === 'en' ? 'FR' : 'EN'}
                  </span>
                </button>

                {/* Enhanced Notifications dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-700 group"
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowUserMenu(false);
                    }}
                  >
                    <span className="sr-only">View notifications</span>
                    <div className="relative">
                      <Bell className="h-5 w-5 transition-transform duration-200 group-hover:animate-pulse" aria-hidden="true" />
                      {notifications.some(n => !n.read) && (
                        <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800 animate-ping"></span>
                      )}
                      {notifications.some(n => !n.read) && (
                        <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
                      )}
                    </div>
                  </button>

                  {/* Notifications panel */}
                  {showNotifications && (
                    <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700">
                      <div className="py-2 px-4 flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Notifications</h3>
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          Mark all as read
                        </button>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="py-4 px-4 text-sm text-center text-gray-500 dark:text-gray-400">No notifications</p>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                              }`}
                            >
                              <p className="text-sm text-gray-900 dark:text-gray-100">{notification.content}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="py-2 px-4">
                        <Link
                          href="/admin/notifications"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Profile dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-110 group"
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                      setShowNotifications(false);
                    }}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="relative">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-200">
                        <span className="font-medium text-sm">AD</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/20 group-hover:to-purple-400/20 transition-all duration-300"></div>
                    </div>
                  </button>

                  {/* User menu dropdown */}
                  {showUserMenu && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700">
                      <div className="py-2 px-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Admin User</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">admin@example.com</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/admin/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <User className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                          Profile
                        </Link>
                        <Link
                          href="/admin/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Settings className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                          Settings
                        </Link>
                        <Link
                          href="/admin/help"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <HelpCircle className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                          Help Center
                        </Link>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => alert('Logging out...')}
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <LogOut className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Breadcrumb and date/time */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-2 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs">
              <div className="flex items-center py-1">
                <Link href="/admin/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                  Home
                </Link>
                <span className="mx-2 text-gray-500">/</span>
                <span className="text-gray-900 dark:text-gray-100">User Management</span>
              </div>
              <div className="flex items-center py-1">
                <span className="text-gray-500 dark:text-gray-400">{getCurrentDateTime()}</span>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {children}
          </main>

          {/* Enhanced Floating Action Buttons */}
          <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
            {/* Help button */}
            <div className="relative group">
              <button
                type="button"
                className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-full text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-110 group"
                onClick={() => alert('Help center opening...')}
              >
                <HelpCircle className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/30 group-hover:to-purple-400/30 rounded-full transition-all duration-300"></div>
              </button>
              {/* Tooltip */}
              <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {t('Help & Support', 'Aide et Support')}
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
              </div>
            </div>

            {/* Quick Actions button */}
            <div className="relative group">
              <button
                type="button"
                className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-full text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-110 group"
                onClick={() => alert('Quick actions menu...')}
              >
                <Settings className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
              </button>
              {/* Tooltip */}
              <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {t('Quick Actions', 'Actions Rapides')}
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
              </div>
            </div>
          </div>

          {/* Enhanced System status indicator */}
          <div className={`fixed bottom-6 transition-all duration-300 ${sidebarOpen ? 'left-72' : 'left-24'} lg:block hidden z-40`}>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg flex items-center space-x-3 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <span className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="absolute inset-0 h-3 w-3 bg-green-500 rounded-full animate-ping opacity-75"></span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('System Online', 'Système En Ligne')}
                </span>
              </div>
              <button
                onClick={() => alert('System status information')}
                className="p-1 rounded-full text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200 transform hover:scale-110"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mobile system status */}
          <div className="fixed bottom-6 left-6 lg:hidden z-40">
            <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="relative">
                <span className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
                <span className="absolute inset-0 h-3 w-3 bg-green-500 rounded-full animate-ping opacity-75"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}