'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Lock, Smartphone, AlertTriangle, Eye, EyeOff, Clock, Key } from 'lucide-react';
import { SecureAdminAuth, AdminAccessLevel } from '@/lib/secureAdminAuth';

export default function SecureAdminLogin() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    masterPassword: '',
    totpCode: '',
    accessLevel: AdminAccessLevel.SYSTEM_ADMIN
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totpSetup, setTotpSetup] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second for TOTP display
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get TOTP setup data when access level changes
  useEffect(() => {
    const setupData = SecureAdminAuth.getTOTPSetupData(formData.accessLevel);
    setTotpSetup(setupData);
  }, [formData.accessLevel]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleMasterPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.masterPassword) {
      setError('Master password is required');
      return;
    }
    setStep(2);
  };

  const handleTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.totpCode || formData.totpCode.length !== 6) {
      setError('Please enter a valid 6-digit authentication code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await SecureAdminAuth.authenticateAdmin(
        formData.masterPassword,
        formData.totpCode,
        formData.accessLevel,
        window.location.hostname, // IP address would be handled server-side
        navigator.userAgent
      );

      if (result.success && result.sessionId) {
        // Store session securely
        sessionStorage.setItem('adminSessionId', result.sessionId);
        sessionStorage.setItem('adminAccessLevel', formData.accessLevel);
        
        // Redirect to admin dashboard
        window.location.href = '/admin/dashboard';
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (error) {
      setError('Authentication system error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTOTP = () => {
    return SecureAdminAuth.getCurrentTOTP(formData.accessLevel);
  };

  const getTimeRemaining = () => {
    const seconds = 30 - (Math.floor(currentTime.getTime() / 1000) % 30);
    return seconds;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Security Warning */}
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Restricted Access</h3>
              <p className="text-xs text-red-700 mt-1">
                This is a secure administrative interface. Unauthorized access is prohibited and monitored.
              </p>
            </div>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Secure Admin Access</h1>
              <p className="text-gray-600 mt-2">GCE Cameroon Administration Portal</p>
            </div>

            {step === 1 && (
              <form onSubmit={handleMasterPasswordSubmit} className="space-y-6">
                {/* Access Level Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Access Level
                  </label>
                  <select
                    name="accessLevel"
                    value={formData.accessLevel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  >
                    <option value={AdminAccessLevel.SYSTEM_ADMIN}>System Administrator</option>
                    <option value={AdminAccessLevel.EXAM_ADMIN}>Examination Administrator</option>
                    <option value={AdminAccessLevel.SECURITY_ADMIN}>Security Administrator</option>
                    <option value={AdminAccessLevel.SUPER_ADMIN}>Super Administrator</option>
                  </select>
                </div>

                {/* Master Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Master Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="masterPassword"
                      value={formData.masterPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      placeholder="Enter master password"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  Continue to Authentication
                </button>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* TOTP Setup Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Smartphone className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-blue-900">Two-Factor Authentication</h3>
                  </div>
                  <p className="text-sm text-blue-800 mb-3">
                    Use your authenticator app (Google Authenticator, Authy, etc.) with this setup:
                  </p>
                  <div className="bg-white rounded p-3 border">
                    <p className="text-xs font-mono text-gray-600 break-all">
                      {totpSetup?.manualEntryKey}
                    </p>
                  </div>
                </div>

                {/* Current TOTP for Development */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Key className="w-4 h-4 text-yellow-600 mr-2" />
                      <span className="text-sm font-semibold text-yellow-800">Current Code (Dev)</span>
                    </div>
                    <div className="flex items-center text-yellow-600">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm">{getTimeRemaining()}s</span>
                    </div>
                  </div>
                  <div className="text-2xl font-mono font-bold text-yellow-900 text-center bg-white rounded p-2">
                    {getCurrentTOTP()}
                  </div>
                  <p className="text-xs text-yellow-700 mt-2 text-center">
                    This is shown for development purposes only
                  </p>
                </div>

                <form onSubmit={handleTotpSubmit} className="space-y-6">
                  {/* TOTP Code Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Authentication Code
                    </label>
                    <input
                      type="text"
                      name="totpCode"
                      value={formData.totpCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 text-center text-2xl font-mono tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                      autoComplete="off"
                    />
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Enter the 6-digit code from your authenticator app
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Authenticating...' : 'Access Admin Panel'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-center mt-6">
          <p className="text-red-200 text-sm">
            All administrative activities are logged and monitored for security purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
