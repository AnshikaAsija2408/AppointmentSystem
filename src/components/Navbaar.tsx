'use client';

import React from 'react'
import Link from 'next/link'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ModeToggle } from "@/components/theme-toogle";
import { Calendar, User, Menu, LayoutDashboard, BookOpen, Clock, Info, LogOut, UserCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { selectAuth, logoutUser } from '@/store/slices/authSlice';
import { AppDispatch } from '@/store/index';

const Navbaar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(selectAuth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/');
  };

  const handleProfile = () => {
    router.push('/profile');
  };
  return (
    <nav className="sticky mx-auto max-w-7xl top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-9 h-9 bg-primary rounded-lg shadow-md">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground hover:text-primary transition-colors">
              TBB Portal
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/dashboard/client" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Client Portal
            </Link>
            <Link 
              href="/dashboard/staff" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Staff Portal
            </Link>
            <Link 
              href="/dashboard/support" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Q&A Support
            </Link>
            <Link 
              href="/admin/dashboard" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin
            </Link>
          </div>

          {/* Desktop Right side actions */}
          <div className="hidden md:flex items-center space-x-3">
            <ModeToggle />
            
            {isAuthenticated && user ? (
              // Authenticated user buttons
              <>
                {/* <span className="text-sm text-muted-foreground">
                  Welcome, {user.name}
                </span> */}
                
                {/* Profile Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleProfile}
                  className="flex items-center space-x-2"
                >
                  <UserCircle className="h-4 w-4" />
                  <span>Profile</span>
                </Button>

                {/* Logout Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              // Non-authenticated user buttons
              <>
                {/* Login Button */}
                <Link href="/login">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Log In</span>
                  </Button>
                </Link>

                {/* Get Started Button */}
                <Link href="/login">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors shadow-sm">
                    Access Portal
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Right side - Theme toggle and Hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            <ModeToggle />
            
            {/* Mobile Menu Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] sm:w-[400px] p-0">
                <div className="p-6 border-b border-border/10">
                  <SheetHeader>
                    <SheetTitle className="flex items-center space-x-3 text-lg">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl shadow-sm">
                        <Calendar className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <span className="font-bold">TBB Portal</span>
                    </SheetTitle>
                    <SheetDescription className="text-muted-foreground mt-2">
                      Navigate through your appointment management platform
                    </SheetDescription>
                  </SheetHeader>
                </div>
                
                <div className="px-6 py-4 flex-1">
                  {/* Navigation Links */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                        Navigation
                      </h3>
                      <div className="space-y-2">
                        <Link 
                          href="/dashboard/client" 
                          className="flex items-center space-x-3 text-sm font-medium text-foreground hover:text-primary transition-all duration-200 p-3 rounded-lg hover:bg-primary/10 group"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary/60 group-hover:bg-primary/20 transition-colors">
                            <LayoutDashboard className="h-4 w-4" />
                          </div>
                          <span>Client Dashboard</span>
                        </Link>
                        <Link 
                          href="/dashboard/staff" 
                          className="flex items-center space-x-3 text-sm font-medium text-foreground hover:text-primary transition-all duration-200 p-3 rounded-lg hover:bg-primary/10 group"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary/60 group-hover:bg-primary/20 transition-colors">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <span>Staff Dashboard</span>
                        </Link>
                        <Link 
                          href="/dashboard/support" 
                          className="flex items-center space-x-3 text-sm font-medium text-foreground hover:text-primary transition-all duration-200 p-3 rounded-lg hover:bg-primary/10 group"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary/60 group-hover:bg-primary/20 transition-colors">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <span>Q&A Support</span>
                        </Link>
                        <Link 
                          href="/admin/dashboard" 
                          className="flex items-center space-x-3 text-sm font-medium text-foreground hover:text-primary transition-all duration-200 p-3 rounded-lg hover:bg-primary/10 group"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary/60 group-hover:bg-primary/20 transition-colors">
                            <Info className="h-4 w-4" />
                          </div>
                          <span>Admin</span>
                        </Link>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                        Account
                      </h3>
                      <div className="space-y-3">
                        {isAuthenticated && user ? (
                          // Authenticated user buttons
                          <>
                            <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                              <p className="text-sm font-medium text-foreground">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                              <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
                            </div>
                            
                            <Button 
                              variant="outline" 
                              onClick={handleProfile}
                              className="w-full justify-start space-x-3 h-12 text-sm font-medium border-border/50 hover:bg-secondary/50"
                            >
                              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary/60">
                                <UserCircle className="h-4 w-4" />
                              </div>
                              <span>Profile</span>
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              onClick={handleLogout}
                              className="w-full justify-start space-x-3 h-12 text-sm font-medium border-border/50 hover:bg-secondary/50"
                            >
                              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary/60">
                                <LogOut className="h-4 w-4" />
                              </div>
                              <span>Logout</span>
                            </Button>
                          </>
                        ) : (
                          // Non-authenticated user buttons
                          <>
                            <Link href="/login" className="block">
                              <Button variant="outline" className="w-full justify-start space-x-3 h-12 text-sm font-medium border-border/50 hover:bg-secondary/50">
                                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary/60">
                                  <User className="h-4 w-4" />
                                </div>
                                <span>Log In</span>
                              </Button>
                            </Link>
                            <Link href="/login" className="block">
                              <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm">
                                <Calendar className="h-4 w-4 mr-2" />
                                Access Portal
                              </Button>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbaar