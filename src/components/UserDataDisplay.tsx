'use client';

import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProfilePicture from '@/components/ProfilePicture';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Building,
  IdCard,
  Users,
  Shield,
  Clock,
  CheckCircle
} from 'lucide-react';

interface UserDataDisplayProps {
  variant?: 'full' | 'summary' | 'minimal';
  showSensitive?: boolean;
  className?: string;
}

const UserDataDisplay: React.FC<UserDataDisplayProps> = ({
  variant = 'full',
  showSensitive = false,
  className = ''
}) => {
  const { user, loading, error } = useUser();

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !user) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Unable to load user data</p>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <ProfilePicture
          userId={user.id}
          userType={user.userType}
          examLevel={user.examLevel}
          userName={user.fullName}
          profilePicturePath={user.profilePicturePath}
          size="sm"
          editable={false}
        />
        <div>
          <p className="font-medium">{user.fullName}</p>
          <p className="text-sm text-gray-600">{user.examLevel || user.userType}</p>
        </div>
      </div>
    );
  }

  if (variant === 'summary') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <ProfilePicture
              userId={user.id}
              userType={user.userType}
              examLevel={user.examLevel}
              userName={user.fullName}
              profilePicturePath={user.profilePicturePath}
              size="md"
              editable={false}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{user.fullName}</h3>
              <p className="text-gray-600 text-sm">{user.email}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {user.examLevel && (
                  <Badge variant="outline">{user.examLevel}</Badge>
                )}
                {user.candidateNumber && (
                  <Badge variant="outline">#{user.candidateNumber}</Badge>
                )}
                {user.schoolCenterNumber && (
                  <Badge variant="outline">School {user.schoolCenterNumber}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Complete Registration Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <ProfilePicture
              userId={user.id}
              userType={user.userType}
              examLevel={user.examLevel}
              userName={user.fullName}
              profilePicturePath={user.profilePicturePath}
              size="xl"
              editable={true}
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{user.fullName}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">ID: {user.id}</p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Badge className="bg-blue-600">{user.userType}</Badge>
                {user.examLevel && (
                  <Badge className="bg-green-600">{user.examLevel}</Badge>
                )}
                <Badge variant="outline">{user.registrationStatus || 'Active'}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IdCard className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.dateOfBirth && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Date of Birth:</strong> {formatDate(user.dateOfBirth)}
                </span>
              </div>
            )}

            {user.gender && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Gender:</strong> {user.gender}
                </span>
              </div>
            )}

            {user.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Phone:</strong> {user.phoneNumber}
                </span>
              </div>
            )}

            {user.region && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Region:</strong> {user.region}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      {user.userType === 'student' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.examLevel && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Exam Level:</strong> {user.examLevel}
                  </span>
                </div>
              )}

              {user.candidateNumber && (
                <div className="flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Candidate Number:</strong> {user.candidateNumber}
                  </span>
                </div>
              )}

              {user.schoolCenterNumber && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>School Center:</strong> {user.schoolCenterNumber}
                  </span>
                </div>
              )}

              {user.examCenter && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Exam Center:</strong> {user.examCenter}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.createdAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Registered:</strong> {formatDate(user.createdAt)}
                </span>
              </div>
            )}

            {user.lastLogin && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Last Login:</strong> {formatDate(user.lastLogin)}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                <strong>Status:</strong> {user.registrationStatus || 'Active'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                <strong>Email Verified:</strong> Yes
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Information (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Debug: Raw User Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserDataDisplay;
