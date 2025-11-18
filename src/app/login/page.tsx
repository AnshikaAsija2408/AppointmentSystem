'use client';

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { loginUser, clearError, selectAuth } from "@/store/slices/authSlice";
import { AppDispatch } from "@/store/index";

const LoginPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoading, error, isAuthenticated, user } = useSelector(selectAuth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role using React Router (no page refresh)
      console.log("🔍 Debug - User role:", user.role);
      
      if (user.role === 'ADMIN') {
        console.log("🚀 Redirecting to admin dashboard");
        router.push('/admin/dashboard');
      } else if (user.role === 'TBB_STAFF' || user.role === 'STAFF') {
        console.log("🚀 Redirecting to staff dashboard");
        router.push('/dashboard/staff');
      } else if (user.role === 'CLIENT') {
        console.log("🚀 Redirecting to client dashboard");
        router.push('/dashboard/client');
      } else {
        // Default fallback
        console.log("🚀 Redirecting to client dashboard (default fallback)");
        router.push('/dashboard/client');
      }
    }
  }, [isAuthenticated, user, router]);

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const result = await dispatch(loginUser({
        email: formData.email,
        password: formData.password
      }));

      if (loginUser.fulfilled.match(result)) {
        console.log("Login successful:", result.payload.user);
        toast.success(`Login successful! Welcome ${result.payload.user.name}!`);
        console.log("User role:", result.payload.user.role);

        // Let the useEffect handle the redirect based on Redux state
        // This prevents page refresh and maintains console logs
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-xl shadow-lg">
              <Calendar className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">TBB Portal</h1>
            <p className="text-muted-foreground mt-2">
              Private client portal access
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="shadow-elegant border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10 h-12"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10 h-12"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    name="rememberMe"
                    className="rounded border-border" 
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <span className="text-foreground">
                Contact your TBB representative for an invitation.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>© 2025 TBB. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;