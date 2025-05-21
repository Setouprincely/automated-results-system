"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Filter
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Type definitions
type ExaminationCenter = {
  id: string;
  name: string;
  code: string;
  region: string;
  division: string;
  capacity: number;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  examTypes: ('O Level' | 'A Level')[];
};

// Mock data for demonstration purposes
const mockCenters: ExaminationCenter[] = [
  {
    id: '1',
    name: 'Government Bilingual High School Yaoundé',
    code: 'GBHSY-001',
    region: 'Centre',
    division: 'Mfoundi',
    capacity: 500,
    address: 'Avenue Kennedy, Yaoundé',
    contactPerson: 'Prof. Mbarga Jean',
    phone: '+237 677123456',
    email: 'gbhsy@education.cm',
    status: 'active',
    examTypes: ['O Level', 'A Level']
  },
  {
    id: '2',
    name: 'Lycée Classique et Moderne de Douala',
    code: 'LCMD-002',
    region: 'Littoral',
    division: 'Wouri',
    capacity: 450,
    address: 'Rue Bonanjo, Douala',
    contactPerson: 'Mme. Fouda Marie',
    phone: '+237 698765432',
    email: 'lcmd@education.cm',
    status: 'active',
    examTypes: ['A Level']
  },
  {
    id: '3',
    name: 'Baptist High School Buea',
    code: 'BHSB-003',
    region: 'South West',
    division: 'Fako',
    capacity: 300,
    address: 'Molyko, Buea',
    contactPerson: 'Mr. Endeley Thomas',
    phone: '+237 670111222',
    email: 'bhsb@education.cm',
    status: 'active',
    examTypes: ['O Level', 'A Level']
  },
  {
    id: '4',
    name: "St. Joseph's College Sasse",
    code: 'SJCS-004',
    region: 'South West',
    division: 'Fako',
    capacity: 200,
    address: 'Sasse, Buea',
    contactPerson: 'Fr. Etienne Bokagne',
    phone: '+237 681234567',
    email: 'sjcs@education.cm',
    status: 'pending',
    examTypes: ['O Level']
  },
  {
    id: '5',
    name: 'Cameroon College of Arts and Science Kumba',
    code: 'CCAS-005',
    region: 'South West',
    division: 'Meme',
    capacity: 350,
    address: 'Fiango, Kumba',
    contactPerson: 'Dr. Akame Richard',
    phone: '+237 675555666',
    email: 'ccas@education.cm',
    status: 'inactive',
    examTypes: ['O Level', 'A Level']
  },
];

// Regions in Cameroon
const regions = [
  'Adamawa',
  'Centre',
  'East',
  'Far North',
  'Littoral',
  'North',
  'North West',
  'South',
  'South West',
  'West'
];

