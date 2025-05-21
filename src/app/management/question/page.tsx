"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FilePlus,
  FileText,
  Lock,
  Eye,
  Download,
  Upload,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  ArrowUpDown,
  PlusCircle,
  ChevronDown
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Types for our data models
type QuestionPaper = {
  id: string;
  title: string;
  subject: string;
  level: 'O Level' | 'A Level';
  examYear: number;
  language: 'English' | 'French' | 'Bilingual';
  status: 'Draft' | 'Review' | 'Approved' | 'Published' | 'Archived';
  version: number;
  lastModified: string;
  modifiedBy: string;
  securityLevel: 'Standard' | 'Restricted' | 'Highly Restricted';
  approvers: string[];
  approvalStatus: {
    chiefExaminer: boolean;
    boardOfficer: boolean;
    securityOfficer: boolean;
  };
};

// Mock Data
const MOCK_PAPERS: QuestionPaper[] = [
  {
    id: 'QP001',
    title: 'Mathematics Paper 1',
    subject: 'Mathematics',
    level: 'O Level',
    examYear: 2025,
    language: 'English',
    status: 'Approved',
    version: 3,
    lastModified: '2025-03-15T10:30:00',
    modifiedBy: 'Dr. Ngwa Thomas',
    securityLevel: 'Highly Restricted',
    approvers: ['Dr. Ngwa Thomas', 'Prof. Ayuk Mary', 'Mr. Tabe Francis'],
    approvalStatus: {
      chiefExaminer: true,
      boardOfficer: true,
      securityOfficer: true
    }
  },
  {
    id: 'QP002',
    title: 'Chemistry Paper 2',
    subject: 'Chemistry',
    level: 'A Level',
    examYear: 2025,
    language: 'English',
    status: 'Review',
    version: 2,
    lastModified: '2025-03-10T14:15:00',
    modifiedBy: 'Prof. Ayuk Mary',
    securityLevel: 'Restricted',
    approvers: ['Dr. Ngwa Thomas'],
    approvalStatus: {
      chiefExaminer: true,
      boardOfficer: false,
      securityOfficer: false
    }
  },
  {
    id: 'QP003',
    title: 'Histoire Paper 1',
    subject: 'History',
    level: 'O Level',
    examYear: 2025,
    language: 'French',
    status: 'Draft',
    version: 1,
    lastModified: '2025-03-05T09:45:00',
    modifiedBy: 'Mr. Ndongo Paul',
    securityLevel: 'Standard',
    approvers: [],
    approvalStatus: {
      chiefExaminer: false,
      boardOfficer: false,
      securityOfficer: false
    }
  },
  {
    id: 'QP004',
    title: 'Physics Practical',
    subject: 'Physics',
    level: 'A Level',
    examYear: 2025,
    language: 'Bilingual',
    status: 'Published',
    version: 4,
    lastModified: '2025-03-12T11:20:00',
    modifiedBy: 'Dr. Ebai Rose',
    securityLevel: 'Highly Restricted',
    approvers: ['Dr. Ebai Rose', 'Prof. Ayuk Mary', 'Mr. Tabe Francis'],
    approvalStatus: {
      chiefExaminer: true,
      boardOfficer: true,
      securityOfficer: true
    }
  },
  {
    id: 'QP005',
    title: 'Literature in English',
    subject: 'Literature',
    level: 'O Level',
    examYear: 2025,
    language: 'English',
    status: 'Archived',
    version: 5,
    lastModified: '2025-02-28T16:30:00',
    modifiedBy: 'Ms. Eposi Jane',
    securityLevel: 'Standard',
    approvers: ['Ms. Eposi Jane', 'Prof. Ayuk Mary', 'Mr. Tabe Francis'],
    approvalStatus: {
      chiefExaminer: true,
      boardOfficer: true,
      securityOfficer: true
    }
  }
];

// Filter options
const SUBJECTS = [
  'Mathematics', 'Chemistry', 'Physics', 'Biology',
  'History', 'Literature', 'Geography', 'Economics',
  'Computer Science', 'French', 'English'
];

const LEVELS = ['O Level', 'A Level'];
const LANGUAGES = ['English', 'French', 'Bilingual'];
const STATUSES = ['Draft', 'Review', 'Approved', 'Published', 'Archived'];
const YEARS = [2025, 2024, 2023, 2022];

