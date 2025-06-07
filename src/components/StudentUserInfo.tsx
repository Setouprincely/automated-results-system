'use client';

import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ProfilePicture from '@/components/ProfilePicture';
import { User, Mail, Phone, MapPin, Calendar, GraduationCap, Building } from 'lucide-react';

interface StudentUserInfoProps {
  variant?: 'banner' | 'card' | 'compact';
  showDetails?: boolean;
  className?: string;
}

const StudentUserInfo: React.FC<StudentUserInfoProps> = ({
  variant = 'banner',
  showDetails = true,
  className = ''
}) => {
  const { user, loading, error } = useUser();

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 rounded-lg h-20 w-full"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={`text-center p-4 text-gray-500 ${className}`}>
        <p>Unable to load user information</p>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  if (variant === 'banner') {
    return (
      <Card className={`bg-gradient-to-r from-blue-600 to-indigo-700 text-white ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <ProfilePicture
                userId={user.id}
                userType={user.userType}
                examLevel={user.examLevel}
                userName={user.fullName}
                profilePicturePath={user.profilePicturePath}
                size="xl"
                editable={true}
                className="border-4 border-white"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{user.fullName}</h2>
              <p className="text-blue-100">ID: {user.id}</p>
              <p className="text-blue-100">Email: {user.email}</p>
              <div className="flex gap-4 mt-2">
                <Badge className="bg-white text-blue-700">
                  {user.examLevel || 'Not specified'}
                </Badge>
                <Badge className="bg-green-500">
                  Status: {user.registrationStatus || 'Active'}
                </Badge>
                {user.candidateNumber && (
                  <Badge className="bg-yellow-500">
                    Candidate: {user.candidateNumber}
                  </Badge>
                )}
              </div>
            </div>
            {showDetails && (
              <div className="text-right">
                <div className="text-sm space-y-1">
                  {user.schoolCenterNumber && (
                    <p>School Center: {user.schoolCenterNumber}</p>
                  )}
                  {user.region && (
                    <p>Region: {user.region}</p>
                  )}
                  {user.examCenter && (
                    <p>Exam Center: {user.examCenter}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <ProfilePicture
              userId={user.id}
              userType={user.userType}
              examLevel={user.examLevel}
              userName={user.fullName}
              profilePicturePath={user.profilePicturePath}
              size="lg"
              editable={true}
            />
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{user.fullName}</h3>
              <p className="text-gray-600">{user.email}</p>

              {showDetails && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-gray-500" />
                      <span>Exam Level: {user.examLevel || 'Not specified'}</span>
                    </div>

                    {user.candidateNumber && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>Candidate: {user.candidateNumber}</span>
                      </div>
                    )}

                    {user.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{user.phoneNumber}</span>
                      </div>
                    )}

                    {user.region && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{user.region}</span>
                      </div>
                    )}

                    {user.schoolCenterNumber && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span>School: {user.schoolCenterNumber}</span>
                      </div>
                    )}

                    {user.dateOfBirth && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>DOB: {formatDate(user.dateOfBirth)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">
                      {user.registrationStatus || 'Active'}
                    </Badge>
                    {user.examLevel && (
                      <Badge variant="outline">
                        {user.examLevel}
                      </Badge>
                    )}
                    {user.gender && (
                      <Badge variant="outline">
                        {user.gender}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact variant
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
        <p className="text-sm text-gray-600">{user.examLevel || 'Student'}</p>
      </div>
    </div>
  );
};

export default StudentUserInfo;