export default function ExaminationCentersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [centers, setCenters] = useState<ExaminationCenter[]>(mockCenters);
  const [filteredCenters, setFilteredCenters] = useState<ExaminationCenter[]>(mockCenters);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<ExaminationCenter | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');

  // Form state for adding/editing centers
  const [formData, setFormData] = useState<Omit<ExaminationCenter, 'id'>>({
    name: '',
    code: '',
    region: '',
    division: '',
    capacity: 0,
    address: '',
    contactPerson: '',
    phone: '',
    email: '',
    status: 'pending',
    examTypes: []
  });

  // Handle search and filtering
  useEffect(() => {
    let filtered = [...centers];

    // Text search
    if (searchQuery) {
      filtered = filtered.filter(center =>
        center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        center.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        center.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        center.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filtering
    if (activeTab !== 'all') {
      filtered = filtered.filter(center => center.status === activeTab);
    }

    // Region filtering
    if (filterRegion !== 'all') {
      filtered = filtered.filter(center => center.region === filterRegion);
    }

    setFilteredCenters(filtered);
  }, [searchQuery, centers, activeTab, filterRegion]);

  // Open add dialog
  const handleAddCenter = () => {
    setFormData({
      name: '',
      code: '',
      region: '',
      division: '',
      capacity: 0,
      address: '',
      contactPerson: '',
      phone: '',
      email: '',
      status: 'pending',
      examTypes: []
    });
    setIsAddDialogOpen(true);
  };

  // Open edit dialog
  const handleEditCenter = (center: ExaminationCenter) => {
    setSelectedCenter(center);
    setFormData({
      name: center.name,
      code: center.code,
      region: center.region,
      division: center.division,
      capacity: center.capacity,
      address: center.address,
      contactPerson: center.contactPerson,
      phone: center.phone,
      email: center.email,
      status: center.status,
      examTypes: [...center.examTypes]
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const handleDeletePrompt = (center: ExaminationCenter) => {
    setSelectedCenter(center);
    setIsDeleteDialogOpen(true);
  };

  // Save new center
  const handleSaveCenter = () => {
    const newCenter: ExaminationCenter = {
      id: `new-${Date.now()}`,
      ...formData
    };
    setCenters([...centers, newCenter]);
    setIsAddDialogOpen(false);
  };

  // Update existing center
  const handleUpdateCenter = () => {
    if (!selectedCenter) return;

    const updatedCenters = centers.map(center =>
      center.id === selectedCenter.id ? { ...center, ...formData } : center
    );

    setCenters(updatedCenters);
    setIsEditDialogOpen(false);
  };

  // Delete center
  const handleDeleteCenter = () => {
    if (!selectedCenter) return;

    const updatedCenters = centers.filter(center =>
      center.id !== selectedCenter.id
    );

    setCenters(updatedCenters);
    setIsDeleteDialogOpen(false);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value
    });
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle exam type toggle
  const handleExamTypeToggle = (type: 'O Level' | 'A Level') => {
    if (formData.examTypes.includes(type)) {
      setFormData({
        ...formData,
        examTypes: formData.examTypes.filter(t => t !== type)
      });
    } else {
      setFormData({
        ...formData,
        examTypes: [...formData.examTypes, type]
      });
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Examination Centers Management</h1>
          <Button onClick={handleAddCenter}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Center
          </Button>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Search centers..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-4 w-full sm:w-auto">
                <Select value={filterRegion} onValueChange={(value) => setFilterRegion(value)}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {regions.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      More Filters
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      Exam Type: O Level
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Exam Type: A Level
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Capacity: Above 300
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Centers</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Center Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Exam Types</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCenters.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10">
                            No examination centers found matching your criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCenters.map((center) => (
                          <TableRow key={center.id}>
                            <TableCell className="font-medium">{center.name}</TableCell>
                            <TableCell>{center.code}</TableCell>
                            <TableCell>{center.region}</TableCell>
                            <TableCell>{center.capacity}</TableCell>
                            <TableCell>{getStatusBadge(center.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {center.examTypes.includes('O Level') &&
                                  <Badge variant="outline">O Level</Badge>}
                                {center.examTypes.includes('A Level') &&
                                  <Badge variant="outline">A Level</Badge>}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleEditCenter(center)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => router.push(`/Examination/Centers/${center.id}`)}>
                                    <MapPin className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeletePrompt(center)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Centers by Region</CardTitle>
              <CardDescription>Distribution of examination centers across regions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border rounded-md bg-gray-50">
                <p className="text-gray-500">Regional distribution chart would appear here</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Centers by Status</CardTitle>
              <CardDescription>Overview of center operational statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border rounded-md bg-gray-50">
                <p className="text-gray-500">Status distribution chart would appear here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Center Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Examination Center</DialogTitle>
            <DialogDescription>
              Enter the details for the new examination center. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Center Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="E.g., Government Bilingual High School Yaoundé"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Center Code *</Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="E.g., GBHSY-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Select
                value={formData.region}
                onValueChange={(value) => handleSelectChange('region', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="division">Division *</Label>
              <Input
                id="division"
                name="division"
                value={formData.division}
                onChange={handleInputChange}
                placeholder="E.g., Mfoundi"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity *</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleInputChange}
                placeholder="E.g., 500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="E.g., Avenue Kennedy, Yaoundé"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person *</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                placeholder="E.g., Prof. Mbarga Jean"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="E.g., +237 677123456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="E.g., gbhsy@education.cm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive' | 'pending') => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Examination Types</Label>
              <div className="flex gap-4 mt-2">
                <Button
                  type="button"
                  variant={formData.examTypes.includes('O Level') ? "default" : "outline"}
                  onClick={() => handleExamTypeToggle('O Level')}
                >
                  O Level
                </Button>
                <Button
                  type="button"
                  variant={formData.examTypes.includes('A Level') ? "default" : "outline"}
                  onClick={() => handleExamTypeToggle('A Level')}
                >
                  A Level
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCenter}>Save Center</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Center Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Examination Center</DialogTitle>
            <DialogDescription>
              Update the details for {selectedCenter?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Center Name *</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-code">Center Code *</Label>
              <Input
                id="edit-code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-region">Region *</Label>
              <Select
                value={formData.region}
                onValueChange={(value) => handleSelectChange('region', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-division">Division *</Label>
              <Input
                id="edit-division"
                name="division"
                value={formData.division}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-capacity">Capacity *</Label>
              <Input
                id="edit-capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">Address *</Label>
              <Input
                id="edit-address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-contactPerson">Contact Person *</Label>
              <Input
                id="edit-contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number *</Label>
              <Input
                id="edit-phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive' | 'pending') => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Examination Types</Label>
              <div className="flex gap-4 mt-2">
                <Button
                  type="button"
                  variant={formData.examTypes.includes('O Level') ? "default" : "outline"}
                  onClick={() => handleExamTypeToggle('O Level')}
                >
                  O Level
                </Button>
                <Button
                  type="button"
                  variant={formData.examTypes.includes('A Level') ? "default" : "outline"}
                  onClick={() => handleExamTypeToggle('A Level')}
                >
                  A Level
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCenter}>Update Center</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedCenter?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCenter}>
              Delete Center
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}