export default function QuestionPaperManagement() {
  // State
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [filteredPapers, setFilteredPapers] = useState<QuestionPaper[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    subject: 'all',
    level: 'all',
    language: 'all',
    status: 'all',
    year: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedPaper, setSelectedPaper] = useState<QuestionPaper | null>(null);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [isSecurityModalOpen, setSecurityModalOpen] = useState(false);

  // Form state for upload modal
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadLevel, setUploadLevel] = useState('');
  const [uploadLanguage, setUploadLanguage] = useState('');
  const [uploadYear, setUploadYear] = useState('');
  const [uploadSecurityLevel, setUploadSecurityLevel] = useState('');

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    logAllAccess: true,
    watermark: false,
    preventDownload: false,
    requireApproval: false
  });

  // Load papers on component mount
  useEffect(() => {
    // In a real application, this would be an API call
    setPapers(MOCK_PAPERS);
    setFilteredPapers(MOCK_PAPERS);
  }, []);

  // Filter papers based on search term and filters
  useEffect(() => {
    let result = [...papers];

    // Apply search term
    if (searchTerm) {
      result = result.filter(paper =>
        paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.subject && filters.subject !== 'all') {
      result = result.filter(paper => paper.subject === filters.subject);
    }
    if (filters.level && filters.level !== 'all') {
      result = result.filter(paper => paper.level === filters.level);
    }
    if (filters.language && filters.language !== 'all') {
      result = result.filter(paper => paper.language === filters.language);
    }
    if (filters.status && filters.status !== 'all') {
      result = result.filter(paper => paper.status === filters.status);
    }
    if (filters.year) {
      result = result.filter(paper => paper.examYear === filters.year);
    }

    // Filter by tab
    if (activeTab !== 'all') {
      result = result.filter(paper => paper.status.toLowerCase() === activeTab);
    }

    setFilteredPapers(result);
  }, [searchTerm, filters, papers, activeTab]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      subject: 'all',
      level: 'all',
      language: 'all',
      status: 'all',
      year: 0
    });
    setSearchTerm('');
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Draft':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'Review':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Review</Badge>;
      case 'Approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'Published':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Published</Badge>;
      case 'Archived':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Archived</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  // Get security level badge
  const getSecurityBadge = (level: string) => {
    switch (level) {
      case 'Standard':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Standard</Badge>;
      case 'Restricted':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">Restricted</Badge>;
      case 'Highly Restricted':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Highly Restricted</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Unknown</Badge>;
    }
  };

  // Handle row click to view paper details
  const handleRowClick = (paper: QuestionPaper) => {
    setSelectedPaper(paper);
    setViewModalOpen(true);
  };

  // View security settings modal
  const handleSecurityClick = (paper: QuestionPaper, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPaper(paper);
    setSecurityModalOpen(true);

    // Set initial security settings based on paper's security level
    setSecuritySettings({
      logAllAccess: true,
      watermark: paper.securityLevel !== 'Standard',
      preventDownload: paper.securityLevel === 'Highly Restricted',
      requireApproval: paper.securityLevel !== 'Standard'
    });
  };

  // Handle creating a new paper
  const handleCreatePaper = () => {
    // Validate form
    if (!uploadTitle || !uploadSubject || !uploadLevel || !uploadLanguage || !uploadYear || !uploadSecurityLevel) {
      // Show validation error
      return;
    }

    // Create new paper
    const newPaper: QuestionPaper = {
      id: `QP${Math.floor(1000 + Math.random() * 9000)}`,
      title: uploadTitle,
      subject: uploadSubject,
      level: uploadLevel as 'O Level' | 'A Level',
      examYear: parseInt(uploadYear),
      language: uploadLanguage as 'English' | 'French' | 'Bilingual',
      status: 'Draft',
      version: 1,
      lastModified: new Date().toISOString(),
      modifiedBy: 'Current User',
      securityLevel: uploadSecurityLevel as 'Standard' | 'Restricted' | 'Highly Restricted',
      approvers: [],
      approvalStatus: {
        chiefExaminer: false,
        boardOfficer: false,
        securityOfficer: false
      }
    };

    // Add to papers
    setPapers([...papers, newPaper]);

    // Reset form and close modal
    setUploadTitle('');
    setUploadSubject('');
    setUploadLevel('');
    setUploadLanguage('');
    setUploadYear('');
    setUploadSecurityLevel('');
    setUploadModalOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Question Paper Management</h1>
          <Button onClick={() => setUploadModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Paper
          </Button>
        </div>

        {/* Alert Banner for Highly Restricted Papers */}
        {filteredPapers.some(p => p.securityLevel === 'Highly Restricted') && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Notice:</strong> You are managing highly restricted examination content.
              All actions are logged and audited for security compliance.
            </AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <div className="mb-6 space-y-2">
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                type="text"
                placeholder="Search question papers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <Card className="mt-2">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div>
                    <Label className="mb-2">Subject</Label>
                    <Select
                      value={filters.subject}
                      onValueChange={(value) => setFilters({...filters, subject: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {SUBJECTS.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2">Level</Label>
                    <Select
                      value={filters.level}
                      onValueChange={(value) => setFilters({...filters, level: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        {LEVELS.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2">Language</Label>
                    <Select
                      value={filters.language}
                      onValueChange={(value) => setFilters({...filters, language: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Languages" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Languages</SelectItem>
                        {LANGUAGES.map(language => (
                          <SelectItem key={language} value={language}>{language}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2">Status</Label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) => setFilters({...filters, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {STATUSES.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2">Exam Year</Label>
                    <Select
                      value={filters.year.toString()}
                      onValueChange={(value) => setFilters({...filters, year: parseInt(value) || 0})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">All Years</SelectItem>
                        {YEARS.map(year => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="ghost" onClick={handleResetFilters}>Reset Filters</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Status Tabs */}
        <Tabs className="mb-6" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Papers</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="review">In Review</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Question Papers Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Security</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPapers.length > 0 ? (
                  filteredPapers.map((paper) => (
                    <TableRow
                      key={paper.id}
                      className="cursor-pointer"
                      onClick={() => handleRowClick(paper)}
                    >
                      <TableCell className="font-medium">{paper.id}</TableCell>
                      <TableCell>{paper.title}</TableCell>
                      <TableCell>{paper.subject}</TableCell>
                      <TableCell>{paper.level}</TableCell>
                      <TableCell>{paper.language}</TableCell>
                      <TableCell>
                        {getStatusBadge(paper.status)}
                      </TableCell>
                      <TableCell>
                        <div
                          className="cursor-pointer"
                          onClick={(e) => handleSecurityClick(paper, e)}
                        >
                          {getSecurityBadge(paper.securityLevel)}
                        </div>
                      </TableCell>
                      <TableCell>v{paper.version}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                      No question papers found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Upload Dialog */}
        <Dialog open={isUploadModalOpen} onOpenChange={setUploadModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Question Paper</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new question paper
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter paper title"
                  className="col-span-3"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">Subject</Label>
                <div className="col-span-3">
                  <Select value={uploadSubject} onValueChange={setUploadSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="level" className="text-right">Level</Label>
                <div className="col-span-3">
                  <Select value={uploadLevel} onValueChange={setUploadLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="language" className="text-right">Language</Label>
                <div className="col-span-3">
                  <Select value={uploadLanguage} onValueChange={setUploadLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(language => (
                        <SelectItem key={language} value={language}>{language}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="year" className="text-right">Exam Year</Label>
                <div className="col-span-3">
                  <Select value={uploadYear} onValueChange={setUploadYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="security" className="text-right">Security Level</Label>
                <div className="col-span-3">
                  <Select value={uploadSecurityLevel} onValueChange={setUploadSecurityLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Security Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Restricted">Restricted</SelectItem>
                      <SelectItem value="Highly Restricted">Highly Restricted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">Upload File</Label>
                <div className="col-span-3">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-1 text-sm text-gray-500">
                      Drag and drop your file here, or click to browse
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Supported formats: PDF, DOCX (max 20MB)
                    </p>
                    <Button variant="outline" className="mt-2">
                      Browse Files
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePaper} disabled={!uploadTitle || !uploadSubject || !uploadLevel || !uploadLanguage || !uploadYear || !uploadSecurityLevel}>
                Create Question Paper
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        {selectedPaper && (
          <Dialog open={isViewModalOpen} onOpenChange={setViewModalOpen}>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>{selectedPaper.title}</DialogTitle>
                <DialogDescription>
                  Question paper details and management
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Paper ID</h3>
                    <p className="font-medium">{selectedPaper.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Subject</h3>
                    <p className="font-medium">{selectedPaper.subject}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Level</h3>
                    <p className="font-medium">{selectedPaper.level}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Language</h3>
                    <p className="font-medium">{selectedPaper.language}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Exam Year</h3>
                    <p className="font-medium">{selectedPaper.examYear}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <div className="mt-1">{getStatusBadge(selectedPaper.status)}</div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Security Level</h3>
                    <div className="mt-1">{getSecurityBadge(selectedPaper.securityLevel)}</div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Version</h3>
                    <p className="font-medium">v{selectedPaper.version}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Last Modified</h3>
                    <p className="font-medium">{new Date(selectedPaper.lastModified).toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Modified By</h3>
                    <p className="font-medium">{selectedPaper.modifiedBy}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">Approval Status</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded-full ${selectedPaper.approvalStatus.chiefExaminer ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {selectedPaper.approvalStatus.chiefExaminer ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <span className="text-sm">Chief Examiner</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded-full ${selectedPaper.approvalStatus.boardOfficer ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {selectedPaper.approvalStatus.boardOfficer ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <span className="text-sm">Board Officer</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded-full ${selectedPaper.approvalStatus.securityOfficer ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {selectedPaper.approvalStatus.securityOfficer ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <span className="text-sm">Security Officer</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">Document Preview</h3>
                  <div className="bg-gray-100 border rounded-lg p-4 h-64 flex items-center justify-center">
                    <FileText className="h-12 w-12 text-gray-400" />
                    <p className="ml-2 text-gray-500">Preview not available in secure mode</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                  Close
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                {selectedPaper.status === 'Draft' && (
                  <Button>
                    Edit Paper
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Security Settings Dialog */}
        {selectedPaper && (
          <Dialog open={isSecurityModalOpen} onOpenChange={setSecurityModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Security Settings</DialogTitle>
                <DialogDescription>
                  Configure security settings for this question paper
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Security Warning:</strong> Changing security settings will be logged and may require additional approval.
                  </AlertDescription>
                </Alert>

                <div>
                  <h3 className="text-sm font-medium mb-2">Current Security Level</h3>
                  <div className="mb-1">{getSecurityBadge(selectedPaper.securityLevel)}</div>
                  <p className="text-sm text-muted-foreground">
                    {selectedPaper.securityLevel === 'Standard' && 'Regular access controls apply. Can be accessed by authorized personnel.'}
                    {selectedPaper.securityLevel === 'Restricted' && 'Limited access. Two-factor authentication required for all operations.'}
                    {selectedPaper.securityLevel === 'Highly Restricted' && 'Maximum security. All actions logged and requires multi-level approval.'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="security-level" className="text-sm font-medium mb-2">Update Security Level</Label>
                  <Select defaultValue={selectedPaper.securityLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Restricted">Restricted</SelectItem>
                      <SelectItem value="Highly Restricted">Highly Restricted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Access Control</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="log-all-access"
                        checked={securitySettings.logAllAccess}
                        onCheckedChange={(checked) =>
                          setSecuritySettings({...securitySettings, logAllAccess: !!checked})
                        }
                      />
                      <Label htmlFor="log-all-access">Log all access attempts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="watermark"
                        checked={securitySettings.watermark}
                        onCheckedChange={(checked) =>
                          setSecuritySettings({...securitySettings, watermark: !!checked})
                        }
                      />
                      <Label htmlFor="watermark">Add watermark with user ID on all document views</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="prevent-download"
                        checked={securitySettings.preventDownload}
                        onCheckedChange={(checked) =>
                          setSecuritySettings({...securitySettings, preventDownload: !!checked})
                        }
                      />
                      <Label htmlFor="prevent-download">Prevent document download (view only)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="require-approval"
                        checked={securitySettings.requireApproval}
                        onCheckedChange={(checked) =>
                          setSecuritySettings({...securitySettings, requireApproval: !!checked})
                        }
                      />
                      <Label htmlFor="require-approval">Require multi-level approval for changes</Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSecurityModalOpen(false)}>Cancel</Button>
                <Button>Save Security Settings</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}