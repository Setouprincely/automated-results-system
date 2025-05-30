// pages/admin/dashboard.js
"use client";
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import Head from 'next/head';
import Link from 'next/link';
import { useAdminDashboardStats } from '@/lib/hooks/useAdmin';
import {
  BarChart,
  PieChart,
  UsersIcon,
  Settings,
  Database,
  Activity,
  FileText,
  AlertTriangle,
  Server,
  Globe,
  ChevronRight,
  Loader2,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const [language, setLanguage] = useState<'en' | 'fr'>('en');

  // Replace mock data with real API call
  const {
    data: dashboardData,
    loading,
    error,
    refetch
  } = useAdminDashboardStats();

  // Extract data from API response
  const statistics = dashboardData?.stats || {};
  const alerts = dashboardData?.alerts || [];
  const recentActivity = dashboardData?.recentActivity || [];

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'fr' : 'en');
  };

  // Translations
  const translations = {
    en: {
      title: 'Administrator Dashboard',
      overview: 'System Overview',
      alerts: 'System Alerts',
      recentActivity: 'Recent Activity',
      quickActions: 'Quick Actions',
      statistics: 'Key Statistics',
      totalUsers: 'Total Users',
      activeExams: 'Active Examinations',
      pendingResults: 'Pending Results',
      systemStatus: 'System Status',
      serverUptime: 'Server Uptime',
      todayLogins: "Today's Logins",
      storageUsed: 'Storage Used',
      manageUsers: 'Manage Users',
      configureSystem: 'Configure System',
      backupData: 'Backup Data',
      viewLogs: 'View System Logs',
      monitorSystem: 'Monitor System',
      viewMore: 'View More',
      loading: 'Loading dashboard data...'
    },
    fr: {
      title: 'Tableau de Bord Administrateur',
      overview: 'Aperçu du Système',
      alerts: 'Alertes Système',
      recentActivity: 'Activité Récente',
      quickActions: 'Actions Rapides',
      statistics: 'Statistiques Clés',
      totalUsers: 'Utilisateurs Totaux',
      activeExams: 'Examens Actifs',
      pendingResults: 'Résultats en Attente',
      systemStatus: 'État du Système',
      serverUptime: 'Disponibilité du Serveur',
      todayLogins: "Connexions Aujourd'hui",
      storageUsed: 'Stockage Utilisé',
      manageUsers: 'Gérer les Utilisateurs',
      configureSystem: 'Configurer le Système',
      backupData: 'Sauvegarder les Données',
      viewLogs: 'Voir les Journaux Système',
      monitorSystem: 'Surveiller le Système',
      viewMore: 'Voir Plus',
      loading: 'Chargement des données...'
    }
  };

  const t = translations[language];

  // Loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
            <p className="mt-4 text-gray-700">{t.loading}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>GCE System - {t.title}</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            <button
              onClick={toggleLanguage}
              className="flex items-center px-3 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Globe className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Français' : 'English'}
            </button>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Key Statistics */}
            <div className="col-span-2 bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">{t.statistics}</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <UsersIcon className="h-5 w-5 text-blue-500 mr-2" />
                      <h3 className="text-sm font-medium text-blue-900">{t.totalUsers}</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{statistics.totalUsers?.toLocaleString() || '0'}</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <FileText className="h-5 w-5 text-green-500 mr-2" />
                      <h3 className="text-sm font-medium text-green-900">{t.activeExams}</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-900">{statistics.activeExaminations || '0'}</p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                      <h3 className="text-sm font-medium text-yellow-900">{t.pendingResults}</h3>
                    </div>
                    <p className="text-2xl font-bold text-yellow-900">{statistics.pendingResults || '0'}</p>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Activity className="h-5 w-5 text-indigo-500 mr-2" />
                      <h3 className="text-sm font-medium text-indigo-900">{t.systemStatus}</h3>
                    </div>
                    <p className="text-2xl font-bold text-indigo-900">{statistics.systemStatus || 'Unknown'}</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Server className="h-5 w-5 text-purple-500 mr-2" />
                      <h3 className="text-sm font-medium text-purple-900">{t.serverUptime}</h3>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">{statistics.serverUptime || 'N/A'}</p>
                  </div>

                  <div className="bg-pink-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <UsersIcon className="h-5 w-5 text-pink-500 mr-2" />
                      <h3 className="text-sm font-medium text-pink-900">{t.todayLogins}</h3>
                    </div>
                    <p className="text-2xl font-bold text-pink-900">{statistics.todayLogins || '0'}</p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Database className="h-5 w-5 text-red-500 mr-2" />
                      <h3 className="text-sm font-medium text-red-900">{t.storageUsed}</h3>
                    </div>
                    <p className="text-2xl font-bold text-red-900">{statistics.storageUsed || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Alerts */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">{t.alerts}</h2>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
                <ul className="divide-y divide-gray-200">
                  {alerts.map(alert => (
                    <li key={alert.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start">
                        <div className={`mt-0.5 flex-shrink-0 h-2 w-2 rounded-full ${
                          alert.level === 'error' ? 'bg-red-500' :
                          alert.level === 'warning' ? 'bg-yellow-500' :
                          alert.level === 'success' ? 'bg-green-500' :
                          'bg-blue-500'
                        }`}></div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm text-gray-900">{alert.message}</p>
                          <p className="mt-1 text-xs text-gray-500">{alert.time}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-gray-200 p-2">
                <Link href="/admin/monitoring" className="w-full flex justify-center items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-800">
                  {t.viewMore}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="col-span-2 bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">{t.recentActivity}</h2>
              </div>
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentActivity.map((activity) => (
                      <tr key={activity.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activity.action}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.user}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.details}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-gray-200 p-2">
                <Link href="/admin/logs" className="w-full flex justify-center items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-800">
                  {t.viewMore}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">{t.quickActions}</h2>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <Link href="/admin/users" className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                    <UsersIcon className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">{t.manageUsers}</span>
                  </Link>

                  <Link href="/admin/configuration" className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                    <Settings className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">{t.configureSystem}</span>
                  </Link>

                  <Link href="/admin/backup" className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                    <Database className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">{t.backupData}</span>
                  </Link>

                  <Link href="/admin/logs" className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                    <FileText className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">{t.viewLogs}</span>
                  </Link>

                  <Link href="/admin/monitoring" className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                    <Activity className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">{t.monitorSystem}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}