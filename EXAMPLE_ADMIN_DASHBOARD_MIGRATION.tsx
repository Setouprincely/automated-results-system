// EXAMPLE: How to migrate Admin Dashboard from mock data to API calls
// File: src/app/admin/dashboard/page.tsx

"use client";
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
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
  Loader2
} from 'lucide-react';

// BEFORE: Mock data (remove this)
/*
const mockStatistics = {
  totalUsers: 8750,
  activeExaminations: 12,
  pendingResults: 4,
  systemStatus: "Operational",
  serverUptime: "99.98%",
  todayLogins: 243,
  storageUsed: "68%"
};
*/

// AFTER: Using API hooks
export default function AdminDashboard() {
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  
  // Replace mock data with API call
  const { 
    data: dashboardData, 
    loading, 
    error, 
    refetch 
  } = useAdminDashboardStats();

  // Extract data from API response
  const statistics = dashboardData?.stats || {};
  const recentActivity = dashboardData?.recentActivity || [];
  const alerts = dashboardData?.alerts || [];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  // Translations
  const t = {
    title: language === 'en' ? 'Admin Dashboard' : 'Tableau de Bord Admin',
    overview: language === 'en' ? 'System Overview' : 'Aperçu du Système',
    totalUsers: language === 'en' ? 'Total Users' : 'Utilisateurs Totaux',
    activeExams: language === 'en' ? 'Active Examinations' : 'Examens Actifs',
    pendingResults: language === 'en' ? 'Pending Results' : 'Résultats en Attente',
    systemStatus: language === 'en' ? 'System Status' : 'État du Système',
    recentActivity: language === 'en' ? 'Recent Activity' : 'Activité Récente',
    systemAlerts: language === 'en' ? 'System Alerts' : 'Alertes Système',
    loading: language === 'en' ? 'Loading dashboard data...' : 'Chargement des données...',
    error: language === 'en' ? 'Error loading dashboard' : 'Erreur de chargement',
    retry: language === 'en' ? 'Retry' : 'Réessayer'
  };

  // Loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">{t.loading}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{t.error}: {error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {t.retry}
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-gray-600 mt-1">{t.overview}</p>
          </div>
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {language === 'en' ? 'Français' : 'English'}
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t.totalUsers}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.totalUsers?.toLocaleString() || '0'}
                </p>
              </div>
              <UsersIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t.activeExams}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.activeExaminations || '0'}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t.pendingResults}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.pendingResults || '0'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t.systemStatus}</p>
                <p className="text-2xl font-bold text-green-600">
                  {statistics.systemStatus || 'Unknown'}
                </p>
              </div>
              <Server className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Recent Activity and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.recentActivity}</h3>
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity: any) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.details}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.systemAlerts}</h3>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert: any) => (
                <div key={alert.id} className={`p-3 rounded-md border-l-4 ${
                  alert.level === 'error' ? 'bg-red-50 border-red-400' :
                  alert.level === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                  alert.level === 'success' ? 'bg-green-50 border-green-400' :
                  'bg-blue-50 border-blue-400'
                }`}>
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Key Changes Made:
// 1. Removed mock data constants
// 2. Added useAdminDashboardStats hook
// 3. Added loading and error states
// 4. Used real data from API response
// 5. Added refetch functionality
// 6. Maintained all existing UI and functionality
