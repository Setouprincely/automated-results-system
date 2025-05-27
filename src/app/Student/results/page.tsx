'use client';

import { useState } from 'react';
import StudentLayout from '@/components/layouts/StudentLayout';
import { useStudentProfile, useStudentResults } from '@/lib/hooks/useStudent';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, Share2, Award, BarChart3, AlertCircle } from "lucide-react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Get current student ID from localStorage or use default
const getCurrentStudentId = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userId') || 'GCE2025-ST-003421';
  }
  return 'GCE2025-ST-003421';
};

export default function StudentResults() {
  const router = useRouter();
  const [resultsVerified] = useState(true); // Removed unused setter
  const [language, setLanguage] = useState<'en' | 'fr'>('en'); // 'en' for English, 'fr' for French

  // Get student data from API
  const studentId = getCurrentStudentId();
  const { data: studentProfile, loading: profileLoading, error: profileError } = useStudentProfile(studentId);
  const { data: resultsResponse, loading: resultsLoading, error: resultsError } = useStudentResults(studentId);

  // Combine loading states
  const loading = profileLoading || resultsLoading;
  const error = profileError || resultsError;

  // Transform API data to match our interface
  const studentInfo = studentProfile ? {
    name: (studentProfile as any).fullName || "Student",
    candidateNumber: (studentProfile as any).id || studentId,
    center: (studentProfile as any).examCenter || "Default Center",
    examSession: "June 2025",
    level: (studentProfile as any).examLevel || "Advanced Level",
    photo: (studentProfile as any).photoUrl || "/images/prince.jpg"
  } : {
    name: "Student",
    candidateNumber: studentId,
    center: "Default Center",
    examSession: "June 2025",
    level: "Advanced Level",
    photo: "/images/prince.jpg"
  };

  // Default results data with API fallback
  const resultsData = (resultsResponse as any) || {
    oLevel: {
      year: "2023",
      overallGrade: "Merit",
      subjects: [
        { name: "English Language", grade: "A", score: 85 },
        { name: "Mathematics", grade: "B", score: 78 },
        { name: "Physics", grade: "A", score: 88 },
        { name: "Chemistry", grade: "B", score: 75 },
        { name: "Biology", grade: "A", score: 87 },
        { name: "Computer Science", grade: "A*", score: 92 },
        { name: "French", grade: "C", score: 65 },
        { name: "History", grade: "B", score: 74 }
      ]
    },
    aLevel: {
      year: "2025",
      overallGrade: "Distinction",
      subjects: [
        { name: "Mathematics", grade: "A", score: 85, ucasPoints: 48 },
        { name: "Physics", grade: "A*", score: 92, ucasPoints: 56 },
        { name: "Chemistry", grade: "B", score: 75, ucasPoints: 40 },
        { name: "Computer Science", grade: "A", score: 87, ucasPoints: 48 }
      ],
      totalUCASPoints: 192
    }
  };

  // Toggle language function
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'fr' : 'en');
  };

  type TranslationKeys =
    'pageTitle' | 'candidateInfo' | 'candidateNumber' | 'examCenter' | 'examSession' |
    'examLevel' | 'resultsTitle' | 'oLevel' | 'aLevel' | 'subject' | 'grade' |
    'score' | 'ucasPoints' | 'totalUCASPoints' | 'overallGrade' | 'downloadResults' |
    'printResults' | 'shareResults' | 'verifyResults' | 'resultsNotVerified' |
    'loading' | 'viewPerformance' | 'downloadCertificate' | 'verificationDetails' |
    'resultsID' | 'verificationCode' | 'verificationDate' | 'switchToFrench';

  type Translations = {
    [key in 'en' | 'fr']: {
      [key in TranslationKeys]: string;
    }
  };

  const translations: Translations = {
    en: {
      pageTitle: "Examination Results",
      candidateInfo: "Candidate Information",
      candidateNumber: "Candidate Number",
      examCenter: "Examination Center",
      examSession: "Examination Session",
      examLevel: "Examination Level",
      resultsTitle: "Results Overview",
      oLevel: "O Level Results",
      aLevel: "A Level Results",
      subject: "Subject",
      grade: "Grade",
      score: "Score (%)",
      ucasPoints: "UCAS Points",
      totalUCASPoints: "Total UCAS Points",
      overallGrade: "Overall Grade",
      downloadResults: "Download Results",
      printResults: "Print Results",
      shareResults: "Share Results",
      verifyResults: "Results Verified",
      resultsNotVerified: "Results Verification Pending",
      loading: "Loading your results...",
      viewPerformance: "View Performance Analysis",
      downloadCertificate: "Download Certificate",
      verificationDetails: "Verification Details",
      resultsID: "Results ID",
      verificationCode: "Verification Code",
      verificationDate: "Verification Date",
      switchToFrench: "Passer au Français"
    },
    fr: {
      pageTitle: "Résultats d'Examen",
      candidateInfo: "Informations du Candidat",
      candidateNumber: "Numéro de Candidat",
      examCenter: "Centre d'Examen",
      examSession: "Session d'Examen",
      examLevel: "Niveau d'Examen",
      resultsTitle: "Aperçu des Résultats",
      oLevel: "Résultats du O Level",
      aLevel: "Résultats du A Level",
      subject: "Matière",
      grade: "Note",
      score: "Score (%)",
      ucasPoints: "Points UCAS",
      totalUCASPoints: "Total des Points UCAS",
      overallGrade: "Note Globale",
      downloadResults: "Télécharger les Résultats",
      printResults: "Imprimer les Résultats",
      shareResults: "Partager les Résultats",
      verifyResults: "Résultats Vérifiés",
      resultsNotVerified: "Vérification des Résultats en Attente",
      loading: "Chargement de vos résultats...",
      viewPerformance: "Voir l'Analyse de Performance",
      downloadCertificate: "Télécharger le Certificat",
      verificationDetails: "Détails de Vérification",
      resultsID: "ID des Résultats",
      verificationCode: "Code de Vérification",
      verificationDate: "Date de Vérification",
      switchToFrench: "Switch to English"
    }
  };

  const t = translations[language];

  const handlePrintResults = () => {
    window.print();
  };

  const handleViewPerformance = () => {
    router.push('/student/performance');
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg font-medium">{t.loading}</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {language === 'en' ? 'Error Loading Results' : 'Erreur de Chargement des Résultats'}
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {language === 'en' ? 'Retry' : 'Réessayer'}
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t.pageTitle}</h1>
          <Button variant="outline" onClick={toggleLanguage}>
            {t.switchToFrench}
          </Button>
        </div>

        {/* Candidate Information Card */}
        <Card className="mb-8 shadow-md">
          <CardHeader className="bg-slate-50">
            <CardTitle>{t.candidateInfo}</CardTitle>
            <CardDescription>
              {resultsVerified ? (
                <div className="flex items-center mt-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 py-1">
                    <Award className="h-3 w-3" />
                    {t.verifyResults}
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center mt-2">
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1 py-1">
                    <AlertCircle className="h-3 w-3" />
                    {t.resultsNotVerified}
                  </Badge>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="rounded-md overflow-hidden border border-gray-200">
                  <Image
                    src={studentInfo.photo}
                    alt={studentInfo.name}
                    width={120}
                    height={120}
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                <div>
                  <p className="text-sm text-gray-500">{t.candidateNumber}</p>
                  <p className="font-medium">{studentInfo.candidateNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t.examCenter}</p>
                  <p className="font-medium">{studentInfo.center}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t.examSession}</p>
                  <p className="font-medium">{studentInfo.examSession}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t.examLevel}</p>
                  <p className="font-medium">{studentInfo.level}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Tabs */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.resultsTitle}</h2>
          <Tabs defaultValue="aLevel" className="w-full">
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="oLevel">{t.oLevel}</TabsTrigger>
              <TabsTrigger value="aLevel">{t.aLevel}</TabsTrigger>
            </TabsList>

            {/* O Level Results */}
            <TabsContent value="oLevel">
              <Card>
                <CardHeader className="bg-blue-50">
                  <div className="flex justify-between items-center">
                    <CardTitle>{t.oLevel} ({resultsData.oLevel.year})</CardTitle>
                    <Badge className="bg-blue-600">{t.overallGrade}: {resultsData.oLevel.overallGrade}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-gray-600">{t.subject}</th>
                          <th className="px-6 py-3 text-gray-600">{t.grade}</th>
                          <th className="px-6 py-3 text-gray-600">{t.score}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultsData.oLevel.subjects.map((subject, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="px-6 py-4">{subject.name}</td>
                            <td className="px-6 py-4">
                              <Badge className={`${
                                subject.grade === 'A*' || subject.grade === 'A' ? 'bg-green-600' :
                                subject.grade === 'B' ? 'bg-blue-600' :
                                subject.grade === 'C' ? 'bg-yellow-600' :
                                'bg-red-600'
                              }`}>
                                {subject.grade}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">{subject.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between py-4 bg-slate-50">
                  <Button variant="outline" onClick={handleViewPerformance}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {t.viewPerformance}
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrintResults}>
                      <Printer className="mr-2 h-4 w-4" />
                      {t.printResults}
                    </Button>
                    <Button variant="default">
                      <Download className="mr-2 h-4 w-4" />
                      {t.downloadResults}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* A Level Results */}
            <TabsContent value="aLevel">
              <Card>
                <CardHeader className="bg-indigo-50">
                  <div className="flex justify-between items-center">
                    <CardTitle>{t.aLevel} ({resultsData.aLevel.year})</CardTitle>
                    <Badge className="bg-indigo-600">{t.overallGrade}: {resultsData.aLevel.overallGrade}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-gray-600">{t.subject}</th>
                          <th className="px-6 py-3 text-gray-600">{t.grade}</th>
                          <th className="px-6 py-3 text-gray-600">{t.score}</th>
                          <th className="px-6 py-3 text-gray-600">{t.ucasPoints}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultsData.aLevel.subjects.map((subject, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="px-6 py-4">{subject.name}</td>
                            <td className="px-6 py-4">
                              <Badge className={`${
                                subject.grade === 'A*' ? 'bg-green-700' :
                                subject.grade === 'A' ? 'bg-green-600' :
                                subject.grade === 'B' ? 'bg-blue-600' :
                                subject.grade === 'C' ? 'bg-yellow-600' :
                                'bg-red-600'
                              }`}>
                                {subject.grade}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">{subject.score}</td>
                            <td className="px-6 py-4">{subject.ucasPoints}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-semibold">
                          <td colSpan={3} className="px-6 py-4 text-right">{t.totalUCASPoints}:</td>
                          <td className="px-6 py-4">{resultsData.aLevel.totalUCASPoints}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between py-4 bg-slate-50">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleViewPerformance}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      {t.viewPerformance}
                    </Button>
                    <Button variant="secondary">
                      <Award className="mr-2 h-4 w-4" />
                      {t.downloadCertificate}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrintResults}>
                      <Printer className="mr-2 h-4 w-4" />
                      {t.printResults}
                    </Button>
                    <Button variant="default">
                      <Download className="mr-2 h-4 w-4" />
                      {t.downloadResults}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Verification Details */}
        {resultsVerified && (
          <Card className="shadow-md mb-8">
            <CardHeader>
              <CardTitle>{t.verificationDetails}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t.resultsID}</p>
                  <p className="font-medium">RES-25-CM-9874563</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t.verificationCode}</p>
                  <p className="font-medium">VGCE-8742-ABCD-5698</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t.verificationDate}</p>
                  <p className="font-medium">15 May 2025</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end py-4">
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                {t.shareResults}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
}