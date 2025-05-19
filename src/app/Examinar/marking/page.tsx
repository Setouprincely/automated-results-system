'use client';

import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle,
  Save,
  Send,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

// Types
interface Question {
  id: number;
  maxScore: number;
  awarded: number | null;
  comments: string;
}

interface Script {
  id: string;
  candidateId: string;
  subject: string;
  level: string;
  center: string;
  status: 'pending' | 'in_progress' | 'completed';
  allocated: string;
  deadline: string;
  pages: number;
  currentPage: number;
  questions: Question[];
}

// Mock data for demonstration
const mockScripts: Script[] = [
  {
    id: 'SCR001',
    candidateId: 'CAM2025001',
    subject: 'Mathematics',
    level: 'A Level',
    center: 'Douala Center 01',
    status: 'in_progress',
    allocated: '2025-05-15',
    deadline: '2025-05-20',
    pages: 8,
    currentPage: 1,
    questions: [
      { id: 1, maxScore: 10, awarded: null, comments: '' },
      { id: 2, maxScore: 15, awarded: null, comments: '' },
      { id: 3, maxScore: 20, awarded: null, comments: '' },
      { id: 4, maxScore: 25, awarded: null, comments: '' },
      { id: 5, maxScore: 30, awarded: null, comments: '' }
    ]
  },
  {
    id: 'SCR002',
    candidateId: 'CAM2025045',
    subject: 'Mathematics',
    level: 'A Level',
    center: 'Yaoundé Center 03',
    status: 'pending',
    allocated: '2025-05-15',
    deadline: '2025-05-20',
    pages: 6,
    currentPage: 1,
    questions: [
      { id: 1, maxScore: 10, awarded: null, comments: '' },
      { id: 2, maxScore: 15, awarded: null, comments: '' },
      { id: 3, maxScore: 20, awarded: null, comments: '' },
      { id: 4, maxScore: 25, awarded: null, comments: '' },
      { id: 5, maxScore: 30, awarded: null, comments: '' }
    ]
  },
  {
    id: 'SCR003',
    candidateId: 'CAM2025103',
    subject: 'Mathematics',
    level: 'O Level',
    center: 'Bamenda Center 02',
    status: 'completed',
    allocated: '2025-05-14',
    deadline: '2025-05-19',
    pages: 7,
    currentPage: 7,
    questions: [
      { id: 1, maxScore: 10, awarded: 8, comments: 'Good work, clear explanation' },
      { id: 2, maxScore: 15, awarded: 12, comments: 'Correct approach but calculation error in part b' },
      { id: 3, maxScore: 20, awarded: 17, comments: 'Excellent solution' },
      { id: 4, maxScore: 25, awarded: 20, comments: 'Good approach, missed final conclusion' },
      { id: 5, maxScore: 30, awarded: 25, comments: 'Well reasoned with minor errors' }
    ]
  }
];

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
}

