'use client';

import { useState } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/layouts/layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Calendar,
  FileText,
  Trophy,
  Award,
  Clock,
  AlertCircle,
  Download,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock data - Replace with actual API calls
const studentInfo = {
  id: 'GCE2025-78956',
  name: 'Jean-Michel Fopa',
  photo: '/api/placeholder/120/120', // Placeholder
  center: 'GBHS Limbe',
  level: 'Advanced Level (A Level)',
  registrationStatus: 'Confirmed',
  examStatus: 'Upcoming',
  subjects: [
    { code: 'ALG', name: 'English Literature', status: 'Registered' },
    { code: 'AFR', name: 'French', status: 'Registered' },
    { code: 'AMH', name: 'Mathematics', status: 'Registered' },
    { code: 'APY', name: 'Physics', status: 'Registered' },
    { code: 'ACY', name: 'Chemistry', status: 'Registered' }
  ],
  notifications: [
    { id: 1, type: 'info', message: 'Examination timetable has been released', date: '2025-05-12' },
    { id: 2, type: 'warning', message: 'Confirm your examination center details', date: '2025-05-10' },
    { id: 3, type: 'success', message: 'Registration successfully processed', date: '2025-04-28' }
  ],
  upcomingExams: [
    { subject: 'English Literature', date: '2025-06-10', time: '09:00 - 12:00', center: 'GBHS Limbe, Hall A' },
    { subject: 'French', date: '2025-06-12', time: '09:00 - 12:00', center: 'GBHS Limbe, Hall A' },
    { subject: 'Mathematics', date: '2025-06-15', time: '09:00 - 12:00', center: 'GBHS Limbe, Hall B' },
    { subject: 'Physics', date: '2025-06-17', time: '09:00 - 12:00', center: 'GBHS Limbe, Hall A' },
    { subject: 'Chemistry', date: '2025-06-19', time: '09:00 - 12:00', center: 'GBHS Limbe, Hall B' }
  ],
  pastResults: {
    OLevel: {
      year: 2023,
      overall: 'A',
      subjects: [
        { name: 'English Language', grade: 'A' },
        { name: 'Mathematics', grade: 'A' },
        { name: 'Physics', grade: 'B' },
        { name: 'Chemistry', grade: 'A' },
        { name: 'Biology', grade: 'B' },
        { name: 'Geography', grade: 'A' },
        { name: 'Computer Science', grade: 'A' }
      ]
    }
  }
};

