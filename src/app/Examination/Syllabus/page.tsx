'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/layout';
import {
  Card,
  CardHeader,
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, X, Check, AlertCircle, FileText, MoreHorizontal } from 'lucide-react';

// Mock data for development purposes
const MOCK_SUBJECTS = [
  { id: 1, code: 'ENG', name: 'English Language', level: 'O Level', papers: 2, status: 'active' },
  { id: 2, code: 'MAT', name: 'Mathematics', level: 'O Level', papers: 2, status: 'active' },
  { id: 3, code: 'FRE', name: 'French', level: 'O Level', papers: 2, status: 'active' },
  { id: 4, code: 'BIO', name: 'Biology', level: 'O Level', papers: 3, status: 'active' },
  { id: 5, code: 'CHE', name: 'Chemistry', level: 'O Level', papers: 3, status: 'active' },
  { id: 6, code: 'PHY', name: 'Physics', level: 'O Level', papers: 3, status: 'active' },
  { id: 7, code: 'LIT', name: 'Literature in English', level: 'A Level', papers: 2, status: 'active' },
  { id: 8, code: 'GEO', name: 'Geography', level: 'A Level', papers: 3, status: 'active' },
  { id: 9, code: 'HIS', name: 'History', level: 'A Level', papers: 2, status: 'active' },
  { id: 10, code: 'ECO', name: 'Economics', level: 'A Level', papers: 2, status: 'active' },
  { id: 11, code: 'COM', name: 'Computer Science', level: 'A Level', papers: 3, status: 'review' },
];

const MOCK_SYLLABI = [
  {
    id: 1,
    subjectId: 1,
    version: '2025',
    status: 'active',
    lastUpdated: '2024-10-15',
    sections: [
      { title: 'Grammar and Usage', weighting: 25 },
      { title: 'Reading Comprehension', weighting: 30 },
      { title: 'Summary Writing', weighting: 20 },
      { title: 'Essay Writing', weighting: 25 },
    ]
  },
  {
    id: 2,
    subjectId: 2,
    version: '2025',
    status: 'active',
    lastUpdated: '2024-09-20',
    sections: [
      { title: 'Number and Algebra', weighting: 40 },
      { title: 'Geometry and Trigonometry', weighting: 35 },
      { title: 'Statistics and Probability', weighting: 25 },
    ]
  },
  {
    id: 3,
    subjectId: 7,
    version: '2025',
    status: 'review',
    lastUpdated: '2024-11-05',
    sections: [
      { title: 'Drama', weighting: 30 },
      { title: 'Poetry', weighting: 30 },
      { title: 'Prose', weighting: 30 },
      { title: 'Literary Criticism', weighting: 10 },
    ]
  }
];

type Subject = {
  id: number;
  code: string;
  name: string;
  level: string;
  papers: number;
  status: string;
};

type SyllabusSection = {
  title: string;
  weighting: number;
};

type Syllabus = {
  id: number;
  subjectId: number;
  version: string;
  status: string;
  lastUpdated: string;
  sections: SyllabusSection[];
};

