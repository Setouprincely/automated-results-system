'use client';

import { useState } from 'react';

// Define types
interface Subject {
  code: string;
  name: string;
  grade: string;
}

interface Student {
  id: string;
  name: string;
  center: string;
  centerCode: string;
  verified: boolean;
  status: 'passed' | 'failed' | 'pending';
  examType: 'olevel' | 'alevel';
  subjects: Subject[];
}
import DashboardLayout from '@/components/layouts/layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Search,
  FileText,
  Download,
  Printer,
  Mail,
  Filter,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Award
} from 'lucide-react';

// Mock data for demonstration
const mockExamSessions = [
  { id: '2025-june', name: 'June 2025' },
  { id: '2025-nov', name: 'November 2025' },
  { id: '2024-june', name: 'June 2024' },
  { id: '2024-nov', name: 'November 2024' }
];

const mockExamTypes = [
  { id: 'olevel', name: 'Ordinary Level (O Level)' },
  { id: 'alevel', name: 'Advanced Level (A Level)' }
];

const mockStudents = [
  {
    id: '20250001',
    name: 'Ebenezer Takang',
    center: 'GBHS Buea',
    centerCode: 'SW001',
    verified: true,
    status: 'passed',
    examType: 'olevel',
    subjects: [
      { code: 'ENG', name: 'English Language', grade: '1' },
      { code: 'MTH', name: 'Mathematics', grade: '2' },
      { code: 'FRE', name: 'French', grade: '3' },
      { code: 'BIO', name: 'Biology', grade: '1' },
      { code: 'CHM', name: 'Chemistry', grade: '1' },
      { code: 'PHY', name: 'Physics', grade: '2' },
      { code: 'GEO', name: 'Geography', grade: '2' },
      { code: 'HIS', name: 'History', grade: '3' }
    ]
  },
  {
    id: '20250002',
    name: 'Marie Ngono',
    center: 'GBHS Bamenda',
    centerCode: 'NW002',
    verified: true,
    status: 'passed',
    examType: 'alevel',
    subjects: [
      { code: 'MTH', name: 'Mathematics', grade: 'A' },
      { code: 'FTH', name: 'Further Mathematics', grade: 'B' },
      { code: 'PHY', name: 'Physics', grade: 'A*' },
      { code: 'CHM', name: 'Chemistry', grade: 'A' }
    ]
  },
  {
    id: '20250003',
    name: 'Joseph Fomba',
    center: 'GBHS Douala',
    centerCode: 'LT003',
    verified: false,
    status: 'pending',
    examType: 'olevel',
    subjects: []
  },
  {
    id: '20250004',
    name: 'Fatimatou Bello',
    center: 'GBHS Maroua',
    centerCode: 'FN004',
    verified: true,
    status: 'failed',
    examType: 'olevel',
    subjects: []
  }
];

