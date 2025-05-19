'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Download, FileText, Filter, Search, Share2 } from 'lucide-react';
import Layout from '@/components/layouts/layout';

interface Student {
  id: string;
  name: string;
  candidateNumber: string;
  center: string;
  level: 'O Level' | 'A Level';
  subjects: {
    name: string;
    grade: string;
    score: number;
  }[];
  overallGrade: string;
  year: number;
}

interface PerformanceData {
  grade: string;
  count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Mock data for demonstration
const mockStudents: Student[] = [
  {
    id: '1',
    name: 'John Doe',
    candidateNumber: 'GCE2023001',
    center: 'Bamenda',
    level: 'O Level',
    subjects: [
      { name: 'Mathematics', grade: 'A', score: 85 },
      { name: 'English', grade: 'B', score: 78 },
      { name: 'Physics', grade: 'A', score: 88 },
      { name: 'Chemistry', grade: 'B', score: 76 },
      { name: 'Biology', grade: 'C', score: 68 },
    ],
    overallGrade: 'B',
    year: 2023,
  },
  {
    id: '2',
    name: 'Jane Smith',
    candidateNumber: 'GCE2023002',
    center: 'Bamenda',
    level: 'O Level',
    subjects: [
      { name: 'Mathematics', grade: 'A*', score: 92 },
      { name: 'English', grade: 'A', score: 85 },
      { name: 'Physics', grade: 'A', score: 87 },
      { name: 'Chemistry', grade: 'A', score: 84 },
      { name: 'Biology', grade: 'A', score: 88 },
    ],
    overallGrade: 'A',
    year: 2023,
  },
  {
    id: '3',
    name: 'Pierre Mbarga',
    candidateNumber: 'GCE2023003',
    center: 'Douala',
    level: 'A Level',
    subjects: [
      { name: 'Mathematics', grade: 'B', score: 74 },
      { name: 'Physics', grade: 'C', score: 65 },
      { name: 'Chemistry', grade: 'B', score: 75 },
    ],
    overallGrade: 'B',
    year: 2023,
  },
  {
    id: '4',
    name: 'Marie Ekoto',
    candidateNumber: 'GCE2023004',
    center: 'Yaoundé',
    level: 'A Level',
    subjects: [
      { name: 'Literature', grade: 'A', score: 87 },
      { name: 'History', grade: 'A*', score: 92 },
      { name: 'French', grade: 'A', score: 88 },
    ],
    overallGrade: 'A',
    year: 2023,
  },
  {
    id: '5',
    name: 'Ahmed Bello',
    candidateNumber: 'GCE2023005',
    center: 'Garoua',
    level: 'O Level',
    subjects: [
      { name: 'Mathematics', grade: 'C', score: 65 },
      { name: 'English', grade: 'B', score: 76 },
      { name: 'Geography', grade: 'B', score: 74 },
      { name: 'Economics', grade: 'C', score: 67 },
      { name: 'Computer Science', grade: 'B', score: 75 },
    ],
    overallGrade: 'B',
    year: 2023,
  },
];

// Generate statistics for our charts
const getSubjectPerformance = () => {
  const subjects: Record<string, { A: number, B: number, C: number, D: number, E: number, F: number }> = {};

  mockStudents.forEach(student => {
    student.subjects.forEach(subject => {
      if (!subjects[subject.name]) {
        subjects[subject.name] = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
      }

      // Count grades
      if (subject.grade.includes('A')) subjects[subject.name].A++;
      else if (subject.grade.includes('B')) subjects[subject.name].B++;
      else if (subject.grade.includes('C')) subjects[subject.name].C++;
      else if (subject.grade.includes('D')) subjects[subject.name].D++;
      else if (subject.grade.includes('E')) subjects[subject.name].E++;
      else subjects[subject.name].F++;
    });
  });

  // Convert to chart format
  return Object.entries(subjects).map(([name, grades]) => ({
    name,
    A: grades.A,
    B: grades.B,
    C: grades.C,
    D: grades.D,
    E: grades.E,
    F: grades.F,
  }));
};

const getOverallPerformance = (): PerformanceData[] => {
  const grades: Record<string, number> = { 'A*': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0 };

  mockStudents.forEach(student => {
    if (student.overallGrade.includes('A*')) grades['A*']++;
    else if (student.overallGrade.includes('A')) grades['A']++;
    else if (student.overallGrade.includes('B')) grades['B']++;
    else if (student.overallGrade.includes('C')) grades['C']++;
    else if (student.overallGrade.includes('D')) grades['D']++;
    else if (student.overallGrade.includes('E')) grades['E']++;
    else grades['F']++;
  });

  return Object.entries(grades)
    .filter(([_, count]) => count > 0)
    .map(([grade, count]) => ({ grade, count }));
};

export default function SchoolResultsPage() {
  const [students] = useState<Student[]>(mockStudents);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState<number | string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [subjectPerformance] = useState(getSubjectPerformance());
  const [overallPerformance] = useState(getOverallPerformance());

  // Filter students based on search term and filters
  useEffect(() => {
    let result = [...students];

    if (searchTerm) {
      result = result.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.candidateNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (yearFilter && yearFilter !== 'all') {
      result = result.filter(student => student.year === parseInt(yearFilter as string));
    }

    if (levelFilter && levelFilter !== 'all') {
      result = result.filter(student => student.level === levelFilter);
    }

    setFilteredStudents(result);
  }, [searchTerm, yearFilter, levelFilter, students]);

  // Function to export results as CSV
  const exportResults = () => {
    // In a real app, this would generate and download a CSV/Excel file
    console.log('Exporting results...');
    alert('Results exported successfully!');
  };

  // Function to share results
  const shareResults = () => {
    // In a real app, this would open a sharing modal
    console.log('Sharing results...');
    alert('Sharing options opened!');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">School Results Dashboard</h1>
            <p className="text-gray-500">View and analyze your school's GCE examination results</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button onClick={exportResults} variant="outline" className="flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={shareResults} variant="outline" className="flex items-center">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="students">Student Results</TabsTrigger>
            <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
            <TabsTrigger value="comparative">Comparative Analysis</TabsTrigger>
          </TabsList>

          {/* Students Results Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Student Results</CardTitle>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex items-center w-full md:w-1/3 relative">
                    <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or candidate number"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Select value={levelFilter.toString()} onValueChange={setLevelFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="O Level">O Level</SelectItem>
                        <SelectItem value="A Level">A Level</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={yearFilter.toString()}
                      onValueChange={(value) => setYearFilter(value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                        <SelectItem value="2021">2021</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      More Filters
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidate Number</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Subjects</TableHead>
                        <TableHead>Overall Grade</TableHead>
                        <TableHead>Center</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.candidateNumber}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.level}</TableCell>
                            <TableCell>{student.subjects.length}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                ${student.overallGrade.includes('A') ? 'bg-green-100 text-green-800' :
                                  student.overallGrade.includes('B') ? 'bg-blue-100 text-blue-800' :
                                  student.overallGrade.includes('C') ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'}`}>
                                {student.overallGrade}
                              </span>
                            </TableCell>
                            <TableCell>{student.center}</TableCell>
                            <TableCell>{student.year}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">View Details</Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-4">
                            No results found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={subjectPerformance}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="A" stackId="grade" fill="#4CAF50" />
                      <Bar dataKey="B" stackId="grade" fill="#2196F3" />
                      <Bar dataKey="C" stackId="grade" fill="#FFC107" />
                      <Bar dataKey="D" stackId="grade" fill="#FF9800" />
                      <Bar dataKey="E" stackId="grade" fill="#F44336" />
                      <Bar dataKey="F" stackId="grade" fill="#9E9E9E" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Overall Performance</CardTitle>
                </CardHeader>
                <CardContent className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={overallPerformance}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ grade, count }) => `${grade}: ${count}`}
                      >
                        {overallPerformance.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, _name, props) => [`${value} students`, `Grade ${props.payload.grade}`]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-500 mb-1">Total Students</p>
                      <p className="text-2xl font-bold">{students.length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-sm text-green-500 mb-1">Pass Rate</p>
                      <p className="text-2xl font-bold">
                        {Math.round((students.filter(s =>
                          !s.overallGrade.includes('F')).length / students.length) * 100)}%
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <p className="text-sm text-purple-500 mb-1">A* and A Grades</p>
                      <p className="text-2xl font-bold">
                        {students.filter(s => s.overallGrade.includes('A')).length}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                      <p className="text-sm text-yellow-600 mb-1">Average Grade</p>
                      <p className="text-2xl font-bold">B</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Comparative Analysis Tab */}
          <TabsContent value="comparative">
            <Card>
              <CardHeader>
                <CardTitle>Year-on-Year Performance</CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { year: '2021', A: 15, B: 25, C: 35, D: 15, E: 8, F: 2 },
                      { year: '2022', A: 18, B: 27, C: 32, D: 14, E: 7, F: 2 },
                      { year: '2023', A: 22, B: 30, C: 28, D: 12, E: 6, F: 2 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="A" name="Grade A" fill="#4CAF50" />
                    <Bar dataKey="B" name="Grade B" fill="#2196F3" />
                    <Bar dataKey="C" name="Grade C" fill="#FFC107" />
                    <Bar dataKey="D" name="Grade D" fill="#FF9800" />
                    <Bar dataKey="E" name="Grade E" fill="#F44336" />
                    <Bar dataKey="F" name="Grade F" fill="#9E9E9E" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Regional Comparison</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { region: 'Your School', passRate: 92, nationalRank: 5 },
                        { region: 'Northwest', passRate: 87, nationalRank: 18 },
                        { region: 'Southwest', passRate: 88, nationalRank: 15 },
                        { region: 'Center', passRate: 90, nationalRank: 10 },
                        { region: 'Littoral', passRate: 89, nationalRank: 12 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="region" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="passRate" name="Pass Rate (%)" fill="#4CAF50" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance Trends</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { subject: 'Mathematics', thisYear: 78, lastYear: 72, national: 68 },
                        { subject: 'English', thisYear: 82, lastYear: 80, national: 75 },
                        { subject: 'Physics', thisYear: 75, lastYear: 70, national: 65 },
                        { subject: 'Chemistry', thisYear: 72, lastYear: 68, national: 63 },
                        { subject: 'Biology', thisYear: 76, lastYear: 74, national: 70 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="thisYear" name="This Year" fill="#4CAF50" />
                      <Bar dataKey="lastYear" name="Last Year" fill="#FFC107" />
                      <Bar dataKey="national" name="National Average" fill="#2196F3" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}