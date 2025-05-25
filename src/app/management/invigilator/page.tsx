'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// Custom toast implementation
const toast = ({ title, description, variant = "default" }: {
  title: string;
  description: string;
  variant?: string
}) => {
  // In a real implementation, this would show a toast notification
  console.log(`Toast: ${title} - ${description} (${variant})`);
};
import {
  ChevronDown,
  Filter,
  Search,
  MoreHorizontal,
  Plus,
  UserPlus,
  FileText,
  Clipboard,
  RefreshCw,
  Download
} from "lucide-react";

// Mock data for invigilators
const mockInvigilators = [
  { id: 1, name: "Dr. Alice Johnson", email: "alice.j@example.com", phone: "+237 650112233", specialization: "Mathematics", availability: "Full-time", assignedCount: 3 },
  { id: 2, name: "Prof. Robert Nkeng", email: "r.nkeng@example.com", phone: "+237 677889900", specialization: "Physics", availability: "Mornings only", assignedCount: 1 },
  { id: 3, name: "Mrs. Sarah Etonde", email: "s.etonde@example.com", phone: "+237 699001122", specialization: "Literature", availability: "Full-time", assignedCount: 2 },
  { id: 4, name: "Mr. John Tabi", email: "j.tabi@example.com", phone: "+237 670223344", specialization: "Biology", availability: "Afternoons only", assignedCount: 0 },
  { id: 5, name: "Dr. Esther Mbella", email: "e.mbella@example.com", phone: "+237 699334455", specialization: "Chemistry", availability: "Full-time", assignedCount: 4 },
  { id: 6, name: "Prof. Paul Mongo", email: "p.mongo@example.com", phone: "+237 677445566", specialization: "Geography", availability: "Full-time", assignedCount: 2 },
  { id: 7, name: "Mrs. Grace Ekema", email: "g.ekema@example.com", phone: "+237 650556677", specialization: "Economics", availability: "Mornings only", assignedCount: 1 },
  { id: 8, name: "Mr. David Fonyuy", email: "d.fonyuy@example.com", phone: "+237 699667788", specialization: "Computer Science", availability: "Full-time", assignedCount: 0 },
];

// Mock data for exam centers
const mockExamCenters = [
  { id: 1, name: "Douala Government High School", location: "Douala", capacity: 200, requiresInvigilators: 12 },
  { id: 2, name: "Yaoundé Bilingual College", location: "Yaoundé", capacity: 150, requiresInvigilators: 8 },
  { id: 3, name: "Buea Secondary School", location: "Buea", capacity: 120, requiresInvigilators: 6 },
  { id: 4, name: "Bamenda International School", location: "Bamenda", capacity: 100, requiresInvigilators: 5 },
  { id: 5, name: "Limbe Technical College", location: "Limbe", capacity: 80, requiresInvigilators: 4 },
];

// Mock data for exams
const mockExams = [
  { id: 1, subject: "Mathematics", level: "O Level", date: "2025-05-25", startTime: "09:00", endTime: "12:00", center: "Douala Government High School" },
  { id: 2, subject: "Physics", level: "A Level", date: "2025-05-26", startTime: "14:00", endTime: "17:00", center: "Yaoundé Bilingual College" },
  { id: 3, subject: "English Literature", level: "O Level", date: "2025-05-27", startTime: "09:00", endTime: "11:00", center: "Buea Secondary School" },
  { id: 4, subject: "Biology", level: "A Level", date: "2025-05-28", startTime: "09:00", endTime: "12:00", center: "Bamenda International School" },
  { id: 5, subject: "Chemistry", level: "O Level", date: "2025-05-29", startTime: "14:00", endTime: "16:00", center: "Limbe Technical College" },
];

// Mock data for assignments
const mockAssignments = [
  { id: 1, invigilatorId: 1, examId: 1, centerId: 1, role: "Chief Invigilator", status: "Confirmed" },
  { id: 2, invigilatorId: 3, examId: 1, centerId: 1, role: "Assistant", status: "Confirmed" },
  { id: 3, invigilatorId: 5, examId: 2, centerId: 2, role: "Chief Invigilator", status: "Pending" },
  { id: 4, invigilatorId: 2, examId: 3, centerId: 3, role: "Assistant", status: "Confirmed" },
  { id: 5, invigilatorId: 6, examId: 4, centerId: 4, role: "Chief Invigilator", status: "Confirmed" },
];

