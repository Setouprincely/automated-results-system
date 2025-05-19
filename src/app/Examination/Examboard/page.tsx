"use client";
import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/layout';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Calendar,
  ClipboardList,
  Award,
  FileText,
  Users,
  School,
  Clock,
  AlertTriangle
} from 'lucide-react';

export default function ExamBoardDashboard() {
  const [stats, setStats] = useState({
    activeExams: 0,
    pendingResults: 0,
    examCenters: 0,
    registeredStudents: 0,
    subjectsOffered: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for charts
  const examRegistrationData = [
    { name: 'O Level', students: 12540 },
    { name: 'A Level', students: 8760 },
  ];

  const subjectRegistrationData = [
    { name: 'Mathematics', students: 9800 },
    { name: 'English', students: 10500 },
    { name: 'Biology', students: 7200 },
    { name: 'Chemistry', students: 6500 },
    { name: 'Physics', students: 5800 },
  ];

  const upcomingActivities = [
    { id: 1, title: 'O Level English Paper 1', date: '2025-06-02', type: 'exam' },
    { id: 2, title: 'A Level Mathematics Paper 2', date: '2025-06-04', type: 'exam' },
    { id: 3, title: 'O Level Results Approval', date: '2025-07-15', type: 'approval' },
    { id: 4, title: 'Examiner Training Session', date: '2025-05-25', type: 'training' },
  ];

  useEffect(() => {
    // Simulate API call to fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll just simulate with setTimeout
        setTimeout(() => {
          setStats({
            activeExams: 12,
            pendingResults: 5,
            examCenters: 245,
            registeredStudents: 21300,
            subjectsOffered: 32
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading dashboard data...</h2>
        </div>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-4">
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <p>{error}</p>
        </Alert>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="p-6 bg-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Examination Board Dashboard</h1>
          <div className="flex items-center">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center mr-4">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span>Active Examination Period</span>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Generate Report
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Active Exams</h3>
                <p className="text-2xl font-semibold">{stats.activeExams}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-amber-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Pending Results</h3>
                <p className="text-2xl font-semibold">{stats.pendingResults}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <School className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Exam Centers</h3>
                <p className="text-2xl font-semibold">{stats.examCenters}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Students</h3>
                <p className="text-2xl font-semibold">{stats.registeredStudents.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-rose-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-rose-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Subjects</h3>
                <p className="text-2xl font-semibold">{stats.subjectsOffered}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts & Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Registration Stats */}
          <Card className="col-span-2 p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Registration Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-64">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Subject Registration</h3>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={subjectRegistrationData}
                    margin={{
                      top: 5,
                      right: 20,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="students" fill="#4f46e5" name="Registered Students" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="h-64">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Exam Level Distribution</h3>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={examRegistrationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="students"
                    >
                      {examRegistrationData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#60a5fa'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toLocaleString()} students`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          {/* Upcoming Activities */}
          <Card className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Upcoming Activities</h2>
            <div className="space-y-3">
              {upcomingActivities.map(activity => (
                <div key={activity.id} className="flex items-start p-2 hover:bg-gray-50 rounded-md">
                  <div className={`p-2 rounded-full mr-3 ${
                    activity.type === 'exam' ? 'bg-blue-100' :
                    activity.type === 'approval' ? 'bg-green-100' : 'bg-amber-100'
                  }`}>
                    {activity.type === 'exam' ?
                      <FileText className="h-5 w-5 text-blue-600" /> :
                      activity.type === 'approval' ?
                      <Award className="h-5 w-5 text-green-600" /> :
                      <Calendar className="h-5 w-5 text-amber-600" />
                    }
                  </div>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All Activities
            </button>
          </Card>
        </div>

        {/* Quick Actions and Recent Activities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg flex flex-col items-center justify-center">
                <ClipboardList className="h-6 w-6 text-blue-600 mb-2" />
                <span className="text-sm font-medium">Create Exam</span>
              </button>
              <button className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg flex flex-col items-center justify-center">
                <Users className="h-6 w-6 text-purple-600 mb-2" />
                <span className="text-sm font-medium">Manage Examiners</span>
              </button>
              <button className="p-3 bg-amber-50 hover:bg-amber-100 rounded-lg flex flex-col items-center justify-center">
                <School className="h-6 w-6 text-amber-600 mb-2" />
                <span className="text-sm font-medium">View Centers</span>
              </button>
              <button className="p-3 bg-green-50 hover:bg-green-100 rounded-lg flex flex-col items-center justify-center">
                <Award className="h-6 w-6 text-green-600 mb-2" />
                <span className="text-sm font-medium">Approve Results</span>
              </button>
            </div>
          </Card>

          <Card className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">System Notifications</h2>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <p className="font-medium text-yellow-800">Pending Results Approval</p>
                </div>
                <p className="text-sm text-yellow-700 mt-1">5 subject results are awaiting your approval</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <p className="font-medium text-blue-800">Upcoming Deadline</p>
                </div>
                <p className="text-sm text-blue-700 mt-1">O Level Physics Paper 2 needs to be finalized</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-green-600 mr-2" />
                  <p className="font-medium text-green-800">New Examiners Added</p>
                </div>
                <p className="text-sm text-green-700 mt-1">15 new examiners have been added to the system</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}