import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Risk & Control System</CardTitle>
          <CardDescription className="text-center">
            Sign in to access the governance platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 border-t pt-4">
            <p className="text-sm text-center text-muted-foreground mb-3">Demo Accounts:</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between bg-gray-50 p-2 rounded">
                <span className="font-medium">Board Member:</span>
                <span className="text-muted-foreground">board@company.com / demo123</span>
              </div>
              <div className="flex justify-between bg-gray-50 p-2 rounded">
                <span className="font-medium">Control Owner:</span>
                <span className="text-muted-foreground">owner@company.com / demo123</span>
              </div>
              <div className="flex justify-between bg-gray-50 p-2 rounded">
                <span className="font-medium">Risk/Compliance:</span>
                <span className="text-muted-foreground">risk@company.com / demo123</span>
              </div>
              <div className="flex justify-between bg-gray-50 p-2 rounded">
                <span className="font-medium">Internal Audit:</span>
                <span className="text-muted-foreground">audit@company.com / demo123</span>
              </div>
              <div className="flex justify-between bg-gray-50 p-2 rounded">
                <span className="font-medium">Framework Admin:</span>
                <span className="text-muted-foreground">admin@company.com / demo123</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
