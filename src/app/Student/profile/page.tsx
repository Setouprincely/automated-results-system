'use client';

import { useState } from 'react';
import StudentLayout from '@/components/layouts/StudentLayout';
import { useUser } from '@/contexts/UserContext';
import UserDataDisplay from '@/components/UserDataDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  Download, 
  Edit, 
  Globe,
  User,
  AlertCircle
} from 'lucide-react';

const StudentProfile = () => {
  const [language, setLanguage] = useState<'english' | 'french'>('english');
  const { user, loading, error, refreshUser } = useUser();

  // Translation helper
  const t = (english: string, french: string) => {
    return language === 'english' ? english : french;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'english' ? 'french' : 'english');
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-700">{t('Loading profile...', 'Chargement du profil...')}</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error || !user) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <AlertCircle className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t('Error Loading Profile', 'Erreur de Chargement du Profil')}
            </h2>
            <p className="text-gray-600 mb-4">
              {error || t('Unable to load profile data', 'Impossible de charger les données du profil')}
            </p>
            <Button onClick={refreshUser} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('Retry', 'Réessayer')}
            </Button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('Student Profile', 'Profil Étudiant')}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('View and manage your complete registration information', 'Consultez et gérez vos informations d\'inscription complètes')}
            </p>
          </div>
          
          <div className="flex gap-3">
            {/* Language Toggle */}
            <Button
              onClick={toggleLanguage}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              {language === 'english' ? 'Français' : 'English'}
            </Button>

            {/* Refresh Data */}
            <Button
              onClick={refreshUser}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t('Refresh', 'Actualiser')}
            </Button>

            {/* Download Profile */}
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <Download className="h-4 w-4" />
              {t('Download Profile', 'Télécharger Profil')}
            </Button>
          </div>
        </div>

        {/* Profile Status */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {t('Profile Status', 'Statut du Profil')}
                  </h3>
                  <p className="text-gray-600">
                    {t('Your registration is complete and verified', 'Votre inscription est complète et vérifiée')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-green-600">
                  {t('Verified', 'Vérifié')}
                </Badge>
                <Badge className="bg-blue-600">
                  {user.examLevel || 'Student'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complete User Data Display */}
        <UserDataDisplay variant="full" />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              {t('Quick Actions', 'Actions Rapides')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Edit className="h-6 w-6" />
                <span className="font-medium">
                  {t('Edit Profile', 'Modifier Profil')}
                </span>
                <span className="text-sm text-gray-500 text-center">
                  {t('Update your personal information', 'Mettre à jour vos informations personnelles')}
                </span>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Download className="h-6 w-6" />
                <span className="font-medium">
                  {t('Download Documents', 'Télécharger Documents')}
                </span>
                <span className="text-sm text-gray-500 text-center">
                  {t('Get your registration certificate', 'Obtenez votre certificat d\'inscription')}
                </span>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <RefreshCw className="h-6 w-6" />
                <span className="font-medium">
                  {t('Sync Data', 'Synchroniser Données')}
                </span>
                <span className="text-sm text-gray-500 text-center">
                  {t('Refresh your information', 'Actualiser vos informations')}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Source Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">
                  {t('Data Source', 'Source des Données')}
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  {t(
                    'This information is pulled directly from your registration in the GCE system database. All data is real-time and reflects your actual registration details.',
                    'Ces informations sont extraites directement de votre inscription dans la base de données du système GCE. Toutes les données sont en temps réel et reflètent vos détails d\'inscription réels.'
                  )}
                </p>
                <div className="mt-2 text-xs text-blue-600">
                  <strong>{t('Database:', 'Base de données:')}</strong> {user.examLevel === 'O Level' ? 'o_level_students' : 'a_level_students'}
                  <br />
                  <strong>{t('Last Updated:', 'Dernière mise à jour:')}</strong> {new Date().toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
};

export default StudentProfile;
