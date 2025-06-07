'use client';

import React, { useState, useEffect } from 'react';
import { User, Camera, Upload, X } from 'lucide-react';

interface ProfilePictureProps {
  userId?: string;
  userType?: string;
  examLevel?: string;
  userName?: string;
  profilePicturePath?: string; // Direct path from user data
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onPictureUpdate?: (newPictureUrl: string) => void;
  className?: string;
}

export default function ProfilePicture({
  userId,
  userType,
  examLevel,
  userName,
  profilePicturePath,
  size = 'md',
  editable = false,
  onPictureUpdate,
  className = ''
}: ProfilePictureProps) {
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  // Size configurations
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  // Load profile picture on component mount
  useEffect(() => {
    if (profilePicturePath) {
      // Use direct path from user data if available
      console.log(`🖼️ Using direct profile picture path: ${profilePicturePath}`);
      setPictureUrl(profilePicturePath);
    } else if (userId && userType) {
      // Fallback to API call
      loadProfilePicture();
    }
  }, [userId, userType, examLevel, profilePicturePath]);

  const loadProfilePicture = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🖼️ Loading profile picture for user: ${userId} (${userType}, ${examLevel})`);

      const params = new URLSearchParams({
        userId: userId!,
        userType: userType!
      });

      if (examLevel) {
        params.append('examLevel', examLevel);
      }

      const apiUrl = `/api/upload/profile-picture?${params}`;
      console.log(`📡 Profile picture API URL: ${apiUrl}`);

      const response = await fetch(apiUrl);

      if (response.ok) {
        const result = await response.json();
        console.log(`📊 Profile picture API response:`, result);

        if (result.success && result.data.fileUrl) {
          console.log(`✅ Profile picture found: ${result.data.fileUrl}`);
          setPictureUrl(result.data.fileUrl);
        } else {
          console.log(`⚠️ No profile picture URL in response`);
        }
      } else if (response.status === 404) {
        console.log(`📭 No profile picture found for user ${userId}`);
      } else {
        console.log(`❌ Profile picture API error: ${response.status} ${response.statusText}`);
        setError('Failed to load profile picture');
      }
    } catch (error) {
      console.error('❌ Error loading profile picture:', error);
      setError('Failed to load profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!userId || !userType) {
      setError('User information missing');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Convert file to base64
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload the picture
      const response = await fetch('/api/upload/profile-picture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userType,
          examLevel,
          imageData: base64Data,
          fileName: file.name
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPictureUrl(result.data.fileUrl);
        setShowUpload(false);
        if (onPictureUpdate) {
          onPictureUpdate(result.data.fileUrl);
        }
      } else {
        setError(result.message || 'Failed to upload picture');
      }
    } catch (error) {
      console.error('Error uploading picture:', error);
      setError('Failed to upload picture');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, or WebP)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      handleFileUpload(file);
    }
  };

  const deletePicture = async () => {
    if (!userId || !userType) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        userId,
        userType
      });

      if (examLevel) {
        params.append('examLevel', examLevel);
      }

      const response = await fetch(`/api/upload/profile-picture?${params}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setPictureUrl(null);
        if (onPictureUpdate) {
          onPictureUpdate('');
        }
      } else {
        setError('Failed to delete picture');
      }
    } catch (error) {
      console.error('Error deleting picture:', error);
      setError('Failed to delete picture');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Profile Picture Display */}
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center relative`}>
        {loading ? (
          <div className="animate-spin rounded-full h-1/2 w-1/2 border-b-2 border-blue-600"></div>
        ) : pictureUrl ? (
          <img
            src={pictureUrl}
            alt={`${userName || 'User'}'s profile picture`}
            className="w-full h-full object-cover"
            onError={() => {
              setPictureUrl(null);
              setError('Failed to load image');
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            {userName ? (
              <span className={`font-semibold ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-lg'}`}>
                {getInitials(userName)}
              </span>
            ) : (
              <User className={iconSizes[size]} />
            )}
          </div>
        )}

        {/* Edit Button */}
        {editable && !loading && (
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100"
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* Upload Options */}
      {editable && showUpload && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10 min-w-48">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <Upload className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">Upload new picture</span>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            {pictureUrl && (
              <button
                onClick={deletePicture}
                className="flex items-center space-x-2 p-2 hover:bg-red-50 rounded w-full text-left"
              >
                <X className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">Remove picture</span>
              </button>
            )}

            <button
              onClick={() => setShowUpload(false)}
              className="text-xs text-gray-500 hover:text-gray-700 p-2 w-full text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-full left-0 mt-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
