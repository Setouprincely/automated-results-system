'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layouts/layout';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle,
  ArrowRight,
  FileText,
  Clock,
  Loader2
} from 'lucide-react';

// Types
type ScriptStatus = 'pending' | 'in_progress' | 'completed';
type PriorityLevel = 'high' | 'medium' | 'low';

interface Script {
  id: string;
  subject: string;
  level: string;
  center: string;
  status: ScriptStatus;
  dueDate: string;
  candidateId: string;
  questionCount: number;
  priority: PriorityLevel;
}

export default function ScriptsAssignment() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // Mock data - would be fetched from API in production
    const fetchScripts = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockScripts: Script[] = [
          {
            id: 'SCR-001',
            subject: 'Mathematics',
            level: 'A Level',
            center: 'Bamenda Examination Center',
            status: 'pending',
            dueDate: '2025-05-25',
            candidateId: 'CAN-1234',
            questionCount: 12,
            priority: 'high'
          },
          {
            id: 'SCR-002',
            subject: 'Physics',
            level: 'A Level',
            center: 'Douala Examination Center',
            status: 'in_progress',
            dueDate: '2025-05-24',
            candidateId: 'CAN-4567',
            questionCount: 8,
            priority: 'medium'
          },
          {
            id: 'SCR-003',
            subject: 'Chemistry',
            level: 'O Level',
            center: 'Yaoundé Examination Center',
            status: 'completed',
            dueDate: '2025-05-22',
            candidateId: 'CAN-7890',
            questionCount: 10,
            priority: 'low'
          },
          {
            id: 'SCR-004',
            subject: 'Mathematics',
            level: 'O Level',
            center: 'Buea Examination Center',
            status: 'pending',
            dueDate: '2025-05-26',
            candidateId: 'CAN-2468',
            questionCount: 15,
            priority: 'high'
          },
          {
            id: 'SCR-005',
            subject: 'Biology',
            level: 'A Level',
            center: 'Limbe Examination Center',
            status: 'in_progress',
            dueDate: '2025-05-23',
            candidateId: 'CAN-1357',
            questionCount: 9,
            priority: 'medium'
          },
          {
            id: 'SCR-006',
            subject: 'English Language',
            level: 'O Level',
            center: 'Kumba Examination Center',
            status: 'pending',
            dueDate: '2025-05-27',
            candidateId: 'CAN-9876',
            questionCount: 6,
            priority: 'high'
          }
        ];
        
        setScripts(mockScripts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching scripts:', error);
        setLoading(false);
      }
    };
    
    fetchScripts();
  }, []);

  const handleAcceptScript = (script: Script) => {
    // In production, this would call an API to update the status
    const updatedScripts = scripts.map(s => 
      s.id === script.id ? {...s, status: 'in_progress' as const} : s
    );
    setScripts(updatedScripts);
  };

  const handleViewScript = (script: Script) => {
    setSelectedScript(script);
    setShowModal(true);
  };

  const handleStartMarking = (script: Script) => {
    // In production, this would navigate to the marking interface
    router.push(`/Examinar/mark-script/${script.id}`);
  };

  const getStatusBadge = (status: ScriptStatus) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="default">In Progress</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch(priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="default">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="secondary">Low Priority</Badge>;
      default:
        return null;
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredScripts = scripts.filter(script => {
    // Apply status filter
    if (filter !== 'all' && script.status !== filter) {
      return false;
    }
    
    // Apply search filter (across multiple fields)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        script.id.toLowerCase().includes(searchLower) ||
        script.subject.toLowerCase().includes(searchLower) ||
        script.level.toLowerCase().includes(searchLower) ||
        script.center.toLowerCase().includes(searchLower) ||
        script.candidateId.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Scripts Assignment</h1>
          <div className="flex gap-2">
            <Button variant="outline">
              My Statistics
            </Button>
            <Button>
              Request More Scripts
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-medium mb-2">Pending Scripts</h3>
                <p className="text-3xl font-bold mb-1">
                  {scripts.filter(s => s.status === 'pending').length}
                </p>
                <p className="text-sm text-gray-500">Awaiting your action</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-indigo-50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-medium mb-2">In Progress</h3>
                <p className="text-3xl font-bold mb-1">
                  {scripts.filter(s => s.status === 'in_progress').length}
                </p>
                <p className="text-sm text-gray-500">Currently being marked</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-medium mb-2">Completed</h3>
                <p className="text-3xl font-bold mb-1">
                  {scripts.filter(s => s.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-500">Fully marked and submitted</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Scripts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search scripts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-64">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scripts</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                Showing {filteredScripts.length} of {scripts.length} scripts
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading scripts...</span>
              </div>
            ) : (
              <>
                {filteredScripts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No scripts found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Script ID</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead>Examination Center</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredScripts.map((script) => (
                          <TableRow key={script.id}>
                            <TableCell>{script.id}</TableCell>
                            <TableCell>{script.subject}</TableCell>
                            <TableCell>{script.level}</TableCell>
                            <TableCell>{script.center}</TableCell>
                            <TableCell>{getStatusBadge(script.status)}</TableCell>
                            <TableCell>
                              {script.dueDate}
                              <div className="text-xs text-gray-500 flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {getDaysRemaining(script.dueDate)} days left
                              </div>
                            </TableCell>
                            <TableCell>{getPriorityBadge(script.priority)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {script.status === 'pending' && (
                                  <Button 
                                    variant="default" 
                                    size="sm"
                                    onClick={() => handleAcceptScript(script)}
                                    className="flex items-center"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" /> Accept
                                  </Button>
                                )}
                                
                                {script.status === 'in_progress' && (
                                  <Button 
                                    variant="default" 
                                    size="sm"
                                    onClick={() => handleStartMarking(script)}
                                    className="flex items-center"
                                  >
                                    <ArrowRight className="h-4 w-4 mr-1" /> Continue
                                  </Button>
                                )}
                                
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewScript(script)}
                                  className="flex items-center"
                                >
                                  <FileText className="h-4 w-4 mr-1" /> Details
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Script Details Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Script Details - {selectedScript?.id}</DialogTitle>
            <DialogDescription>
              Detailed information about the selected script
            </DialogDescription>
          </DialogHeader>
          
          {selectedScript && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Basic Information</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2">
                    <div className="font-medium">Subject:</div>
                    <div>{selectedScript.subject}</div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="font-medium">Level:</div>
                    <div>{selectedScript.level}</div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="font-medium">Center:</div>
                    <div>{selectedScript.center}</div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="font-medium">Candidate ID:</div>
                    <div>{selectedScript.candidateId}</div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="font-medium">Questions:</div>
                    <div>{selectedScript.questionCount} questions</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Status Information</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2">
                    <div className="font-medium">Current Status:</div>
                    <div>{getStatusBadge(selectedScript.status)}</div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="font-medium">Priority:</div>
                    <div>{getPriorityBadge(selectedScript.priority)}</div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="font-medium">Due Date:</div>
                    <div>{selectedScript.dueDate}</div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="font-medium">Time Remaining:</div>
                    <div>{getDaysRemaining(selectedScript.dueDate)} days</div>
                  </div>
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-2 bg-blue-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Marking Guidelines</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Please adhere to the marking scheme provided for this subject</li>
                  <li>Each question must be marked independently</li>
                  <li>Provide detailed feedback for incorrect answers</li>
                  <li>Submit for review after completing all questions</li>
                </ul>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Close
            </Button>
            
            {selectedScript?.status === 'pending' && (
              <Button 
                onClick={() => {
                  handleAcceptScript(selectedScript);
                  setShowModal(false);
                }}
              >
                Accept Script
              </Button>
            )}
            
            {selectedScript?.status === 'in_progress' && (
              <Button
                onClick={() => {
                  handleStartMarking(selectedScript);
                  setShowModal(false);
                }}
              >
                Continue Marking
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
