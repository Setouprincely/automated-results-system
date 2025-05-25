'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ExaminerLayout from '@/components/layouts/ExaminerLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ClipboardList,
  Bell,
  Search,
  CheckCircle,
  Shield,
  Timer
} from 'lucide-react';

// Types
type ScriptStatus = 'Pending' | 'In Progress' | 'Completed' | 'Verification';

interface Script {
  id: string;
  subject: string;
  level: string;
  center: string;
  candidate: string;
  status: ScriptStatus;
  deadline: string;
}

interface ExaminerStats {
  assignedScripts: number;
  completedScripts: number;
  pendingVerification: number;
  averageMarkingTime: string;
  accuracyRate: string;
  consistencyScore: string;
}

// Mock data - would be fetched from API in production
const assignedScripts: Script[] = [
  {
    id: 'SCR001',
    subject: 'Mathematics',
    level: 'A Level',
    center: 'Government Bilingual High School Buea',
    candidate: 'CM2023001',
    status: 'Pending',
    deadline: '2025-05-25',
  },
  {
    id: 'SCR002',
    subject: 'Mathematics',
    level: 'A Level',
    center: 'Government High School Bamenda',
    candidate: 'CM2023045',
    status: 'In Progress',
    deadline: '2025-05-25',
  },
  {
    id: 'SCR003',
    subject: 'Mathematics',
    level: 'A Level',
    center: 'Baptist High School Douala',
    candidate: 'CM2023078',
    status: 'Completed',
    deadline: '2025-05-24',
  },
  {
    id: 'SCR004',
    subject: 'Mathematics',
    level: 'A Level',
    center: 'Presbyterian Secondary School Yaoundé',
    candidate: 'CM2023112',
    status: 'Verification',
    deadline: '2025-05-23',
  },
  {
    id: 'SCR005',
    subject: 'Mathematics',
    level: 'A Level',
    center: 'Government High School Limbe',
    candidate: 'CM2023156',
    status: 'Pending',
    deadline: '2025-05-25',
  },
];



const examinerStats: ExaminerStats = {
  assignedScripts: 50,
  completedScripts: 27,
  pendingVerification: 8,
  averageMarkingTime: '18 minutes',
  accuracyRate: '94%',
  consistencyScore: '91%'
};

export default function ExaminerDashboard() {
  const [language, setLanguage] = useState<'en' | 'fr'>('en'); // 'en' for English, 'fr' for French
  const router = useRouter();

  const handleNavigateToScript = (scriptId: string) => {
    router.push(`/Examinar/mark-script/${scriptId}`);
  };

  const getStatusBadge = (status: ScriptStatus) => {
    const statusMap = {
      'Pending': { variant: 'outline', label: language === 'en' ? 'Pending' : 'En attente' },
      'In Progress': { variant: 'default', label: language === 'en' ? 'In Progress' : 'En cours' },
      'Completed': { variant: 'success', label: language === 'en' ? 'Completed' : 'Terminé' },
      'Verification': { variant: 'warning', label: language === 'en' ? 'Verification' : 'Vérification' },
    };

    const { variant, label } = statusMap[status];

    return <Badge variant={variant as any}>{label}</Badge>;
  };

  // Calculate completion percentage
  const completionPercentage = Math.round((examinerStats.completedScripts / examinerStats.assignedScripts) * 100);

  return (
    <ExaminerLayout>
      <div className="container mx-auto p-6">
        {/* Welcome header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              {language === 'en' ? 'Examiner Dashboard' : 'Tableau de Bord de l\'Examinateur'}
            </h1>
            <p className="text-gray-500 mt-1">
              {language === 'en'
                ? 'Welcome back, Dr. Nkeng. You have 23 scripts pending review.'
                : 'Bienvenue, Dr. Nkeng. Vous avez 23 copies en attente de correction.'}
            </p>
          </div>
          <div className="flex items-center mt-4 md:mt-0">
            <Button variant="outline" size="icon" className="mr-2">
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="default"
              className="flex items-center"
              onClick={() => router.push('/Examinar/search-scripts')}
            >
              <Search className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Search Scripts' : 'Rechercher des Copies'}
            </Button>
            <Button
              variant="ghost"
              className="ml-2"
              onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
            >
              {language === 'en' ? 'FR' : 'EN'}
            </Button>
          </div>
        </div>

        {/* Dashboard overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="p-2 bg-blue-100 rounded-full mb-4">
                  <ClipboardList className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold">{examinerStats.assignedScripts}</div>
                <p className="text-gray-500 text-sm">
                  {language === 'en' ? 'Assigned Scripts' : 'Copies Assignées'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="p-2 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold">{examinerStats.completedScripts}</div>
                <p className="text-gray-500 text-sm">
                  {language === 'en' ? 'Completed Scripts' : 'Copies Complétées'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="p-2 bg-yellow-100 rounded-full mb-4">
                  <Shield className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="text-3xl font-bold">{examinerStats.pendingVerification}</div>
                <p className="text-gray-500 text-sm">
                  {language === 'en' ? 'Pending Verification' : 'En Attente de Vérification'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="p-2 bg-purple-100 rounded-full mb-4">
                  <Timer className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-3xl font-bold">{examinerStats.averageMarkingTime}</div>
                <p className="text-gray-500 text-sm">
                  {language === 'en' ? 'Avg. Marking Time' : 'Temps Moyen de Correction'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>
                {language === 'en' ? 'Marking Progress' : 'Progression des Corrections'}
              </CardTitle>
              <Badge variant="default">
                {language === 'en'
                  ? `${completionPercentage}% Complete`
                  : `${completionPercentage}% Terminé`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <div>
                {language === 'en'
                  ? `${examinerStats.completedScripts} of ${examinerStats.assignedScripts} scripts marked`
                  : `${examinerStats.completedScripts} sur ${examinerStats.assignedScripts} copies corrigées`}
              </div>
              <div>
                {language === 'en'
                  ? 'Deadline: May 30, 2025'
                  : 'Date limite: 30 mai 2025'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scripts table */}
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>
                {language === 'en' ? 'Assigned Scripts' : 'Copies Assignées'}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/Examinar/all-scripts')}
              >
                {language === 'en' ? 'View All' : 'Voir Tout'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">{language === 'en' ? 'Script ID' : 'ID de Copie'}</th>
                    <th className="text-left p-4 font-medium">{language === 'en' ? 'Subject' : 'Matière'}</th>
                    <th className="text-left p-4 font-medium">{language === 'en' ? 'Center' : 'Centre'}</th>
                    <th className="text-left p-4 font-medium">{language === 'en' ? 'Candidate' : 'Candidat'}</th>
                    <th className="text-left p-4 font-medium">{language === 'en' ? 'Status' : 'Statut'}</th>
                    <th className="text-right p-4 font-medium">{language === 'en' ? 'Actions' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedScripts.map((script) => (
                    <tr key={script.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{script.id}</td>
                      <td className="p-4">{script.subject} ({script.level})</td>
                      <td className="p-4">{script.center}</td>
                      <td className="p-4">{script.candidate}</td>
                      <td className="p-4">{getStatusBadge(script.status)}</td>
                      <td className="p-4 text-right">
                        <Button
                          variant={script.status === 'Completed' || script.status === 'Verification' ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => handleNavigateToScript(script.id)}
                        >
                          {script.status === 'Completed' || script.status === 'Verification'
                            ? (language === 'en' ? 'View' : 'Voir')
                            : (language === 'en' ? 'Mark' : 'Corriger')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ExaminerLayout>
  );
}
