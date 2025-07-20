import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Users, Shield, BookOpen } from 'lucide-react';
import { useESSS } from '@/context/ESSContext';

const LoginForm = () => {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    department: '',
    role: 'supervisor' as 'admin' | 'supervisor'
  });
  
  const { login, register, loading } = useESSS();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(loginData.username, loginData.password);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register(registerData);
    if (success) {
      setRegisterData({ username: '', email: '', department: '', role: 'supervisor' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="space-y-8 fade-in">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <div className="bg-gradient-primary p-3 rounded-xl shadow-glow">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                ESSS
              </h1>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Examination Supervision
              <span className="block text-primary">Scheduling System</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Streamline your academic exam supervision with intelligent scheduling, 
              automated assignments, and real-time conflict resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-academic p-6 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Smart Assignment</h3>
              <p className="text-sm text-muted-foreground">Automated supervisor allocation based on availability and fairness</p>
            </div>
            <div className="card-academic p-6 text-center">
              <Shield className="h-8 w-8 text-accent mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Conflict Resolution</h3>
              <p className="text-sm text-muted-foreground">Real-time detection and resolution of scheduling conflicts</p>
            </div>
            <div className="card-academic p-6 text-center">
              <BookOpen className="h-8 w-8 text-academic-orange mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Comprehensive Management</h3>
              <p className="text-sm text-muted-foreground">Complete exam, venue, and supervisor management</p>
            </div>
          </div>
        </div>

        {/* Login/Register Form */}
        <div className="slide-up">
          <Card className="card-academic max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome to ESSS</CardTitle>
              <CardDescription>
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={loginData.username}
                        onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                        className="input-academic"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        className="input-academic"
                        required
                      />
                    </div>
                    <Button type="submit" className="btn-academic w-full" disabled={loading}>
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>

                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Demo Credentials:</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><strong>Admin:</strong> admin / password</p>
                      <p><strong>Supervisor:</strong> dr.smith / password</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-username">Username</Label>
                      <Input
                        id="reg-username"
                        type="text"
                        placeholder="Choose a username"
                        value={registerData.username}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                        className="input-academic"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                        className="input-academic"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        type="text"
                        placeholder="Enter your department"
                        value={registerData.department}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, department: e.target.value }))}
                        className="input-academic"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <select
                        id="role"
                        value={registerData.role}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, role: e.target.value as 'admin' | 'supervisor' }))}
                        className="input-academic"
                        required
                      >
                        <option value="supervisor">Supervisor</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                    <Button type="submit" className="btn-academic w-full" disabled={loading}>
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;