'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { Upload, Camera, X, User, AlertCircle, CheckCircle } from 'lucide-react';

interface PictureUploadProps {
  onImageSelect: (file: File | null) => void;
  currentImage?: File | null;
  label?: string;
  required?: boolean;
  userType?: 'student' | 'teacher' | 'examiner';
}

export default function PictureUpload({ 
  onImageSelect, 
  currentImage, 
  label = "Profile Picture", 
  required = false,
  userType = 'student'
}: PictureUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, or WebP)';
    }
    if (file.size > maxFileSize) {
      return 'File size must be less than 5MB';
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Pass file to parent
    onImageSelect(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = () => {
    setPreview(null);
    setError(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getUploadText = () => {
    switch (userType) {
      case 'student':
        return {
          title: 'Student Photo',
          description: 'Upload a clear passport-style photo for identification',
          requirement: 'Required for exam verification'
        };
      case 'teacher':
        return {
          title: 'Teacher Photo',
          description: 'Upload a professional photo for your profile',
          requirement: 'Optional but recommended'
        };
      case 'examiner':
        return {
          title: 'Examiner Photo',
          description: 'Upload a professional photo for verification',
          requirement: 'Required for security clearance'
        };
      default:
        return {
          title: 'Profile Photo',
          description: 'Upload a clear photo',
          requirement: 'Optional'
        };
    }
  };

  const uploadText = getUploadText();

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="space-y-4">
        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : preview
              ? 'border-green-300 bg-green-50'
              : error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {preview ? (
            // Preview Image
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 mx-auto rounded-lg object-cover border-2 border-white shadow-md"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center text-green-600 mb-2">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Photo uploaded successfully</span>
                </div>
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Change photo
                </button>
              </div>
            </div>
          ) : (
            // Upload Prompt
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                {userType === 'student' ? (
                  <Camera className="w-8 h-8 text-gray-400" />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {uploadText.title}
              </h4>
              
              <p className="text-sm text-gray-600 mb-4">
                {uploadText.description}
              </p>
              
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Photo
                </button>
                
                <p className="text-xs text-gray-500">
                  or drag and drop your photo here
                </p>
                
                <div className={`text-xs ${required ? 'text-orange-600' : 'text-gray-500'}`}>
                  {uploadText.requirement}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        {/* File Requirements */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>• Supported formats: JPEG, PNG, WebP</div>
          <div>• Maximum file size: 5MB</div>
          <div>• Recommended: Clear, passport-style photo</div>
          {userType === 'student' && (
            <div className="text-orange-600 font-medium">
              • This photo will be used for exam verification
            </div>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}
