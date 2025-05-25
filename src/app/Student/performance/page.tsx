'use client';

import { useState, useEffect } from 'react';
import StudentLayout from '@/components/layouts/StudentLayout';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  ArrowUp, ArrowDown, Award, BookOpen,
  Calendar, Clock, Download, TrendingUp
} from 'lucide-react';

// Define types
interface SubjectPerformance {
  subject: string;
  score: number;
  average: number;
  highest: number;
}

interface ExamHistoryEntry {
  term: string;
  mathematics: number;
  physics: number;
  chemistry: number;
  biology: number;
  english: number;
  french: number;
  [key: string]: string | number; // Index signature for dynamic access
}

interface GradeDistribution {
  name: string;
  value: number;
}

interface PerformanceMetric {
  subject: string;
  value: number;
}

interface StudentInfo {
  name: string;
  id: string;
  level: string;
  ranking: number;
  totalStudents: number;
  percentile: number;
  averageScore: number;
  highestSubject: string;
  lowestSubject: string;
  improvement: string;
}

// Mock data - In production, this would come from an API
const subjectPerformance: SubjectPerformance[] = [
  { subject: 'Mathematics', score: 78, average: 65, highest: 92 },
  { subject: 'Physics', score: 82, average: 68, highest: 95 },
  { subject: 'Chemistry', score: 75, average: 62, highest: 88 },
  { subject: 'Biology', score: 65, average: 70, highest: 90 },
  { subject: 'English', score: 85, average: 72, highest: 92 },
  { subject: 'French', score: 79, average: 68, highest: 89 },
];

const examHistory: ExamHistoryEntry[] = [
  { term: 'Term 1', mathematics: 65, physics: 70, chemistry: 68, biology: 72, english: 78, french: 74 },
  { term: 'Term 2', mathematics: 70, physics: 75, chemistry: 72, biology: 68, english: 80, french: 76 },
  { term: 'Term 3', mathematics: 75, physics: 80, chemistry: 74, biology: 70, english: 82, french: 78 },
  { term: 'Mock', mathematics: 78, physics: 82, chemistry: 75, biology: 65, english: 85, french: 79 },
];

const gradeDistribution: GradeDistribution[] = [
  { name: 'A', value: 3 },
  { name: 'B', value: 2 },
  { name: 'C', value: 1 },
  { name: 'D', value: 0 },
  { name: 'E', value: 0 },
  { name: 'U', value: 0 },
];

const COLORS = ['#00C49F', '#0088FE', '#FFBB28', '#FF8042', '#A28EFF', '#FF6B6B'];

const performanceMetrics: PerformanceMetric[] = [
  { subject: 'Mathematics', value: 78 },
  { subject: 'Physics', value: 82 },
  { subject: 'Chemistry', value: 75 },
  { subject: 'Biology', value: 65 },
  { subject: 'English', value: 85 },
  { subject: 'French', value: 79 },
];

const studentInfo: StudentInfo = {
  name: 'John Doe',
  id: 'GCE-2023-12345',
  level: 'A Level',
  ranking: 15,
  totalStudents: 120,
  percentile: 87.5,
  averageScore: 77.3,
  highestSubject: 'English',
  lowestSubject: 'Biology',
  improvement: '+5.2%',
};

const PerformanceAnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Remove artificial delay for better performance
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your performance data...</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Performance Analytics</h1>
            <p className="text-gray-600">Analyze your academic progress and identify improvement areas</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2">
              <Download size={16} className="mr-2" /> Export Report
            </button>
            <select className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="current">Current Session (2023-2024)</option>
              <option value="previous">Previous Session (2022-2023)</option>
            </select>
          </div>
        </div>

        {/* Student Info Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h2 className="text-xl font-semibold">{studentInfo.name}</h2>
              <p className="text-gray-500">ID: {studentInfo.id} | {studentInfo.level}</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center bg-blue-50 px-4 py-2 rounded-lg">
              <div className="mr-4">
                <p className="text-sm text-gray-500">Class Rank</p>
                <p className="text-lg font-bold">{studentInfo.ranking}/{studentInfo.totalStudents}</p>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">Percentile</p>
                <p className="text-lg font-bold">{studentInfo.percentile}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Score</p>
                <p className="text-lg font-bold">{studentInfo.averageScore}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-full">
                  <TrendingUp size={20} className="text-green-600" />
                </div>
                <p className="ml-2 text-sm text-gray-600">Improvement</p>
              </div>
              <p className="mt-2 text-lg font-bold text-green-600">{studentInfo.improvement}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full">
                  <ArrowUp size={20} className="text-blue-600" />
                </div>
                <p className="ml-2 text-sm text-gray-600">Strongest Subject</p>
              </div>
              <p className="mt-2 text-lg font-bold text-blue-600">{studentInfo.highestSubject}</p>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="bg-amber-100 p-2 rounded-full">
                  <ArrowDown size={20} className="text-amber-600" />
                </div>
                <p className="ml-2 text-sm text-gray-600">Needs Improvement</p>
              </div>
              <p className="mt-2 text-lg font-bold text-amber-600">{studentInfo.lowestSubject}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Award size={20} className="text-purple-600" />
                </div>
                <p className="ml-2 text-sm text-gray-600">Achievement</p>
              </div>
              <p className="mt-2 text-lg font-bold text-purple-600">Above Average</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`px-4 py-2 font-medium ${activeTab === 'subjects' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
            >
              Subject Analysis
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-4 py-2 font-medium ${activeTab === 'progress' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
            >
              Progress Tracking
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-4 py-2 font-medium ${activeTab === 'recommendations' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
            >
              Recommendations
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Overview Chart */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-medium mb-4">Performance Overview</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" fill="#4F46E5" name="Your Score" />
                    <Bar dataKey="average" fill="#94A3B8" name="Class Average" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grade Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-medium mb-4">Grade Distribution</h3>
              <div className="h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gradeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {gradeDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-medium mb-4">Subject Performance Metrics</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={90} data={performanceMetrics}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Exam Progress */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-medium mb-4">Progress Over Time</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={examHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="term" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="mathematics" stroke="#8884d8" name="Mathematics" />
                    <Line type="monotone" dataKey="physics" stroke="#82ca9d" name="Physics" />
                    <Line type="monotone" dataKey="english" stroke="#ff7300" name="English" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjectPerformance.map((subject, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-medium mb-2">{subject.subject}</h3>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <span className="text-xl font-bold text-blue-600">{subject.score}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Class Average: {subject.average}</p>
                    <p className="text-sm text-gray-500">Highest Score: {subject.highest}</p>
                    <p className={`text-sm ${subject.score > subject.average ? 'text-green-500' : 'text-red-500'}`}>
                      {subject.score > subject.average
                        ? `${(((subject.score - subject.average) / subject.average) * 100).toFixed(1)}% above average`
                        : `${(((subject.average - subject.score) / subject.average) * 100).toFixed(1)}% below average`}
                    </p>
                  </div>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={examHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="term" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey={subject.subject.toLowerCase()}
                        stroke={COLORS[index % COLORS.length]}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-medium mb-4">Progress Tracking</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={examHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="term" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    {Object.keys(examHistory[0])
                      .filter(key => key !== 'term')
                      .map((key, index) => (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          stroke={COLORS[index % COLORS.length]}
                          name={key.charAt(0).toUpperCase() + key.slice(1)}
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-medium mb-4">Performance Trends</h3>
                <div className="space-y-4">
                  {Object.keys(examHistory[0])
                    .filter(key => key !== 'term')
                    .map((subject, index) => {
                      const start = examHistory[0][subject] as number;
                      const end = examHistory[examHistory.length - 1][subject] as number;
                      const change = end - start;
                      const percentChange = ((change / start) * 100).toFixed(1);

                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="text-gray-700">{subject.charAt(0).toUpperCase() + subject.slice(1)}</span>
                          </div>
                          <div className="flex items-center">
                            <span className={`${change >= 0 ? 'text-green-500' : 'text-red-500'} font-medium`}>
                              {change >= 0 ? '+' : ''}{change} ({change >= 0 ? '+' : ''}{percentChange}%)
                            </span>
                            {change >= 0 ? (
                              <ArrowUp size={16} className="ml-1 text-green-500" />
                            ) : (
                              <ArrowDown size={16} className="ml-1 text-red-500" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-medium mb-4">Study Time Analysis</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { subject: 'Mathematics', hours: 12 },
                        { subject: 'Physics', hours: 10 },
                        { subject: 'Chemistry', hours: 8 },
                        { subject: 'Biology', hours: 7 },
                        { subject: 'English', hours: 6 },
                        { subject: 'French', hours: 5 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="hours" fill="#8884d8" name="Study Hours" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <BookOpen size={24} className="text-blue-600 mr-2" />
                <h3 className="text-lg font-medium">Study Recommendations</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                  <h4 className="font-medium text-amber-800">Biology (Priority)</h4>
                  <p className="text-amber-700 mt-1">Focus on improving understanding of cellular respiration and photosynthesis concepts.</p>
                  <ul className="mt-2 list-disc list-inside text-amber-700">
                    <li>Review chapters 5-7 in the textbook</li>
                    <li>Complete practice questions on enzyme activity</li>
                    <li>Watch supplementary videos on cell division</li>
                  </ul>
                </div>

                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800">Mathematics</h4>
                  <p className="text-blue-700 mt-1">Continue practicing calculus problems to maintain strong performance.</p>
                  <ul className="mt-2 list-disc list-inside text-blue-700">
                    <li>Complete advanced integration exercises</li>
                    <li>Focus on application problems</li>
                  </ul>
                </div>

                <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800">Physics</h4>
                  <p className="text-purple-700 mt-1">Maintain current study patterns while focusing on problem-solving techniques.</p>
                  <ul className="mt-2 list-disc list-inside text-purple-700">
                    <li>Practice more complex mechanical problems</li>
                    <li>Review electrical concepts</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <Calendar size={24} className="text-green-600 mr-2" />
                <h3 className="text-lg font-medium">Study Schedule Suggestion</h3>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Focus Areas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Monday</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Biology (Cell Structure)</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Tuesday</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Mathematics (Calculus)</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Wednesday</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Physics (Mechanics)</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Thursday</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Biology (Photosynthesis)</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Friday</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Chemistry (Organic Chemistry)</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Saturday</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Practice Tests (All Subjects)</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Sunday</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Review & Rest</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <div className="flex items-center mb-4">
                  <Clock size={24} className="text-indigo-600 mr-2" />
                  <h3 className="text-lg font-medium">Resource Recommendations</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                    <span>Biology Video Series: "Cell Structure and Function" - GCE Learning Portal</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                    <span>Mathematics Practice Book: "Advanced Calculus Problems" - Dr. Mathew Johnson</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                    <span>Physics Interactive Simulations - National Science Foundation</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                    <span>Chemistry Study Group - Tuesdays at 4PM (School Library)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default PerformanceAnalyticsPage;