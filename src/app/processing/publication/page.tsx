'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Loader2, Search, Download, Share2, QrCode,
  TrendingUp, AlertTriangle, CheckCircle, Copy, FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

// Types for our components
type Result = {
  candidateNumber: string;
  candidateName: string;
  center: string;
  examType: 'O Level' | 'A Level';
  year: number;
  subjects: {
    code: string;
    name: string;
    grade: string;
    score?: number;
  }[];
  overallGrade?: string;
  verificationCode: string;
};

type SearchParams = {
  candidateNumber: string;
  examType: string;
  year: string;
};

export default function PublicationPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    candidateNumber: '',
    examType: 'O Level',
    year: new Date().getFullYear().toString(),
  });
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'fr'>('en');
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [showShareDialog, setShowShareDialog] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<'success' | 'error' | null>(null);

  // Analytics data
  const analyticsData = {
    gradeDistribution: {
      'A*': 12,
      'A': 18,
      'B': 25,
      'C': 30,
      'D': 10,
      'E': 3,
      'U': 2
    },
    subjectPerformance: [
      { subject: 'Mathematics', passRate: 92, avgScore: 78 },
      { subject: 'English', passRate: 88, avgScore: 72 },
      { subject: 'Physics', passRate: 85, avgScore: 70 },
      { subject: 'Chemistry', passRate: 82, avgScore: 68 },
      { subject: 'Biology', passRate: 90, avgScore: 75 }
    ],
    centerPerformance: [
      { center: 'Yaoundé Center', passRate: 92 },
      { center: 'Douala Center', passRate: 88 },
      { center: 'Bamenda Center', passRate: 85 },
      { center: 'Buea Center', passRate: 90 },
      { center: 'Limbe Center', passRate: 87 }
    ]
  };

  // Load the results - this would normally call an API
  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);

    // Validation
    if (!searchParams.candidateNumber) {
      setError(lang === 'en' ? 'Please enter a candidate number' : 'Veuillez saisir un numéro de candidat');
      setIsLoading(false);
      return;
    }

    try {
      // This would be an API call in production
      // For demo purposes, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock result data for demonstration
      if (searchParams.candidateNumber === '12345678') {
        const mockResult: Result = {
          candidateNumber: '12345678',
          candidateName: 'John Doe',
          center: 'Yaoundé Center',
          examType: searchParams.examType as 'O Level' | 'A Level',
          year: parseInt(searchParams.year),
          subjects: [
            { code: 'ENG', name: 'English Language', grade: searchParams.examType === 'O Level' ? '8' : 'A', score: 78 },
            { code: 'MAT', name: 'Mathematics', grade: searchParams.examType === 'O Level' ? '9' : 'A*', score: 92 },
            { code: 'PHY', name: 'Physics', grade: searchParams.examType === 'O Level' ? '7' : 'B', score: 71 },
            { code: 'CHE', name: 'Chemistry', grade: searchParams.examType === 'O Level' ? '6' : 'B', score: 68 },
            { code: 'BIO', name: 'Biology', grade: searchParams.examType === 'O Level' ? '7' : 'B', score: 74 },
          ],
          overallGrade: searchParams.examType === 'O Level' ? '7' : 'B',
          verificationCode: 'GCE-VER-2024-ABCXYZ',
        };
        setResult(mockResult);
      } else {
        setError(lang === 'en' ? 'No results found for the provided information. Please check and try again.' : 'Aucun résultat trouvé pour les informations fournies. Veuillez vérifier et réessayer.');
      }
    } catch (err) {
      setError(lang === 'en' ? 'An error occurred while fetching results. Please try again later.' : 'Une erreur s\'est produite lors de la récupération des résultats. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle language switch
  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'fr' : 'en');
  };

  // Handle download results
  const handleDownload = () => {
    if (!result) return;

    // In a real application, this would generate a PDF or other document format
    // For this demo, we'll just show a success message
    alert(lang === 'en'
      ? 'Results downloaded successfully!'
      : 'Résultats téléchargés avec succès!');
  };

  // Handle share results
  const handleShare = () => {
    setShowShareDialog(true);
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    if (!result) return;

    const shareText = `
${result.candidateName} (${result.candidateNumber})
${result.examType} ${result.year}
${result.center}
Overall Grade: ${result.overallGrade}
    `;

    navigator.clipboard.writeText(shareText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Handle verify results
  const handleVerify = () => {
    setShowQRCode(true);
  };

  // Handle verification code submission
  const handleVerificationSubmit = () => {
    if (verificationCode.trim() === '') return;

    // In a real application, this would verify the code against a database
    // For this demo, we'll just check if it matches the result's verification code
    if (result && verificationCode === result.verificationCode) {
      setVerificationResult('success');
    } else {
      setVerificationResult('error');
    }
  };

  // Translations for the UI
  const t = {
    title: lang === 'en' ? 'GCE Results Publication' : 'Publication des résultats du GCE',
    subtitle: lang === 'en' ? 'Check your examination results' : 'Vérifiez vos résultats d\'examen',
    search: {
      title: lang === 'en' ? 'Find Your Results' : 'Trouvez vos résultats',
      candidateNumber: lang === 'en' ? 'Candidate Number' : 'Numéro de candidat',
      examType: lang === 'en' ? 'Examination Type' : 'Type d\'examen',
      year: lang === 'en' ? 'Examination Year' : 'Année d\'examen',
      button: lang === 'en' ? 'Search Results' : 'Rechercher résultats',
      placeholder: lang === 'en' ? 'Enter your 8-digit number' : 'Entrez votre numéro à 8 chiffres'
    },
    results: {
      title: lang === 'en' ? 'Examination Results' : 'Résultats d\'examen',
      candidate: lang === 'en' ? 'Candidate' : 'Candidat',
      center: lang === 'en' ? 'Examination Center' : 'Centre d\'examen',
      verification: lang === 'en' ? 'Verification Code' : 'Code de vérification',
      subjectCode: lang === 'en' ? 'Code' : 'Code',
      subjectName: lang === 'en' ? 'Subject' : 'Matière',
      grade: lang === 'en' ? 'Grade' : 'Note',
      score: lang === 'en' ? 'Score' : 'Score',
      overallGrade: lang === 'en' ? 'Overall Grade' : 'Note Globale',
      download: lang === 'en' ? 'Download Results' : 'Télécharger les résultats',
      share: lang === 'en' ? 'Share Results' : 'Partager les résultats',
      verify: lang === 'en' ? 'Verify with QR' : 'Vérifier avec QR'
    },
    tabs: {
      results: lang === 'en' ? 'Results' : 'Résultats',
      analytics: lang === 'en' ? 'Analytics' : 'Analyses',
      verification: lang === 'en' ? 'Verification' : 'Vérification'
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">{t.title}</h1>
        <Button variant="outline" onClick={toggleLanguage}>
          {lang === 'en' ? 'Français' : 'English'}
        </Button>
      </div>

      <p className="text-gray-500 mb-8">{t.subtitle}</p>

      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="results">{t.tabs.results}</TabsTrigger>
          <TabsTrigger value="analytics">{t.tabs.analytics}</TabsTrigger>
          <TabsTrigger value="verification">{t.tabs.verification}</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.search.title}</CardTitle>
              <CardDescription>
                {lang === 'en'
                  ? 'Enter your candidate number, exam type, and year to view your results.'
                  : 'Entrez votre numéro de candidat, le type d\'examen et l\'année pour consulter vos résultats.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="candidateNumber">{t.search.candidateNumber}</Label>
                  <Input
                    id="candidateNumber"
                    placeholder={t.search.placeholder}
                    value={searchParams.candidateNumber}
                    onChange={(e) => setSearchParams({...searchParams, candidateNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="examType">{t.search.examType}</Label>
                  <Select
                    value={searchParams.examType}
                    onValueChange={(value) => setSearchParams({...searchParams, examType: value})}
                  >
                    <SelectTrigger id="examType">
                      <SelectValue placeholder={t.search.examType} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="O Level">O Level</SelectItem>
                      <SelectItem value="A Level">A Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">{t.search.year}</Label>
                  <Select
                    value={searchParams.year}
                    onValueChange={(value) => setSearchParams({...searchParams, year: value})}
                  >
                    <SelectTrigger id="year">
                      <SelectValue placeholder={t.search.year} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSearch} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {lang === 'en' ? 'Searching...' : 'Recherche...'}
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    {t.search.button}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{lang === 'en' ? 'Error' : 'Erreur'}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Card className="mt-6 border-2 border-primary">
              <CardHeader className="bg-primary/5">
                <div className="flex justify-between items-center">
                  <CardTitle>{t.results.title}</CardTitle>
                  <Badge variant="outline" className="text-primary">
                    {result.examType} {result.year}
                  </Badge>
                </div>
                <CardDescription>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                    <div>
                      <span className="font-semibold">{t.results.candidate}:</span> {result.candidateName} ({result.candidateNumber})
                    </div>
                    <div>
                      <span className="font-semibold">{t.results.center}:</span> {result.center}
                    </div>
                    <div>
                      <span className="font-semibold">{t.results.verification}:</span> {result.verificationCode}
                    </div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left pb-2">{t.results.subjectCode}</th>
                        <th className="text-left pb-2">{t.results.subjectName}</th>
                        <th className="text-center pb-2">{t.results.grade}</th>
                        <th className="text-center pb-2">{t.results.score}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.subjects.map((subject, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3">{subject.code}</td>
                          <td className="py-3">{subject.name}</td>
                          <td className="py-3 text-center">
                            <Badge
                              className={`font-bold ${getBadgeColor(subject.grade)}`}
                            >
                              {subject.grade}
                            </Badge>
                          </td>
                          <td className="py-3 text-center">{subject.score || '-'}</td>
                        </tr>
                      ))}
                      <tr className="bg-primary/5">
                        <td colSpan={2} className="py-3 font-semibold text-right pr-4">{t.results.overallGrade}:</td>
                        <td className="py-3 text-center">
                          <Badge variant="default" className="font-bold">
                            {result.overallGrade}
                          </Badge>
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between bg-gray-50 px-6 py-4">
                <Button variant="outline" className="w-full sm:w-auto" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  {t.results.download}
                </Button>
                <Button variant="outline" className="w-full sm:w-auto" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  {t.results.share}
                </Button>
                <Button variant="outline" className="w-full sm:w-auto" onClick={handleVerify}>
                  <QrCode className="mr-2 h-4 w-4" />
                  {t.results.verify}
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 mt-6">
          {!result ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {lang === 'en' ? 'Performance Analytics' : 'Analyse de Performance'}
                </CardTitle>
                <CardDescription>
                  {lang === 'en'
                    ? 'View your performance analytics and comparison with peers.'
                    : 'Consultez vos analyses de performance et comparaison avec vos pairs.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-4 text-gray-500">
                    {lang === 'en'
                      ? 'Please search for your results first to view analytics.'
                      : 'Veuillez d\'abord rechercher vos résultats pour afficher les analyses.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {lang === 'en' ? 'Grade Distribution' : 'Distribution des Notes'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analyticsData.gradeDistribution).map(([grade, count]) => (
                      <div key={grade} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Badge className={`mr-2 ${getBadgeColor(grade)}`}>{grade}</Badge>
                            <span>{count} {lang === 'en' ? 'students' : 'étudiants'}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {Math.round(count / Object.values(analyticsData.gradeDistribution).reduce((a, b) => a + b, 0) * 100)}%
                          </span>
                        </div>
                        <Progress value={count} max={30} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {lang === 'en' ? 'Your Performance' : 'Votre Performance'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          {lang === 'en' ? 'Overall Ranking' : 'Classement Général'}
                        </span>
                        <span className="text-sm font-medium text-primary">
                          {lang === 'en' ? 'Top 15%' : 'Top 15%'}
                        </span>
                      </div>
                      <div className="relative h-4 w-full overflow-hidden rounded-full bg-primary/20">
                        <div className="h-full w-[85%] bg-primary rounded-full"></div>
                        <div className="absolute top-0 bottom-0 left-[85%] w-1 bg-white"></div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-3">
                        {lang === 'en' ? 'Subject Performance' : 'Performance par Matière'}
                      </h4>
                      <div className="space-y-2">
                        {result.subjects.map((subject) => (
                          <div key={subject.code} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                              <span className="text-sm">{subject.name}</span>
                            </div>
                            <Badge className={getBadgeColor(subject.grade)}>
                              {subject.grade}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {lang === 'en' ? 'Center Performance' : 'Performance du Centre'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.centerPerformance.map((center) => (
                      <div key={center.center} className="flex items-center justify-between">
                        <span className="text-sm">{center.center}</span>
                        <div className="flex items-center">
                          <div className="w-40 h-2 bg-gray-100 rounded-full mr-3">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${center.passRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{center.passRate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="verification" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {lang === 'en' ? 'Result Verification' : 'Vérification des Résultats'}
              </CardTitle>
              <CardDescription>
                {lang === 'en'
                  ? 'Verify the authenticity of your examination results.'
                  : 'Vérifiez l\'authenticité de vos résultats d\'examen.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      {lang === 'en' ? 'Verify by Code' : 'Vérifier par Code'}
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="verificationCode">
                        {lang === 'en' ? 'Verification Code' : 'Code de Vérification'}
                      </Label>
                      <div className="flex space-x-2">
                        <Input
                          id="verificationCode"
                          placeholder={lang === 'en' ? 'Enter verification code' : 'Entrez le code de vérification'}
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                        />
                        <Button onClick={handleVerificationSubmit}>
                          {lang === 'en' ? 'Verify' : 'Vérifier'}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        {lang === 'en'
                          ? 'Enter the verification code found on your result slip or certificate.'
                          : 'Entrez le code de vérification figurant sur votre relevé de notes ou certificat.'}
                      </p>

                      {verificationResult === 'success' && (
                        <Alert className="mt-4 bg-green-50 border-green-200">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertTitle className="text-green-800">
                            {lang === 'en' ? 'Verification Successful' : 'Vérification Réussie'}
                          </AlertTitle>
                          <AlertDescription className="text-green-700">
                            {lang === 'en'
                              ? 'This result is authentic and has been verified.'
                              : 'Ce résultat est authentique et a été vérifié.'}
                          </AlertDescription>
                        </Alert>
                      )}

                      {verificationResult === 'error' && (
                        <Alert variant="destructive" className="mt-4">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>
                            {lang === 'en' ? 'Verification Failed' : 'Échec de la Vérification'}
                          </AlertTitle>
                          <AlertDescription>
                            {lang === 'en'
                              ? 'The verification code is invalid or does not match any records.'
                              : 'Le code de vérification est invalide ou ne correspond à aucun enregistrement.'}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      {lang === 'en' ? 'Verify by QR Code' : 'Vérifier par Code QR'}
                    </h3>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center">
                      <div className="w-32 h-32 bg-gray-100 rounded-md mb-4 flex items-center justify-center">
                        <QrCode className="h-16 w-16 text-gray-400" />
                      </div>
                      <Button variant="outline" className="w-full">
                        {lang === 'en' ? 'Scan QR Code' : 'Scanner le Code QR'}
                      </Button>
                      <p className="text-sm text-gray-500 text-center mt-2">
                        {lang === 'en'
                          ? 'Scan the QR code on your result slip to verify authenticity.'
                          : 'Scannez le code QR sur votre relevé de notes pour vérifier l\'authenticité.'}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-4">
                    {lang === 'en' ? 'Verification Information' : 'Informations de Vérification'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {lang === 'en' ? 'Official Verification' : 'Vérification Officielle'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {lang === 'en'
                            ? 'All results are digitally signed and can be verified for authenticity.'
                            : 'Tous les résultats sont signés numériquement et peuvent être vérifiés pour leur authenticité.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {lang === 'en' ? 'Secure Documents' : 'Documents Sécurisés'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {lang === 'en'
                            ? 'All certificates include security features to prevent forgery.'
                            : 'Tous les certificats incluent des fonctionnalités de sécurité pour empêcher la falsification.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {lang === 'en' ? 'Share Your Results' : 'Partager Vos Résultats'}
            </DialogTitle>
            <DialogDescription>
              {lang === 'en'
                ? 'Share your results with others or copy the information.'
                : 'Partagez vos résultats avec d\'autres ou copiez les informations.'}
            </DialogDescription>
          </DialogHeader>

          {result && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="font-medium">{result.candidateName} ({result.candidateNumber})</p>
                <p>{result.examType} {result.year}</p>
                <p>{result.center}</p>
                <p className="mt-2">
                  <span className="font-medium">
                    {lang === 'en' ? 'Overall Grade' : 'Note Globale'}:
                  </span> {result.overallGrade}
                </p>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" className="w-full" onClick={handleCopy}>
                  {copySuccess ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      {lang === 'en' ? 'Copied!' : 'Copié!'}
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      {lang === 'en' ? 'Copy to Clipboard' : 'Copier dans le Presse-papiers'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              {lang === 'en' ? 'Close' : 'Fermer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {lang === 'en' ? 'QR Code Verification' : 'Vérification par Code QR'}
            </DialogTitle>
            <DialogDescription>
              {lang === 'en'
                ? 'Scan this QR code to verify the authenticity of your results.'
                : 'Scannez ce code QR pour vérifier l\'authenticité de vos résultats.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-48 h-48 bg-gray-100 rounded-md flex items-center justify-center mb-4">
              <QrCode className="h-24 w-24 text-gray-400" />
            </div>
            <p className="text-sm text-center text-gray-500 max-w-xs">
              {lang === 'en'
                ? 'This QR code contains a secure link to verify your examination results.'
                : 'Ce code QR contient un lien sécurisé pour vérifier vos résultats d\'examen.'}
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQRCode(false)}>
              {lang === 'en' ? 'Close' : 'Fermer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

// Helper function to determine badge color based on grade
function getBadgeColor(grade: string): string {
  // For O Level (numerical grades 9-1)
  if (!isNaN(Number(grade))) {
    const numGrade = Number(grade);
    if (numGrade >= 8) return "bg-green-100 text-green-800";
    if (numGrade >= 6) return "bg-blue-100 text-blue-800";
    if (numGrade >= 4) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  }

  // For A Level (letter grades A*-E)
  switch(grade) {
    case 'A*':
      return "bg-purple-100 text-purple-800";
    case 'A':
      return "bg-green-100 text-green-800";
    case 'B':
      return "bg-blue-100 text-blue-800";
    case 'C':
      return "bg-cyan-100 text-cyan-800";
    case 'D':
      return "bg-yellow-100 text-yellow-800";
    case 'E':
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-red-100 text-red-800";
  }
}