export default function SyllabusManagement() {
  const [activeTab, setActiveTab] = useState('subjects');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedSyllabus, setSelectedSyllabus] = useState<Syllabus | null>(null);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showEditSyllabusModal, setShowEditSyllabusModal] = useState(false);
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [newSubject, setNewSubject] = useState<{
    code: string;
    name: string;
    level: string;
    papers: number;
  }>({
    code: '',
    name: '',
    level: 'O Level',
    papers: 2,
  });

  const [editingSections, setEditingSections] = useState<SyllabusSection[]>([]);
  const [syllabusVersion, setSyllabusVersion] = useState('');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSubjects(MOCK_SUBJECTS);
      setSyllabi(MOCK_SYLLABI);
      setLoading(false);
    }, 800);
  }, []);

  const handleAddSubject = () => {
    // Validation
    if (!newSubject.code || !newSubject.name) {
      setErrorMessage('Please fill all required fields');
      return;
    }

    const newId = Math.max(...subjects.map(s => s.id)) + 1;
    const subjectToAdd = {
      ...newSubject,
      id: newId,
      status: 'review'
    };

    setSubjects([...subjects, subjectToAdd]);
    setShowAddSubjectModal(false);
    setSuccessMessage('Subject added successfully and pending review');

    // Reset form
    setNewSubject({
      code: '',
      name: '',
      level: 'O Level',
      papers: 2,
    });
  };

  const handleEditSyllabus = () => {
    if (!selectedSubject || !syllabusVersion) {
      setErrorMessage('Please fill all required fields');
      return;
    }

    // Check if weightings add up to 100%
    const totalWeighting = editingSections.reduce((sum, section) => sum + section.weighting, 0);
    if (totalWeighting !== 100) {
      setErrorMessage('Section weightings must total 100%');
      return;
    }

    // Check if syllabus exists
    const existingSyllabus = syllabi.find(s => s.subjectId === selectedSubject.id);

    if (existingSyllabus) {
      // Update existing syllabus
      const updatedSyllabi = syllabi.map(s => {
        if (s.subjectId === selectedSubject.id) {
          return {
            ...s,
            version: syllabusVersion,
            sections: editingSections,
            lastUpdated: new Date().toISOString().split('T')[0],
            status: 'review'
          };
        }
        return s;
      });
      setSyllabi(updatedSyllabi);
    } else {
      // Create new syllabus
      const newSyllabus: Syllabus = {
        id: Math.max(...syllabi.map(s => s.id)) + 1,
        subjectId: selectedSubject.id,
        version: syllabusVersion,
        sections: editingSections,
        lastUpdated: new Date().toISOString().split('T')[0],
        status: 'review'
      };
      setSyllabi([...syllabi, newSyllabus]);
    }

    setShowEditSyllabusModal(false);
    setSuccessMessage('Syllabus updated successfully and pending review');
  };

  const handleCreateSyllabus = (subject: Subject) => {
    setSelectedSubject(subject);
    const existingSyllabus = syllabi.find(s => s.subjectId === subject.id);

    if (existingSyllabus) {
      setEditingSections([...existingSyllabus.sections]);
      setSyllabusVersion(existingSyllabus.version);
    } else {
      // Default empty sections
      setEditingSections([{ title: '', weighting: 100 }]);
      setSyllabusVersion(new Date().getFullYear().toString());
    }

    setShowEditSyllabusModal(true);
  };

  const handleAddSection = () => {
    // Only add if there's room to maintain 100% total
    if (editingSections.length < 10) {
      const currentTotal = editingSections.reduce((sum, section) => sum + section.weighting, 0);
      const newWeighting = Math.max(5, Math.min(100 - currentTotal, 20));

      // Adjust other weightings proportionally if needed
      let adjustedSections = [...editingSections];
      if (currentTotal + newWeighting > 100) {
        const adjustment = (currentTotal + newWeighting - 100) / editingSections.length;
        adjustedSections = editingSections.map(section => ({
          ...section,
          weighting: Math.max(5, Math.round(section.weighting - adjustment))
        }));
      }

      setEditingSections([...adjustedSections, { title: '', weighting: newWeighting }]);
    }
  };

  const handleRemoveSection = (index: number) => {
    if (editingSections.length > 1) {
      const newSections = editingSections.filter((_, i) => i !== index);

      // Redistribute the removed section's weighting
      const removedWeight = editingSections[index].weighting;
      const weightPerSection = removedWeight / newSections.length;

      const redistributedSections = newSections.map(section => ({
        ...section,
        weighting: Math.round(section.weighting + weightPerSection)
      }));

      setEditingSections(redistributedSections);
    }
  };

  const handleSectionChange = (index: number, field: 'title' | 'weighting', value: string | number) => {
    const updatedSections = [...editingSections];
    updatedSections[index] = {
      ...updatedSections[index],
      [field]: field === 'weighting' ? Number(value) : value
    };
    setEditingSections(updatedSections);
  };

  const handleViewSyllabus = (subject: Subject) => {
    const syllabus = syllabi.find(s => s.subjectId === subject.id);
    if (syllabus) {
      setSelectedSyllabus(syllabus);
      setSelectedSubject(subject);
      setActiveTab('syllabusView');
    } else {
      setErrorMessage(`No syllabus found for ${subject.name}`);
    }
  };

  const filteredSubjects = subjects
    .filter(subject =>
      (subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       subject.code.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterLevel === 'all' || subject.level === filterLevel)
    );

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-end mb-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
            >
              {language === 'en' ? 'Français' : 'English'}
            </Button>
            <Button onClick={() => setShowAddSubjectModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {language === 'en' ? 'Add Subject' : 'Ajouter une Matière'}
            </Button>
          </div>
        </div>

        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <Check className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">
              {language === 'en' ? 'Syllabus Management' : 'Gestion des Programmes'}
            </h2>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="subjects" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="subjects">
                  {language === 'en' ? 'Subjects' : 'Matières'}
                </TabsTrigger>
                {selectedSubject && selectedSyllabus && (
                  <TabsTrigger value="syllabusView">
                    {`${selectedSubject.name} ${language === 'en' ? 'Syllabus' : 'Programme'}`}
                  </TabsTrigger>
                )}
              </TabsList>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-500">
                    {language === 'en' ? 'Loading...' : 'Chargement...'}
                  </span>
                </div>
              ) : (
                <>
                  <TabsContent value="subjects">
                    <div className="flex gap-4 mb-6">
                      <div className="relative flex-1">
                        <Input
                          type="search"
                          placeholder={language === 'en' ? 'Search subjects...' : 'Rechercher des matières...'}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                      <Select value={filterLevel} onValueChange={setFilterLevel}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={language === 'en' ? 'All Levels' : 'Tous les Niveaux'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{language === 'en' ? 'All Levels' : 'Tous les Niveaux'}</SelectItem>
                          <SelectItem value="O Level">O Level</SelectItem>
                          <SelectItem value="A Level">A Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{language === 'en' ? 'Code' : 'Code'}</TableHead>
                            <TableHead>{language === 'en' ? 'Subject Name' : 'Nom de la Matière'}</TableHead>
                            <TableHead>{language === 'en' ? 'Level' : 'Niveau'}</TableHead>
                            <TableHead>{language === 'en' ? 'Papers' : 'Épreuves'}</TableHead>
                            <TableHead>{language === 'en' ? 'Syllabus' : 'Programme'}</TableHead>
                            <TableHead>{language === 'en' ? 'Status' : 'Statut'}</TableHead>
                            <TableHead className="text-right">{language === 'en' ? 'Actions' : 'Actions'}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredSubjects.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8">
                                <div className="flex flex-col items-center">
                                  <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                                  <p className="text-gray-500">
                                    {language === 'en' ? 'No subjects found' : 'Aucune matière trouvée'}
                                  </p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredSubjects.map((subject) => {
                              const subjectSyllabus = syllabi.find(s => s.subjectId === subject.id);
                              return (
                                <TableRow key={subject.id}>
                                  <TableCell className="font-medium">{subject.code}</TableCell>
                                  <TableCell>{subject.name}</TableCell>
                                  <TableCell>{subject.level}</TableCell>
                                  <TableCell>{subject.papers}</TableCell>
                                  <TableCell>
                                    {subjectSyllabus ? (
                                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                        {language === 'en' ? 'Available' : 'Disponible'} (v{subjectSyllabus.version})
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                                        {language === 'en' ? 'Not Available' : 'Non Disponible'}
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={subject.status === 'active' ? 'default' : 'secondary'}>
                                      {subject.status === 'active'
                                        ? language === 'en' ? 'Active' : 'Actif'
                                        : language === 'en' ? 'Review' : 'En Révision'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                          <span className="sr-only">Open menu</span>
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleCreateSyllabus(subject)}>
                                          <Edit className="mr-2 h-4 w-4" />
                                          {subjectSyllabus
                                            ? language === 'en' ? 'Edit Syllabus' : 'Modifier le Programme'
                                            : language === 'en' ? 'Create Syllabus' : 'Créer un Programme'}
                                        </DropdownMenuItem>
                                        {subjectSyllabus && (
                                          <DropdownMenuItem onClick={() => handleViewSyllabus(subject)}>
                                            <FileText className="mr-2 h-4 w-4" />
                                            {language === 'en' ? 'View Syllabus' : 'Voir le Programme'}
                                          </DropdownMenuItem>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  <TabsContent value="syllabusView">
                    {selectedSubject && selectedSyllabus && (
                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <h2 className="text-xl font-bold">{selectedSubject.name} {language === 'en' ? 'Syllabus' : 'Programme'}</h2>
                            <p className="text-sm text-gray-500 mt-1">
                              {language === 'en' ? 'Version' : 'Version'}: {selectedSyllabus.version} |
                              {language === 'en' ? ' Last Updated' : ' Dernière Mise à Jour'}: {selectedSyllabus.lastUpdated} |
                              {language === 'en' ? ' Status' : ' Statut'}: {' '}
                              <Badge className={selectedSyllabus.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                {selectedSyllabus.status === 'active'
                                  ? language === 'en' ? 'Active' : 'Actif'
                                  : language === 'en' ? 'Under Review' : 'En Révision'}
                              </Badge>
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => handleCreateSyllabus(selectedSubject)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            {language === 'en' ? 'Edit Syllabus' : 'Modifier le Programme'}
                          </Button>
                        </div>

                        <Card>
                          <CardHeader>
                            <h3 className="text-lg font-semibold">{language === 'en' ? 'Syllabus Content' : 'Contenu du Programme'}</h3>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{language === 'en' ? 'Section' : 'Section'}</TableHead>
                                  <TableHead className="text-right">{language === 'en' ? 'Weighting (%)' : 'Pondération (%)'}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedSyllabus.sections.map((section, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{section.title}</TableCell>
                                    <TableCell className="text-right">{section.weighting}%</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                              <tfoot>
                                <tr className="border-t">
                                  <th className="py-3 px-4 text-left font-semibold">{language === 'en' ? 'Total' : 'Total'}</th>
                                  <th className="py-3 px-4 text-right font-semibold">
                                    {selectedSyllabus.sections.reduce((sum, section) => sum + section.weighting, 0)}%
                                  </th>
                                </tr>
                              </tfoot>
                            </Table>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </TabsContent>
                </>
              )}
            </Tabs>
          </CardContent>
        </Card>

        {/* Add Subject Dialog */}
        <Dialog open={showAddSubjectModal} onOpenChange={setShowAddSubjectModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{language === 'en' ? 'Add New Subject' : 'Ajouter une Nouvelle Matière'}</DialogTitle>
              <DialogDescription>
                {language === 'en'
                  ? 'Add a new subject to the system. You can create a syllabus later.'
                  : 'Ajoutez une nouvelle matière au système. Vous pourrez créer un programme plus tard.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject-code" className="text-right">
                  {language === 'en' ? 'Code' : 'Code'}
                </Label>
                <Input
                  id="subject-code"
                  value={newSubject.code}
                  onChange={(e) => setNewSubject({...newSubject, code: e.target.value})}
                  maxLength={5}
                  placeholder="e.g. PHY"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject-name" className="text-right">
                  {language === 'en' ? 'Name' : 'Nom'}
                </Label>
                <Input
                  id="subject-name"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                  placeholder="e.g. Physics"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject-level" className="text-right">
                  {language === 'en' ? 'Level' : 'Niveau'}
                </Label>
                <Select
                  value={newSubject.level}
                  onValueChange={(value) => setNewSubject({...newSubject, level: value})}
                >
                  <SelectTrigger id="subject-level" className="col-span-3">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="O Level">O Level</SelectItem>
                    <SelectItem value="A Level">A Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject-papers" className="text-right">
                  {language === 'en' ? 'Papers' : 'Épreuves'}
                </Label>
                <Select
                  value={newSubject.papers.toString()}
                  onValueChange={(value) => setNewSubject({...newSubject, papers: Number(value)})}
                >
                  <SelectTrigger id="subject-papers" className="col-span-3">
                    <SelectValue placeholder="Number of papers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddSubjectModal(false)}>
                {language === 'en' ? 'Cancel' : 'Annuler'}
              </Button>
              <Button onClick={handleAddSubject}>
                {language === 'en' ? 'Add Subject' : 'Ajouter la Matière'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Syllabus Dialog */}
        <Dialog open={showEditSyllabusModal} onOpenChange={setShowEditSyllabusModal}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {selectedSubject && (
                  language === 'en'
                    ? `Edit ${selectedSubject.name} Syllabus`
                    : `Modifier le Programme de ${selectedSubject.name}`
                )}
              </DialogTitle>
              <DialogDescription>
                {language === 'en'
                  ? 'Define the syllabus sections and their weightings. Total must equal 100%.'
                  : 'Définissez les sections du programme et leurs pondérations. Le total doit être égal à 100%.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="syllabus-version" className="text-right">
                  {language === 'en' ? 'Version/Year' : 'Version/Année'}
                </Label>
                <Input
                  id="syllabus-version"
                  value={syllabusVersion}
                  onChange={(e) => setSyllabusVersion(e.target.value)}
                  placeholder="e.g. 2025"
                  className="col-span-3"
                />
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold">
                    {language === 'en' ? 'Syllabus Sections' : 'Sections du Programme'}
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddSection}
                    disabled={editingSections.length >= 10}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {language === 'en' ? 'Add Section' : 'Ajouter une Section'}
                  </Button>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {editingSections.map((section, index) => (
                    <div key={index} className="border rounded-md p-4 relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={() => handleRemoveSection(index)}
                        disabled={editingSections.length <= 1}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>

                      <div className="grid gap-3">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor={`section-title-${index}`} className="text-right">
                            {language === 'en' ? 'Title' : 'Titre'}
                          </Label>
                          <Input
                            id={`section-title-${index}`}
                            value={section.title}
                            onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                            placeholder={language === 'en' ? 'e.g. Reading Comprehension' : 'ex. Compréhension de Lecture'}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor={`section-weight-${index}`} className="text-right">
                            {language === 'en' ? 'Weighting (%)' : 'Pondération (%)'}
                          </Label>
                          <Input
                            id={`section-weight-${index}`}
                            type="number"
                            min="5"
                            max="100"
                            value={section.weighting}
                            onChange={(e) => handleSectionChange(index, 'weighting', e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end items-center mt-4">
                  <div className="text-sm font-medium">
                    {language === 'en' ? 'Total:' : 'Total:'} {' '}
                    <span className={editingSections.reduce((sum, section) => sum + section.weighting, 0) !== 100
                      ? 'text-red-600 font-bold'
                      : 'text-green-600 font-bold'
                    }>
                      {editingSections.reduce((sum, section) => sum + section.weighting, 0)}%
                    </span>
                    {' '}
                    {editingSections.reduce((sum, section) => sum + section.weighting, 0) !== 100 && (
                      <Badge variant="outline" className="bg-red-100 text-red-800 ml-2">
                        {language === 'en' ? 'Must equal 100%' : 'Doit être égal à 100%'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditSyllabusModal(false)}>
                {language === 'en' ? 'Cancel' : 'Annuler'}
              </Button>
              <Button
                onClick={handleEditSyllabus}
                disabled={editingSections.reduce((sum, section) => sum + section.weighting, 0) !== 100}
              >
                {language === 'en' ? 'Save Syllabus' : 'Enregistrer le Programme'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
