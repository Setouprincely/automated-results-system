// components/layouts/AdminLayout.jsx

"use client";
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
  Calendar,
  BarChart2,
  MessageSquare,
  Shield,
  ChevronDown,
  Sun,
  Moon,
  Info
} from 'lucide-react';

/**
 * @typedef {Object} AdminLayoutProps
 * @property {React.ReactNode} children
 */

/**
 * Admin layout component with sidebar navigation, dark mode toggle, notifications, and user menu
 * @param {AdminLayoutProps} props
 */
export default function AdminLayout({ children }) {
  const pathname = usePathname() || '';
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, content: 'New user registered', time: '5 min ago', read: false },
    { id: 2, content: 'System update scheduled', time: '1 hour ago', read: false },
    { id: 3, content: 'Backup completed successfully', time: '3 hours ago', read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
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
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { 
      name: 'User Management', 
      href: '/admin/user-management', 
      icon: Users,
      current: pathname === '/admin/user-management',
      subitems: [
        { name: 'All Users', href: '/admin/user-management' },
        { name: 'Roles & Permissions', href: '/admin/roles' },
        { name: 'User Activity', href: '/admin/user-activity' }
      ]
    },
    { 
      name: 'Examinations', 
      href: '/admin/examinations', 
      icon: FileText,
      subitems: [
        { name: 'Exam Schedule', href: '/admin/exam-schedule' },
        { name: 'Exam Results', href: '/admin/exam-results' },
        { name: 'Question Bank', href: '/admin/question-bank' }
      ]
    },
    { name: 'Calendar', href: '/admin/calendar', icon: Calendar },
    { name: 'Reports', href: '/admin/reports', icon: BarChart2 },
    { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
    { name: 'Security', href: '/admin/security', icon: Shield },
  ];

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  // Get the current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    const options = { 
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
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Searching for: ${searchQuery}`);
      // In a real app, this would redirect to search results page
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar for desktop */}
        <aside 
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } hidden lg:block transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}
        >
          <div className="h-full flex flex-col">
            <div className={`flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700`}>
              <div className="flex items-center">
                {sidebarOpen ? (
                  <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400">ExamAdmin</h1>
                ) : (
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">EA</span>
                )}
              </div>
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronDown className={`h-5 w-5 transition-transform ${!sidebarOpen ? 'rotate-90' : ''}`} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="space-y-1 px-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || (item.subitems && item.subitems.some(subitem => subitem.href === pathname));
                  
                  return (
                    <div key={item.name}>
                      <Link 
                        href={item.href}
                        className={`${
                          isActive
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        } ${sidebarOpen ? 'justify-between' : 'justify-center'} group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
                      >
                        <div className="flex items-center">
                          <item.icon className={`${sidebarOpen ? 'mr-3' : ''} flex-shrink-0 h-5 w-5`} aria-hidden="true" />
                          {sidebarOpen && <span>{item.name}</span>}
                        </div>
                        {item.subitems && sidebarOpen && (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Link>
                      
                      {/* Subitems */}
                      {item.subitems && isActive && sidebarOpen && (
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
            
            {/* User profile section */}
            {sidebarOpen && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
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
            )}
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
                  <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400">ExamAdmin</h1>
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
          {/* Top navigation */}
          <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
            <div className="h-16 flex items-center justify-between px-4 sm:px-6">
              <div className="flex items-center">
                {/* Mobile menu button */}
                <button
                  type="button"
                  className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <span className="sr-only">Open sidebar</span>
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
                
                {/* Search bar */}
                <form onSubmit={handleSearch} className="hidden md:block ml-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </form>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Dark mode toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-1 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {darkMode ? (
                    <Sun className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Moon className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>
                
                {/* Notifications dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    className="p-1 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowUserMenu(false);
                    }}
                  >
                    <span className="sr-only">View notifications</span>
                    <div className="relative">
                      <Bell className="h-6 w-6" aria-hidden="true" />
                      {notifications.some(n => !n.read) && (
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
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
                
                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                      setShowNotifications(false);
                    }}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      <span className="font-medium text-sm">AD</span>
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
          
          {/* Help button (fixed position) */}
          <div className="fixed bottom-6 right-6">
            <button 
              type="button"
              className="bg-blue-600 p-3 rounded-full text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => alert('Help center opening...')}
            >
              <HelpCircle className="h-6 w-6" />
            </button>
          </div>
          
          {/* System status indicator */}
          <div className="fixed bottom-6 left-6 lg:left-72">
            <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg flex items-center">
              <div className="flex items-center mr-2">
                <span className="h-3 w-3 bg-green-500 rounded-full mr-1"></span>
                <span className="text-xs text-gray-600 dark:text-gray-300">System Online</span>
              </div>
              <button
                onClick={() => alert('System status information')}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}