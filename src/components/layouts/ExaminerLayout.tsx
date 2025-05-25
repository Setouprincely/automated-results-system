'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Home,
  ClipboardList,
  FileCheck,
  BarChart3,
  CheckCircle,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Globe,
  Timer,
  Award,
  TrendingUp,
  Activity,
  BookOpen,
  Target,
  Zap,
  ChevronDown,
  ChevronRight,
  Bookmark,
  Calendar,
  Clock,
  MessageSquare,
  HelpCircle,
  Download,
  Upload,
  Filter,
  SortAsc,
  Eye,
  Edit,
  Save,
  RefreshCw,
  AlertCircle,
  CheckSquare,
  FileText,
  PieChart,
  BarChart,
  LineChart
} from 'lucide-react';

interface ExaminerLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  current: boolean;
  subitems?: { name: string; href: string }[];
}

interface Notification {
  id: number;
  content: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

export default function ExaminerLayout({ children }: ExaminerLayoutProps) {
  const pathname = usePathname() || '';
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [expandedSections, setExpandedSections] = useState<string[]>(['marking', 'performance']);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, content: 'New script assigned for marking', time: '5 min ago', read: false, type: 'info' },
    { id: 2, content: 'Deadline approaching for Mathematics scripts', time: '1 hour ago', read: false, type: 'warning' },
    { id: 3, content: 'Performance report generated', time: '2 hours ago', read: true, type: 'success' },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Helper function for translations
  const t = (en: string, fr: string) => (language === 'en' ? en : fr);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Handle language toggle
  const handleLanguageToggle = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  // Toggle expanded sections
  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionName)
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    );
  };

  // Navigation structure matching AdminLayout pattern
  const navigation: NavigationItem[] = [
    {
      name: t('Dashboard', 'Tableau de Bord'),
      href: '/Examinar/dashboard',
      icon: Home,
      current: pathname === '/Examinar/dashboard'
    },
    {
      name: t('Script Marking', 'Correction de Copies'),
      href: '#',
      icon: ClipboardList,
      current: pathname.includes('/Examinar/marking'),
      subitems: [
        { name: t('Active Scripts', 'Copies Actives'), href: '/Examinar/marking' },
        { name: t('Quick Mark', 'Correction Rapide'), href: '/Examinar/marking/quick' },
        { name: t('Batch Processing', 'Traitement par Lot'), href: '/Examinar/marking/batch' }
      ]
    },
    {
      name: t('All Scripts', 'Toutes les Copies'),
      href: '#',
      icon: FileText,
      current: pathname.includes('/Examinar/scripts'),
      subitems: [
        { name: t('All Scripts', 'Toutes les Copies'), href: '/Examinar/scripts' },
        { name: t('Pending Review', 'En Attente de Révision'), href: '/Examinar/scripts/pending' },
        { name: t('Completed', 'Terminées'), href: '/Examinar/scripts/completed' }
      ]
    },
    {
      name: t('Verification', 'Vérification'),
      href: '#',
      icon: FileCheck,
      current: pathname.includes('/Examinar/verification'),
      subitems: [
        { name: t('Quality Check', 'Contrôle Qualité'), href: '/Examinar/verification' },
        { name: t('Cross Verification', 'Vérification Croisée'), href: '/Examinar/verification/cross' }
      ]
    },
    {
      name: t('Performance', 'Performance'),
      href: '#',
      icon: BarChart3,
      current: pathname.includes('/Examinar/performance'),
      subitems: [
        { name: t('Overview', 'Aperçu'), href: '/Examinar/performance' },
        { name: t('Analytics', 'Analytiques'), href: '/Examinar/performance/analytics' },
        { name: t('Reports', 'Rapports'), href: '/Examinar/performance/reports' }
      ]
    },
    {
      name: t('Score Analysis', 'Analyse des Notes'),
      href: '#',
      icon: Award,
      current: pathname.includes('/Examinar/score'),
      subitems: [
        { name: t('Score Analysis', 'Analyse des Notes'), href: '/Examinar/score' },
        { name: t('Grade Distribution', 'Distribution des Notes'), href: '/Examinar/score/distribution' }
      ]
    }
  ];

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
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

  const unreadCount = notifications.filter(n => !n.read).length;

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
            <div className={`flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-indigo-700 dark:from-purple-700 dark:to-indigo-800`}>
              <div className="flex items-center">
                <div className="relative">
                  <img className="h-8 w-auto transition-transform duration-300 hover:scale-110" src="/images/GCEB.png" alt="GCE System" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                {sidebarOpen && (
                  <span className="ml-3 text-lg font-bold text-white transition-all duration-300 transform">
                    {t('GCE Examiner', 'Examinateur GCE')}
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
              <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-gray-600 dark:text-gray-300">{t('Examiner Online', 'Examinateur En Ligne')}</span>
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
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg transform scale-105'
                              : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:text-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600'
                          } ${sidebarOpen ? 'justify-between' : 'justify-center'} group flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-md relative overflow-hidden`}
                        >
                          {/* Animated background */}
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 to-indigo-600/0 group-hover:from-purple-400/10 group-hover:to-indigo-600/10 transition-all duration-300"></div>

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
                            <ChevronDown className={`h-4 w-4 transition-all duration-300 transform ${isExpanded ? 'rotate-180 text-purple-300' : ''} relative z-10`} />
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
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg transform scale-105'
                              : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:text-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600'
                          } ${sidebarOpen ? 'justify-start' : 'justify-center'} group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-md relative overflow-hidden`}
                        >
                          {/* Animated background */}
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 to-indigo-600/0 group-hover:from-purple-400/10 group-hover:to-indigo-600/10 transition-all duration-300"></div>

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
                                    ? 'bg-purple-50 text-purple-600 border-l-2 border-purple-500 dark:bg-purple-900/30 dark:text-purple-400'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
                                } block px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 transform hover:translate-x-1 hover:shadow-sm relative`}
                                style={{ animationDelay: `${subIndex * 30}ms` }}
                              >
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-3 transition-colors duration-200"></div>
                                  {subitem.name}
                                </div>
                                {pathname === subitem.href && (
                                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
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
                      <Globe className="mr-3 h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <span className="group-hover:text-purple-600 transition-colors duration-200">
                      {language === 'en' ? 'Français' : 'English'}
                    </span>
                    <div className="ml-auto">
                      <div className="w-6 h-3 bg-gray-300 rounded-full relative">
                        <div className={`w-3 h-3 bg-purple-500 rounded-full absolute transition-transform duration-300 ${language === 'en' ? 'translate-x-0' : 'translate-x-3'}`}></div>
                      </div>
                    </div>
                  </button>

                  {/* User Profile */}
                  <div className="flex items-center p-3 bg-white dark:bg-gray-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 group cursor-pointer">
                    <div className="flex-shrink-0 relative">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-200">
                        <span className="font-medium text-sm">DN</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-purple-600 transition-colors duration-200">
                        {t('Dr. Nkeng', 'Dr. Nkeng')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('Mathematics Examiner', 'Examinateur de Mathématiques')}</p>
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
                    <Globe className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
                  </button>

                  {/* Collapsed User Profile */}
                  <div className="relative group cursor-pointer">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-200 transform group-hover:scale-110">
                      <span className="font-medium text-xs">DN</span>
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
                  <span className="ml-2 text-lg font-bold text-purple-600 dark:text-purple-400">
                    {t('GCE Examiner', 'Examinateur GCE')}
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
                              ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
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
                                    ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
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
                    <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white">
                      <span className="font-medium text-sm">DN</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Dr. Nkeng</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Mathematics Examiner</p>
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
            <div className="absolute inset-0 bg-gradient-to-r from-purple-50/30 via-indigo-50/30 to-blue-50/30 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800"></div>

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
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Enhanced Search bar */}
                <form onSubmit={handleSearch} className="hidden md:block ml-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className={`h-5 w-5 transition-colors duration-200 ${searchFocused ? 'text-purple-500' : 'text-gray-400'}`} aria-hidden="true" />
                      </div>
                      <input
                        type="text"
                        placeholder={t('Search examiner panel...', 'Rechercher dans le panneau examinateur...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 transform focus:scale-105 shadow-sm focus:shadow-lg sm:text-sm"
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
                  className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-700 group"
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
                  <Globe className="mr-2 h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
                  <span className="group-hover:text-purple-600 transition-colors duration-200">
                    {language === 'en' ? 'FR' : 'EN'}
                  </span>
                </button>

                {/* Enhanced Notifications dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-700 group"
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowUserMenu(false);
                    }}
                  >
                    <span className="sr-only">View notifications</span>
                    <div className="relative">
                      <Bell className="h-5 w-5 transition-transform duration-200 group-hover:rotate-12" aria-hidden="true" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-pulse">
                          {unreadCount}
                        </span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </button>

                  {/* Enhanced Notifications dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 transform transition-all duration-200 scale-100 opacity-100">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-t-xl">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {t('Notifications', 'Notifications')}
                          </h3>
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors duration-200"
                          >
                            {t('Mark all read', 'Tout marquer comme lu')}
                          </button>
                        </div>
                        {unreadCount > 0 && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {t(`${unreadCount} unread notifications`, `${unreadCount} notifications non lues`)}
                          </p>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                        {notifications.map((notification, index) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-[1.02] ${
                              !notification.read ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500' : ''
                            }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                                notification.type === 'error' ? 'bg-red-500 animate-pulse' :
                                notification.type === 'warning' ? 'bg-yellow-500 animate-pulse' :
                                notification.type === 'success' ? 'bg-green-500' : 'bg-purple-500'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{notification.content}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {notification.time}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-b-xl">
                        <button className="w-full text-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium transition-colors duration-200 py-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30">
                          {t('View all notifications', 'Voir toutes les notifications')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced User menu */}
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl group"
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                      setShowNotifications(false);
                    }}
                  >
                    <div className="relative">
                      <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-sm font-bold">DN</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">Dr. Nkeng</p>
                      <p className="text-xs opacity-75">{t('Examiner', 'Examinateur')}</p>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* User dropdown menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 transform transition-all duration-200 scale-100 opacity-100">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                            DN
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Dr. Nkeng</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('Mathematics Examiner', 'Examinateur de Mathématiques')}</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <Link href="/Examinar/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                          <User className="mr-3 h-4 w-4" />
                          {t('Profile', 'Profil')}
                        </Link>
                        <Link href="/Examinar/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                          <Settings className="mr-3 h-4 w-4" />
                          {t('Settings', 'Paramètres')}
                        </Link>
                        <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200">
                          <LogOut className="mr-3 h-4 w-4" />
                          {t('Sign out', 'Déconnexion')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