export default function CertificateGenerationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [examSession, setExamSession] = useState('');
  const [examType, setExamType] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('individual');

  // Filter students based on search and filters
  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.id.includes(searchTerm);

    const matchesExamType = examType ? student.examType === examType : true;

    const matchesStatus = filterStatus === 'all' ? true :
                          filterStatus === 'passed' ? student.status === 'passed' :
                          filterStatus === 'pending' ? student.status === 'pending' :
                          student.status === 'failed';

    return matchesSearch && matchesExamType && matchesStatus;
  });

  const handleSelectAll = (checked: boolean | string) => {
    if (checked === true || checked === "true" || checked === "indeterminate") {
      setSelectedStudents(filteredStudents.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean | string) => {
    if (checked === true || checked === "true" || checked === "indeterminate") {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  const handleGenerateCertificate = (student: any) => {
    setCurrentStudent(student as Student);
    setShowPreview(true);
  };

  const handleBulkAction = () => {
    if (bulkAction === 'generate') {
      setShowConfirmDialog(true);
    }
  };

  const confirmBulkGeneration = () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowConfirmDialog(false);
      setShowSuccessDialog(true);
      setSelectedStudents([]);
    }, 2000);
  };

  const regenerateCertificate = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowPreview(false);
      setShowSuccessDialog(true);
    }, 1500);
  };

  const handleBatchUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccessDialog(true);
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            Certificate Generation
          </h1>
          <div className="flex items-center gap-4">
            <Select value={examSession} onValueChange={setExamSession}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Exam Session" />
              </SelectTrigger>
              <SelectContent>
                {mockExamSessions.map(session => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual">Individual Certificates</TabsTrigger>
            <TabsTrigger value="batch">Batch Certificate Generation</TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Certificate Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6 flex flex-wrap items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                      placeholder="Search by student name or ID..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <Select value={examType} onValueChange={setExamType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Exam Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      {mockExamTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="passed">Passed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="w-32">Student ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Examination Center</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-36">Certificate</TableHead>
                        <TableHead className="w-32">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedStudents.includes(student.id)}
                                onCheckedChange={(checked) => handleSelectStudent(student.id, checked)}
                              />
                            </TableCell>
                            <TableCell>{student.id}</TableCell>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>{student.center} ({student.centerCode})</TableCell>
                            <TableCell>
                              {student.status === 'passed' && (
                                <Badge variant="outline" className="bg-green-100 text-green-800">Passed</Badge>
                              )}
                              {student.status === 'failed' && (
                                <Badge variant="destructive">Failed</Badge>
                              )}
                              {student.status === 'pending' && (
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {student.status === 'passed' ? (
                                <Badge className="flex items-center gap-1 bg-blue-100 text-blue-800">
                                  <CheckCircle className="h-3 w-3" />
                                  Eligible
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="flex items-center gap-1 bg-gray-100 text-gray-800">
                                  <AlertCircle className="h-3 w-3" />
                                  Not Eligible
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant={student.status === 'passed' ? "default" : "outline"}
                                  disabled={student.status !== 'passed'}
                                  onClick={() => handleGenerateCertificate(student)}
                                >
                                  Generate
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No students found matching the criteria
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {selectedStudents.length > 0 && (
                  <div className="mt-4 flex items-center justify-between bg-gray-50 p-4 rounded-md">
                    <div>
                      <span className="font-medium">{selectedStudents.length} students selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={bulkAction} onValueChange={setBulkAction}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Bulk Action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="generate">Generate Certificates</SelectItem>
                          <SelectItem value="email">Email Certificates</SelectItem>
                          <SelectItem value="download">Download Certificates</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        disabled={!bulkAction}
                        onClick={handleBulkAction}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="batch" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Batch Certificate Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBatchUpload} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Examination Session</label>
                      <Select required value={examSession} onValueChange={setExamSession}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Session" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockExamSessions.map(session => (
                            <SelectItem key={session.id} value={session.id}>
                              {session.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Examination Type</label>
                      <Select required value={examType} onValueChange={setExamType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockExamTypes.map(type => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Upload Student List (CSV or Excel)</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FileText className="w-8 h-8 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            CSV, XLS or XLSX (MAX. 10MB)
                          </p>
                        </div>
                        <input type="file" className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Certificate Options</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="digital" defaultChecked />
                        <label htmlFor="digital" className="text-sm">Generate Digital Copy</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="email" />
                        <label htmlFor="email" className="text-sm">Send Email Notification</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="archive" defaultChecked />
                        <label htmlFor="archive" className="text-sm">Archive in System</label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                    <Button type="submit" className="gap-2" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Generate Certificates
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Batch Processing History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Batch ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Session</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Certificates</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>BCH-2025-001</TableCell>
                        <TableCell>15 May 2025</TableCell>
                        <TableCell>June 2024</TableCell>
                        <TableCell>O Level</TableCell>
                        <TableCell>1,245 certificates</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">Completed</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>BCH-2025-002</TableCell>
                        <TableCell>12 May 2025</TableCell>
                        <TableCell>November 2024</TableCell>
                        <TableCell>A Level</TableCell>
                        <TableCell>893 certificates</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">Completed</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Certificate Preview Dialog */}
      {currentStudent && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">GCE Certificate Preview</DialogTitle>
            </DialogHeader>

            <div className="p-4 border rounded-lg bg-gray-50 min-h-96">
              <div className="bg-white p-8 border-8 border-double border-gray-300 rounded-md shadow-lg mx-auto max-w-3xl">
                <div className="flex justify-center mb-6">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold uppercase text-gray-800">Republic of Cameroon</h1>
                    <p className="text-xl">Ministry of Secondary Education</p>
                    <div className="my-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-xs text-gray-500">National Emblem</span>
                      </div>
                      <h2 className="text-2xl font-bold text-primary">
                        {currentStudent.examType === 'olevel' ?
                          'General Certificate of Education - Ordinary Level' :
                          'General Certificate of Education - Advanced Level'}
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="mb-6 text-center">
                  <p className="text-lg">This is to certify that</p>
                  <h3 className="text-2xl font-bold uppercase my-2">{currentStudent.name}</h3>
                  <p className="text-lg mb-2">
                    Candidate Number: <span className="font-semibold">{currentStudent.id}</span>
                  </p>
                  <p className="text-lg">
                    of <span className="font-semibold">{currentStudent.center}</span> ({currentStudent.centerCode})
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-lg text-center mb-4">has been awarded the following grades:</p>

                  <div className="mx-auto max-w-md">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b-2 border-gray-300">
                          <th className="py-2 text-left">Subject</th>
                          <th className="py-2 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentStudent.subjects.map((subject, index) => (
                          <tr key={index} className="border-b border-gray-200">
                            <td className="py-2">{subject.name}</td>
                            <td className="py-2 text-center font-bold">{subject.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-8 flex justify-between items-end">
                  <div className="text-center">
                    <div className="mb-2 h-10 border-b border-gray-300 w-40"></div>
                    <p className="text-sm">Date & Official Stamp</p>
                  </div>

                  <div className="text-center">
                    <div className="mb-2 h-10 border-b border-gray-300 w-40"></div>
                    <p className="text-sm">Registrar</p>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-xs text-gray-500">
                    Certificate ID: GCE-{currentStudent.examType === 'olevel' ? 'OL' : 'AL'}-2025-{currentStudent.id}
                  </p>
                  <p className="text-xs text-gray-500">
                    Verify this certificate at verify.gce.cm
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <div className="flex w-full justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                </div>
                <div className="flex gap-2">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={regenerateCertificate} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      "Generate Official Certificate"
                    )}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate {selectedStudents.length} Certificates?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to generate certificates for {selectedStudents.length} students. This process cannot be undone.
              Only students who have passed all requirements will receive certificates.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkGeneration} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Yes, Generate Certificates"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-600 flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              Certificate Generation Successful
            </AlertDialogTitle>
            <AlertDialogDescription>
              The certificates have been successfully generated and stored in the system.
              You can access them in the certificate archive section or send them directly to students.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}