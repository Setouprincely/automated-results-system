"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/layouts/AdminLayout';
import { format } from 'date-fns';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons
import {
  Search,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Camera,
  QrCode,
  UserCheck,
  Clock,
  FileText,
  BarChart,
  Eye,
  Pencil,
  Trash
} from 'lucide-react';

// Types
interface Student {
  id: string;
  registrationNumber: string;
  fullName: string;
  school: string;
  examCenter: string;
  subjects: string[];
  photoUrl: string;
  isPresent?: boolean;
  isVerified?: boolean;
  timeRecorded?: Date;
  signatureUrl?: string;
  notes?: string;
}

interface ExamSession {
  id: string;
  name: string;
  subject: string;
  date: Date;
  startTime: string;
  endTime: string;
  venue: string;
  totalRegistered: number;
  totalPresent: number;
  totalAbsent: number;
  inProgress: boolean;
}

export default function AttendanceTrackingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get('examId');
  const sessionId = searchParams.get('sessionId');

  // States
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [examSessions, setExamSessions] = useState<{[key: string]: ExamSession[]}>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [scanMode, setScanMode] = useState<boolean>(false);
  const [scannedId, setScannedId] = useState<string>('');
  const [currentSession, setCurrentSession] = useState<ExamSession | null>(null);
  const [statsVisible, setStatsVisible] = useState<boolean>(true);
  const [batchMode, setBatchMode] = useState<boolean>(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [verificationMode, setVerificationMode] = useState<'simple' | 'photo' | 'signature'>('simple');
  const [showScanDialog, setShowScanDialog] = useState<boolean>(false);
  const [showStudentDialog, setShowStudentDialog] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Track if data has been loaded
  const dataLoadedRef = useRef(false);

  // Mock data for demonstration - load only once
  useEffect(() => {
    // Skip if data is already loaded
    if (dataLoadedRef.current) return;

    // In a real application, this would be an API call
    const mockExams = [
      { id: 'gce-ol-2025', name: 'GCE O Level 2025' },
      { id: 'gce-al-2025', name: 'GCE A Level 2025' },
    ];

    const mockSessions: ExamSession[] = [
      {
        id: 'math-001',
        name: 'Mathematics Paper 1',
        subject: 'Mathematics',
        date: new Date('2025-06-01'),
        startTime: '09:00',
        endTime: '11:30',
        venue: 'Main Hall',
        totalRegistered: 120,
        totalPresent: 112,
        totalAbsent: 8,
        inProgress: true
      },
      {
        id: 'eng-001',
        name: 'English Language',
        subject: 'English',
        date: new Date('2025-06-02'),
        startTime: '09:00',
        endTime: '11:00',
        venue: 'Main Hall',
        totalRegistered: 135,
        totalPresent: 130,
        totalAbsent: 5,
        inProgress: false
      },
      {
        id: 'phy-001',
        name: 'Physics Paper 1',
        subject: 'Physics',
        date: new Date('2025-06-03'),
        startTime: '13:00',
        endTime: '15:00',
        venue: 'Science Block',
        totalRegistered: 85,
        totalPresent: 0,
        totalAbsent: 0,
        inProgress: false
      }
    ];

    const mockStudents: Student[] = Array(50).fill(null).map((_, index) => {
      const isPresent = Math.random() > 0.05; // 5% chance of being absent
      return {
        id: `STD${1000 + index}`,
        registrationNumber: `GCE${2025}${10000 + index}`,
        fullName: `Student ${index + 1}`,
        school: `School ${Math.floor(index / 10) + 1}`,
        examCenter: 'Yaounde Examination Center',
        subjects: ['Mathematics', 'English', 'Physics'],
        photoUrl: `/placeholder-student-${(index % 5) + 1}.jpg`,
        isPresent: isPresent,
        isVerified: isPresent ? Math.random() > 0.1 : false, // 10% not verified
        timeRecorded: isPresent ? new Date() : undefined,
        signatureUrl: isPresent ? '/placeholder-signature.png' : undefined,
        notes: isPresent ? '' : Math.random() > 0.5 ? 'Student reported sick' : 'No information'
      };
    });

    // Create mock exam sessions
    const sessionsData = {
      'gce-ol-2025': mockSessions,
      'gce-al-2025': mockSessions.map(s => ({ ...s, id: `a-${s.id}` }))
    };

    // Set mock data
    setExamSessions(sessionsData);
    setStudents(mockStudents);
    setSessions(mockSessions);

    // Mark data as loaded
    dataLoadedRef.current = true;
    setLoading(false);
  }, []);  // Empty dependency array - run only once

  // Handle URL params and session selection
  useEffect(() => {
    if (!dataLoadedRef.current) return; // Skip if data isn't loaded yet

    // Set initial selections if query params exist
    if (examId) setSelectedExam(examId as string);
    if (sessionId) setSelectedSession(sessionId as string);

    // Find current session if selections exist
    if (examId && sessionId && examSessions[examId as string]) {
      const session = examSessions[examId as string].find(s => s.id === sessionId);
      if (session) setCurrentSession(session);
    }
  }, [examId, sessionId, examSessions]);

  // Filter students based on search and filters with memoization
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Search query filter
      const matchesSearch =
        student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      let matchesStatus = true;
      if (filterStatus === 'present') matchesStatus = !!student.isPresent;
      if (filterStatus === 'absent') matchesStatus = !student.isPresent;
      if (filterStatus === 'unverified') matchesStatus = !!student.isPresent && !student.isVerified;

      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, filterStatus]); // Only recalculate when these dependencies change

  // Handle attendance toggle
  const toggleAttendance = (studentId: string, isPresent: boolean) => {
    setStudents(prev =>
      prev.map(student => {
        if (student.id === studentId) {
          return {
            ...student,
            isPresent,
            timeRecorded: isPresent ? new Date() : undefined,
            isVerified: false
          };
        }
        return student;
      })
    );

    // Update session stats
    if (currentSession) {
      const updatedSession = {...currentSession};
      updatedSession.totalPresent = isPresent
        ? updatedSession.totalPresent + 1
        : updatedSession.totalPresent - 1;
      updatedSession.totalAbsent = updatedSession.totalRegistered - updatedSession.totalPresent;
      setCurrentSession(updatedSession);
    }
  };

  // Handle verification toggle
  const toggleVerification = (studentId: string, isVerified: boolean) => {
    setStudents(prev =>
      prev.map(student => {
        if (student.id === studentId) {
          return {
            ...student,
            isVerified
          };
        }
        return student;
      })
    );
  };

  // Handle batch actions
  const handleBatchAction = (action: 'markPresent' | 'markAbsent' | 'verify') => {
    setStudents(prev =>
      prev.map(student => {
        if (selectedStudents.includes(student.id)) {
          if (action === 'markPresent') {
            return {
              ...student,
              isPresent: true,
              timeRecorded: new Date()
            };
          } else if (action === 'markAbsent') {
            return {
              ...student,
              isPresent: false,
              timeRecorded: undefined,
              isVerified: false
            };
          } else if (action === 'verify') {
            return {
              ...student,
              isVerified: true
            };
          }
        }
        return student;
      })
    );

    // Clear selection after batch action
    setSelectedStudents([]);
  };

  // Handle student selection for batch actions
  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Handle barcode/QR code scan
  const handleScan = (scannedData: string) => {
    const foundStudent = students.find(s => s.registrationNumber === scannedData);
    if (foundStudent) {
      toggleAttendance(foundStudent.id, true);
      setScannedId(scannedData);

      // Auto-clear scan result after 3 seconds
      setTimeout(() => {
        setScannedId('');
      }, 3000);
    }
  };

  // Mock scan for demo
  const mockScan = () => {
    const randomStudent = students[Math.floor(Math.random() * students.length)];
    handleScan(randomStudent.registrationNumber);
  };

  // Handle exam session change
  const handleSessionChange = (sessionId: string) => {
    setSelectedSession(sessionId);

    // If "none" is selected, clear the current session
    if (sessionId === "none") {
      setCurrentSession(null);

      // Update URL to reflect selection
      const params = new URLSearchParams(searchParams);
      params.set('examId', selectedExam);
      params.delete('sessionId');
      router.push(`/management/attendance?${params.toString()}`);
      return;
    }

    // Update current session
    if (selectedExam && examSessions[selectedExam]) {
      const session = examSessions[selectedExam].find(s => s.id === sessionId);
      if (session) setCurrentSession(session);
    }

    // Update URL to reflect selection
    const params = new URLSearchParams(searchParams);
    params.set('examId', selectedExam);
    params.set('sessionId', sessionId);
    router.push(`/management/attendance?${params.toString()}`);
  };

  // Handle exam change
  const handleExamChange = (examId: string) => {
    // If "all" is selected, clear everything
    if (examId === "all") {
      setSelectedExam('');
      setSelectedSession('');
      setCurrentSession(null);

      // Update URL to reflect selection
      const params = new URLSearchParams(searchParams);
      params.delete('examId');
      params.delete('sessionId');
      router.push(`/management/attendance?${params.toString()}`);
      return;
    }

    setSelectedExam(examId);
    setSelectedSession('');
    setCurrentSession(null);

    // Update URL to reflect selection
    const params = new URLSearchParams(searchParams);
    params.set('examId', examId);
    params.delete('sessionId');
    router.push(`/management/attendance?${params.toString()}`);
  };

  // Export attendance data
  const exportAttendance = () => {
    // In a real application, this would generate and download a CSV/Excel file
    alert('Attendance data exported successfully!');
  };

  // Start/end examination session
  const toggleExamSession = () => {
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        inProgress: !currentSession.inProgress
      });
    }
  };

  // View student details
  const viewStudentDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentDialog(true);
  };

  // Calculate stats with memoization to prevent unnecessary recalculations
  const stats = useMemo(() => ({
    totalStudents: students.length,
    present: students.filter(s => s.isPresent).length,
    absent: students.filter(s => !s.isPresent).length,
    verified: students.filter(s => s.isVerified).length,
    unverified: students.filter(s => s.isPresent && !s.isVerified).length,
    attendanceRate: students.length > 0
      ? Math.round((students.filter(s => s.isPresent).length / students.length) * 100)
      : 0
  }), [students]); // Only recalculate when students array changes

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Attendance Tracking</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track student attendance for examinations
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setShowScanDialog(true)}
              className="flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              Scan ID/QR Code
            </Button>
            <Button
              variant="outline"
              onClick={exportAttendance}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            {currentSession && (
              <Button
                variant={currentSession.inProgress ? "destructive" : "default"}
                onClick={toggleExamSession}
              >
                {currentSession.inProgress ? 'End Session' : 'Start Session'}
              </Button>
            )}
          </div>
        </div>

        {/* Examination Selection */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Examination</label>
                <Select
                  value={selectedExam}
                  onValueChange={handleExamChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an examination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Select an examination</SelectItem>
                    <SelectItem value="gce-ol-2025">GCE O Level 2025</SelectItem>
                    <SelectItem value="gce-al-2025">GCE A Level 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Select Session</label>
                <Select
                  value={selectedSession}
                  onValueChange={handleSessionChange}
                  disabled={!selectedExam}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select a session</SelectItem>
                    {selectedExam && examSessions[selectedExam]?.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.name} - {format(session.date, 'dd MMM yyyy')} ({session.startTime}-{session.endTime})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Info */}
        {currentSession && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    {currentSession.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {format(currentSession.date, 'EEEE, MMMM d, yyyy')} | {currentSession.startTime} - {currentSession.endTime} | {currentSession.venue}
                  </p>
                </div>
                <div className="flex items-center mt-2 md:mt-0">
                  <Badge variant={currentSession.inProgress ? "default" : "outline"} className="flex items-center gap-1">
                    <span className={`inline-block h-2 w-2 rounded-full ${currentSession.inProgress ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    {currentSession.inProgress ? 'Session in Progress' : 'Session Not Started'}
                  </Badge>
                </div>
              </div>

              {/* Stats Cards */}
              {statsVisible && (
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-sm font-medium text-blue-600 mb-1">Total Registered</div>
                        <div className="text-3xl font-bold">{currentSession.totalRegistered}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-sm font-medium text-green-600 mb-1">Present</div>
                        <div className="text-3xl font-bold">{currentSession.totalPresent}</div>
                        <div className="text-sm text-muted-foreground">
                          {currentSession.totalRegistered > 0
                            ? Math.round((currentSession.totalPresent / currentSession.totalRegistered) * 100)
                            : 0}%
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-sm font-medium text-red-600 mb-1">Absent</div>
                        <div className="text-3xl font-bold">{currentSession.totalAbsent}</div>
                        <div className="text-sm text-muted-foreground">
                          {currentSession.totalRegistered > 0
                            ? Math.round((currentSession.totalAbsent / currentSession.totalRegistered) * 100)
                            : 0}%
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-sm font-medium text-amber-600 mb-1">To Be Verified</div>
                        <div className="text-3xl font-bold">{stats.unverified}</div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStatsVisible(false)}
                    >
                      Hide Stats
                    </Button>
                  </div>
                </div>
              )}

              {!statsVisible && (
                <div className="border-t pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatsVisible(true)}
                  >
                    Show Stats
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Scan Dialog */}
        <Dialog open={showScanDialog} onOpenChange={setShowScanDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Scan Student ID Card</DialogTitle>
              <DialogDescription>
                Scan barcode or QR code on student ID card to mark attendance
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center py-6">
              <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <Button
                  variant="ghost"
                  onClick={mockScan}
                  className="flex flex-col items-center"
                >
                  <QrCode className="h-12 w-12 text-gray-400 mb-2" />
                  <span className="text-sm font-medium">
                    Click to simulate scan
                  </span>
                </Button>
              </div>
            </div>

            {scannedId && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  Successfully scanned ID: <strong>{scannedId}</strong>
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScanDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Student List */}
        {currentSession && (
          <Card>
            <CardContent className="pt-6">
              {/* Search and Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Search Students
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      placeholder="Search by name or registration number"
                    />
                  </div>
                </div>

                <div className="w-full md:w-64">
                  <label className="text-sm font-medium mb-2 block">
                    Filter by Status
                  </label>
                  <Select
                    value={filterStatus}
                    onValueChange={setFilterStatus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Students" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="unverified">Present but Not Verified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full md:w-64">
                  <label className="text-sm font-medium mb-2 block">
                    Verification Mode
                  </label>
                  <Select
                    value={verificationMode}
                    onValueChange={(value) => setVerificationMode(value as 'simple' | 'photo' | 'signature')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Verification Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple Verification</SelectItem>
                      <SelectItem value="photo">Photo Verification</SelectItem>
                      <SelectItem value="signature">Signature Verification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Button
                    variant={batchMode ? "default" : "outline"}
                    onClick={() => setBatchMode(!batchMode)}
                  >
                    Batch Mode {batchMode && `(${selectedStudents.length})`}
                  </Button>
                </div>
              </div>

              {/* Batch Actions */}
              {batchMode && selectedStudents.length > 0 && (
                <Alert className="mb-6">
                  <div className="flex justify-between items-center w-full">
                    <div className="font-medium">
                      {selectedStudents.length} students selected
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleBatchAction('markPresent')}
                      >
                        Mark Present
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleBatchAction('markAbsent')}
                      >
                        Mark Absent
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleBatchAction('verify')}
                      >
                        Verify Selected
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedStudents([])}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                </Alert>
              )}

              {/* Student List */}
              <Table>
                <TableHeader>
                  <TableRow>
                    {batchMode && <TableHead className="w-[50px]"></TableHead>}
                    {verificationMode === 'photo' && <TableHead className="w-[80px]">Photo</TableHead>}
                    <TableHead>Student</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={batchMode ? 6 : 5} className="text-center text-muted-foreground">
                        No students match your search criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        {batchMode && (
                          <TableCell>
                            <Checkbox
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={() => toggleStudentSelection(student.id)}
                            />
                          </TableCell>
                        )}

                        {verificationMode === 'photo' && (
                          <TableCell>
                            <div className="h-10 w-10 rounded-full overflow-hidden">
                              <img
                                className="h-full w-full object-cover"
                                src={student.photoUrl || '/placeholder-user.jpg'}
                                alt={student.fullName}
                              />
                            </div>
                          </TableCell>
                        )}

                        <TableCell>
                          <div className="font-medium">{student.fullName}</div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline">{student.registrationNumber}</Badge>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm text-muted-foreground">{student.school}</div>
                        </TableCell>

                        <TableCell>
                          {student.isPresent ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Present
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200">
                              <XCircle className="mr-1 h-3 w-3" />
                              Absent
                            </Badge>
                          )}
                          {student.isPresent && student.isVerified && (
                            <Badge className="ml-2 bg-blue-100 text-blue-800">Verified</Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {student.isPresent ? (
                              <>
                                {!student.isVerified && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggleVerification(student.id, true)}
                                  >
                                    <AlertCircle className="mr-1 h-3 w-3" />
                                    Verify
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600"
                                  onClick={() => toggleAttendance(student.id, false)}
                                >
                                  Mark Absent
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600"
                                onClick={() => toggleAttendance(student.id, true)}
                              >
                                Mark Present
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => viewStudentDetails(student)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Student Details Dialog */}
              {selectedStudent && (
                <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Student Details</DialogTitle>
                      <DialogDescription>
                        View detailed information about the student
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="col-span-2 sm:col-span-1">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Full Name</div>
                        <div className="font-medium">{selectedStudent.fullName}</div>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Registration Number</div>
                        <div className="font-medium">{selectedStudent.registrationNumber}</div>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <div className="text-sm font-medium text-muted-foreground mb-1">School</div>
                        <div className="font-medium">{selectedStudent.school}</div>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Examination Center</div>
                        <div className="font-medium">{selectedStudent.examCenter}</div>
                      </div>

                      <div className="col-span-2">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Subjects</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedStudent.subjects.map(subject => (
                            <Badge key={subject} variant="secondary">{subject}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Attendance Status</div>
                        <div className="flex items-center gap-2">
                          {selectedStudent.isPresent ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Present
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              <XCircle className="mr-1 h-3 w-3" />
                              Absent
                            </Badge>
                          )}

                          {selectedStudent.isPresent && selectedStudent.isVerified && (
                            <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                          )}

                          {selectedStudent.timeRecorded && (
                            <span className="text-sm text-muted-foreground">
                              Recorded at {format(selectedStudent.timeRecorded, 'HH:mm')}
                            </span>
                          )}
                        </div>
                      </div>

                      {selectedStudent.notes && (
                        <div className="col-span-2">
                          <div className="text-sm font-medium text-muted-foreground mb-1">Notes</div>
                          <div className="text-sm">{selectedStudent.notes}</div>
                        </div>
                      )}

                      {verificationMode === 'photo' && (
                        <div className="col-span-2 flex justify-center">
                          <div className="w-32 h-32 rounded-full overflow-hidden">
                            <img
                              className="h-full w-full object-cover"
                              src={selectedStudent.photoUrl || '/placeholder-user.jpg'}
                              alt={selectedStudent.fullName}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowStudentDialog(false)}>Close</Button>
                      {selectedStudent.isPresent ? (
                        <Button
                          variant="outline"
                          className="text-red-600"
                          onClick={() => {
                            toggleAttendance(selectedStudent.id, false);
                            setShowStudentDialog(false);
                          }}
                        >
                          Mark Absent
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="text-green-600"
                          onClick={() => {
                            toggleAttendance(selectedStudent.id, true);
                            setShowStudentDialog(false);
                          }}
                        >
                          Mark Present
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}