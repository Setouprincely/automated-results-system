'use client';

import React, { useState } from 'react';
import ExaminationLayout from '@/components/layouts/ExaminationLayout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

// Define types for our grading systems
type GradeRange = {
  id: string;
  grade: string;
  minScore: number;
  maxScore: number;
  description?: string;
  color: string;
};

type Subject = {
  id: string;
  name: string;
  code: string;
  level: 'O' | 'A';
  hasCustomGrading: boolean;
};

// Custom toast implementation since we don't have the shadcn toast component
const useCustomToast = () => {
  const [toasts, setToasts] = useState<Array<{ title: string; description: string; variant?: string }>>([]);

  const toast = ({ title, description, variant = "default" }: {
    title: string;
    description: string;
    variant?: string
  }) => {
    // In a real implementation, this would show a toast notification
    console.log(`Toast: ${title} - ${description} (${variant})`);
    // For now, we'll just add it to our state
    setToasts([...toasts, { title, description, variant }]);
  };

  return { toast, toasts };
};

// Custom Switch component
const Switch: React.FC<{
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}> = ({ id, checked, onCheckedChange }) => {
  return (
    <div className="relative inline-flex h-6 w-11 items-center rounded-full" onClick={() => onCheckedChange(!checked)}>
      <span
        className={`${checked ? 'bg-blue-600' : 'bg-gray-200'} inline-block h-6 w-11 rounded-full transition-colors`}
      >
        <span
          className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-1`}
        />
      </span>
      <input
        type="checkbox"
        id={id}
        className="sr-only"
        checked={checked}
        onChange={() => onCheckedChange(!checked)}
      />
    </div>
  );
};

// Custom Slider component
const Slider: React.FC<{
  defaultValue: number[];
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number[]) => void;
}> = ({ defaultValue, min, max, step, onValueChange }) => {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = [...value];
    newValue[index] = parseInt(e.target.value);
    setValue(newValue);
    onValueChange(newValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(e) => handleChange(e, 0)}
          className="w-full"
        />
      </div>
      <div className="flex justify-between">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={(e) => handleChange(e, 1)}
          className="w-full"
        />
      </div>
    </div>
  );
};

const GradingConfigurationPage: React.FC = () => {
  const { toast } = useCustomToast();
  const [activeTab, setActiveTab] = useState('o-level');
  const [showSubjectSpecific, setShowSubjectSpecific] = useState(false);
  const [isEditingGrade, setIsEditingGrade] = useState(false);
  const [currentGrade, setCurrentGrade] = useState<GradeRange | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');

  // Sample data
  const [oLevelGrades, setOLevelGrades] = useState<GradeRange[]>([
    { id: '1', grade: '1', minScore: 90, maxScore: 100, description: 'Outstanding', color: '#10b981' },
    { id: '2', grade: '2', minScore: 80, maxScore: 89, description: 'Excellent', color: '#22c55e' },
    { id: '3', grade: '3', minScore: 70, maxScore: 79, description: 'Very Good', color: '#84cc16' },
    { id: '4', grade: '4', minScore: 60, maxScore: 69, description: 'Good', color: '#eab308' },
    { id: '5', grade: '5', minScore: 50, maxScore: 59, description: 'Credit', color: '#f59e0b' },
    { id: '6', grade: '6', minScore: 45, maxScore: 49, description: 'Credit', color: '#f97316' },
    { id: '7', grade: '7', minScore: 40, maxScore: 44, description: 'Pass', color: '#ef4444' },
    { id: '8', grade: '8', minScore: 30, maxScore: 39, description: 'Pass', color: '#dc2626' },
    { id: '9', grade: '9', minScore: 0, maxScore: 29, description: 'Fail', color: '#7f1d1d' },
  ]);

  const [aLevelGrades, setALevelGrades] = useState<GradeRange[]>([
    { id: 'a_star', grade: 'A*', minScore: 90, maxScore: 100, description: 'Outstanding', color: '#10b981' },
    { id: 'a', grade: 'A', minScore: 80, maxScore: 89, description: 'Excellent', color: '#22c55e' },
    { id: 'b', grade: 'B', minScore: 70, maxScore: 79, description: 'Very Good', color: '#84cc16' },
    { id: 'c', grade: 'C', minScore: 60, maxScore: 69, description: 'Good', color: '#eab308' },
    { id: 'd', grade: 'D', minScore: 50, maxScore: 59, description: 'Satisfactory', color: '#f59e0b' },
    { id: 'e', grade: 'E', minScore: 40, maxScore: 49, description: 'Pass', color: '#f97316' },
    { id: 'u', grade: 'U', minScore: 0, maxScore: 39, description: 'Unclassified', color: '#7f1d1d' },
  ]);

  // Generate chart data
  const oLevelDistributionData = oLevelGrades.map(grade => ({
    name: grade.grade,
    value: Math.floor(Math.random() * 30) + 5, // Random value between 5 and 35
    color: grade.color
  }));

  const aLevelDistributionData = aLevelGrades.map(grade => ({
    name: grade.grade,
    value: Math.floor(Math.random() * 30) + 5, // Random value between 5 and 35
    color: grade.color
  }));

  const boundaryHistoryData = (() => {
    const years = [2020, 2021, 2022, 2023, 2024];
    const grades = ['A*', 'A', 'B', 'C', 'D', 'E'];

    return years.map(year => {
      const data: any = { year };
      grades.forEach(grade => {
        // Generate a value that changes slightly each year (between 40 and 90)
        data[grade] = Math.floor(Math.random() * 10) + 40 + (grades.indexOf(grade) * 8);
      });
      return data;
    });
  })();

  // Using const instead of state since we're not modifying the subjects in this example
  const subjects: Subject[] = [
    { id: '1', name: 'Mathematics', code: 'MATH', level: 'O', hasCustomGrading: true },
    { id: '2', name: 'English Language', code: 'ENGL', level: 'O', hasCustomGrading: false },
    { id: '3', name: 'Physics', code: 'PHYS', level: 'O', hasCustomGrading: false },
    { id: '4', name: 'Chemistry', code: 'CHEM', level: 'O', hasCustomGrading: false },
    { id: '5', name: 'Further Mathematics', code: 'FMAT', level: 'A', hasCustomGrading: true },
    { id: '6', name: 'Literature in English', code: 'LITE', level: 'A', hasCustomGrading: false },
    { id: '7', name: 'Biology', code: 'BIOL', level: 'A', hasCustomGrading: false },
  ];

  const handleSaveGradingChanges = () => {
    toast({
      title: "Grading configuration saved",
      description: "Your changes to the grading configuration have been saved successfully.",
    });
  };

  const handleEditGrade = (grade: GradeRange) => {
    setCurrentGrade(grade);
    setIsEditingGrade(true);
  };

  const handleSaveGrade = () => {
    if (!currentGrade) return;

    if (activeTab === 'o-level') {
      setOLevelGrades(prev =>
        prev.map(g => g.id === currentGrade.id ? currentGrade : g)
      );
    } else {
      setALevelGrades(prev =>
        prev.map(g => g.id === currentGrade.id ? currentGrade : g)
      );
    }

    setIsEditingGrade(false);
    setCurrentGrade(null);

    toast({
      title: "Grade updated",
      description: `Grade ${currentGrade.grade} has been updated successfully.`,
    });
  };

  const handlePublishGradingScheme = () => {
    toast({
      title: "Grading scheme published",
      description: "The grading scheme has been published and is now active for all examiners.",
      variant: "default",
    });
  };

  // Track the selected subject
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const handleSelectSubject = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    setSelectedSubject(subject || null);

    // In a real app, we might load custom grading for this subject
    console.log(`Selected subject: ${subject?.name}`);
  };

  return (
    <ExaminationLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grading Configuration</h1>
            <p className="text-gray-500 mt-1">Configure grading schemes for GCE examinations</p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={handleSaveGradingChanges}>
              Save Draft
            </Button>
            <Button onClick={handlePublishGradingScheme}>
              Publish Grading Scheme
            </Button>
          </div>
        </div>

        <Alert className="mb-6 bg-blue-50 border border-blue-200">
          <AlertDescription>
            Changes to the grading scheme will affect all future examinations. Current examinations in progress will not be affected.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Examination Grading Configuration</CardTitle>
                <CardDescription>
                  Configure grading scales for O Level and A Level examinations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="o-level" onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="o-level">O Level (1-9)</TabsTrigger>
                    <TabsTrigger value="a-level">A Level (A*-E)</TabsTrigger>
                  </TabsList>

                  <TabsContent value="o-level" className="mt-6">
                    <div className="mb-4 flex justify-between items-center">
                      <h3 className="text-lg font-medium">O Level Grading Scale</h3>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="subject-specific-o"
                          checked={showSubjectSpecific && activeTab === 'o-level'}
                          onCheckedChange={() => setShowSubjectSpecific(!showSubjectSpecific)}
                        />
                        <label htmlFor="subject-specific-o" className="text-sm text-gray-600">
                          Show Subject-Specific Grading
                        </label>
                      </div>
                    </div>

                    {showSubjectSpecific && (
                      <div className="mb-4">
                        <Select onValueChange={handleSelectSubject}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={selectedSubject ? `${selectedSubject.name} (${selectedSubject.code})` : "Select a subject"} />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects
                              .filter(s => s.level === 'O')
                              .map(subject => (
                                <SelectItem key={subject.id} value={subject.id}>
                                  {subject.name} ({subject.code})
                                  {subject.hasCustomGrading && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Custom</span>
                                  )}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>

                        {selectedSubject && selectedSubject.level === 'O' && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                            Showing custom grading for {selectedSubject.name}
                            {selectedSubject.hasCustomGrading ?
                              " (This subject has custom grading rules)" :
                              " (Using default grading rules)"}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-20">Grade</TableHead>
                            <TableHead>Score Range</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {oLevelGrades.map((grade) => (
                            <TableRow key={grade.id}>
                              <TableCell>
                                <Badge
                                  style={{backgroundColor: grade.color}}
                                  className="text-white font-bold"
                                >
                                  {grade.grade}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {grade.minScore} - {grade.maxScore}%
                              </TableCell>
                              <TableCell>{grade.description}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditGrade(grade)}
                                >
                                  Edit
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  <TabsContent value="a-level" className="mt-6">
                    <div className="mb-4 flex justify-between items-center">
                      <h3 className="text-lg font-medium">A Level Grading Scale</h3>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="subject-specific-a"
                          checked={showSubjectSpecific && activeTab === 'a-level'}
                          onCheckedChange={() => setShowSubjectSpecific(!showSubjectSpecific)}
                        />
                        <label htmlFor="subject-specific-a" className="text-sm text-gray-600">
                          Show Subject-Specific Grading
                        </label>
                      </div>
                    </div>

                    {showSubjectSpecific && (
                      <div className="mb-4">
                        <Select onValueChange={handleSelectSubject}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={selectedSubject ? `${selectedSubject.name} (${selectedSubject.code})` : "Select a subject"} />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects
                              .filter(s => s.level === 'A')
                              .map(subject => (
                                <SelectItem key={subject.id} value={subject.id}>
                                  {subject.name} ({subject.code})
                                  {subject.hasCustomGrading && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Custom</span>
                                  )}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>

                        {selectedSubject && selectedSubject.level === 'A' && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                            Showing custom grading for {selectedSubject.name}
                            {selectedSubject.hasCustomGrading ?
                              " (This subject has custom grading rules)" :
                              " (Using default grading rules)"}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-20">Grade</TableHead>
                            <TableHead>Score Range</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {aLevelGrades.map((grade) => (
                            <TableRow key={grade.id}>
                              <TableCell>
                                <Badge
                                  style={{backgroundColor: grade.color}}
                                  className="text-white font-bold"
                                >
                                  {grade.grade}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {grade.minScore} - {grade.maxScore}%
                              </TableCell>
                              <TableCell>{grade.description}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditGrade(grade)}
                                >
                                  Edit
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>
                  {activeTab === 'o-level' ? 'O Level' : 'A Level'} grade distribution from previous year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-around mb-6">
                  <Button
                    variant={chartType === 'bar' ? 'default' : 'outline'}
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setChartType('bar')}
                  >
                    <BarChartIcon className="h-4 w-4" />
                    Bar
                  </Button>
                  <Button
                    variant={chartType === 'pie' ? 'default' : 'outline'}
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setChartType('pie')}
                  >
                    <PieChartIcon className="h-4 w-4" />
                    Pie
                  </Button>
                  <Button
                    variant={chartType === 'line' ? 'default' : 'outline'}
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setChartType('line')}
                  >
                    <LineChartIcon className="h-4 w-4" />
                    Line
                  </Button>
                </div>

                <div className="py-6">
                  <div className="h-64 rounded-md">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'bar' ? (
                        <BarChart
                          data={activeTab === 'o-level' ? oLevelDistributionData : aLevelDistributionData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Percentage of Students">
                            {(activeTab === 'o-level' ? oLevelDistributionData : aLevelDistributionData).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      ) : chartType === 'pie' ? (
                        <PieChart>
                          <Pie
                            data={activeTab === 'o-level' ? oLevelDistributionData : aLevelDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {(activeTab === 'o-level' ? oLevelDistributionData : aLevelDistributionData).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      ) : (
                        <LineChart
                          data={activeTab === 'o-level' ? oLevelDistributionData : aLevelDistributionData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="value" name="Percentage of Students" stroke="#8884d8" />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  {activeTab === 'o-level' ? (
                    oLevelGrades.map(grade => (
                      <div key={grade.id} className="p-2 rounded-md bg-gray-50">
                        <Badge
                          style={{backgroundColor: grade.color}}
                          className="text-white font-bold mb-1"
                        >
                          {grade.grade}
                        </Badge>
                        <p className="text-xs text-gray-500">12%</p>
                      </div>
                    ))
                  ) : (
                    aLevelGrades.map(grade => (
                      <div key={grade.id} className="p-2 rounded-md bg-gray-50">
                        <Badge
                          style={{backgroundColor: grade.color}}
                          className="text-white font-bold mb-1"
                        >
                          {grade.grade}
                        </Badge>
                        <p className="text-xs text-gray-500">15%</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Grade Boundary History</CardTitle>
                <CardDescription>
                  Track changes to grade boundaries over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-6">
                  <div className="h-48 rounded-md">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={boundaryHistoryData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="A*" stroke="#10b981" />
                        <Line type="monotone" dataKey="A" stroke="#22c55e" />
                        <Line type="monotone" dataKey="B" stroke="#84cc16" />
                        <Line type="monotone" dataKey="C" stroke="#eab308" />
                        <Line type="monotone" dataKey="D" stroke="#f59e0b" />
                        <Line type="monotone" dataKey="E" stroke="#f97316" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <Select defaultValue="2024">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="2021">2021</SelectItem>
                      <SelectItem value="2020">2020</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Grade Dialog */}
      <Dialog open={isEditingGrade} onOpenChange={setIsEditingGrade}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Grade Configuration</DialogTitle>
            <DialogDescription>
              Update the score range and description for this grade.
            </DialogDescription>
          </DialogHeader>

          {currentGrade && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <div className="font-medium">Grade:</div>
                <Badge
                  style={{backgroundColor: currentGrade.color}}
                  className="text-white font-bold"
                >
                  {currentGrade.grade}
                </Badge>
              </div>

              <div className="grid gap-2">
                <div className="font-medium">Score Range:</div>
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Minimum Score: {currentGrade.minScore}%</span>
                      <span>Maximum Score: {currentGrade.maxScore}%</span>
                    </div>
                    <Slider
                      defaultValue={[currentGrade.minScore, currentGrade.maxScore]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => {
                        if (currentGrade) {
                          setCurrentGrade({
                            ...currentGrade,
                            minScore: value[0],
                            maxScore: value[1]
                          });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor="description" className="font-medium">Description:</label>
                <Input
                  id="description"
                  value={currentGrade.description || ''}
                  onChange={(e) => {
                    if (currentGrade) {
                      setCurrentGrade({
                        ...currentGrade,
                        description: e.target.value
                      });
                    }
                  }}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="color" className="font-medium">Color:</label>
                <div className="flex gap-2">
                  {['#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444', '#dc2626', '#7f1d1d'].map(color => (
                    <div
                      key={color}
                      className={`h-8 w-8 rounded-full cursor-pointer border-2 ${currentGrade.color === color ? 'border-gray-800' : 'border-transparent'}`}
                      style={{backgroundColor: color}}
                      onClick={() => {
                        if (currentGrade) {
                          setCurrentGrade({
                            ...currentGrade,
                            color
                          });
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingGrade(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveGrade}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ExaminationLayout>
  );
};

export default GradingConfigurationPage;