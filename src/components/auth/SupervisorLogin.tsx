import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, GraduationCap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useESSS } from '@/context/ESSContext';

const SupervisorLogin = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const { loginSupervisor, loading, currentUser } = useESSS();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await loginSupervisor(loginData.email, loginData.password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-primary p-3 rounded-xl shadow-glow">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ESSS
            </h1>
          </div>
          <p className="text-muted-foreground">Supervisor Portal</p>
        </div>

        <Card className="card-academic">
          <CardHeader className="text-center">
            <div className="mx-auto bg-accent/10 p-3 rounded-full w-fit mb-4">
              <Users className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl">Supervisor Login</CardTitle>
            <CardDescription>
              Sign in to your supervisor account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
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
                {loading ? 'Signing in...' : 'Sign In as Supervisor'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Are you an administrator?{' '}
                <Link to="/admin-login" className="text-primary hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupervisorLogin;