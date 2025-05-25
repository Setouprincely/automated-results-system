"use client";
import React, { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  ChevronDown,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  HelpCircle,
  Home,
  Users,
  FileText,
  BarChart,
  Database,
  Server,
  Shield,
  AlertTriangle,
  Activity,
  Globe,
  MenuIcon,
  X,
  ChevronRight
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  current?: boolean;
  children?: NavigationItem[];
}

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface SystemStatus {
  status: 'operational' | 'degraded' | 'outage';
  message: string;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('en');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'operational',
    message: 'All systems operational'
  });

  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'System Update',
      message: 'System update v2.4.1 is available for installation',
      time: '2h ago',
      read: false,
      type: 'info'
    },
    {
      id: 2,
      title: 'Login Alert',
      message: 'Suspicious login attempt detected',
      time: '5h ago',
      read: false,
      type: 'warning'
    },
    {
      id: 3,
      title: 'Database Backup',
      message: 'Daily backup completed successfully',
      time: '6h ago',
      read: false,
      type: 'success'
    },
    {
      id: 4,
      title: 'Server Error',
      message: 'API endpoint /results/validate experiencing high error rate',
      time: '1d ago',
      read: true,
      type: 'error'
    },
  ]);

  // Navigation structure
  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home, current: pathname === '/admin/dashboard' },
    { name: 'Users', href: '/admin/users', icon: Users, current: pathname === '/admin/users' },
    {
      name: 'Examinations',
      href: '#',
      icon: FileText,
      current: pathname.includes('/admin/examinations'),
      children: [
        { name: 'Active Exams', href: '/admin/examinations/active', current: pathname === '/admin/examinations/active' },
        { name: 'Results', href: '/admin/examinations/results', current: pathname === '/admin/examinations/results' },
        { name: 'Schedule', href: '/admin/examinations/schedule', current: pathname === '/admin/examinations/schedule' },
      ]
    },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart, current: pathname === '/admin/analytics' },
    { name: 'Database', href: '/admin/database', icon: Database, current: pathname === '/admin/database' },
    { name: 'System', href: '/admin/system', icon: Server, current: pathname === '/admin/system' },
    { name: 'Security', href: '/admin/security', icon: Shield, current: pathname === '/admin/security' },
    { name: 'Logs', href: '/admin/logs', icon: FileText, current: pathname === '/admin/logs' },
    { name: 'Monitoring', href: '/admin/monitoring', icon: Activity, current: pathname === '/admin/monitoring' },
  ];

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(p => p);
    const breadcrumbs = [];

    let currentPath = '';

    for (let i = 0; i < paths.length; i++) {
      currentPath += `/${paths[i]}`;
      breadcrumbs.push({
        name: paths[i].charAt(0).toUpperCase() + paths[i].slice(1),
        href: currentPath,
        current: i === paths.length - 1
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Toggle dark mode and save preference to localStorage
  const toggleDarkMode = () => {
    const newDarkModeState = !isDarkMode;
    setIsDarkMode(newDarkModeState);
    localStorage.setItem('darkMode', JSON.stringify(newDarkModeState));

    if (newDarkModeState) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Toggle language
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'fr' : 'en');
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Searching for: ${searchQuery}`);
    // Implement search functionality
  };

  // Mark notification as read
  const markNotificationAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
    updateUnreadCount();
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadNotificationsCount(0);
  };

  // Update unread notifications count
  const updateUnreadCount = () => {
    const unreadCount = notifications.filter(notification => !notification.read).length;
    setUnreadNotificationsCount(unreadCount);
  };

  // Fetch system status from API
  const fetchSystemStatus = async () => {
    // In a real app, this would be an API call
    // const response = await fetch('/api/system/status');
    // const data = await response.json();
    // setSystemStatus(data);

    // Mock data
    setSystemStatus({
      status: 'operational',
      message: 'All systems operational'
    });
  };

  // Effect to load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      const darkModeState = JSON.parse(savedDarkMode);
      setIsDarkMode(darkModeState);

      if (darkModeState) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Check system preference
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDarkMode);

      if (prefersDarkMode) {
        document.documentElement.classList.add('dark');
      }
    }

    updateUnreadCount();
    fetchSystemStatus();
  }, []);

  // Translations
  const translations = {
    en: {
      search: 'Search...',
      notifications: 'Notifications',
      markAllAsRead: 'Mark all as read',
      viewAll: 'View all notifications',
      profile: 'Your Profile',
      settings: 'Settings',
      help: 'Help & Support',
      logout: 'Log out',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      systemStatus: 'System Status',
      operational: 'Operational',
      degraded: 'Degraded',
      outage: 'Outage',
    },
    fr: {
      search: 'Rechercher...',
      notifications: 'Notifications',
      markAllAsRead: 'Marquer tout comme lu',
      viewAll: 'Voir toutes les notifications',
      profile: 'Votre Profil',
      settings: 'Paramètres',
      help: 'Aide et Support',
      logout: 'Se déconnecter',
      darkMode: 'Mode Sombre',
      lightMode: 'Mode Clair',
      systemStatus: 'État du Système',
      operational: 'Opérationnel',
      degraded: 'Dégradé',
      outage: 'Panne',
    }
  };

  const t = translations[language as keyof typeof translations];

  return (
    <div className={`h-screen flex overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-indigo-600 dark:bg-indigo-800">
              <Link href="/admin/dashboard" className="flex items-center">
                <img
                  className="h-8 w-auto"
                  src="/images/GCEB.png"
                  alt="GCE System"
                />
                <span className="ml-2 text-white font-medium text-lg">GCE Admin</span>
              </Link>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => !item.children ? (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      item.current
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {React.createElement(item.icon, {
                      className: `mr-3 h-5 w-5 ${
                        item.current ? 'text-indigo-500 dark:text-indigo-300' : 'text-gray-400 dark:text-gray-400'
                      }`,
                      'aria-hidden': true,
                    })}
                    {item.name}
                  </Link>
                ) : (
                  <div key={item.name}>
                    <button
                      className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        item.current
                          ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => {
                        // Toggle submenu
                        const updatedNav = navigation.map(navItem =>
                          navItem.name === item.name
                            ? { ...navItem, isOpen: !navItem.isOpen }
                            : navItem
                        );
                        // setNavigation(updatedNav);
                      }}
                    >
                      {React.createElement(item.icon, {
                        className: `mr-3 h-5 w-5 ${
                          item.current ? 'text-indigo-500 dark:text-indigo-300' : 'text-gray-400 dark:text-gray-400'
                        }`,
                        'aria-hidden': true,
                      })}
                      <span className="flex-1">{item.name}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>

                    {/* Submenu */}
                    <div className="pl-10 space-y-1 mt-1">
                      {item.children?.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                            child.current
                              ? 'text-indigo-600 dark:text-indigo-300'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                          }`}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div>
                    <div className="inline-block h-9 w-9 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-600">
                      <svg className="h-full w-full text-gray-300 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin User</p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                      System Administrator
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white dark:bg-gray-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-shrink-0 flex items-center px-4">
              <img className="h-8 w-auto" src="/images/GCEB.png" alt="GCE System" />
              <span className="ml-2 text-gray-900 dark:text-white font-medium text-lg">GCE Admin</span>
            </div>
            <div className="mt-5 flex-1 h-0 overflow-y-auto">
              <nav className="px-2 space-y-1">
                {navigation.map((item) => !item.children ? (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      item.current
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {React.createElement(item.icon, {
                      className: `mr-4 h-6 w-6 ${
                        item.current ? 'text-indigo-500 dark:text-indigo-300' : 'text-gray-400 dark:text-gray-400'
                      }`,
                      'aria-hidden': true,
                    })}
                    {item.name}
                  </Link>
                ) : (
                  <div key={item.name}>
                    <button
                      className={`w-full group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        item.current
                          ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => {
                        // Toggle submenu
                        const updatedNav = navigation.map(navItem =>
                          navItem.name === item.name
                            ? { ...navItem, isOpen: !navItem.isOpen }
                            : navItem
                        );
                        // setNavigation(updatedNav);
                      }}
                    >
                      {React.createElement(item.icon, {
                        className: `mr-4 h-6 w-6 ${
                          item.current ? 'text-indigo-500 dark:text-indigo-300' : 'text-gray-400 dark:text-gray-400'
                        }`,
                        'aria-hidden': true,
                      })}
                      <span className="flex-1">{item.name}</span>
                      <ChevronDown className="h-5 w-5" />
                    </button>

                    {/* Submenu */}
                    <div className="pl-12 space-y-1 mt-1">
                      {item.children?.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                            child.current
                              ? 'text-indigo-600 dark:text-indigo-300'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex-shrink-0 group block">
                <div className="flex items-center">
                  <div>
                    <div className="inline-block h-10 w-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <svg className="h-full w-full text-gray-300 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-700 dark:text-gray-300">Admin User</p>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                      System Administrator
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center px-4 border-r border-gray-200 dark:border-gray-700">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <div>
                    <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                      <Home className="flex-shrink-0 h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">Home</span>
                    </Link>
                  </div>
                </li>
                {breadcrumbs.map((item) => (
                  <li key={item.href}>
                    <div className="flex items-center">
                      <ChevronRight className="flex-shrink-0 h-5 w-5 text-gray-400" aria-hidden="true" />
                      <Link
                        href={item.href}
                        className={`ml-4 text-sm font-medium ${
                          item.current
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </Link>
                    </div>
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <form className="w-full flex md:ml-0" onSubmit={handleSearch}>
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <div className="relative w-full text-gray-400 focus-within:text-gray-600 dark:focus-within:text-gray-300">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <Search className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    id="search-field"
                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-0 focus:border-transparent sm:text-sm bg-transparent"
                    placeholder={t.search}
                    type="search"
                    name="search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              </form>
            </div>

            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* System status indicator */}
              <div className="flex items-center">
                <div className={`h-2 w-2 rounded-full mr-2 ${
                  systemStatus.status === 'operational' ? 'bg-green-500' :
                  systemStatus.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {systemStatus.status === 'operational' ? t.operational :
                   systemStatus.status === 'degraded' ? t.degraded : t.outage}
                </span>
              </div>

              {/* Language toggle */}
              <button
                type="button"
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                onClick={toggleLanguage}
              >
                <span className="sr-only">Change language</span>
                <Globe className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Dark mode toggle */}
              <button
                type="button"
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                onClick={toggleDarkMode}
              >
                <span className="sr-only">
                  {isDarkMode ? t.lightMode : t.darkMode}
                </span>
                {isDarkMode ? (
                  <Sun className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Moon className="h-6 w-6" aria-hidden="true" />
                )}
              </button>

              {/* Notifications dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                >
                  <span className="sr-only">{t.notifications}</span>
                  <div className="relative">
                    <Bell className="h-6 w-6" aria-hidden="true" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute top-0 right-0 -mt-1 -mr-1 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-xs font-medium text-white">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </div>
                </button>

                {isNotificationsOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.notifications}</h3>
                          <button
                            type="button"
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                            onClick={markAllNotificationsAsRead}
                          >
                            {t.markAllAsRead}
                          </button>
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">No notifications</p>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                !notification.read ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                              }`}
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <div className="flex items-start">
                                <div className={`flex-shrink-0 h-2 w-2 mt-2 rounded-full ${
                                  notification.type === 'info' ? 'bg-blue-500' :
                                  notification.type === 'warning' ? 'bg-yellow-500' :
                                  notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                                }`}></div>
                                <div className="ml-3 w-0 flex-1">
                                  <p className={`text-sm font-medium ${
                                    !notification.read ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
                                  }`}>
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    {notification.time}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700">
                        <Link
                          href="/admin/notifications"
                          className="block px-4 py-2 text-sm text-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                          onClick={() => setIsNotificationsOpen(false)}
                        >
                          {t.viewAll}
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="max-w-xs bg-white dark:bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                      <Link
                        href="/admin/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <User className="mr-3 h-4 w-4" aria-hidden="true" />
                          {t.profile}
                        </div>
                      </Link>
                      <Link
                        href="/admin/settings"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <Settings className="mr-3 h-4 w-4" aria-hidden="true" />
                          {t.settings}
                        </div>
                      </Link>
                      <Link
                        href="/admin/help"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <HelpCircle className="mr-3 h-4 w-4" aria-hidden="true" />
                          {t.help}
                        </div>
                      </Link>
                      <div className="border-t border-gray-200 dark:border-gray-700"></div>
                      <Link
                        href="/logout"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <LogOut className="mr-3 h-4 w-4" aria-hidden="true" />
                          {t.logout}
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}