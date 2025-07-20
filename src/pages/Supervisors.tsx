import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Users, UserCheck, Clock } from 'lucide-react';
import { useSupervisors, CreateSupervisorData, SupervisorData } from '@/hooks/useSupervisors';
import { Skeleton } from '@/components/ui/skeleton';

const Supervisors = () => {
  const { supervisors, loading, createSupervisor, updateSupervisor, deleteSupervisor } = useSupervisors();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState<SupervisorData | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    department: '',
    phone: '',
    max_assignments: 5,
    max_daily_assignments: 2,
    specializations: [] as string[]
  });

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      password: '',
      department: '',
      phone: '',
      max_assignments: 5,
      max_daily_assignments: 2,
      specializations: []
    });
    setEditingSupervisor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const supervisorData: CreateSupervisorData = {
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password,
      department: formData.department,
      phone: formData.phone,
      max_assignments: formData.max_assignments,
      max_daily_assignments: formData.max_daily_assignments,
      specializations: formData.specializations
    };

    let result;
    if (editingSupervisor) {
      result = await updateSupervisor(editingSupervisor.id, supervisorData);
    } else {
      result = await createSupervisor(supervisorData);
    }

    if (result.success) {
      resetForm();
      setIsDialogOpen(false);
    }
  };

  const handleEdit = (supervisor: SupervisorData) => {
    setEditingSupervisor(supervisor);
    setFormData({
      full_name: supervisor.full_name,
      email: supervisor.email,
      password: '', // Don't pre-fill password for security
      department: supervisor.department,
      phone: supervisor.phone || '',
      max_assignments: supervisor.max_assignments,
      max_daily_assignments: supervisor.max_daily_assignments,
      specializations: supervisor.specializations
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (supervisorId: string) => {
    if (window.confirm('Are you sure you want to delete this supervisor? This will also delete their login account.')) {
      await deleteSupervisor(supervisorId);
    }
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return 'U';
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
  };

  const activeSupervisors = supervisors.filter(s => s.status === 'active');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Supervisors</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Supervisors</h1>
          <p className="text-muted-foreground">Manage examination supervisors and their login credentials</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-white shadow-glow">
              <Plus className="h-4 w-4 mr-2" />
              Add Supervisor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingSupervisor ? 'Edit Supervisor' : 'Add New Supervisor'}</DialogTitle>
              <DialogDescription>
                {editingSupervisor ? 'Update supervisor information' : 'Create a new supervisor account with login credentials'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g., Dr. John Doe"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g., john.doe@university.edu"
                    required
                    disabled={!!editingSupervisor}
                  />
                </div>

                {!editingSupervisor && (
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter secure password"
                      required
                      minLength={6}
                    />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g., +1234567890"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_assignments">Max Total Assignments</Label>
                  <Input
                    id="max_assignments"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.max_assignments}
                    onChange={(e) => setFormData({ ...formData, max_assignments: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="max_daily_assignments">Max Daily Assignments</Label>
                  <Input
                    id="max_daily_assignments"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.max_daily_assignments}
                    onChange={(e) => setFormData({ ...formData, max_daily_assignments: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="specializations">Specializations (one per line)</Label>
                <Textarea
                  id="specializations"
                  value={formData.specializations.join('\n')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    specializations: e.target.value.split('\n').filter(s => s.trim()) 
                  })}
                  placeholder="Enter specializations, one per line"
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-primary text-white">
                  {editingSupervisor ? 'Update' : 'Create'} Supervisor
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Supervisors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supervisors.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Supervisors</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSupervisors.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSupervisors.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Supervisor Directory
          </CardTitle>
          <CardDescription>
            Manage supervisor profiles and login credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supervisor</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Max Assignments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supervisors.map((supervisor) => (
                <TableRow key={supervisor.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-primary text-white">
                          {getInitials(supervisor.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{supervisor.full_name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{supervisor.email}</div>
                  </TableCell>
                  <TableCell>{supervisor.department}</TableCell>
                  <TableCell>
                    {supervisor.phone || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline">
                        Total: {supervisor.max_assignments}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        Daily: {supervisor.max_daily_assignments}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={supervisor.status === 'active' ? 'default' : 'secondary'}>
                      {supervisor.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(supervisor)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(supervisor.id)}
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

export default Supervisors;