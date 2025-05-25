'use client';

import React, { useState, useEffect } from 'react';
import ExaminerLayout from '@/components/layouts/ExaminerLayout';
import {
  Search, Save, AlertTriangle, CheckCircle,
  Eye, BarChart2, XCircle, HelpCircle, FileText
} from 'lucide-react';

// Types for our data structures
type Student = {
  id: string;
  name: string;
  centerCode: string;
  candidateNumber: string;
  subjectCode: string;
  examType: 'O Level' | 'A Level';
  status: 'Unmarked' | 'Marked' | 'Verified' | 'Queried';
  score?: number;
  maxScore: number;
  comments?: string;
}

type ValidationResult = {
  valid: boolean;
  message?: string;
}

const ScoreEntryPage = () => {
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [currentSubject, setCurrentSubject] = useState<string>('');
  // We're using currentExamType but not changing it in this example
  const [currentExamType] = useState<'O Level' | 'A Level'>('O Level');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [score, setScore] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [validation, setValidation] = useState<ValidationResult>({ valid: true });
  const [students, setStudents] = useState<Student[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Mock data loading - replace with actual API call
  useEffect(() => {
    // This would be an API call in a real application
    const mockStudents: Student[] = [
      {
        id: '1001',
        name: 'John Doe',
        centerCode: 'SWR01',
        candidateNumber: '2025001',
        subjectCode: 'MATH',
        examType: 'O Level',
        status: 'Unmarked',
        maxScore: 100
      },
      {
        id: '1002',
        name: 'Jane Smith',
        centerCode: 'SWR01',
        candidateNumber: '2025002',
        subjectCode: 'MATH',
        examType: 'O Level',
        status: 'Unmarked',
        maxScore: 100
      },
      {
        id: '1003',
        name: 'Robert Fang',
        centerCode: 'NWR05',
        candidateNumber: '2025134',
        subjectCode: 'PHYS',
        examType: 'A Level',
        status: 'Marked',
        score: 75,
        maxScore: 100,
        comments: 'Good work on thermodynamics section.'
      },
      {
        id: '1004',
        name: 'Yvette Nguemo',
        centerCode: 'LIT02',
        candidateNumber: '2025088',
        subjectCode: 'CHEM',
        examType: 'A Level',
        status: 'Queried',
        score: 45,
        maxScore: 100,
        comments: 'Potential grading issue in organic chemistry section.'
      },
      {
        id: '1005',
        name: 'David Tabe',
        centerCode: 'SWR03',
        candidateNumber: '2025056',
        subjectCode: 'MATH',
        examType: 'O Level',
        status: 'Verified',
        score: 88,
        maxScore: 100,
        comments: 'Excellent problem-solving skills.'
      },
    ];

    setStudents(mockStudents);

    // In Next.js App Router, we would use searchParams or params
    // For now, just set default values
    setCurrentSubject('MATH');

  }, []);

  // Filter students based on search term and filters
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.candidateNumber.includes(searchTerm);

    const matchesFilter = filterStatus === 'all' || student.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // Handle student selection
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setScore(student.score?.toString() || '');
    setComments(student.comments || '');
    setValidation({ valid: true });
  };

  // Validate score input
  const validateScore = (scoreValue: string): ValidationResult => {
    if (!selectedStudent) return { valid: false, message: 'No student selected' };

    const scoreNum = Number(scoreValue);

    if (isNaN(scoreNum)) {
      return { valid: false, message: 'Score must be a number' };
    }

    if (scoreNum < 0) {
      return { valid: false, message: 'Score cannot be negative' };
    }

    if (scoreNum > selectedStudent.maxScore) {
      return { valid: false, message: `Score cannot exceed maximum (${selectedStudent.maxScore})` };
    }

    return { valid: true };
  };

  // Handle score change
  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScore = e.target.value;
    setScore(newScore);

    const validation = validateScore(newScore);
    setValidation(validation);
  };

  // Save the score
  const handleSaveScore = async () => {
    if (!selectedStudent) return;

    const validation = validateScore(score);
    if (!validation.valid) {
      setValidation(validation);
      return;
    }

    setSaveStatus('saving');

    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 800));

      // Update the student in our local state
      const updatedStudents = students.map(student => {
        if (student.id === selectedStudent.id) {
          return {
            ...student,
            score: Number(score),
            comments: comments,
            status: 'Marked' as const
          };
        }
        return student;
      });

      setStudents(updatedStudents);
      setSelectedStudent(prev => prev ? {
        ...prev,
        score: Number(score),
        comments: comments,
        status: 'Marked' as const
      } : null);

      setSaveStatus('success');

      // Reset after showing success
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);

    } catch (error) {
      console.error('Error saving score:', error);
      setSaveStatus('error');

      // Reset after showing error
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }
  };

  // Submit for verification
  const handleSubmitForVerification = async () => {
    if (!selectedStudent || !selectedStudent.score) return;

    setSaveStatus('saving');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Update the student in our local state
      const updatedStudents = students.map(student => {
        if (student.id === selectedStudent.id) {
          return {
            ...student,
            status: 'Verified' as const
          };
        }
        return student;
      });

      setStudents(updatedStudents);
      setSelectedStudent(prev => prev ? {
        ...prev,
        status: 'Verified' as const
      } : null);

      setSaveStatus('success');

      // Reset after showing success
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);

    } catch (error) {
      console.error('Error submitting for verification:', error);
      setSaveStatus('error');

      // Reset after showing error
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }
  };

  // Clear current selection
  const handleClear = () => {
    setSelectedStudent(null);
    setScore('');
    setComments('');
    setValidation({ valid: true });
  };

  // Translations
  const text = {
    en: {
      title: 'Score Entry',
      subject: 'Subject',
      examType: 'Exam Type',
      search: 'Search by name or candidate number',
      studentList: 'Candidate List',
      scoreEntry: 'Score Entry',
      candidateInfo: 'Candidate Information',
      name: 'Name',
      candidateNumber: 'Candidate Number',
      center: 'Examination Center',
      score: 'Score',
      maxScore: 'out of',
      comments: 'Comments/Observations',
      save: 'Save Score',
      submit: 'Submit for Verification',
      clear: 'Clear Selection',
      guide: 'Scoring Guide',
      all: 'All',
      unmarked: 'Unmarked',
      marked: 'Marked',
      verified: 'Verified',
      queried: 'Queried',
      filter: 'Filter by status',
      previewScript: 'Preview Script',
      viewGuidelines: 'View Marking Guidelines'
    },
    fr: {
      title: 'Saisie des Notes',
      subject: 'Matière',
      examType: 'Type d\'Examen',
      search: 'Rechercher par nom ou numéro de candidat',
      studentList: 'Liste des Candidats',
      scoreEntry: 'Saisie des Notes',
      candidateInfo: 'Informations du Candidat',
      name: 'Nom',
      candidateNumber: 'Numéro de Candidat',
      center: 'Centre d\'Examen',
      score: 'Note',
      maxScore: 'sur',
      comments: 'Commentaires/Observations',
      save: 'Enregistrer la Note',
      submit: 'Soumettre pour Vérification',
      clear: 'Effacer la Sélection',
      guide: 'Guide de Notation',
      all: 'Tous',
      unmarked: 'Non Noté',
      marked: 'Noté',
      verified: 'Vérifié',
      queried: 'Contesté',
      filter: 'Filtrer par statut',
      previewScript: 'Aperçu de la Copie',
      viewGuidelines: 'Consulter les Directives de Notation'
    }
  };

  const t = language === 'en' ? text.en : text.fr;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Unmarked':
      case 'Non Noté':
        return 'text-gray-500';
      case 'Marked':
      case 'Noté':
        return 'text-blue-600';
      case 'Verified':
      case 'Vérifié':
        return 'text-green-600';
      case 'Queried':
      case 'Contesté':
        return 'text-amber-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <ExaminerLayout>
      <div className="flex flex-col h-full">
        {/* Header with language toggle */}
        <div className="flex justify-between items-center p-4 bg-white border-b">
          <h1 className="text-2xl font-bold text-blue-900">{t.title}: {currentSubject} - {currentExamType}</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('fr')}
              className={`px-3 py-1 rounded ${language === 'fr' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              FR
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left side - Student list */}
          <div className="w-1/3 border-r overflow-hidden flex flex-col">
            <div className="p-4 bg-gray-50 border-b">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
              <div className="mt-3 flex">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t.all}</option>
                  <option value="Unmarked">{t.unmarked}</option>
                  <option value="Marked">{t.marked}</option>
                  <option value="Verified">{t.verified}</option>
                  <option value="Queried">{t.queried}</option>
                </select>
                <span className="ml-2 text-sm text-gray-500 self-center">
                  {filteredStudents.length} {filteredStudents.length === 1 ? 'candidate' : 'candidates'}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No candidates match your search criteria
                </div>
              ) : (
                <ul className="divide-y">
                  {filteredStudents.map((student) => (
                    <li
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className={`p-3 hover:bg-blue-50 cursor-pointer ${selectedStudent?.id === student.id ? 'bg-blue-100' : ''}`}
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.candidateNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${getStatusColor(student.status)}`}>
                            {student.status}
                          </p>
                          {student.score !== undefined && (
                            <p className="text-sm">{student.score}/{student.maxScore}</p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right side - Score entry form */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedStudent ? (
              <>
                <div className="bg-gray-50 p-4 border-b">
                  <h2 className="text-lg font-semibold mb-3">{t.candidateInfo}</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">{t.name}</p>
                      <p className="font-medium">{selectedStudent.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t.candidateNumber}</p>
                      <p className="font-medium">{selectedStudent.candidateNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t.center}</p>
                      <p className="font-medium">{selectedStudent.centerCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t.subject}</p>
                      <p className="font-medium">{selectedStudent.subjectCode} ({selectedStudent.examType})</p>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button
                      className="flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                      onClick={() => alert('Script preview functionality would open here')}
                    >
                      <Eye size={16} className="mr-1" />
                      {t.previewScript}
                    </button>
                    <button
                      className="flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      onClick={() => setShowGuide(!showGuide)}
                    >
                      <FileText size={16} className="mr-1" />
                      {t.viewGuidelines}
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {showGuide && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-blue-800">Marking Guidelines for {selectedStudent.subjectCode}</h3>
                        <button
                          onClick={() => setShowGuide(false)}
                          className="text-blue-800 hover:text-blue-600"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                      <ul className="list-disc pl-5 text-sm space-y-1 text-blue-800">
                        <li>Award full marks for completely correct answers with proper working shown</li>
                        <li>Award partial marks according to marking scheme even if the final answer is incorrect</li>
                        <li>For mathematical proofs, ensure each step is logical and clearly stated</li>
                        <li>If a candidate uses an alternate valid method, award marks accordingly</li>
                        <li>No marks for correct answers without required working (as specified in marking scheme)</li>
                      </ul>
                    </div>
                  )}

                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="font-semibold text-lg mb-4">{t.scoreEntry}</h3>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.score}</label>
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={score}
                          onChange={handleScoreChange}
                          className={`w-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!validation.valid ? 'border-red-500' : ''}`}
                        />
                        <span className="ml-2">
                          {t.maxScore} {selectedStudent.maxScore}
                        </span>
                      </div>
                      {!validation.valid && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertTriangle size={14} className="mr-1" /> {validation.message}
                        </p>
                      )}
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.comments}</label>
                      <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add detailed feedback or observations here..."
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={handleSaveScore}
                        disabled={!validation.valid || saveStatus === 'saving'}
                        className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed ${saveStatus === 'saving' ? 'opacity-70' : ''}`}
                      >
                        {saveStatus === 'saving' ? (
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        ) : (
                          <Save size={18} className="mr-2" />
                        )}
                        {t.save}
                      </button>

                      {selectedStudent.status === 'Marked' && (
                        <button
                          onClick={handleSubmitForVerification}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          <CheckCircle size={18} className="mr-2" />
                          {t.submit}
                        </button>
                      )}

                      <button
                        onClick={handleClear}
                        className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                      >
                        {t.clear}
                      </button>
                    </div>

                    {saveStatus === 'success' && (
                      <div className="mt-3 text-green-600 flex items-center">
                        <CheckCircle size={16} className="mr-1" />
                        {language === 'en' ? 'Successfully saved!' : 'Enregistré avec succès !'}
                      </div>
                    )}

                    {saveStatus === 'error' && (
                      <div className="mt-3 text-red-600 flex items-center">
                        <AlertTriangle size={16} className="mr-1" />
                        {language === 'en' ? 'Error saving data. Please try again.' : 'Erreur lors de l\'enregistrement. Veuillez réessayer.'}
                      </div>
                    )}
                  </div>

                  {selectedStudent.status === 'Verified' && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 flex items-center">
                      <CheckCircle size={18} className="mr-2" />
                      This score has been verified and locked. No further changes can be made.
                    </div>
                  )}

                  {selectedStudent.status === 'Queried' && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 flex items-center">
                      <AlertTriangle size={18} className="mr-2" />
                      This score has been queried by a supervisor. Please review your marking.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md p-8">
                  <HelpCircle size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No Candidate Selected</h3>
                  <p className="text-gray-500">Select a candidate from the list to begin scoring their examination.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with stats */}
        <div className="p-3 bg-gray-100 border-t flex justify-between items-center text-sm">
          <div className="flex items-center">
            <BarChart2 size={16} className="mr-1 text-blue-600" />
            <span>
              {language === 'en'
                ? `Progress: ${students.filter(s => s.status === 'Marked' || s.status === 'Verified').length}/${students.length} candidates marked`
                : `Progression: ${students.filter(s => s.status === 'Marked' || s.status === 'Verified').length}/${students.length} candidats notés`
              }
            </span>
          </div>
          <div className="text-gray-500">
            {new Date().toLocaleString(language === 'en' ? 'en-GB' : 'fr-FR', {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </div>
        </div>
      </div>
    </ExaminerLayout>
  );
};

export default ScoreEntryPage;