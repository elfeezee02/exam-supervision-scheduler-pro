import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, RefreshCw } from 'lucide-react';
import { useESSS } from '@/context/ESSContext';

const Header = () => {
  const { currentUser, logout, refreshData, loading } = useESSS();

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Welcome back, {currentUser?.username}
        </h1>
        <p className="text-sm text-muted-foreground">
          {currentUser?.department} • {currentUser?.role === 'admin' ? 'Administrator' : 'Supervisor'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          disabled={loading}
          className="btn-secondary-academic"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="btn-secondary-academic"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;