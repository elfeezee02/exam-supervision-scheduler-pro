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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Edit, Trash2, Users, UserCheck, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Supervisor } from '@/types';

const Supervisors = () => {
  const { supervisors, addSupervisor, updateSupervisor, deleteSupervisor } = useESSS();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    department: '',
    phone: '',
    maxAssignments: 5,
    status: 'active' as 'active' | 'inactive'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.fullName || !formData.department) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const supervisorData = {
      ...formData,
      maxAssignments: Number(formData.maxAssignments),
      role: 'supervisor' as const
    };

    if (editingSupervisor) {
      updateSupervisor(editingSupervisor.id, supervisorData);
      toast({
        title: "Success",
        description: "Supervisor updated successfully"
      });
    } else {
      addSupervisor(supervisorData);
      toast({
        title: "Success",
        description: "Supervisor added successfully"
      });
    }

    setIsDialogOpen(false);
    setEditingSupervisor(null);
    setFormData({
      username: '',
      email: '',
      fullName: '',
      department: '',
      phone: '',
      maxAssignments: 5,
      status: 'active'
    });
  };

  const handleEdit = (supervisor: Supervisor) => {
    setEditingSupervisor(supervisor);
    setFormData({
      username: supervisor.username,
      email: supervisor.email,
      fullName: supervisor.fullName,
      department: supervisor.department,
      phone: supervisor.phone || '',
      maxAssignments: supervisor.maxAssignments || 5,
      status: supervisor.status || 'active'
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (supervisorId: string) => {
    deleteSupervisor(supervisorId);
    toast({
      title: "Success",
      description: "Supervisor removed successfully"
    });
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return 'U';
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Supervisors</h1>
          <p className="text-muted-foreground">Manage examination supervisors and their profiles</p>
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
                {editingSupervisor ? 'Update supervisor information' : 'Register a new examination supervisor'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g., john.doe"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g., john.doe@university.edu"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g., Dr. John Doe"
                />
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
                  <Label htmlFor="maxAssignments">Max Assignments per Day</Label>
                  <Input
                    id="maxAssignments"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.maxAssignments}
                    onChange={(e) => setFormData({ ...formData, maxAssignments: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-primary text-white">
                  {editingSupervisor ? 'Update' : 'Add'} Supervisor
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
            <div className="text-2xl font-bold">
              {supervisors.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {supervisors.filter(s => s.status === 'active').length}
            </div>
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
            Manage supervisor profiles and assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supervisor</TableHead>
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
                          {getInitials(supervisor.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{supervisor.fullName}</p>
                        <p className="text-sm text-muted-foreground">@{supervisor.username}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{supervisor.department}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{supervisor.email}</p>
                      {supervisor.phone && (
                        <p className="text-sm text-muted-foreground">{supervisor.phone}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {supervisor.maxAssignments || 5} per day
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={supervisor.status === 'active' ? 'default' : 'secondary'}>
                      {supervisor.status || 'active'}
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