export default function MarkingInterface() {
  const [activeTab, setActiveTab] = useState<'assigned' | 'completed'>('assigned');
  const [scripts, setScripts] = useState<Script[]>(mockScripts);
  const [activeScript, setActiveScript] = useState<Script | null>(null);
  const [markingMode, setMarkingMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    hours: 3,
    minutes: 45,
    seconds: 30
  });

  // Initialize active script with the first in-progress script, but don't activate marking mode
  useEffect(() => {
    const inProgressScript = scripts.find(script => script.status === 'in_progress');
    if (inProgressScript) {
      setActiveScript(inProgressScript);
    } else if (scripts.length > 0) {
      setActiveScript(scripts[0]);
    }
    // Make sure marking mode is off when the component loads
    setMarkingMode(false);
  }, []);

  // Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleScoreChange = (questionId: number, value: string) => {
    if (activeScript) {
      const updatedScript = { ...activeScript };
      const questionIndex = updatedScript.questions.findIndex(q => q.id === questionId);

      if (questionIndex !== -1) {
        updatedScript.questions[questionIndex].awarded = Math.min(
          updatedScript.questions[questionIndex].maxScore,
          Math.max(0, parseInt(value) || 0)
        );
        setActiveScript(updatedScript);
      }
    }
  };

  const handleCommentChange = (questionId: number, comment: string) => {
    if (activeScript) {
      const updatedScript = { ...activeScript };
      const questionIndex = updatedScript.questions.findIndex(q => q.id === questionId);

      if (questionIndex !== -1) {
        updatedScript.questions[questionIndex].comments = comment;
        setActiveScript(updatedScript);
      }
    }
  };

  const saveProgress = () => {
    if (!activeScript) return;

    const updatedScripts = scripts.map(script =>
      script.id === activeScript.id ? activeScript : script
    );
    setScripts(updatedScripts);
    alert('Progress saved successfully!');
  };

  const submitMarking = () => {
    if (!activeScript) return;

    // Check if all questions are marked
    const allMarked = activeScript.questions.every(q => q.awarded !== null);

    if (!allMarked) {
      alert('Please mark all questions before submitting.');
      return;
    }

    const updatedScripts = scripts.map(script =>
      script.id === activeScript.id
        ? { ...activeScript, status: 'completed' as const }
        : script
    );
    setScripts(updatedScripts);
    setActiveScript({ ...activeScript, status: 'completed' as const });
    setMarkingMode(false);
    alert('Script submitted successfully for verification!');
  };

  const filteredScripts = scripts.filter(script => {
    if (activeTab === 'assigned') return script.status !== 'completed';
    if (activeTab === 'completed') return script.status === 'completed';
    return true;
  }).filter(script =>
    script.candidateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.center.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalScore = activeScript?.questions.reduce((sum, q) => sum + (q.awarded || 0), 0) || 0;
  const maxPossibleScore = activeScript?.questions.reduce((sum, q) => sum + q.maxScore, 0) || 0;
  const completionPercentage = activeScript
    ? (activeScript.questions.filter(q => q.awarded !== null).length / activeScript.questions.length) * 100
    : 0;

  const formatTime = (hours: number, minutes: number, seconds: number): string => {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <Layout>
      <div className="p-6 max-w-full bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">GCE Examination Marking Interface</h1>
          <div className="flex items-center space-x-4">
            <div className="bg-white p-2 rounded-lg shadow flex items-center">
              <Clock className="h-5 w-5 text-red-500 mr-2" />
              <span className="font-mono font-bold">
                {formatTime(timeRemaining.hours, timeRemaining.minutes, timeRemaining.seconds)}
              </span>
            </div>
            <Button
              onClick={() => setShowHelp(!showHelp)}
              variant="outline"
              className="flex items-center"
            >
              <HelpCircle className="h-5 w-5 mr-1" />
              Help
            </Button>
          </div>
        </div>

        {showHelp && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
            <h3 className="font-bold text-blue-800">Marking Guidelines</h3>
            <ul className="list-disc pl-5 mt-2 text-blue-800">
              <li>Award marks based on the marking scheme provided</li>
              <li>Add comments to justify scores, especially for partial marks</li>
              <li>Save your progress frequently to prevent data loss</li>
              <li>Submit only when you have completed marking all questions</li>
              <li>For assistance, contact your chief examiner at chief.examiner@gceboard.cm</li>
            </ul>
            <Button
              onClick={() => setShowHelp(false)}
              variant="outline"
              className="mt-2 text-blue-800 border-blue-800"
            >
              Close Help
            </Button>
          </div>
        )}

        {markingMode && activeScript ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold">Script: {activeScript.id}</h2>
                    <p className="text-sm text-gray-300">
                      {activeScript.subject} • {activeScript.level} • {activeScript.center}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="bg-gray-700 hover:bg-gray-600 mr-2"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <span className="mx-2 text-sm">
                      Page {currentPage} of {activeScript.pages}
                    </span>
                    <Button
                      onClick={() => setCurrentPage(Math.min(activeScript.pages, currentPage + 1))}
                      disabled={currentPage === activeScript.pages}
                      className="bg-gray-700 hover:bg-gray-600 ml-2"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  {/* Script content would be loaded here */}
                  <div className="border border-gray-300 rounded-lg bg-white p-6 min-h-96 relative">
                    <img
                      src={`/api/placeholder/800/600`}
                      alt="Script page content"
                      className="w-full object-contain border border-gray-200"
                    />
                    <div className="absolute top-2 right-2 bg-white/80 backdrop-blur p-2 rounded-lg border border-gray-200 text-sm">
                      <p>Double-click to annotate</p>
                      <p>Use toolbar for more options</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Marking Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{Math.round(completionPercentage)}% Complete</span>
                    <span>Total: {totalScore}/{maxPossibleScore}</span>
                  </div>

                  <div className="mt-6 space-y-6">
                    {activeScript.questions.map((question) => (
                      <div key={question.id} className="border-b pb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Question {question.id}</h4>
                          <span className="text-sm text-gray-500">Max: {question.maxScore}</span>
                        </div>

                        <div className="flex items-center space-x-2 mb-2">
                          <Input
                            type="number"
                            value={question.awarded !== null ? question.awarded : ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleScoreChange(question.id, e.target.value)}
                            min={0}
                            max={question.maxScore}
                            className="w-16 text-center"
                          />
                          <span className="text-gray-500">/ {question.maxScore}</span>
                          {question.awarded !== null && question.awarded === question.maxScore && (
                            <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                          )}
                        </div>

                        <Textarea
                          placeholder="Add comments here..."
                          value={question.comments}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleCommentChange(question.id, e.target.value)}
                          className="w-full text-sm"
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex space-x-2">
                <Button
                  onClick={saveProgress}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Progress
                </Button>
                <Button
                  onClick={submitMarking}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit
                </Button>
              </div>

              <Button
                onClick={() => setMarkingMode(false)}
                variant="outline"
                className="w-full"
              >
                Back to Scripts
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex space-x-4">
                <Button
                  onClick={() => setActiveTab('assigned')}
                  variant={activeTab === 'assigned' ? 'default' : 'outline'}
                  className={activeTab === 'assigned' ? 'bg-blue-600' : ''}
                >
                  Assigned Scripts
                </Button>
                <Button
                  onClick={() => setActiveTab('completed')}
                  variant={activeTab === 'completed' ? 'default' : 'outline'}
                  className={activeTab === 'completed' ? 'bg-green-600' : ''}
                >
                  Completed Scripts
                </Button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="h-4 w-4 absolute top-3 left-3 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search scripts..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Script ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Center
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredScripts.length > 0 ? (
                    filteredScripts.map((script) => (
                      <tr key={script.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {script.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {script.candidateId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {script.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {script.level}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {script.center}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              script.status === 'completed'
                                ? 'secondary'
                                : script.status === 'in_progress'
                                ? 'default'
                                : 'outline'
                            }
                          >
                            {script.status === 'completed'
                              ? 'Completed'
                              : script.status === 'in_progress'
                              ? 'In Progress'
                              : 'Pending'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {script.deadline}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            onClick={() => {
                              setActiveScript(script);
                              setMarkingMode(true);
                            }}
                            disabled={script.status === 'completed'}
                            variant={script.status === 'completed' ? 'outline' : 'default'}
                            className="text-xs"
                          >
                            {script.status === 'completed' ? 'View' : 'Mark'}
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                        No scripts found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium text-gray-800 mb-3">Marking Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">Total Assigned</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {scripts.filter(s => s.status !== 'completed').length}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-md">
                  <p className="text-sm text-green-800">Completed</p>
                  <p className="text-2xl font-bold text-green-900">
                    {scripts.filter(s => s.status === 'completed').length}
                  </p>
                </div>
                <div className="bg-amber-50 p-3 rounded-md">
                  <p className="text-sm text-amber-800">In Progress</p>
                  <p className="text-2xl font-bold text-amber-900">
                    {scripts.filter(s => s.status === 'in_progress').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
