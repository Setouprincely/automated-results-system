"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, FileText, Lock, Eye, Trash, CheckCircle, Upload, History, AlertTriangle, FileIcon, Search } from 'lucide-react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

// Mock data for examination materials
interface ExamMaterial {
  id: string;
  title: string;
  subject: string;
  level: string;
  examDate: string;
  uploadedBy: string;
  uploadDate: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'distributed';
  securityLevel: 'high' | 'medium' | 'low';
  fileType: 'question_paper' | 'answer_scheme' | 'marking_guide' | 'other';
  fileSize: string;
  accessCount: number;
  lastAccessed?: string;
  encryptionStatus: boolean;
}

const mockExamMaterials: ExamMaterial[] = [
  {
    id: 'QP001',
    title: 'Mathematics Paper 1',
    subject: 'Mathematics',
    level: 'O Level',
    examDate: '2025-06-15',
    uploadedBy: 'Dr. Johnson Akwa',
    uploadDate: '2025-03-10',
    status: 'approved',
    securityLevel: 'high',
    fileType: 'question_paper',
    fileSize: '2.4 MB',
    accessCount: 3,
    lastAccessed: '2025-03-18',
    encryptionStatus: true
  },
  {
    id: 'QP002',
    title: 'Physics Paper 2',
    subject: 'Physics',
    level: 'A Level',
    examDate: '2025-06-18',
    uploadedBy: 'Prof. Michelle Tabi',
    uploadDate: '2025-03-12',
    status: 'pending_approval',
    securityLevel: 'high',
    fileType: 'question_paper',
    fileSize: '3.1 MB',
    accessCount: 1,
    lastAccessed: '2025-03-15',
    encryptionStatus: true
  },
  {
    id: 'AS001',
    title: 'Chemistry Answer Scheme',
    subject: 'Chemistry',
    level: 'A Level',
    examDate: '2025-06-20',
    uploadedBy: 'Dr. Francis Etoh',
    uploadDate: '2025-03-14',
    status: 'draft',
    securityLevel: 'medium',
    fileType: 'answer_scheme',
    fileSize: '1.8 MB',
    accessCount: 0,
    encryptionStatus: false
  },
  {
    id: 'MG001',
    title: 'Literature in English Marking Guide',
    subject: 'Literature in English',
    level: 'O Level',
    examDate: '2025-06-22',
    uploadedBy: 'Mrs. Ngono Alice',
    uploadDate: '2025-03-16',
    status: 'approved',
    securityLevel: 'medium',
    fileType: 'marking_guide',
    fileSize: '4.2 MB',
    accessCount: 2,
    lastAccessed: '2025-03-19',
    encryptionStatus: true
  },
  {
    id: 'QP003',
    title: 'French Language Paper 1',
    subject: 'French',
    level: 'O Level',
    examDate: '2025-06-25',
    uploadedBy: 'M. Pierre Ndongo',
    uploadDate: '2025-03-18',
    status: 'distributed',
    securityLevel: 'high',
    fileType: 'question_paper',
    fileSize: '2.9 MB',
    accessCount: 6,
    lastAccessed: '2025-05-20',
    encryptionStatus: true
  }
];

// Mock data for examination subjects
const subjects = [
  'Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology',
  'Geography', 'History', 'Literature in English', 'French', 'Computer Science',
  'Economics', 'Commerce', 'Religious Studies', 'Fine Arts', 'Physical Education'
];

// Mock data for access logs
interface AccessLog {
  id: string;
  materialId: string;
  accessedBy: string;
  accessTime: string;
  ipAddress: string;
  action: string;
  device: string;
}

const mockAccessLogs: AccessLog[] = [
  {
    id: 'LOG001',
    materialId: 'QP001',
    accessedBy: 'Dr. Johnson Akwa',
    accessTime: '2025-03-18 09:45:23',
    ipAddress: '192.168.1.45',
    action: 'viewed',
    device: 'Windows Desktop'
  },
  {
    id: 'LOG002',
    materialId: 'QP001',
    accessedBy: 'Prof. Etienne Mbarga',
    accessTime: '2025-03-17 14:22:10',
    ipAddress: '192.168.1.78',
    action: 'printed',
    device: 'MacOS Desktop'
  },
  {
    id: 'LOG003',
    materialId: 'MG001',
    accessedBy: 'Mrs. Ngono Alice',
    accessTime: '2025-03-19 11:05:17',
    ipAddress: '192.168.1.92',
    action: 'downloaded',
    device: 'Windows Desktop'
  }
];