// Simple Progress component
const Progress = ({ value, className }: { value: number, className?: string }) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full ${className}`}>
      <div
        className="bg-blue-600 rounded-full h-full"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};

const StudentDashboard = () => {
  const [language, setLanguage] = useState<'english' | 'french'>('english');

  // Translation function - In a real app, use a proper i18n library
  const t = (english: string, french: string) => {
    return language === 'english' ? english : french;
  };

  // Toggle language
  const toggleLanguage = () => {
    setLanguage(language === 'english' ? 'french' : 'english');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* Header with language toggle and profile banner */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {t('Student Dashboard', 'Tableau de Bord de l\'Étudiant')}
          </h1>
          <Button
            variant="outline"
            onClick={toggleLanguage}
            className="flex items-center gap-2"
          >
            {language === 'english' ? 'Français' : 'English'}
          </Button>
        </div>

        {/* Student Profile Banner */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white">
                <Image
                  src={studentInfo.photo}
                  alt={studentInfo.name}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{studentInfo.name}</h2>
                <p className="text-blue-100">{t('Candidate ID:', 'ID du Candidat:')} {studentInfo.id}</p>
                <div className="flex gap-4 mt-2">
                  <Badge className="bg-white text-blue-700">
                    {studentInfo.level}
                  </Badge>
                  <Badge className="bg-green-500">
                    {t('Registration: ', 'Inscription: ')} {studentInfo.registrationStatus}
                  </Badge>
                </div>
              </div>
              <div>
                <Button className="bg-white text-blue-700 hover:bg-blue-50">
                  {t('Download ID Card', 'Télécharger Carte d\'identité')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="overview">
              {t('Overview', 'Aperçu')}
            </TabsTrigger>
            <TabsTrigger value="exams">
              {t('Upcoming Exams', 'Examens à Venir')}
            </TabsTrigger>
            <TabsTrigger value="results">
              {t('Results', 'Résultats')}
            </TabsTrigger>
            <TabsTrigger value="documents">
              {t('Documents', 'Documents')}
            </TabsTrigger>
            <TabsTrigger value="support">
              {t('Support', 'Assistance')}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Registration Status */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    {t('Registration Status', 'Statut d\'Inscription')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span>
                        {t('Payment Status:', 'Statut de Paiement:')}
                      </span>
                      <Badge className="bg-green-600">
                        {t('Paid', 'Payé')}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>
                        {t('Subjects Registered:', 'Matières Inscrites:')}
                      </span>
                      <span className="font-medium">{studentInfo.subjects.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>
                        {t('Examination Center:', 'Centre d\'Examen:')}
                      </span>
                      <span className="font-medium">{studentInfo.center}</span>
                    </div>
                    <Button variant="outline" className="mt-2">
                      {t('View Details', 'Voir les Détails')}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    {t('Notifications', 'Notifications')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    {studentInfo.notifications.map(notification => (
                      <div key={notification.id} className="flex items-start gap-3 py-2 border-b last:border-0">
                        {notification.type === 'warning' && (
                          <span className="text-orange-500 mt-1"><AlertCircle size={16} /></span>
                        )}
                        {notification.type === 'info' && (
                          <span className="text-blue-500 mt-1"><Clock size={16} /></span>
                        )}
                        {notification.type === 'success' && (
                          <span className="text-green-500 mt-1"><Trophy size={16} /></span>
                        )}
                        <div className="flex-1">
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-gray-500">{notification.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Next Exam Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    {t('Next Examination', 'Prochain Examen')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">
                        {studentInfo.upcomingExams[0].subject}
                      </h3>
                      <Badge>
                        {studentInfo.upcomingExams[0].date}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-sm">
                        <span>{t('Time:', 'Heure:')}</span>
                        <span className="font-medium">{studentInfo.upcomingExams[0].time}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{t('Location:', 'Lieu:')}</span>
                        <span className="font-medium">{studentInfo.upcomingExams[0].center}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-1">{t('Countdown:', 'Compte à rebours:')}</p>
                      <Progress value={65} className="h-2" />
                      <p className="text-xs text-right mt-1 text-gray-500">
                        {t('23 days remaining', '23 jours restants')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Registered Subjects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  {t('Registered Subjects', 'Matières Inscrites')}
                </CardTitle>
                <CardDescription>
                  {t('Subjects you\'re registered for in the upcoming examination',
                     'Matières pour lesquelles vous êtes inscrit pour le prochain examen')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studentInfo.subjects.map((subject) => (
                    <div
                      key={subject.code}
                      className="p-4 border rounded-md flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-semibold">
                          {subject.code[1]}
                        </div>
                        <div>
                          <p className="font-medium">{subject.name}</p>
                          <p className="text-xs text-gray-500">{t('Code:', 'Code:')} {subject.code}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                        {subject.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upcoming Exams Tab Content */}
          <TabsContent value="exams" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  {t('Examination Timetable', 'Calendrier des Examens')}
                </CardTitle>
                <CardDescription>
                  {t('Your personal examination schedule for the upcoming GCE',
                     'Votre calendrier personnel d\'examens pour le prochain GCE')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentInfo.upcomingExams.map((exam, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-800 font-semibold">
                          {exam.date.split('-')[2]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{exam.subject}</h3>
                          <p className="text-sm text-gray-600">{exam.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Clock size={14} className="text-gray-500" />
                            <span>{exam.time}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <BookOpen size={14} className="text-gray-500" />
                            <span>{exam.center}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          {t('Set Reminder', 'Définir un Rappel')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  {t('Examination Guidelines', 'Consignes d\'Examen')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                    <h3 className="font-medium mb-2 text-blue-800">
                      {t('Important Reminders', 'Rappels Importants')}
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>{t('Arrive at least 30 minutes before the scheduled examination time',
                            'Arrivez au moins 30 minutes avant l\'heure prévue de l\'examen')}</li>
                      <li>{t('Bring your candidate ID card and admission notice',
                            'Apportez votre carte de candidat et votre avis d\'admission')}</li>
                      <li>{t('Bring appropriate stationery (pens, pencils, ruler, calculator if permitted)',
                            'Apportez les fournitures appropriées (stylos, crayons, règle, calculatrice si autorisée)')}</li>
                      <li>{t('Mobile phones and electronic devices are strictly prohibited',
                            'Les téléphones portables et appareils électroniques sont strictement interdits')}</li>
                    </ul>
                  </div>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    {t('Download Complete Examination Guidelines', 'Télécharger les Consignes Complètes d\'Examen')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab Content */}
          <TabsContent value="results" className="space-y-6">
            {studentInfo.pastResults ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-blue-600" />
                      {t('Previous Results: O Level (2023)', 'Résultats Précédents: O Level (2023)')}
                    </CardTitle>
                    <CardDescription>
                      {t('Your General Certificate of Education Ordinary Level Results',
                         'Vos Résultats du Certificat Général d\'Éducation Niveau Ordinaire')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="sm:w-1/3">
                        <div className="bg-blue-50 p-6 rounded-lg text-center">
                          <p className="text-sm text-blue-700 mb-1">{t('Overall Grade', 'Note Globale')}</p>
                          <div className="text-5xl font-bold text-blue-700 flex justify-center">
                            {studentInfo.pastResults.OLevel.overall}
                          </div>
                          <div className="mt-4 flex justify-center">
                            <Badge className="bg-blue-700">{t('Passed', 'Réussi')}</Badge>
                          </div>
                          <Button variant="outline" className="mt-4 w-full">
                            <Download className="h-4 w-4 mr-2" />
                            {t('Download Certificate', 'Télécharger le Certificat')}
                          </Button>
                        </div>
                      </div>
                      <div className="sm:w-2/3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {studentInfo.pastResults.OLevel.subjects.map((subject, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-3 border rounded-md"
                            >
                              <span>{subject.name}</span>
                              <Badge
                                className={`${
                                  subject.grade === 'A' ? 'bg-green-600' :
                                  subject.grade === 'B' ? 'bg-blue-600' :
                                  subject.grade === 'C' ? 'bg-yellow-600' :
                                  'bg-gray-600'
                                }`}
                              >
                                {subject.grade}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      {t('Performance Analytics', 'Analyse de Performance')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-4 border rounded-md bg-gray-50">
                      <p>
                        {t('Detailed performance analytics for A Level will be available after your examinations',
                          'Les analyses détaillées de performance pour le niveau A seront disponibles après vos examens')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Award className="h-16 w-16 text-gray-300" />
                    <h3 className="text-xl font-medium">
                      {t('No Results Available Yet', 'Aucun Résultat Disponible Pour le Moment')}
                    </h3>
                    <p className="text-gray-500">
                      {t('Your examination results will appear here after they are published',
                        'Vos résultats d\'examen apparaîtront ici après leur publication')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  {t('Your Documents', 'Vos Documents')}
                </CardTitle>
                <CardDescription>
                  {t('Access and download your examination documents',
                     'Accédez et téléchargez vos documents d\'examen')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border rounded-md p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded">
                          <FileText className="h-5 w-5 text-blue-700" />
                        </div>
                        <h3 className="font-medium">
                          {t('Registration Receipt', 'Reçu d\'Inscription')}
                        </h3>
                      </div>
                      <Badge>{t('PDF', 'PDF')}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 flex-grow">
                      {t('Proof of registration for the 2025 A Level examinations',
                         'Preuve d\'inscription pour les examens A Level 2025')}
                    </p>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      {t('Download', 'Télécharger')}
                    </Button>
                  </div>

                  <div className="border rounded-md p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded">
                          <FileText className="h-5 w-5 text-blue-700" />
                        </div>
                        <h3 className="font-medium">
                          {t('Examination Timetable', 'Calendrier d\'Examen')}
                        </h3>
                      </div>
                      <Badge>{t('PDF', 'PDF')}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 flex-grow">
                      {t('Personal examination schedule for June 2025',
                         'Calendrier personnel d\'examen pour juin 2025')}
                    </p>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      {t('Download', 'Télécharger')}
                    </Button>
                  </div>

                  <div className="border rounded-md p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded">
                          <FileText className="h-5 w-5 text-blue-700" />
                        </div>
                        <h3 className="font-medium">
                          {t('O Level Certificate', 'Certificat O Level')}
                        </h3>
                      </div>
                      <Badge>{t('PDF', 'PDF')}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 flex-grow">
                      {t('Your 2023 O Level examination certificate',
                         'Votre certificat d\'examen O Level 2023')}
                    </p>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      {t('Download', 'Télécharger')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  {t('Request Documents', 'Demande de Documents')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button>
                    {t('Request Result Verification', 'Demander une Vérification des Résultats')}
                  </Button>
                  <Button>
                    {t('Request Duplicate Certificate', 'Demander un Duplicata de Certificat')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t('Support & Help Center', 'Centre d\'Assistance et d\'Aide')}
                </CardTitle>
                <CardDescription>
                  {t('Get help with your examination process',
                     'Obtenez de l\'aide pour votre processus d\'examen')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-md p-6">
                    <h3 className="font-semibold text-lg mb-4">
                      {t('Frequently Asked Questions', 'Questions Fréquemment Posées')}
                    </h3>
                    <div className="space-y-3">
                      <div className="border-b pb-3">
                        <p className="font-medium text-blue-700 hover:underline cursor-pointer">
                          {t('How can I update my personal information?',
                             'Comment puis-je mettre à jour mes informations personnelles?')}
                        </p>
                      </div>
                      <div className="border-b pb-3">
                        <p className="font-medium text-blue-700 hover:underline cursor-pointer">
                          {t('What do I do if I lose my examination slip?',
                             'Que faire si je perds ma convocation d\'examen?')}
                        </p>
                      </div>
                      <div className="border-b pb-3">
                        <p className="font-medium text-blue-700 hover:underline cursor-pointer">
                          {t('How can I apply for a remark of my scripts?',
                             'Comment puis-je demander une révision de mes copies?')}
                        </p>
                      </div>
                      <div className="pb-3">
                        <p className="font-medium text-blue-700 hover:underline cursor-pointer">
                          {t('What identification is required on examination day?',
                             'Quelle identification est requise le jour de l\'examen?')}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      {t('View All FAQs', 'Voir Toutes les FAQ')}
                    </Button>
                  </div>

                  <div className="border rounded-md p-6">
                    <h3 className="font-semibold text-lg mb-4">
                      {t('Contact Support', 'Contacter le Support')}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <FileText className="h-5 w-5 text-blue-700" />
                        </div>
                        <div>
                          <p className="font-medium">{t('Email Support', 'Support par Email')}</p>
                          <p className="text-sm text-gray-500">support@gceboard.cm</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {t('Response time: Within 24 hours', 'Temps de réponse: Sous 24 heures')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <FileText className="h-5 w-5 text-blue-700" />
                        </div>
                        <div>
                          <p className="font-medium">{t('Phone Support', 'Support Téléphonique')}</p>
                          <p className="text-sm text-gray-500">+237 222 123 456</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {t('Available: Mon-Fri, 8AM-4PM', 'Disponible: Lun-Ven, 8h-16h')}
                          </p>
                        </div>
                      </div>

                      <Button className="w-full mt-2">
                        {t('Submit Support Ticket', 'Soumettre un Ticket de Support')}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {t('Examination Resources', 'Ressources d\'Examen')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto py-6 flex flex-col">
                    <BookOpen className="h-8 w-8 mb-2" />
                    <span>{t('Study Resources', 'Ressources d\'Étude')}</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-6 flex flex-col">
                    <FileText className="h-8 w-8 mb-2" />
                    <span>{t('Past Papers', 'Anciens Sujets')}</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-6 flex flex-col">
                    <Calendar className="h-8 w-8 mb-2" />
                    <span>{t('Exam Preparation Guide', 'Guide de Préparation aux Examens')}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default StudentDashboard;