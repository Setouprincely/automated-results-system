'use client';

import { useState, useEffect } from 'react';
import ExaminerLayout from '@/components/layouts/ExaminerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, DownloadIcon, RefreshCw } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Mock data - in a real app, this would come from your API
const mockPerformanceData = {
  subjectPerformance: {
    labels: ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Literature', 'Geography'],
    datasets: [
      {
        label: 'Average Score',
        data: [72, 68, 65, 70, 75, 67, 71],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Pass Rate (%)',
        data: [85, 90, 78, 82, 88, 80, 84],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  },
  yearlyTrend: {
    labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
    datasets: [
      {
        label: 'O Level Pass Rate',
        data: [76, 77, 75, 79, 81, 83],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'A Level Pass Rate',
        data: [72, 74, 73, 76, 78, 80],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  },
  gradeDistribution: {
    labels: ['A*', 'A', 'B', 'C', 'D', 'E', 'U'],
    datasets: [
      {
        label: 'Students',
        data: [5, 12, 25, 30, 18, 8, 2],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(199, 199, 199, 0.6)',
        ],
      },
    ],
  },
  regionalComparison: {
    labels: ['Northwest', 'Southwest', 'Center', 'Littoral', 'West', 'South', 'East', 'Far North', 'North', 'Adamawa'],
    datasets: [
      {
        label: 'Average Score',
        data: [68, 70, 72, 74, 69, 67, 65, 63, 64, 66],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  },
  schoolRankings: [
    { rank: 1, name: 'Lycée de Manengouba', avgScore: 78.4, passRate: 92.3, region: 'Littoral' },
    { rank: 2, name: 'GBHS Bamenda', avgScore: 77.6, passRate: 91.7, region: 'Northwest' },
    { rank: 3, name: 'PGSS Mankon', avgScore: 76.8, passRate: 90.9, region: 'Northwest' },
    { rank: 4, name: 'Lycée Bilingue de Yaoundé', avgScore: 76.2, passRate: 90.2, region: 'Center' },
    { rank: 5, name: 'Saker Baptist College', avgScore: 75.9, passRate: 89.8, region: 'Southwest' },
    { rank: 6, name: 'CCC Mankon', avgScore: 75.2, passRate: 89.3, region: 'Northwest' },
    { rank: 7, name: 'Lycée Classique de Bafoussam', avgScore: 74.8, passRate: 88.1, region: 'West' },
    { rank: 8, name: 'GBHS Limbe', avgScore: 74.1, passRate: 87.6, region: 'Southwest' },
    { rank: 9, name: 'Collège de la Retraite', avgScore: 73.5, passRate: 86.2, region: 'Center' },
    { rank: 10, name: 'Cameroon College of Arts & Science', avgScore: 72.9, passRate: 85.7, region: 'Southwest' },
  ],
};

const PerformanceAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [year, setYear] = useState('2025');
  const [exam, setExam] = useState('all');
  const [region, setRegion] = useState('all');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = () => {
    setIsLoading(true);
    // Simulate API fetch
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  useEffect(() => {
    refreshData();
  }, [year, exam, region]);

  return (
    <ExaminerLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Performance Analytics</h1>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center gap-2">
              <DownloadIcon size={16} />
              Export Report
            </Button>
            <Button
              variant="default"
              className="flex items-center gap-2"
              onClick={refreshData}
              disabled={isLoading}
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              Refresh Data
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Candidates</p>
              <h3 className="text-2xl font-bold">28,543</h3>
              <p className="text-xs text-green-600">+5.2% from previous year</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Overall Pass Rate</p>
              <h3 className="text-2xl font-bold">82.4%</h3>
              <p className="text-xs text-green-600">+3.7% from previous year</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">A* - C Rate</p>
              <h3 className="text-2xl font-bold">61.2%</h3>
              <p className="text-xs text-green-600">+2.8% from previous year</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Average Score</p>
              <h3 className="text-2xl font-bold">68.5/100</h3>
              <p className="text-xs text-green-600">+1.2 points from previous year</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <label className="text-sm font-medium">Exam Level:</label>
            <Select value={exam} onValueChange={setExam}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Exam" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="olevel">O Level</SelectItem>
                <SelectItem value="alevel">A Level</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <label className="text-sm font-medium">Year:</label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <label className="text-sm font-medium">Region:</label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="northwest">Northwest</SelectItem>
                <SelectItem value="southwest">Southwest</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="littoral">Littoral</SelectItem>
                <SelectItem value="west">West</SelectItem>
                <SelectItem value="south">South</SelectItem>
                <SelectItem value="east">East</SelectItem>
                <SelectItem value="farNorth">Far North</SelectItem>
                <SelectItem value="north">North</SelectItem>
                <SelectItem value="adamawa">Adamawa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <label className="text-sm font-medium">As of:</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-[180px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subjects">Subject Analysis</TabsTrigger>
            <TabsTrigger value="regions">Regional Analysis</TabsTrigger>
            <TabsTrigger value="schools">School Rankings</TabsTrigger>
            <TabsTrigger value="trends">Historical Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4">Grade Distribution</h3>
                  <div className="h-80">
                    <Pie
                      data={mockPerformanceData.gradeDistribution}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4">Pass Rate Trends</h3>
                  <div className="h-80">
                    <Line
                      data={mockPerformanceData.yearlyTrend}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Subject Performance Overview</h3>
                <div className="h-80">
                  <Bar
                    data={mockPerformanceData.subjectPerformance}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Subject Performance Breakdown</h3>
                <div className="h-96">
                  <Bar
                    data={mockPerformanceData.subjectPerformance}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                        },
                      },
                    }}
                  />
                </div>
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidates</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">A* - C Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">YoY Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Mathematics</td>
                        <td className="px-6 py-4 whitespace-nowrap">5,482</td>
                        <td className="px-6 py-4 whitespace-nowrap">72.3</td>
                        <td className="px-6 py-4 whitespace-nowrap">85.2%</td>
                        <td className="px-6 py-4 whitespace-nowrap">63.7%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-600">+2.5%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">English</td>
                        <td className="px-6 py-4 whitespace-nowrap">5,820</td>
                        <td className="px-6 py-4 whitespace-nowrap">68.4</td>
                        <td className="px-6 py-4 whitespace-nowrap">90.1%</td>
                        <td className="px-6 py-4 whitespace-nowrap">58.4%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-600">+1.8%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Physics</td>
                        <td className="px-6 py-4 whitespace-nowrap">3,751</td>
                        <td className="px-6 py-4 whitespace-nowrap">65.2</td>
                        <td className="px-6 py-4 whitespace-nowrap">78.3%</td>
                        <td className="px-6 py-4 whitespace-nowrap">52.1%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-600">+3.4%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Chemistry</td>
                        <td className="px-6 py-4 whitespace-nowrap">3,920</td>
                        <td className="px-6 py-4 whitespace-nowrap">70.1</td>
                        <td className="px-6 py-4 whitespace-nowrap">82.5%</td>
                        <td className="px-6 py-4 whitespace-nowrap">59.8%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-600">+2.2%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Biology</td>
                        <td className="px-6 py-4 whitespace-nowrap">4,120</td>
                        <td className="px-6 py-4 whitespace-nowrap">75.6</td>
                        <td className="px-6 py-4 whitespace-nowrap">88.1%</td>
                        <td className="px-6 py-4 whitespace-nowrap">67.3%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-600">+4.1%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regions">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Regional Performance Comparison</h3>
                <div className="h-96">
                  <Bar
                    data={mockPerformanceData.regionalComparison}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                        },
                      },
                    }}
                  />
                </div>
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidates</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">A* - C Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">YoY Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Northwest</td>
                        <td className="px-6 py-4 whitespace-nowrap">4,287</td>
                        <td className="px-6 py-4 whitespace-nowrap">68.3</td>
                        <td className="px-6 py-4 whitespace-nowrap">83.2%</td>
                        <td className="px-6 py-4 whitespace-nowrap">61.7%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-600">+2.5%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Southwest</td>
                        <td className="px-6 py-4 whitespace-nowrap">3,950</td>
                        <td className="px-6 py-4 whitespace-nowrap">70.1</td>
                        <td className="px-6 py-4 whitespace-nowrap">84.5%</td>
                        <td className="px-6 py-4 whitespace-nowrap">63.2%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-600">+3.1%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Center</td>
                        <td className="px-6 py-4 whitespace-nowrap">5,124</td>
                        <td className="px-6 py-4 whitespace-nowrap">72.4</td>
                        <td className="px-6 py-4 whitespace-nowrap">86.3%</td>
                        <td className="px-6 py-4 whitespace-nowrap">65.8%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-600">+3.7%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Littoral</td>
                        <td className="px-6 py-4 whitespace-nowrap">4,876</td>
                        <td className="px-6 py-4 whitespace-nowrap">74.2</td>
                        <td className="px-6 py-4 whitespace-nowrap">87.5%</td>
                        <td className="px-6 py-4 whitespace-nowrap">68.9%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-600">+4.2%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">West</td>
                        <td className="px-6 py-4 whitespace-nowrap">3,752</td>
                        <td className="px-6 py-4 whitespace-nowrap">69.3</td>
                        <td className="px-6 py-4 whitespace-nowrap">82.1%</td>
                        <td className="px-6 py-4 whitespace-nowrap">60.4%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-600">+1.9%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schools">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Top Performing Schools</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidates</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">A* - C Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous Rank</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mockPerformanceData.schoolRankings.map((school, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">{school.rank}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">{school.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{school.region}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{Math.floor(Math.random() * 300) + 100}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{school.avgScore.toFixed(1)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{school.passRate.toFixed(1)}%</td>
                          <td className="px-6 py-4 whitespace-nowrap">{(school.passRate - Math.random() * 20).toFixed(1)}%</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {index === 0 ? (
                              <span className="text-gray-500">-</span>
                            ) : index === 1 ? (
                              <span className="text-green-600">↑2</span>
                            ) : index === 2 ? (
                              <span className="text-red-600">↓1</span>
                            ) : index === 7 ? (
                              <span className="text-green-600">↑3</span>
                            ) : (
                              <span className="text-gray-500">{school.rank + (Math.random() > 0.5 ? 1 : -1)}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4">5-Year Performance Trend</h3>
                  <div className="h-80">
                    <Line
                      data={mockPerformanceData.yearlyTrend}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                          title: {
                            display: true,
                            text: 'Historical Performance Trends'
                          }
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4">Subject Performance by Year</h3>
                  <div className="h-80">
                    <Bar
                      data={{
                        labels: ['2021', '2022', '2023', '2024', '2025'],
                        datasets: [
                          {
                            label: 'Mathematics',
                            data: [65, 68, 70, 72, 75],
                            backgroundColor: 'rgba(53, 162, 235, 0.5)',
                          },
                          {
                            label: 'English',
                            data: [70, 72, 69, 71, 73],
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                          },
                          {
                            label: 'Science',
                            data: [62, 65, 68, 70, 72],
                            backgroundColor: 'rgba(255, 99, 132, 0.5)',
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                          },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Historical Statistics</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidates</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">A* - C Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">YoY Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">28,543</td>
                        <td className="px-6 py-4 whitespace-nowrap">82.4%</td>
                        <td className="px-6 py-4 whitespace-nowrap">61.2%</td>
                        <td className="px-6 py-4 whitespace-nowrap">68.5</td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-600">+3.7%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">2024</td>
                        <td className="px-6 py-4 whitespace-nowrap">27,128</td>
                        <td className="px-6 py-4 whitespace-nowrap">78.7%</td>
                        <td className="px-6 py-4 whitespace-nowrap">58.4%</td>
                        <td className="px-6 py-4 whitespace-nowrap">67.3</td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-600">+2.5%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">2023</td>
                        <td className="px-6 py-4 whitespace-nowrap">26,452</td>
                        <td className="px-6 py-4 whitespace-nowrap">76.2%</td>
                        <td className="px-6 py-4 whitespace-nowrap">55.9%</td>
                        <td className="px-6 py-4 whitespace-nowrap">65.8</td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-600">+1.9%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">2022</td>
                        <td className="px-6 py-4 whitespace-nowrap">25,781</td>
                        <td className="px-6 py-4 whitespace-nowrap">74.3%</td>
                        <td className="px-6 py-4 whitespace-nowrap">54.1%</td>
                        <td className="px-6 py-4 whitespace-nowrap">64.6</td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-600">+1.2%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">2021</td>
                        <td className="px-6 py-4 whitespace-nowrap">24,935</td>
                        <td className="px-6 py-4 whitespace-nowrap">73.1%</td>
                        <td className="px-6 py-4 whitespace-nowrap">52.8%</td>
                        <td className="px-6 py-4 whitespace-nowrap">63.9</td>
                        <td className="px-6 py-4 whitespace-nowrap text-red-600">-0.8%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ExaminerLayout>
  );
};

export default PerformanceAnalytics;