export default function InvigilatorAssignmentPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCenter, setFilterCenter] = useState('all');
  const [filterExam, setFilterExam] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showBulkAssignDialog, setShowBulkAssignDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedInvigilator, setSelectedInvigilator] = useState<number | null>(null);
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState("Assistant");
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
  const [assignments, setAssignments] = useState(mockAssignments);
  // Using useState but ignoring the setter for read-only data
  const [invigilators] = useState(mockInvigilators);
  const [exams] = useState(mockExams);
  const [centers] = useState(mockExamCenters);
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle assignment creation
  const handleCreateAssignment = () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Only proceed if all required values are selected
      if (selectedInvigilator !== null && selectedExam !== null && selectedCenter !== null) {
        const newAssignment = {
          id: assignments.length + 1,
          invigilatorId: selectedInvigilator,
          examId: selectedExam,
          centerId: selectedCenter,
          role: selectedRole,
          status: "Pending"
        };

        setAssignments([...assignments, newAssignment]);
        setShowAssignDialog(false);
        setIsLoading(false);

        toast({
          title: "Assignment Created",
          description: "Invigilator has been successfully assigned to the examination.",
        });
      } else {
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Please select all required fields.",
          variant: "destructive",
        });
      }
    }, 1000);
  };

  // Function to handle bulk assignment creation
  const handleBulkAssign = () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setShowBulkAssignDialog(false);
      setIsLoading(false);

      toast({
        title: "Bulk Assignment Complete",
        description: "Multiple invigilators have been assigned based on your criteria.",
      });
    }, 1500);
  };

  // Function to handle assignment deletion
  const handleDeleteAssignment = () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const updatedAssignments = assignments.filter(a => a.id !== selectedAssignment);
      setAssignments(updatedAssignments);
      setShowDeleteDialog(false);
      setIsLoading(false);

      toast({
        title: "Assignment Removed",
        description: "The invigilator assignment has been removed successfully.",
      });
    }, 800);
  };

  // Filter assignments based on search and filters
  const filteredAssignments = assignments.filter(assignment => {
    const invigilator = invigilators.find(i => i.id === assignment.invigilatorId);
    const exam = exams.find(e => e.id === assignment.examId);
    const center = centers.find(c => c.id === assignment.centerId);

    const matchesSearch = invigilator &&
      invigilator.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCenter = filterCenter === 'all' ||
      (center && center.name === filterCenter);

    const matchesExam = filterExam === 'all' ||
      (exam && exam.subject === filterExam);

    const matchesStatus = filterStatus === 'all' ||
      assignment.status === filterStatus;

    return matchesSearch && matchesCenter && matchesExam && matchesStatus;
  });

  // Generate report
  const handleGenerateReport = () => {
    toast({
      title: "Report Generated",
      description: "Invigilator assignment report has been generated and is ready for download.",
    });
  };

  // Send notifications to assigned invigilators
  const handleSendNotifications = () => {
    toast({
      title: "Notifications Sent",
      description: "All assigned invigilators have been notified of their examination duties.",
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Invigilator Assignment</h1>
            <p className="text-gray-500 mt-1">Assign invigilators to examination centers and sessions</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleGenerateReport}
              className="flex items-center gap-2"
            >
              <FileText size={16} />
              Generate Report
            </Button>
            <Button
              variant="outline"
              onClick={handleSendNotifications}
              className="flex items-center gap-2"
            >
              <Clipboard size={16} />
              Send Notifications
            </Button>
            <Button onClick={() => setShowAssignDialog(true)} className="flex items-center gap-2">
              <UserPlus size={16} />
              New Assignment
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowBulkAssignDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Bulk Assign
            </Button>
          </div>
        </div>

        <Tabs defaultValue="assignments" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="invigilators">Available Invigilators</TabsTrigger>
          </TabsList>

          {/* Assignments View Tab */}
          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Examination Assignments</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="text"
                        placeholder="Search invigilators..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Filter size={16} />
                          Filters
                          <ChevronDown size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <div className="p-2">
                          <Label className="text-xs font-semibold">Exam Center</Label>
                          <Select value={filterCenter} onValueChange={setFilterCenter}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="All Centers" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Centers</SelectItem>
                              {centers.map(center => (
                                <SelectItem key={center.id} value={center.name}>
                                  {center.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="p-2">
                          <Label className="text-xs font-semibold">Exam Subject</Label>
                          <Select value={filterExam} onValueChange={setFilterExam}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="All Subjects" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Subjects</SelectItem>
                              {exams.map(exam => (
                                <SelectItem key={exam.id} value={exam.subject}>
                                  {exam.subject}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="p-2">
                          <Label className="text-xs font-semibold">Status</Label>
                          <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              <SelectItem value="Confirmed">Confirmed</SelectItem>
                              <SelectItem value="Pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" onClick={() => {
                      setSearchTerm('');
                      setFilterCenter('all');
                      setFilterExam('all');
                      setFilterStatus('all');
                    }} className="flex items-center gap-2">
                      <RefreshCw size={16} />
                      Reset
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Manage invigilator assignments for all examination sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invigilator</TableHead>
                      <TableHead>Examination</TableHead>
                      <TableHead>Center</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                          No assignments found matching your criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAssignments.map((assignment) => {
                        const invigilator = invigilators.find(i => i.id === assignment.invigilatorId);
                        const exam = exams.find(e => e.id === assignment.examId);
                        const center = centers.find(c => c.id === assignment.centerId);

                        return (
                          <TableRow key={assignment.id}>
                            <TableCell>
                              <div className="font-medium">{invigilator?.name}</div>
                              <div className="text-sm text-gray-500">{invigilator?.specialization}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{exam?.subject}</div>
                              <div className="text-sm text-gray-500">{exam?.level}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{center?.name}</div>
                              <div className="text-sm text-gray-500">{center?.location}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{exam?.date}</div>
                              <div className="text-sm text-gray-500">{exam?.startTime} - {exam?.endTime}</div>
                            </TableCell>
                            <TableCell>
                              {assignment.role === "Chief Invigilator" ? (
                                <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                  Chief Invigilator
                                </Badge>
                              ) : (
                                <Badge variant="outline">Assistant</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {assignment.status === "Confirmed" ? (
                                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                                  Confirmed
                                </Badge>
                              ) : (
                                <Badge variant="default" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {
                                    // View assignment details (would navigate to details page in real app)
                                    toast({
                                      title: "Viewing Assignment",
                                      description: `Assignment details for ${invigilator?.name}`,
                                    });
                                  }}>
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    // Update assignment status
                                    const updatedAssignments = assignments.map(a =>
                                      a.id === assignment.id
                                        ? {...a, status: a.status === "Confirmed" ? "Pending" : "Confirmed"}
                                        : a
                                    );
                                    setAssignments(updatedAssignments);
                                    toast({
                                      title: "Status Updated",
                                      description: `Assignment status changed to ${assignment.status === "Confirmed" ? "Pending" : "Confirmed"}`,
                                    });
                                  }}>
                                    Toggle Status
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelectedAssignment(assignment.id);
                                      setShowDeleteDialog(true);
                                    }}
                                  >
                                    Remove Assignment
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500">
                  Showing {filteredAssignments.length} of {assignments.length} assignments
                </div>
                <Button variant="outline" onClick={handleGenerateReport} className="flex items-center gap-2">
                  <Download size={16} />
                  Export to CSV
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Invigilators View Tab */}
          <TabsContent value="invigilators" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Available Invigilators</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Search invigilators..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <CardDescription>
                  View and select invigilators for examination assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Current Assignments</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invigilators
                      .filter(inv => inv.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((invigilator) => (
                        <TableRow key={invigilator.id}>
                          <TableCell>
                            <div className="font-medium">{invigilator.name}</div>
                          </TableCell>
                          <TableCell>
                            <div>{invigilator.email}</div>
                            <div className="text-sm text-gray-500">{invigilator.phone}</div>
                          </TableCell>
                          <TableCell>{invigilator.specialization}</TableCell>
                          <TableCell>{invigilator.availability}</TableCell>
                          <TableCell>
                            <Badge variant={invigilator.assignedCount > 0 ? "outline" : "secondary"}>
                              {invigilator.assignedCount} {invigilator.assignedCount === 1 ? "assignment" : "assignments"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setSelectedInvigilator(invigilator.id);
                                setShowAssignDialog(true);
                              }}
                            >
                              Assign
                            </Button>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Invigilator Assignment</DialogTitle>
            <DialogDescription>
              Assign an invigilator to an examination session and center
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="invigilator">Invigilator</Label>
              <Select
                value={selectedInvigilator !== null ? selectedInvigilator.toString() : ""}
                onValueChange={(value) => setSelectedInvigilator(value ? parseInt(value) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an invigilator" />
                </SelectTrigger>
                <SelectContent>
                  {invigilators.map(invigilator => (
                    <SelectItem key={invigilator.id} value={invigilator.id.toString()}>
                      {invigilator.name} - {invigilator.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="exam">Examination</Label>
              <Select
                value={selectedExam !== null ? selectedExam.toString() : ""}
                onValueChange={(value) => setSelectedExam(value ? parseInt(value) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an examination" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map(exam => (
                    <SelectItem key={exam.id} value={exam.id.toString()}>
                      {exam.subject} ({exam.level}) - {exam.date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="center">Examination Center</Label>
              <Select
                value={selectedCenter !== null ? selectedCenter.toString() : ""}
                onValueChange={(value) => setSelectedCenter(value ? parseInt(value) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a center" />
                </SelectTrigger>
                <SelectContent>
                  {centers.map(center => (
                    <SelectItem key={center.id} value={center.id.toString()}>
                      {center.name} - {center.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chief Invigilator">Chief Invigilator</SelectItem>
                  <SelectItem value="Assistant">Assistant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
            <Button
              onClick={handleCreateAssignment}
              disabled={!selectedInvigilator || !selectedExam || !selectedCenter || isLoading}
            >
              {isLoading ? "Creating..." : "Create Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Assignment Dialog */}
      <Dialog open={showBulkAssignDialog} onOpenChange={setShowBulkAssignDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Bulk Invigilator Assignment</DialogTitle>
            <DialogDescription>
              Assign multiple invigilators to examination sessions based on criteria
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Examination Period</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Input type="date" placeholder="Start Date" />
                  </div>
                  <div className="relative">
                    <Input type="date" placeholder="End Date" />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="center">Examination Center</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a center" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Centers</SelectItem>
                    {centers.map(center => (
                      <SelectItem key={center.id} value={center.id.toString()}>
                        {center.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Assignment Criteria</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="availability" />
                  <Label htmlFor="availability">Consider availability</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="specialization" />
                  <Label htmlFor="specialization">Match subject specialization</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="balance-load" />
                  <Label htmlFor="balance-load">Balance assignment load</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="minimize-travel" />
                  <Label htmlFor="minimize-travel">Minimize travel distance</Label>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Assignment Settings</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="chief-per-center">Chief Invigilators per Center</Label>
                  <Select defaultValue="1">
                    <SelectTrigger>
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Chief Invigilator</SelectItem>
                      <SelectItem value="2">2 Chief Invigilators</SelectItem>
                      <SelectItem value="3">3 Chief Invigilators</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="assistants-ratio">Assistant to Student Ratio</Label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue placeholder="Select ratio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">1:20 (One per 20 students)</SelectItem>
                      <SelectItem value="25">1:25 (One per 25 students)</SelectItem>
                      <SelectItem value="30">1:30 (One per 30 students)</SelectItem>
                      <SelectItem value="40">1:40 (One per 40 students)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkAssignDialog(false)}>Cancel</Button>
            <Button onClick={handleBulkAssign}>
              {isLoading ? "Processing..." : "Assign Invigilators"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Assignment Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this invigilator assignment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAssignment} className="bg-red-600 hover:bg-red-700">
              {isLoading ? "Removing..." : "Remove Assignment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}