'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/layout';
import {
  BarChart, Users, BookOpen,
  CheckCircle, AlertCircle, Download, FileText
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Mock data for prototyping
const mockStats = {
  totalStudents: 845,
  registeredForExam: 712,
  pendingRegistrations: 133,
  passRate: 78.3,
  examReadiness: 86
};

const mockPerformanceTrend = [
  { year: '2021', passRate: 72 },
  { year: '2022', passRate: 74 },
  { year: '2023', passRate: 76 },
  { year: '2024', passRate: 78 },
  { year: '2025', passRate: 78.3 },
];

const mockSubjectPerformance = [
  { subject: 'Mathematics', passRate: 68, avgScore: 62 },
  { subject: 'English', passRate: 82, avgScore: 74 },
  { subject: 'Physics', passRate: 71, avgScore: 65 },
  { subject: 'Chemistry', passRate: 73, avgScore: 66 },
  { subject: 'Biology', passRate: 77, avgScore: 70 },
];

const mockNotifications = [
  { id: 1, type: 'info', message: 'Registration deadline for O Level candidates is May 30, 2025' },
  { id: 2, type: 'warning', message: '133 students still pending registration confirmation' },
  { id: 3, type: 'success', message: 'A Level results for February session have been published' },
  { id: 4, type: 'info', message: 'Teacher verification of candidate details ends next week' },
];

const mockUpcomingEvents = [
  { id: 1, date: '2025-05-30', title: 'O Level Registration Deadline' },
  { id: 2, date: '2025-06-15', title: 'A Level Practical Examinations Begin' },
  { id: 3, date: '2025-06-25', title: 'O Level Written Examinations Begin' },
  { id: 4, date: '2025-07-10', title: 'Verification of Examination Centers' },
];

export default function SchoolDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats] = useState(mockStats);
  const [performanceTrend] = useState(mockPerformanceTrend);
  const [subjectPerformance] = useState(mockSubjectPerformance);
  const [notifications] = useState(mockNotifications);
  const [upcomingEvents] = useState(mockUpcomingEvents);
  const [activeTab, setActiveTab] = useState('overview');
  const [language, setLanguage] = useState<'en' | 'fr'>('en'); // 'en' for English, 'fr' for French

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Language translations (simplified for demonstration)
  const translations = {
    en: {
      title: 'School Dashboard',
      overview: 'Overview',
      students: 'Students',
      registration: 'Registration',
      results: 'Results',
      reports: 'Reports',
      totalStudents: 'Total Students',
      registeredStudents: 'Registered for Exams',
      pendingRegistration: 'Pending Registration',
      schoolPassRate: 'School Pass Rate',
      examReadiness: 'Exam Readiness',
      performance: 'Performance',
      notifications: 'Notifications',
      upcomingEvents: 'Upcoming Events',
      subjectPerformance: 'Subject Performance',
      passingTrend: 'Passing Trend',
      viewAll: 'View All',
      downloadData: 'Download Data',
      switchToFrench: 'Passer au français',
      subject: 'Subject',
      passRate: 'Pass Rate',
      avgScore: 'Avg. Score'
    },
    fr: {
      title: 'Tableau de Bord Scolaire',
      overview: 'Vue d\'ensemble',
      students: 'Élèves',
      registration: 'Inscription',
      results: 'Résultats',
      reports: 'Rapports',
      totalStudents: 'Nombre Total d\'Élèves',
      registeredStudents: 'Inscrits aux Examens',
      pendingRegistration: 'Inscriptions en Attente',
      schoolPassRate: 'Taux de Réussite',
      examReadiness: 'Préparation aux Examens',
      performance: 'Performance',
      notifications: 'Notifications',
      upcomingEvents: 'Événements à Venir',
      subjectPerformance: 'Performance par Matière',
      passingTrend: 'Tendance de Réussite',
      viewAll: 'Voir Tout',
      downloadData: 'Télécharger les Données',
      switchToEnglish: 'Switch to English',
      subject: 'Matière',
      passRate: 'Taux de Réussite',
      avgScore: 'Note Moyenne'
    }
  };

  const t = translations[language];

  const handleLanguageToggle = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{t.title}</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLanguageToggle}
              className="px-4 py-2 bg-white rounded-md shadow text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {language === 'en' ? translations.en.switchToFrench : translations.fr.switchToEnglish}
            </button>
            <div className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-medium">
              Saint Joseph's College Sasse
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="flex overflow-x-auto">
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('overview')}
            >
              {t.overview}
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'students' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('students')}
            >
              {t.students}
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'registration' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('registration')}
            >
              {t.registration}
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'results' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('results')}
            >
              {t.results}
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'reports' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('reports')}
            >
              {t.reports}
            </button>
          </div>
        </div>

        {/* Main Dashboard Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t.totalStudents}</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
                  </div>
                  <Users className="h-10 w-10 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t.registeredStudents}</p>
                    <p className="text-2xl font-bold text-green-600">{stats.registeredForExam}</p>
                  </div>
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t.pendingRegistration}</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.pendingRegistrations}</p>
                  </div>
                  <AlertCircle className="h-10 w-10 text-amber-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t.schoolPassRate}</p>
                    <p className="text-2xl font-bold text-indigo-600">{stats.passRate}%</p>
                  </div>
                  <BarChart className="h-10 w-10 text-indigo-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t.examReadiness}</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.examReadiness}%</p>
                  </div>
                  <BookOpen className="h-10 w-10 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Performance Trend Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">{t.passingTrend}</h2>
                  <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                    <Download className="h-4 w-4 mr-1" />
                    {t.downloadData}
                  </button>
                </div>
                <div className="h-64">
                  <Bar
                    data={{
                      labels: performanceTrend.map(item => item.year),
                      datasets: [
                        {
                          label: t.passRate,
                          data: performanceTrend.map(item => item.passRate),
                          backgroundColor: 'rgba(59, 130, 246, 0.6)',
                          borderColor: 'rgba(59, 130, 246, 1)',
                          borderWidth: 1,
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: t.passingTrend,
                          font: {
                            size: 14
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `${context.dataset.label}: ${context.parsed.y}%`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          ticks: {
                            callback: function(value) {
                              return value + '%';
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Subject Performance */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">{t.subjectPerformance}</h2>
                  <button className="text-sm text-blue-600 hover:text-blue-800">{t.viewAll}</button>
                </div>
                <div className="h-64">
                  <Bar
                    data={{
                      labels: subjectPerformance.map(item => item.subject),
                      datasets: [
                        {
                          label: t.passRate,
                          data: subjectPerformance.map(item => item.passRate),
                          backgroundColor: 'rgba(34, 197, 94, 0.6)',
                          borderColor: 'rgba(34, 197, 94, 1)',
                          borderWidth: 1,
                        },
                        {
                          label: t.avgScore,
                          data: subjectPerformance.map(item => item.avgScore),
                          backgroundColor: 'rgba(59, 130, 246, 0.6)',
                          borderColor: 'rgba(59, 130, 246, 1)',
                          borderWidth: 1,
                        }
                      ]
                    }}
                    options={{
                      indexAxis: 'y',
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: t.subjectPerformance,
                          font: {
                            size: 14
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const label = context.dataset.label;
                              const value = context.parsed.x;
                              return label === t.passRate ?
                                `${label}: ${value}%` :
                                `${label}: ${value}/100`;
                            }
                          }
                        }
                      },
                      scales: {
                        x: {
                          beginAtZero: true,
                          max: 100,
                          ticks: {
                            callback: function(value) {
                              return value;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Notifications and Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Notifications */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">{t.notifications}</h2>
                  <button className="text-sm text-blue-600 hover:text-blue-800">{t.viewAll}</button>
                </div>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-md flex items-start ${
                        notification.type === 'info' ? 'bg-blue-50' :
                        notification.type === 'warning' ? 'bg-amber-50' :
                        notification.type === 'success' ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      <div
                        className={`mr-3 rounded-full p-1 ${
                          notification.type === 'info' ? 'bg-blue-100 text-blue-500' :
                          notification.type === 'warning' ? 'bg-amber-100 text-amber-500' :
                          notification.type === 'success' ? 'bg-green-100 text-green-500' : 'bg-gray-100'
                        }`}
                      >
                        {notification.type === 'info' && <FileText className="h-4 w-4" />}
                        {notification.type === 'warning' && <AlertCircle className="h-4 w-4" />}
                        {notification.type === 'success' && <CheckCircle className="h-4 w-4" />}
                      </div>
                      <p className="text-sm text-gray-700">{notification.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">{t.upcomingEvents}</h2>
                  <button className="text-sm text-blue-600 hover:text-blue-800">{t.viewAll}</button>
                </div>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => {
                    const eventDate = new Date(event.date);
                    const formattedDate = eventDate.toLocaleDateString(
                      language === 'en' ? 'en-US' : 'fr-FR',
                      { day: 'numeric', month: 'short', year: 'numeric' }
                    );

                    return (
                      <div key={event.id} className="flex items-start border-b border-gray-100 pb-4">
                        <div className="bg-gray-100 rounded-md p-2 text-center mr-4 w-12">
                          <div className="text-xs font-medium text-gray-500">
                            {eventDate.toLocaleDateString(
                              language === 'en' ? 'en-US' : 'fr-FR',
                              { month: 'short' }
                            )}
                          </div>
                          <div className="text-lg font-bold text-gray-800">
                            {eventDate.getDate()}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-800">{event.title}</h3>
                          <p className="text-xs text-gray-500">{formattedDate}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== 'overview' && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h2 className="text-xl font-medium text-gray-800 mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} {t.title}
            </h2>
            <p className="text-gray-600">
              This section is under development. Please check back later.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}