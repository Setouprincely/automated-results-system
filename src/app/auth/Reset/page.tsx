'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token'); // get token from URL

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || 'Password has been reset successfully.');
        setError('');
      } else {
        setError(data.error || 'An error occurred while resetting the password.');
        setSuccessMessage('');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      setSuccessMessage('');
    }
  };

  return (
    <>
      <Head>
        <title>Reset Password</title>
      </Head>
      <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-6">
            <Link href="/auth/Login" className="text-sm text-blue-500 flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-200 p-2">
              <img
                src="/images/GCEB.png"
                alt="GCE Board Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Reset Password</h2>
          <form onSubmit={handleResetPassword}>
            <div className="mb-4 relative">
              <label className="block text-gray-700 text-sm font-semibold mb-2">New Password</label>
              <div className="flex items-center border rounded px-3 py-2">
                <Lock className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  className="w-full outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="ml-2 focus:outline-none"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="mb-4 relative">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Confirm Password</label>
              <div className="flex items-center border rounded px-3 py-2">
                <Lock className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  type={confirmPasswordVisible ? 'text' : 'password'}
                  className="w-full outline-none"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="ml-2 focus:outline-none"
                  onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                >
                  {confirmPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {successMessage && (
              <p className="text-green-600 text-sm mb-4 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