export default function MaterialsManagementPage() {
  const [materials, setMaterials] = useState<ExamMaterial[]>(mockExamMaterials);
  const [filteredMaterials, setFilteredMaterials] = useState<ExamMaterial[]>(mockExamMaterials);
  const [accessLogs] = useState<AccessLog[]>(mockAccessLogs);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<ExamMaterial | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [selectedMaterialLogs, setSelectedMaterialLogs] = useState<AccessLog[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialSubject, setMaterialSubject] = useState('');
  const [materialLevel, setMaterialLevel] = useState('');
  const [materialSecurityLevel, setMaterialSecurityLevel] = useState('');
  const [materialFileType, setMaterialFileType] = useState('');

  useEffect(() => {
    // Apply filters
    let filtered = materials;

    if (searchText) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchText.toLowerCase()) ||
        material.subject.toLowerCase().includes(searchText.toLowerCase()) ||
        material.id.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(material => material.status === filterStatus);
    }

    if (filterSubject !== 'all') {
      filtered = filtered.filter(material => material.subject === filterSubject);
    }

    if (filterLevel !== 'all') {
      filtered = filtered.filter(material => material.level === filterLevel);
    }

    setFilteredMaterials(filtered);
  }, [searchText, filterStatus, filterSubject, filterLevel, materials]);

  const showDetailsDialog = (material: ExamMaterial) => {
    setCurrentMaterial(material);
    setDetailsDialogOpen(true);
  };

  const showLogsDialog = (material: ExamMaterial) => {
    setCurrentMaterial(material);
    const logs = accessLogs.filter(log => log.materialId === material.id);
    setSelectedMaterialLogs(logs);
    setLogsDialogOpen(true);
  };

  const simulateUpload = () => {
    if (!materialTitle || !materialSubject || !materialLevel || !materialSecurityLevel || !materialFileType || !date) {
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsProcessing(false);
            // Add new material to the list
            const newMaterial: ExamMaterial = {
              id: `QP${Math.floor(1000 + Math.random() * 9000)}`,
              title: materialTitle,
              subject: materialSubject,
              level: materialLevel,
              examDate: format(date, 'yyyy-MM-dd'),
              uploadedBy: 'Current User',
              uploadDate: format(new Date(), 'yyyy-MM-dd'),
              status: 'draft',
              securityLevel: materialSecurityLevel as 'high' | 'medium' | 'low',
              fileType: materialFileType as 'question_paper' | 'answer_scheme' | 'marking_guide' | 'other',
              fileSize: '3.2 MB',
              accessCount: 0,
              encryptionStatus: true
            };
            setMaterials([...materials, newMaterial]);
            setUploadDialogOpen(false);

            // Reset form
            setMaterialTitle('');
            setMaterialSubject('');
            setMaterialLevel('');
            setMaterialSecurityLevel('');
            setMaterialFileType('');
            setDate(undefined);
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  const handleDeleteMaterial = (id: string) => {
    const updatedMaterials = materials.filter(material => material.id !== id);
    setMaterials(updatedMaterials);
  };

  const handleApprove = (id: string) => {
    const updatedMaterials = materials.map(material => {
      if (material.id === id) {
        return { ...material, status: 'approved' as const };
      }
      return material;
    });
    setMaterials(updatedMaterials);
  };

  const handleDistribute = (id: string) => {
    setWarningDialogOpen(true);
    setCurrentMaterial(materials.find(m => m.id === id) || null);
  };

  const confirmDistribution = () => {
    if (currentMaterial) {
      const updatedMaterials = materials.map(material => {
        if (material.id === currentMaterial.id) {
          return { ...material, status: 'distributed' as const };
        }
        return material;
      });
      setMaterials(updatedMaterials);
      setWarningDialogOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'pending_approval':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'distributed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Distributed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getSecurityLevelBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800">High Security</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">Medium Security</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Low Security</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'question_paper':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'answer_scheme':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'marking_guide':
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <FileIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  // Table columns are now defined directly in the JSX

  // Access log columns are now defined directly in the table

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Examination Materials Management</h1>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload New Material
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Examination Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search materials..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="distributed">Distributed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="O Level">O Level</SelectItem>
                  <SelectItem value="A Level">A Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert className="mb-4">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                All examination materials are encrypted and secured with multi-factor authentication.
                Access to these materials is strictly monitored and logged.
              </AlertDescription>
            </Alert>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Exam Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Security</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell>{material.id}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      {getFileTypeIcon(material.fileType)}
                      <span className="font-medium">{material.title}</span>
                    </TableCell>
                    <TableCell>{material.subject}</TableCell>
                    <TableCell>{material.level}</TableCell>
                    <TableCell>{material.examDate}</TableCell>
                    <TableCell>{getStatusBadge(material.status)}</TableCell>
                    <TableCell>{getSecurityLevelBadge(material.securityLevel)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => showDetailsDialog(material)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => showLogsDialog(material)}>
                          <History className="h-4 w-4" />
                        </Button>
                        {material.status === 'pending_approval' && (
                          <Button variant="outline" size="icon" onClick={() => handleApprove(material.id)}>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                        {material.status === 'approved' && (
                          <Button variant="outline" size="icon" onClick={() => handleDistribute(material.id)}>
                            <Lock className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                        <Button variant="outline" size="icon" onClick={() => handleDeleteMaterial(material.id)}>
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Examination Material Details</DialogTitle>
              <DialogDescription>
                View and edit details of the examination material.
              </DialogDescription>
            </DialogHeader>
            {currentMaterial && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">ID:</span>
                  <span className="col-span-3">{currentMaterial.id}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Title:</span>
                  <span className="col-span-3">{currentMaterial.title}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Subject:</span>
                  <span className="col-span-3">{currentMaterial.subject}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Level:</span>
                  <span className="col-span-3">{currentMaterial.level}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Exam Date:</span>
                  <span className="col-span-3">{currentMaterial.examDate}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Status:</span>
                  <span className="col-span-3">{getStatusBadge(currentMaterial.status)}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Security Level:</span>
                  <span className="col-span-3">{getSecurityLevelBadge(currentMaterial.securityLevel)}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">File Type:</span>
                  <span className="col-span-3 flex items-center gap-2">
                    {getFileTypeIcon(currentMaterial.fileType)}
                    {currentMaterial.fileType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Uploaded By:</span>
                  <span className="col-span-3">{currentMaterial.uploadedBy}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Upload Date:</span>
                  <span className="col-span-3">{currentMaterial.uploadDate}</span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Upload New Examination Material</DialogTitle>
              <DialogDescription>
                Fill in the details and upload the examination material file.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-medium">Title:</span>
                <Input
                  className="col-span-3"
                  placeholder="e.g. Chemistry Paper 2"
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-medium">Subject:</span>
                <div className="col-span-3">
                  <Select
                    value={materialSubject}
                    onValueChange={setMaterialSubject}
                  >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-medium">Level:</span>
                <div className="col-span-3">
                  <Select
                    value={materialLevel}
                    onValueChange={setMaterialLevel}
                  >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="O Level">O Level</SelectItem>
                    <SelectItem value="A Level">A Level</SelectItem>
                  </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-medium">Exam Date:</span>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Select date</span>}
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
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-medium">Security Level:</span>
                <div className="col-span-3">
                  <Select
                    value={materialSecurityLevel}
                    onValueChange={setMaterialSecurityLevel}
                  >
                  <SelectTrigger>
                    <SelectValue placeholder="Select security level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-medium">File Type:</span>
                <div className="col-span-3">
                  <Select
                    value={materialFileType}
                    onValueChange={setMaterialFileType}
                  >
                  <SelectTrigger>
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="question_paper">Question Paper</SelectItem>
                    <SelectItem value="answer_scheme">Answer Scheme</SelectItem>
                    <SelectItem value="marking_guide">Marking Guide</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-medium">File:</span>
                <div className="col-span-3">
                  <Button variant="outline" className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Select File
                  </Button>
                </div>
              </div>

              <Alert className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Files will be automatically encrypted upon upload. Access to these materials will be restricted based on the security level specified.
                </AlertDescription>
              </Alert>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading and encrypting file...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)} disabled={isProcessing}>Cancel</Button>
              <Button onClick={simulateUpload} disabled={isProcessing || !materialTitle || !materialSubject || !materialLevel || !materialSecurityLevel || !materialFileType || !date}>
                {isProcessing ? 'Processing...' : 'Upload and Encrypt'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Logs Dialog */}
        <Dialog open={logsDialogOpen} onOpenChange={setLogsDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Material Access Logs</DialogTitle>
              <DialogDescription>
                {currentMaterial && `Access history for ${currentMaterial.title}`}
              </DialogDescription>
            </DialogHeader>
            {currentMaterial && (
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">{currentMaterial.subject}</Badge>
                <Badge variant="outline" className="bg-purple-100 text-purple-800">{currentMaterial.level}</Badge>
                {getStatusBadge(currentMaterial.status)}
              </div>
            )}

            {selectedMaterialLogs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Access Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Device</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedMaterialLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.accessTime}</TableCell>
                      <TableCell>{log.accessedBy}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          log.action === 'viewed' ? 'bg-blue-100 text-blue-800' :
                          log.action === 'printed' ? 'bg-orange-100 text-orange-800' :
                          'bg-purple-100 text-purple-800'
                        }>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.ipAddress}</TableCell>
                      <TableCell>{log.device}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Alert>
                <AlertDescription>
                  No access logs found for this material.
                </AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setLogsDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Warning Dialog */}
        <Dialog open={warningDialogOpen} onOpenChange={setWarningDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Security Warning</DialogTitle>
              <DialogDescription>
                Distributing this material will make it accessible to authorized examination centers.
              </DialogDescription>
            </DialogHeader>
            <Alert className="border-yellow-500 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                This action cannot be undone. Are you sure you want to proceed?
              </AlertDescription>
            </Alert>

            {currentMaterial && (
              <div className="grid gap-2 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Material:</span>
                  <span className="col-span-3">{currentMaterial.title}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Subject:</span>
                  <span className="col-span-3">{currentMaterial.subject}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Level:</span>
                  <span className="col-span-3">{currentMaterial.level}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Exam Date:</span>
                  <span className="col-span-3">{currentMaterial.examDate}</span>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setWarningDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDistribution}>Confirm Distribution</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}