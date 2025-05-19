'use client';
import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/layout';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, Filter, Calendar, ArrowUpRight } from 'lucide-react';

// Mock data - replace with actual API calls in production
const mockPerformanceData = [
  { year: '2021', averageScore: 65, passRate: 72 },
  { year: '2022', averageScore: 68, passRate: 75 },
  { year: '2023', averageScore: 71, passRate: 78 },
  { year: '2024', averageScore: 73, passRate: 81 },
  { year: '2025', averageScore: 76, passRate: 84 },
];

const mockSubjectPerformance = [
  { subject: 'Mathematics', averageScore: 68, passRate: 74 },
  { subject: 'Physics', averageScore: 71, passRate: 78 },
  { subject: 'Chemistry', averageScore: 65, passRate: 72 },
  { subject: 'Biology', averageScore: 76, passRate: 83 },
  { subject: 'English', averageScore: 81, passRate: 88 },
  { subject: 'French', averageScore: 73, passRate: 79 },
  { subject: 'History', averageScore: 77, passRate: 85 },
];

const mockGradeDistribution = [
  { name: 'A/A*', value: 15, color: '#4CAF50' },
  { name: 'B', value: 27, color: '#8BC34A' },
  { name: 'C', value: 35, color: '#CDDC39' },
  { name: 'D', value: 18, color: '#FFEB3B' },
  { name: 'E', value: 12, color: '#FFC107' },
  { name: 'U', value: 8, color: '#FF5722' },
];

const mockStudentImprovementData = [
  { name: 'Significant Improvement', value: 23, color: '#4CAF50' },
  { name: 'Slight Improvement', value: 45, color: '#8BC34A' },
  { name: 'No Change', value: 20, color: '#FFEB3B' },
  { name: 'Decline', value: 12, color: '#FF5722' },
];

const SchoolAnalyticsPage = () => {
  const [examType, setExamType] = useState('both');
  const [academicYear, setAcademicYear] = useState('2025');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate data loading when filters change
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [examType, academicYear]);

  return (
    <Layout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">School Performance Analytics</h1>
            <p className="text-gray-500 mt-1">
              Comprehensive analytics and insights into student performance
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger className="w-40">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2021">2021</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={examType} onValueChange={setExamType}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Exam Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">O & A Levels</SelectItem>
                  <SelectItem value="olevel">O Level Only</SelectItem>
                  <SelectItem value="alevel">A Level Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button className="flex items-center" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading analytics data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">76.3%</div>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    +3.2% from last year
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Pass Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">84%</div>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    +3% from last year
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Students Tested</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">328</div>
                  <p className="text-sm text-blue-600 flex items-center mt-1">
                    +12 from last year
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Excellence Rate (A/A*)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">15%</div>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    +2.3% from last year
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="performance" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="performance">Overall Performance</TabsTrigger>
                <TabsTrigger value="subjects">Subject Analysis</TabsTrigger>
                <TabsTrigger value="students">Student Improvement</TabsTrigger>
                <TabsTrigger value="comparison">Regional Comparison</TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Trend (5 Years)</CardTitle>
                      <CardDescription>Average scores and pass rates over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={mockPerformanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="averageScore" name="Average Score" stroke="#8884d8" activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="passRate" name="Pass Rate %" stroke="#82ca9d" activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Grade Distribution</CardTitle>
                      <CardDescription>Percentage of students per grade</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={mockGradeDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {mockGradeDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="subjects" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Subject Performance Analysis</CardTitle>
                    <CardDescription>Average scores by subject</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mockSubjectPerformance} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis dataKey="subject" type="category" width={100} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="averageScore" name="Average Score" fill="#8884d8" />
                          <Bar dataKey="passRate" name="Pass Rate %" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="students" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Student Improvement Analysis</CardTitle>
                      <CardDescription>Year-on-year student performance change</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={mockStudentImprovementData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {mockStudentImprovementData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Students</CardTitle>
                      <CardDescription>Students with highest improvement</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                {index}
                              </div>
                              <div>
                                <h4 className="font-medium">Student Name {index}</h4>
                                <p className="text-sm text-gray-500">
                                  {index % 2 === 0 ? 'O Level' : 'A Level'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">
                                {85 + index}%
                              </div>
                              <div className="text-sm text-green-600">
                                +{10 + index}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        View All Students
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="comparison" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Regional Performance Comparison</CardTitle>
                    <CardDescription>How your school compares to others in the region</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Your School</span>
                          <span className="font-medium">76.3%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '76.3%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Regional Average</span>
                          <span className="font-medium">71.8%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-gray-500 h-2.5 rounded-full" style={{ width: '71.8%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>National Average</span>
                          <span className="font-medium">68.5%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-gray-500 h-2.5 rounded-full" style={{ width: '68.5%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Top Performing School</span>
                          <span className="font-medium">82.7%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '82.7%' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <h4 className="font-semibold mb-4">Performance Ranking</h4>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-center">
                        <p className="text-lg">Your school ranks</p>
                        <p className="text-3xl font-bold text-blue-700 my-2">12th</p>
                        <p className="text-sm text-gray-600">out of 87 schools in your region</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
};

export default SchoolAnalyticsPage;