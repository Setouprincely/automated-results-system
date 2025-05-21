'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, BarChart2 } from 'lucide-react';

export default function ProcessingPage() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Examination Processing</h1>
        <p className="text-gray-600 mb-8">
          Select the examination level to proceed with grading and processing.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/processing/olevel')}>
            <CardHeader>
              <CardTitle>O-Level Processing</CardTitle>
              <CardDescription>Process and grade O-Level examinations with 9-1 grading system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-10 w-10 text-blue-500 mr-4" />
                  <div>
                    <p className="text-sm text-gray-500">Grading System</p>
                    <p className="font-medium">9-1 Scale</p>
                  </div>
                </div>
                <Button>Access</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/processing/alevel')}>
            <CardHeader>
              <CardTitle>A-Level Processing</CardTitle>
              <CardDescription>Process and grade A-Level examinations with A*-E grading system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BarChart2 className="h-10 w-10 text-indigo-500 mr-4" />
                  <div>
                    <p className="text-sm text-gray-500">Grading System</p>
                    <p className="font-medium">A*-E Scale</p>
                  </div>
                </div>
                <Button>Access</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
