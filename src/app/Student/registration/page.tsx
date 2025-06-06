
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentLayout from '@/components/layouts/StudentLayout';
import Image from 'next/image';
import { CheckCircle, AlertTriangle, Download, Printer, Share2, Loader2, RefreshCw, User } from 'lucide-react';
import { useStudentProfile } from '@/lib/hooks/useStudent';
import ProfilePicture from '@/components/ProfilePicture';

// Define types
interface Subject {
  code: string;
  name: string;
  status: 'confirmed' | 'pending';
}

interface RegistrationData {
  status: 'confirmed' | 'pending';
  studentId: string;
  fullName: string;
  photoUrl: string | null; // Allow null for no profile picture
  examLevel: string;
  examCenter: string;
  centerCode: string;
  subjects: Subject[];
  paymentStatus: string;
  paymentReference: string;
  registrationDate: string;
  examDates: string;
  admissionCardStatus: 'ready' | 'not-ready';
}

// Get current student ID from localStorage or use default
const getCurrentStudentId = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userId') || 'GCE2025-ST-003421';
  }
  return 'GCE2025-ST-003421';
};

const RegistrationConfirmation = () => {
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'fr'>('en'); // 'en' for English, 'fr' for French

  // Get student registration data from API
  const studentId = getCurrentStudentId();
  const { data: studentData, loading: isLoading, error, refetch } = useStudentProfile(studentId);

  // Transform API data to match our interface
  const registrationData: RegistrationData | null = studentData ? {
    status: (studentData as any).registrationStatus === 'confirmed' ? 'confirmed' : 'pending',
    studentId: (studentData as any).id || studentId,
    fullName: (studentData as any).fullName || 'Student',
    photoUrl: (studentData as any).profilePicturePath || null, // Use real profile picture path
    examLevel: (studentData as any).examLevel || 'Advanced Level (A Level)',
    examCenter: (studentData as any).examCenter || 'Default Center',
    centerCode: (studentData as any).centerCode || 'DC-001',
    subjects: (studentData as any).subjects || [],
    paymentStatus: 'completed',
    paymentReference: `PMT-GCE-2025-${Date.now().toString().slice(-6)}`,
    registrationDate: (studentData as any).createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
    examDates: '2025-05-22 to 2025-06-18',
    admissionCardStatus: (studentData as any).registrationStatus === 'confirmed' ? 'ready' : 'not-ready',
  } : null;

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  type TranslationKeys =
    'title' | 'loading' | 'studentId' | 'examLevel' | 'examCenter' | 'centerCode' |
    'subjects' | 'subjectCode' | 'subjectName' | 'subjectStatus' | 'paymentStatus' |
    'paymentReference' | 'registrationDate' | 'examDates' | 'admissionStatus' |
    'confirmed' | 'pending' | 'completed' | 'ready' | 'notReady' | 'downloadAdmissionCard' |
    'printConfirmation' | 'shareDetails' | 'registrationComplete' | 'registrationPending' |
    'backToDashboard';

  type Translations = {
    [key in 'en' | 'fr']: {
      [key in TranslationKeys]: string;
    }
  };

  const translations: Translations = {
    en: {
      title: 'Registration Confirmation',
      loading: 'Loading your registration details...',
      studentId: 'Student ID',
      examLevel: 'Examination Level',
      examCenter: 'Examination Center',
      centerCode: 'Center Code',
      subjects: 'Registered Subjects',
      subjectCode: 'Code',
      subjectName: 'Subject',
      subjectStatus: 'Status',
      paymentStatus: 'Payment Status',
      paymentReference: 'Payment Reference',
      registrationDate: 'Registration Date',
      examDates: 'Examination Dates',
      admissionStatus: 'Admission Card',
      confirmed: 'Confirmed',
      pending: 'Pending Approval',
      completed: 'Completed',
      ready: 'Ready for Download',
      notReady: 'Not Available Yet',
      downloadAdmissionCard: 'Download Admission Card',
      printConfirmation: 'Print Confirmation',
      shareDetails: 'Share Details',
      registrationComplete: 'Registration Complete',
      registrationPending: 'Registration Pending',
      backToDashboard: 'Back to Dashboard',
    },
    fr: {
      title: 'Confirmation d\'Inscription',
      loading: 'Chargement de vos détails d\'inscription...',
      studentId: 'ID d\'Étudiant',
      examLevel: 'Niveau d\'Examen',
      examCenter: 'Centre d\'Examen',
      centerCode: 'Code du Centre',
      subjects: 'Matières Inscrites',
      subjectCode: 'Code',
      subjectName: 'Matière',
      subjectStatus: 'Statut',
      paymentStatus: 'Statut de Paiement',
      paymentReference: 'Référence de Paiement',
      registrationDate: 'Date d\'Inscription',
      examDates: 'Dates d\'Examen',
      admissionStatus: 'Carte d\'Admission',
      confirmed: 'Confirmé',
      pending: 'En Attente d\'Approbation',
      completed: 'Complété',
      ready: 'Prêt à Télécharger',
      notReady: 'Pas Encore Disponible',
      downloadAdmissionCard: 'Télécharger la Carte d\'Admission',
      printConfirmation: 'Imprimer la Confirmation',
      shareDetails: 'Partager les Détails',
      registrationComplete: 'Inscription Complète',
      registrationPending: 'Inscription en Attente',
      backToDashboard: 'Retour au Tableau de Bord',
    }
  };

  const t = translations[language];

  const handleDownloadAdmissionCard = () => {
    // Logic to download admission card
    alert('Downloading admission card...');
  };

  const handlePrintConfirmation = () => {
    window.print();
  };

  const handleShareDetails = () => {
    // Logic to share details
    if (!registrationData) return;

    if (navigator.share) {
      navigator.share({
        title: 'GCE Registration Confirmation',
        text: `GCE Registration Details for ${registrationData.fullName}`,
        url: window.location.href,
      });
    } else {
      alert('Sharing is not supported on this browser');
    }
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50">
          <div className="w-full max-w-3xl px-4 py-8 mx-auto bg-white rounded-lg shadow-md">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
              <h2 className="text-xl font-semibold text-gray-700">{t.loading}</h2>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <StudentLayout>
        <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50">
          <div className="w-full max-w-3xl px-4 py-8 mx-auto bg-white rounded-lg shadow-md">
            <div className="flex flex-col items-center justify-center space-y-4">
              <AlertTriangle className="w-16 h-16 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-700">
                {language === 'en' ? 'Error Loading Registration' : 'Erreur de Chargement de l\'Inscription'}
              </h2>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={refetch}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Retry' : 'Réessayer'}
              </button>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // If we have data but it's not loading, render the confirmation page
  if (!isLoading && registrationData) {
    return (
      <StudentLayout>
        <div className="min-h-screen py-12 bg-gray-50 print:bg-white">
          <div className="w-full max-w-4xl px-4 mx-auto">
            {/* Language Toggle */}
            <div className="flex justify-end mb-4 print:hidden">
              <button
                onClick={toggleLanguage}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {language === 'en' ? 'Français' : 'English'}
              </button>
            </div>

          {/* Main Card */}
          <div className="overflow-hidden bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-800 print:from-blue-600 print:to-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Image
                    src="/images/GCEB.png"
                    alt="GCE Board Logo"
                    width={60}
                    height={60}
                    className="rounded-full bg-white p-1"
                  />
                  <div>
                    <h1 className="text-xl font-bold text-white">
                      {t.title}
                    </h1>
                    <p className="text-blue-100">
                      Cameroon GCE Board - {new Date().getFullYear()}
                    </p>
                  </div>
                </div>
                <div className="hidden md:block">
                  {registrationData.status === 'confirmed' ? (
                    <div className="flex items-center px-4 py-2 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {t.registrationComplete}
                    </div>
                  ) : (
                    <div className="flex items-center px-4 py-2 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      {t.registrationPending}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Student Photo and Basic Info */}
                <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg md:col-span-1">
                  {registrationData.photoUrl ? (
                    <Image
                      src={registrationData.photoUrl}
                      alt="Student Photo"
                      width={120}
                      height={150}
                      className="object-cover border-2 border-gray-300 rounded-lg"
                    />
                  ) : (
                    <div className="w-[120px] h-[150px] border-2 border-gray-300 rounded-lg bg-gray-100 flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <h2 className="mt-4 text-xl font-semibold text-gray-800">{registrationData.fullName}</h2>
                  <div className="w-full mt-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">{t.studentId}</span>
                      <span className="font-medium text-gray-800">{registrationData.studentId}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">{t.examLevel}</span>
                      <span className="font-medium text-gray-800">{registrationData.examLevel}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">{t.registrationDate}</span>
                      <span className="font-medium text-gray-800">{registrationData.registrationDate}</span>
                    </div>
                  </div>
                </div>

                {/* Exam and Payment Details */}
                <div className="p-4 border border-gray-200 rounded-lg md:col-span-2">
                  <h3 className="mb-4 text-lg font-semibold text-gray-800">{t.examCenter}</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">{t.examCenter}</p>
                      <p className="font-medium text-gray-800">{registrationData.examCenter}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">{t.centerCode}</p>
                      <p className="font-medium text-gray-800">{registrationData.centerCode}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">{t.examDates}</p>
                      <p className="font-medium text-gray-800">{registrationData.examDates}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">{t.admissionStatus}</p>
                      <p className="font-medium text-green-600">
                        {registrationData.admissionCardStatus === 'ready' ? t.ready : t.notReady}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">{t.paymentStatus}</p>
                      <p className="font-medium text-green-600">{t.completed}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">{t.paymentReference}</p>
                      <p className="font-medium text-gray-800">{registrationData.paymentReference}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subjects */}
              <div className="mt-6 overflow-hidden border border-gray-200 rounded-lg">
                <h3 className="px-6 py-3 text-lg font-semibold text-gray-800 bg-gray-50">{t.subjects}</h3>
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-sm font-medium text-left text-gray-500 uppercase">{t.subjectCode}</th>
                      <th className="px-6 py-3 text-sm font-medium text-left text-gray-500 uppercase">{t.subjectName}</th>
                      <th className="px-6 py-3 text-sm font-medium text-left text-gray-500 uppercase">{t.subjectStatus}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {registrationData.subjects.map((subject) => (
                      <tr key={subject.code} className="bg-white">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{subject.code}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{subject.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {subject.status === 'confirmed' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {t.confirmed}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {t.pending}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-6 print:hidden">
                <button
                  onClick={handleDownloadAdmissionCard}
                  disabled={registrationData.admissionCardStatus !== 'ready'}
                  className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-md ${
                    registrationData.admissionCardStatus === 'ready'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.downloadAdmissionCard}
                </button>
                <button
                  onClick={handlePrintConfirmation}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  {t.printConfirmation}
                </button>
                <button
                  onClick={handleShareDetails}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {t.shareDetails}
                </button>
              </div>

              {/* Back to Dashboard */}
              <div className="mt-6 text-center print:hidden">
                <button
                  onClick={() => router.push('/student/dashboard')}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  &larr; {t.backToDashboard}
                </button>
              </div>

              {/* Print watermark - Only visible when printing */}
              <div className="items-center justify-center hidden print:flex">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 text-gray-200 text-6xl font-bold opacity-20">
                  GCE BOARD CAMEROON
                </div>
              </div>
            </div>
          </div>

          {/* QR Code for Verification - Only visible in print */}
          <div className="hidden mt-4 print:block">
            <div className="flex items-center justify-center p-4 bg-white border border-gray-200 rounded">
              <div className="text-center">
                <Image
                  src="/api/placeholder/100/100"
                  alt="Verification QR Code"
                  width={100}
                  height={100}
                />
                <p className="mt-2 text-sm text-gray-500">Scan to verify registration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
  }

  // Fallback for unexpected state
  return (
    <StudentLayout>
      <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50">
        <div className="w-full max-w-3xl px-4 py-8 mx-auto bg-white rounded-lg shadow-md">
          <div className="flex flex-col items-center justify-center space-y-4">
            <AlertTriangle className="w-16 h-16 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-700">
              {language === 'en' ? 'Something went wrong' : 'Quelque chose s\'est mal passé'}
            </h2>
            <button
              onClick={() => router.push('/student/dashboard')}
              className="px-4 py-2 mt-4 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {language === 'en' ? 'Back to Dashboard' : 'Retour au Tableau de Bord'}
            </button>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default RegistrationConfirmation;