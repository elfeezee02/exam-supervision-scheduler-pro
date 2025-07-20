import React, { useState } from 'react';
import { useESSS } from '@/context/ESSContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Calendar, Clock, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Exam } from '@/types';

const Exams = () => {
  const { exams, venues, addExam, updateExam, deleteExam } = useESSS();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    date: '',
    startTime: '',
    endTime: '',
    venueId: '',
    supervisorsNeeded: 2
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.courseCode || !formData.courseName || !formData.date || !formData.startTime || !formData.endTime || !formData.venueId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const examData = {
      ...formData,
      supervisorsNeeded: Number(formData.supervisorsNeeded)
    };

    if (editingExam) {
      updateExam(editingExam.id, examData);
      toast({
        title: "Success",
        description: "Exam updated successfully"
      });
    } else {
      addExam(examData);
      toast({
        title: "Success",
        description: "Exam created successfully"
      });
    }

    setIsDialogOpen(false);
    setEditingExam(null);
    setFormData({
      courseCode: '',
      courseName: '',
      date: '',
      startTime: '',
      endTime: '',
      venueId: '',
      supervisorsNeeded: 2
    });
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      courseCode: exam.courseCode,
      courseName: exam.courseName,
      date: exam.date,
      startTime: exam.startTime,
      endTime: exam.endTime,
      venueId: exam.venueId,
      supervisorsNeeded: exam.supervisorsNeeded
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (examId: string) => {
    deleteExam(examId);
    toast({
      title: "Success",
      description: "Exam deleted successfully"
    });
  };

  const getVenueName = (venueId: string) => {
    const venue = venues.find(v => v.id === venueId);
    return venue ? venue.name : 'Unknown Venue';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Exams</h1>
          <p className="text-muted-foreground">Manage examination schedules and sessions</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-white shadow-glow">
              <Plus className="h-4 w-4 mr-2" />
              Add Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingExam ? 'Edit Exam' : 'Add New Exam'}</DialogTitle>
              <DialogDescription>
                {editingExam ? 'Update exam details' : 'Create a new examination session'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="courseCode">Course Code *</Label>
                  <Input
                    id="courseCode"
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                    placeholder="e.g., CS101"
                  />
                </div>
                <div>
                  <Label htmlFor="courseName">Course Name *</Label>
                  <Input
                    id="courseName"
                    value={formData.courseName}
                    onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                    placeholder="e.g., Introduction to Computer Science"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="venue">Venue *</Label>
                <Select value={formData.venueId} onValueChange={(value) => setFormData({ ...formData, venueId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name} (Capacity: {venue.capacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="supervisorsNeeded">Supervisors Needed</Label>
                <Input
                  id="supervisorsNeeded"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.supervisorsNeeded}
                  onChange={(e) => setFormData({ ...formData, supervisorsNeeded: Number(e.target.value) })}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-primary text-white">
                  {editingExam ? 'Update' : 'Create'} Exam
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Examination Schedule
          </CardTitle>
          <CardDescription>
            View and manage all examination sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Supervisors</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{exam.courseCode}</p>
                      <p className="text-sm text-muted-foreground">{exam.courseName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(exam.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {exam.startTime} - {exam.endTime}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{getVenueName(exam.venueId)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {exam.supervisorsNeeded} needed
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Scheduled</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(exam)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(exam.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Exams;