'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Tabs,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Download, FileText, MoreVertical, Filter, Printer, RefreshCw } from 'lucide-react';

// Mock data for demonstration
const feeData: FeeRecord[] = [
  {
    id: 'FEE-001',
    studentId: 'STU-1023',
    studentName: 'Jean Pierre Ndoumbe',
    class: 'Form 6 Science',
    examType: 'A Level',
    amount: 15000,
    currency: 'FCFA',
    status: 'paid',
    paymentDate: '2025-03-15',
    paymentMethod: 'Mobile Money',
    transactionId: 'MM234567',
  },
  {
    id: 'FEE-002',
    studentId: 'STU-2045',
    studentName: 'Marie Claire Enow',
    class: 'Form 6 Arts',
    examType: 'A Level',
    amount: 15000,
    currency: 'FCFA',
    status: 'pending',
    paymentDate: null,
    paymentMethod: null,
    transactionId: null,
  },
  {
    id: 'FEE-003',
    studentId: 'STU-1078',
    studentName: 'Emmanuel Tabi',
    class: 'Form 5',
    examType: 'O Level',
    amount: 10000,
    currency: 'FCFA',
    status: 'paid',
    paymentDate: '2025-03-10',
    paymentMethod: 'Bank Transfer',
    transactionId: 'BT789012',
  },
  {
    id: 'FEE-004',
    studentId: 'STU-2089',
    studentName: 'Sophie Mbarga',
    class: 'Form 5',
    examType: 'O Level',
    amount: 10000,
    currency: 'FCFA',
    status: 'failed',
    paymentDate: null,
    paymentMethod: 'Mobile Money',
    transactionId: null,
  },
  {
    id: 'FEE-005',
    studentId: 'STU-1456',
    studentName: 'Paul Ekambi',
    class: 'Form 6 Science',
    examType: 'A Level',
    amount: 15000,
    currency: 'FCFA',
    status: 'paid',
    paymentDate: '2025-03-11',
    paymentMethod: 'Cash',
    transactionId: 'CASH-1202',
  },
];

// Stats data
const statsData = {
  totalCollected: 40000,
  totalPending: 25000,
  totalStudents: 5,
  paidStudents: 3,
  pendingStudents: 1,
  failedPayments: 1
};

// Fee structure data
const feeStructureData = [
  { examType: 'O Level', amount: 10000, currency: 'FCFA', deadline: '2025-04-15' },
  { examType: 'A Level', amount: 15000, currency: 'FCFA', deadline: '2025-04-15' },
];

// Define types
type PaymentStatus = 'paid' | 'pending' | 'failed';

interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  examType: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentDate: string | null;
  paymentMethod: string | null;
  transactionId: string | null;
}

const FeeManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<FeeRecord[]>(feeData);
  const [activeTab, setActiveTab] = useState<'all' | PaymentStatus>('all');

  useEffect(() => {
    // Filter data based on search term and active tab
    let result = feeData;

    if (searchTerm) {
      result = result.filter(fee =>
        fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeTab !== 'all') {
      result = result.filter(fee => fee.status === activeTab);
    }

    setFilteredData(result);
  }, [searchTerm, activeTab]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTabChange = (value: 'all' | PaymentStatus) => {
    setActiveTab(value);
  };

  const handleRecordPayment = (studentId: string) => {
    // In a real application, this would open a payment recording form
    alert(`Record payment for student ID: ${studentId}`);
  };

  const handleGenerateReceipt = (feeId: string) => {
    // In a real application, this would generate a receipt PDF
    alert(`Generate receipt for fee ID: ${feeId}`);
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <div className="flex space-x-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Collected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.totalCollected.toLocaleString()} FCFA</div>
              <p className="text-xs text-gray-500 mt-1">From {statsData.paidStudents} students</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.totalPending.toLocaleString()} FCFA</div>
              <p className="text-xs text-gray-500 mt-1">From {statsData.pendingStudents + statsData.failedPayments} students</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Payment Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round((statsData.paidStudents / statsData.totalStudents) * 100)}%</div>
              <p className="text-xs text-gray-500 mt-1">{statsData.paidStudents} out of {statsData.totalStudents} students</p>
            </CardContent>
          </Card>
        </div>

        {/* Fee Structure */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Fee Structure</CardTitle>
            <CardDescription>Current examination registration fees</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Examination Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Payment Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeStructureData.map((fee, index) => (
                  <TableRow key={index}>
                    <TableCell>{fee.examType}</TableCell>
                    <TableCell>{fee.amount.toLocaleString()}</TableCell>
                    <TableCell>{fee.currency}</TableCell>
                    <TableCell>{new Date(fee.deadline).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Fee Management Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Student Payments</CardTitle>
                <CardDescription>Manage student examination fee payments</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or ID..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" onValueChange={(value) => handleTabChange(value as 'all' | PaymentStatus)}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="failed">Failed</TabsTrigger>
              </TabsList>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Exam Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell>{fee.studentId}</TableCell>
                        <TableCell>{fee.studentName}</TableCell>
                        <TableCell>{fee.class}</TableCell>
                        <TableCell>{fee.examType}</TableCell>
                        <TableCell>{fee.amount.toLocaleString()} {fee.currency}</TableCell>
                        <TableCell>{getStatusBadge(fee.status)}</TableCell>
                        <TableCell>{fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {fee.status !== 'paid' && (
                                <DropdownMenuItem onClick={() => handleRecordPayment(fee.studentId)}>
                                  Record Payment
                                </DropdownMenuItem>
                              )}
                              {fee.status === 'paid' && (
                                <DropdownMenuItem onClick={() => handleGenerateReceipt(fee.id)}>
                                  Generate Receipt
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No payment records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <p className="text-sm text-gray-500">Showing {filteredData.length} of {feeData.length} records</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Print List
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default FeeManagementPage;