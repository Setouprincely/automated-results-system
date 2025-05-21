'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import Layout from '@/components/layouts/layout'
import {
  ChevronDown,
  Save,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react'

// Mock subjects for O Level
const subjects = [
  { id: 1, code: "0500", name: "English Language" },
  { id: 2, code: "0580", name: "Mathematics" },
  { id: 3, code: "0620", name: "Chemistry" },
  { id: 4, code: "0625", name: "Physics" },
  { id: 5, code: "0610", name: "Biology" },
  { id: 6, code: "0470", name: "History" },
  { id: 7, code: "0460", name: "Geography" },
  { id: 8, code: "0520", name: "French" },
  { id: 9, code: "0654", name: "Computer Science" },
  { id: 10, code: "0445", name: "Design & Technology" }
]

// Default grade boundaries
const defaultGradeBoundaries = {
  9: 90,
  8: 80,
  7: 70,
  6: 60,
  5: 50,
  4: 40,
  3: 30,
  2: 20,
  1: 10
}

// Define types
interface GradeBoundaries {
  [grade: string]: number;
}

interface SubjectPerformance {
  subject: string;
  passRate: number;
  distinctionRate: number;
}

interface Statistics {
  totalCandidates: number;
  passRate: number;
  distinctionRate: number;
  averageScore: number;
  subjectPerformance: SubjectPerformance[];
}

export default function OLevelGradingPage() {
  const [selectedSubject, setSelectedSubject] = useState("")
  const [gradeBoundaries, setGradeBoundaries] = useState<GradeBoundaries>(defaultGradeBoundaries)
  const [isAutomatedGrading, setIsAutomatedGrading] = useState(true)
  const [showSaveAlert, setShowSaveAlert] = useState(false)
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [session, setSession] = useState("June")
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(false)

  // Mock statistics
  const statistics: Statistics = {
    totalCandidates: 15273,
    passRate: 67.8,
    distinctionRate: 12.3,
    averageScore: 58.4,
    subjectPerformance: [
      { subject: "English Language", passRate: 72.5, distinctionRate: 15.2 },
      { subject: "Mathematics", passRate: 65.8, distinctionRate: 9.7 },
      { subject: "Chemistry", passRate: 61.2, distinctionRate: 14.3 },
      { subject: "Physics", passRate: 59.6, distinctionRate: 13.8 },
      { subject: "Biology", passRate: 70.3, distinctionRate: 11.9 }
    ]
  }

  const handleGradeBoundaryChange = (grade: string, value: number[]) => {
    setGradeBoundaries(prev => ({
      ...prev,
      [grade]: value[0]
    }))
  }

  const handleSaveGradeBoundaries = () => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setShowSaveAlert(true)
    }, 1000)
  }

  const handlePublishGrades = () => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setIsPublished(true)
    }, 1500)
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">O-Level Grading</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Configure grade boundaries and process results for GCE O-Level examinations
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="automated-grading"
                checked={isAutomatedGrading}
                onCheckedChange={setIsAutomatedGrading}
              />
              <Label htmlFor="automated-grading">Automated Grading</Label>
            </div>
            <Badge variant={isPublished ? "default" : "outline"} className={`ml-2 ${isPublished ? "bg-green-500" : ""}`}>
              {isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Examination Details</CardTitle>
              <CardDescription>Select subject and examination session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="year">Examination Year</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Year</SelectLabel>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session">Examination Session</Label>
                <Select value={session} onValueChange={setSession}>
                  <SelectTrigger id="session">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Session</SelectLabel>
                      <SelectItem value="June">June</SelectItem>
                      <SelectItem value="November">November</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Subjects</SelectLabel>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.code}>
                          {subject.code} - {subject.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 space-y-4">
                <Button className="w-full flex items-center gap-2" onClick={handleSaveGradeBoundaries} disabled={loading}>
                  <Save size={16} />
                  Save Grade Boundaries
                </Button>

                <Button
                  className="w-full flex items-center gap-2"
                  variant="outline"
                  onClick={() => setGradeBoundaries(defaultGradeBoundaries)}
                >
                  <ChevronDown size={16} />
                  Reset to Defaults
                </Button>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <Button
                  className="w-full flex items-center gap-2"
                  variant="outline"
                >
                  <Upload size={16} />
                  Import Grade Boundaries
                </Button>

                <Button
                  className="w-full flex items-center gap-2"
                  variant="outline"
                >
                  <Download size={16} />
                  Export Grade Boundaries
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Grade Boundaries Configuration</CardTitle>
              <CardDescription>
                Set minimum score requirements for each grade level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="sliders" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="sliders">Slider View</TabsTrigger>
                  <TabsTrigger value="table">Table View</TabsTrigger>
                </TabsList>

                <TabsContent value="sliders" className="space-y-6 pt-4">
                  {Object.entries(gradeBoundaries).map(([grade, value]) => (
                    <div key={grade} className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Grade {grade}</Label>
                        <span className="font-medium">{value}%</span>
                      </div>
                      <Slider
                        defaultValue={[value]}
                        min={0}
                        max={100}
                        step={1}
                        value={[value]}
                        onValueChange={(value) => handleGradeBoundaryChange(grade, value)}
                      />
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="table">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Grade</TableHead>
                        <TableHead>Minimum Score (%)</TableHead>
                        <TableHead>Typical Performance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(gradeBoundaries)
                        .sort(([gradeA], [gradeB]) => Number(gradeB) - Number(gradeA))
                        .map(([grade, value]) => (
                        <TableRow key={grade}>
                          <TableCell className="font-medium">Grade {grade}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={value}
                              onChange={(e) => handleGradeBoundaryChange(grade, [parseInt(e.target.value)])}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            {Number(grade) >= 7 ? "Distinction" :
                             Number(grade) >= 4 ? "Credit" :
                             Number(grade) >= 1 ? "Pass" : "Fail"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>

              <div className="mt-6 flex justify-end space-x-4">
                <Button
                  onClick={handlePublishGrades}
                  variant={isPublished ? "outline" : "default"}
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  {isPublished ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {isPublished ? "Republish Results" : "Publish Results"}
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileSpreadsheet size={16} />
                  Generate Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Results Statistics</CardTitle>
            <CardDescription>
              Overview of candidate performance for {selectedSubject ? subjects.find(s => s.code === selectedSubject)?.name : "all subjects"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{statistics.totalCandidates.toLocaleString()}</div>
                  <p className="text-sm text-gray-500">Total Candidates</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{statistics.passRate}%</div>
                  <p className="text-sm text-gray-500">Pass Rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{statistics.distinctionRate}%</div>
                  <p className="text-sm text-gray-500">Distinction Rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{statistics.averageScore}</div>
                  <p className="text-sm text-gray-500">Average Score</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Subject Performance Breakdown</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Pass Rate (%)</TableHead>
                    <TableHead>Distinction Rate (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statistics.subjectPerformance.map((subject, index) => (
                    <TableRow key={index}>
                      <TableCell>{subject.subject}</TableCell>
                      <TableCell>{subject.passRate}%</TableCell>
                      <TableCell>{subject.distinctionRate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showSaveAlert} onOpenChange={setShowSaveAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Grade Boundaries Saved</AlertDialogTitle>
            <AlertDialogDescription>
              The grade boundaries for {selectedSubject ?
              subjects.find(s => s.code === selectedSubject)?.name : "all subjects"} have been successfully saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  )
}