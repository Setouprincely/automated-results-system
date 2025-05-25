"use client";
import React, { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  Bell, 
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  HelpCircle,
  Home,
  Globe,
  MenuIcon,
  X,
  ChevronRight
} from 'lucide-react';

interface SimpleLayoutProps {
  children: ReactNode;
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

export default function SimpleLayout({ children }: SimpleLayoutProps) {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
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
  ]);

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
      {/* Main content area */}
      <div className="flex flex-col w-full flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 shadow">
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
