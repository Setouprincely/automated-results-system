'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layouts/layout';
import {
  Card,
  CardContent,
  CardHeader
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Calculator, Save, CheckCircle, HelpCircle, Filter } from 'lucide-react';

// Define interfaces
interface Subject {
  id: string;
  name: string;
  examCode: string;
  maxScore: number;
}

interface Candidate {
  id: string;
  name: string;
  center: string;
  candidateNumber: string;
}

interface GradeResult {
  subjectId: string;
  rawScore: number;
  normalizedScore: number;
  grade: string;
  ucasPoints: number;
  status: 'pending' | 'verified' | 'finalized';
}

interface BatchInfo {
  id: string;
  name: string;
  examYear: number;
  totalCandidates: number;
  gradingProgress: number;
}

// Sample data
const subjects: Subject[] = [
  { id: '1', name: 'Mathematics', examCode: 'A1', maxScore: 100 },
  { id: '2', name: 'Further Mathematics', examCode: 'A2', maxScore: 100 },
  { id: '3', name: 'Physics', examCode: 'A3', maxScore: 100 },
  { id: '4', name: 'Chemistry', examCode: 'A4', maxScore: 100 },
  { id: '5', name: 'Biology', examCode: 'A5', maxScore: 100 },
  { id: '6', name: 'Computer Science', examCode: 'A6', maxScore: 100 },
  { id: '7', name: 'Economics', examCode: 'A7', maxScore: 100 },
  { id: '8', name: 'Literature in English', examCode: 'A8', maxScore: 100 },
  { id: '9', name: 'History', examCode: 'A9', maxScore: 100 },
  { id: '10', name: 'Geography', examCode: 'A10', maxScore: 100 },
];

const batches: BatchInfo[] = [
  { id: '1', name: 'June 2025 A-Level', examYear: 2025, totalCandidates: 15830, gradingProgress: 72 },
  { id: '2', name: 'Jan 2025 A-Level', examYear: 2025, totalCandidates: 8920, gradingProgress: 100 },
  { id: '3', name: 'June 2024 A-Level', examYear: 2024, totalCandidates: 14750, gradingProgress: 100 },
];

// UCAS Points mapping
const ucasPointsMap: Record<string, number> = {
  'A*': 56,
  'A': 48,
  'B': 40,
  'C': 32,
  'D': 24,
  'E': 16,
  'U': 0
};

// Grade boundaries (simplified example)
const gradeBoundaries = {
  'A*': 90,
  'A': 80,
  'B': 70,
  'C': 60,
  'D': 50,
  'E': 40,
  'U': 0
};

const ALevelGradingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('batch-selection');
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [gradingInProgress, setGradingInProgress] = useState<boolean>(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [results, setResults] = useState<GradeResult[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingComplete, setProcessingComplete] = useState<boolean>(false);
  const [currentBatch, setCurrentBatch] = useState<BatchInfo | null>(null);

  // When batch is selected, load its data
  useEffect(() => {
    if (selectedBatch) {
      const batch = batches.find(b => b.id === selectedBatch);
      setCurrentBatch(batch || null);

      // Simulate loading candidates
      setIsProcessing(true);
      setTimeout(() => {
        // Mock candidate data
        const mockCandidates: Candidate[] = Array.from({ length: 15 }, (_, i) => ({
          id: `cand-${i + 1}`,
          name: `Candidate ${i + 1}`,
          center: `Examination Center ${Math.floor(i / 3) + 1}`,
          candidateNumber: `A${selectedBatch}${100000 + i}`
        }));

        // Mock results data
        const mockResults: GradeResult[] = [];
        mockCandidates.forEach(() => {
          subjects.forEach(subject => {
            const rawScore = Math.floor(Math.random() * 100);
            let grade = 'U';

            // Determine grade based on raw score
            for (const [g, minScore] of Object.entries(gradeBoundaries)) {
              if (rawScore >= minScore) {
                grade = g;
                break;
              }
            }

            mockResults.push({
              subjectId: subject.id,
              rawScore,
              normalizedScore: rawScore, // Simplified, in real system this would be normalized
              grade,
              ucasPoints: ucasPointsMap[grade],
              status: Math.random() > 0.7 ? 'verified' : 'pending'
            });
          });
        });

        setCandidates(mockCandidates);
        setResults(mockResults);
        setIsProcessing(false);
      }, 1500);
    }
  }, [selectedBatch]);

  const handleStartGrading = () => {
    setGradingInProgress(true);
    setActiveTab('grading-process');

    // Simulating grading process
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setProcessingComplete(true);
    }, 3000);
  };

  const handleSaveGrading = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setActiveTab('verification');
      setIsProcessing(false);
    }, 1500);
  };

  const handleFinalizeResults = () => {
    setIsProcessing(true);

    setTimeout(() => {
      // Update all results to finalized
      const updatedResults = results.map(result => ({
        ...result,
        status: 'finalized' as const
      }));

      setResults(updatedResults);
      setIsProcessing(false);
      setActiveTab('summary');
    }, 2000);
  };

  const getSubjectById = (id: string) => {
    return subjects.find(subject => subject.id === id);
  };

  // Calculate overall statistics for summary view
  const calculateStatistics = () => {
    const totalCandidates = candidates.length;
    const gradesDistribution: Record<string, number> = { 'A*': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'U': 0 };

    results.forEach(result => {
      if (gradesDistribution[result.grade] !== undefined) {
        gradesDistribution[result.grade]++;
      }
    });

    const totalResults = Object.values(gradesDistribution).reduce((sum, count) => sum + count, 0);

    const passingGrades = gradesDistribution['A*'] + gradesDistribution['A'] +
                         gradesDistribution['B'] + gradesDistribution['C'] +
                         gradesDistribution['D'] + gradesDistribution['E'];

    const passRate = totalResults > 0 ? (passingGrades / totalResults) * 100 : 0;

    return {
      totalCandidates,
      totalResults,
      gradesDistribution,
      passRate: passRate.toFixed(2)
    };
  };

  const stats = calculateStatistics();

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">A-Level Grading System</h1>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <HelpCircle className="mr-2 h-4 w-4" />
              Help
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="bg-blue-50">
            <h2 className="text-xl font-semibold text-blue-900">A-Level Grading Module</h2>
            <p className="text-sm text-blue-700">Manage the grading process for A-Level examinations with A*-E grading system</p>
          </CardHeader>

          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="batch-selection" disabled={gradingInProgress && activeTab !== 'batch-selection'}>
                  1. Batch Selection
                </TabsTrigger>
                <TabsTrigger value="grading-process" disabled={!selectedBatch || activeTab === 'batch-selection'}>
                  2. Grading Process
                </TabsTrigger>
                <TabsTrigger value="verification" disabled={!processingComplete || activeTab === 'batch-selection'}>
                  3. Verification
                </TabsTrigger>
                <TabsTrigger value="summary" disabled={activeTab !== 'summary'}>
                  4. Summary
                </TabsTrigger>
              </TabsList>

              <TabsContent value="batch-selection" className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-md mb-6">
                  <h3 className="font-medium text-blue-800 mb-2">Batch Selection Instructions</h3>
                  <p className="text-sm text-blue-700">
                    Select an examination batch to begin the grading process. You can view the progress status
                    for each batch and continue with pending work or review completed gradings.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {batches.map((batch) => (
                    <Card
                      key={batch.id}
                      className={`cursor-pointer transition-all ${selectedBatch === batch.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'}`}
                      onClick={() => setSelectedBatch(batch.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-lg">{batch.name}</h3>
                            <p className="text-sm text-gray-500">Year: {batch.examYear} | Candidates: {batch.totalCandidates.toLocaleString()}</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-medium">
                              Progress: {batch.gradingProgress}%
                            </span>
                            <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                              <div
                                className={`h-2 rounded-full ${batch.gradingProgress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                style={{ width: `${batch.gradingProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleStartGrading}
                    disabled={!selectedBatch}
                  >
                    Continue with Selected Batch
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="grading-process" className="space-y-6">
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-lg font-medium text-blue-900">Processing A-Level Grades...</p>
                    <p className="text-sm text-gray-500">This may take a few moments</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Grading for: {currentBatch?.name}</h3>
                        <p className="text-sm text-gray-500">Total Candidates: {currentBatch?.totalCandidates}</p>
                      </div>

                      <div className="flex space-x-2">
                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                          <SelectTrigger className="w-[240px]">
                            <SelectValue placeholder="Filter by Subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Subjects</SelectItem>
                            {subjects.map(subject => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name} ({subject.examCode})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button variant="outline" size="sm">
                          <Calculator className="mr-2 h-4 w-4" />
                          Recalculate
                        </Button>
                      </div>
                    </div>

                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Subject</TableHead>
                              <TableHead>Exam Code</TableHead>
                              <TableHead className="text-right">Raw Score</TableHead>
                              <TableHead className="text-right">Normalized</TableHead>
                              <TableHead className="text-center">Grade</TableHead>
                              <TableHead className="text-center">UCAS Points</TableHead>
                              <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results
                              .filter(r => !selectedSubject || r.subjectId === selectedSubject)
                              .slice(0, 10) // Limit to 10 rows for display
                              .map((result, index) => {
                                const subject = getSubjectById(result.subjectId);
                                return (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">{subject?.name}</TableCell>
                                    <TableCell>{subject?.examCode}</TableCell>
                                    <TableCell className="text-right">{result.rawScore}</TableCell>
                                    <TableCell className="text-right">{result.normalizedScore}</TableCell>
                                    <TableCell className="text-center">
                                      <span className={`px-2 py-1 rounded-md font-medium ${
                                        result.grade === 'A*' || result.grade === 'A' ? 'bg-green-100 text-green-800' :
                                        result.grade === 'B' || result.grade === 'C' ? 'bg-blue-100 text-blue-800' :
                                        result.grade === 'D' || result.grade === 'E' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        {result.grade}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-center">{result.ucasPoints}</TableCell>
                                    <TableCell className="text-center">
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        result.status === 'finalized' ? 'bg-green-100 text-green-800' :
                                        result.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                                      </span>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                      <h4 className="font-medium text-yellow-800 mb-1">Grading Information</h4>
                      <p className="text-sm text-yellow-700">
                        A-Level grading uses the A*-E system. The grade boundaries are determined based on
                        statistical analysis and raw score distributions. UCAS points are automatically calculated
                        as follows: A* (56), A (48), B (40), C (32), D (24), E (16), U (0).
                      </p>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={() => setActiveTab('batch-selection')}>
                        Back to Batch Selection
                      </Button>
                      <Button onClick={handleSaveGrading}>
                        <Save className="mr-2 h-4 w-4" />
                        Save and Continue to Verification
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="verification" className="space-y-6">
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-lg font-medium text-blue-900">Preparing Verification Data...</p>
                    <p className="text-sm text-gray-500">This may take a few moments</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-green-50 p-4 rounded-md border border-green-200">
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                        <div>
                          <h4 className="font-medium text-green-800">Grading Process Complete</h4>
                          <p className="text-sm text-green-700">
                            All candidate results have been processed. Please verify the results before finalizing.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <h3 className="text-lg font-medium">Grade Distribution</h3>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Object.entries(stats.gradesDistribution).map(([grade, count]) => (
                              <div key={grade} className="flex items-center">
                                <span className="w-8 font-medium">{grade}</span>
                                <div className="flex-1 mx-2 h-4 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      grade === 'A*' || grade === 'A' ? 'bg-green-500' :
                                      grade === 'B' || grade === 'C' ? 'bg-blue-500' :
                                      grade === 'D' || grade === 'E' ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${count / stats.totalResults * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-500 w-10 text-right">
                                  {((count / stats.totalResults) * 100).toFixed(1)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <h3 className="text-lg font-medium">Verification Status</h3>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Pending Verification</span>
                                <span className="font-medium">
                                  {results.filter(r => r.status === 'pending').length} results
                                </span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full">
                                <div
                                  className="h-2 bg-yellow-500 rounded-full"
                                  style={{
                                    width: `${results.filter(r => r.status === 'pending').length / results.length * 100}%`
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Verified</span>
                                <span className="font-medium">
                                  {results.filter(r => r.status === 'verified').length} results
                                </span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full">
                                <div
                                  className="h-2 bg-blue-500 rounded-full"
                                  style={{
                                    width: `${results.filter(r => r.status === 'verified').length / results.length * 100}%`
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Finalized</span>
                                <span className="font-medium">
                                  {results.filter(r => r.status === 'finalized').length} results
                                </span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full">
                                <div
                                  className="h-2 bg-green-500 rounded-full"
                                  style={{
                                    width: `${results.filter(r => r.status === 'finalized').length / results.length * 100}%`
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <Button variant="outline" size="sm" className="w-full">
                              View Detailed Status Report
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <h3 className="text-lg font-medium">Actions Required</h3>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center p-2 rounded-md bg-yellow-50">
                              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-yellow-200 text-yellow-700 mr-2">
                                {results.filter(r => r.status === 'pending').length}
                              </span>
                              <span className="text-sm text-yellow-800">Results pending verification</span>
                            </div>

                            <div className="flex items-center p-2 rounded-md bg-blue-50">
                              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-200 text-blue-700 mr-2">
                                {results.filter(r => r.grade === 'U').length}
                              </span>
                              <span className="text-sm text-blue-800">Failing grades to review</span>
                            </div>

                            <div className="flex items-center p-2 rounded-md bg-green-50">
                              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-200 text-green-700 mr-2">1</span>
                              <span className="text-sm text-green-800">Chief examiner approval needed</span>
                            </div>
                          </div>

                          <Button className="w-full mt-4" onClick={handleFinalizeResults}>
                            Finalize All Results
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b">
                        <h3 className="font-medium">Verification Notes</h3>
                      </div>
                      <div className="p-4">
                        <textarea
                          className="w-full h-24 p-2 border rounded-md"
                          placeholder="Add verification notes here..."
                        ></textarea>

                        <div className="flex justify-end mt-2">
                          <Button variant="outline" size="sm">
                            Save Notes
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={() => setActiveTab('grading-process')}>
                        Back to Grading Process
                      </Button>
                      <Button onClick={handleFinalizeResults}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Finalize and Generate Summary
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="summary" className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-green-800">Results Successfully Finalized</h3>
                    <p className="text-green-700">
                      The A-Level grading process has been completed and verified. Results are now ready for publication
                      and certificate generation.
                    </p>
                  </div>
                </div>

                <Card>
                  <CardHeader className="pb-2 bg-blue-50">
                    <h3 className="text-xl font-semibold">Grading Summary: {currentBatch?.name}</h3>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-medium mb-3">Results Overview</h4>

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-md">
                              <div className="text-sm text-gray-500">Total Candidates</div>
                              <div className="text-2xl font-bold">{stats.totalCandidates}</div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-md">
                              <div className="text-sm text-gray-500">Pass Rate</div>
                              <div className="text-2xl font-bold">{stats.passRate}%</div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-md">
                              <div className="text-sm text-gray-500">Top Grades (A*-B)</div>
                              <div className="text-2xl font-bold">
                                {(((stats.gradesDistribution['A*'] + stats.gradesDistribution['A'] + stats.gradesDistribution['B']) / stats.totalResults) * 100).toFixed(1)}%
                              </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-md">
                              <div className="text-sm text-gray-500">Average UCAS Points</div>
                              <div className="text-2xl font-bold">
                                {(results.reduce((sum, r) => sum + r.ucasPoints, 0) / results.length).toFixed(1)}
                              </div>
                            </div>
                          </div>

                          <Card>
                            <CardContent className="p-4">
                              <h5 className="font-medium mb-2">Grade Distribution Chart</h5>
                              <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center">
                                <p className="text-gray-500 text-sm">Chart visualization would appear here</p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-medium mb-3">Subject Performance</h4>
                        <Card>
                          <CardContent className="p-4">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Subject</TableHead>
                                  <TableHead className="text-right">Pass Rate</TableHead>
                                  <TableHead className="text-right">Avg. UCAS</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {subjects.slice(0, 5).map(subject => (
                                  <TableRow key={subject.id}>
                                    <TableCell>{subject.name}</TableCell>
                                    <TableCell className="text-right">
                                      {(Math.random() * 30 + 70).toFixed(1)}%
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {(Math.random() * 20 + 30).toFixed(1)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>

                        <div className="mt-4 flex justify-end">
                          <Button variant="outline" size="sm">
                            View Detailed Reports
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-between">
                      <Button variant="outline">
                        Return to Batch Selection
                      </Button>
                      <div className="space-x-2">
                        <Button variant="outline">
                          Export Results
                        </Button>
                        <Button>
                          Publish Results
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ALevelGradingPage;