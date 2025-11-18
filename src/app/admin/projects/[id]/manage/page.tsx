"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ArrowLeft, 
  Users, 
  UserPlus, 
  Mail, 
  Trash2, 
  Building, 
  Settings,
  Calendar,
  FileText,
  Save,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  tbbStaff: TeamMember[];
  clients: TeamMember[];
  teamSize: number;
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  company?: string;
  isVerified?: boolean;
  addedAt: string;
  emailSent?: boolean;
  tempPassword?: string;
}

export default function ManageProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [staff, setStaff] = useState<TeamMember[]>([]);
  const [clients, setClients] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [staffForm, setStaffForm] = useState({ email: "", name: "" });
  const [clientForm, setClientForm] = useState({ email: "", name: "" });
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);
  const [isSubmittingClient, setIsSubmittingClient] = useState(false);
  const [resendingEmails, setResendingEmails] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Fetch project details
        const projectResponse = await fetch(`/api/admin/projects/${projectId}`);

        console.log("Fetching project data for ID:", projectId);

        if (projectResponse.ok) {
          const projectData = await projectResponse.json();
          console.log("Project data fetched:", projectData);
          setProject(projectData);
        }

        // Fetch staff
        const staffResponse = await fetch(`/api/admin/projects/${projectId}/staff`);
        if (staffResponse.ok) {
          const staffData = await staffResponse.json();
          setStaff(staffData);
        }

        // Fetch clients
        const clientsResponse = await fetch(`/api/admin/projects/${projectId}/clients`);
        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json();
          setClients(clientsData);
        }
      } catch (error) {
        console.error('Error fetching project data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const refreshProjectData = async () => {
    try {
      // Fetch project details
      const projectResponse = await fetch(`/api/admin/projects/${projectId}`);
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        setProject(projectData);
      }

      // Fetch staff
      const staffResponse = await fetch(`/api/admin/projects/${projectId}/staff`);
      if (staffResponse.ok) {
        const staffData = await staffResponse.json();
        setStaff(staffData);
      }

      // Fetch clients
      const clientsResponse = await fetch(`/api/admin/projects/${projectId}/clients`);
      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        setClients(clientsData);
      }
    } catch (error) {
      console.error('Error fetching project data:', error);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingStaff(true);

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffForm),
      });

      const result = await response.json();

      if (response.ok) {
        setStaffForm({ email: "", name: "" });
        
        if (result.emailSent) {
          toast.success('Staff member added and invitation email sent successfully!');
        } else {
          toast.warning('Staff member added but invitation email failed to send. You can resend it later.');
        }
        
        refreshProjectData(); // Refresh data
      } else {
        toast.error(result.error || 'Failed to add staff member');
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmittingStaff(false);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingClient(true);

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: clientForm.email,
          name: clientForm.name
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setClientForm({ email: "", name: "" });
        
        if (result.emailSent) {
          toast.success('Client added and invitation email sent successfully!');
        } else {
          toast.warning('Client added but invitation email failed to send. You can resend it later.');
        }
        
        refreshProjectData(); // Refresh data
      } else {
        toast.error(result.error || 'Failed to add client');
      }
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmittingClient(false);
    }
  };

  const handleRemoveMember = async (userId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this project?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/members/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(`${memberName} removed from project successfully`);
        refreshProjectData(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleResendEmail = async (userId: string, memberName: string, memberEmail: string) => {
    setResendingEmails(prev => ({ ...prev, [userId]: true }));

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/members/${userId}/resend-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (response.ok) {
        if (result.emailSent) {
          toast.success(`Invitation email sent successfully to ${memberName}!`);
        } else {
          toast.error(`Failed to send invitation email to ${memberName}`);
        }
      } else {
        toast.error(result.error || 'Failed to resend invitation email');
      }
    } catch (error) {
      console.error('Error resending email:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setResendingEmails(prev => ({ ...prev, [userId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-muted-foreground">Project not found</h3>
        <Link href="/admin/projects">
          <Button className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
        <Link href="/admin/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
          <p className="text-muted-foreground mt-2">
            Manage team members and project settings
          </p>
        </div>
        <Link href={`/admin/projects/${projectId}/edit`}>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
        </Link>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Team</p>
                <p className="text-2xl font-bold">{(project.tbbStaff?.length || 0) + (project.clients?.length || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">TBB Staff</p>
                <p className="text-2xl font-bold">{project.tbbStaff?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Clients</p>
                <p className="text-2xl font-bold">{project.clients?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={project.isActive ? "default" : "secondary"}>
                  {project.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TBB Staff Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>TBB Staff Members ({staff.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {staff.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No staff members assigned yet</p>
                  <p className="text-xs text-muted-foreground mt-2">Add staff members below and they'll receive invitation emails</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {staff.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{member.name}</p>
                            {!member.isVerified && (
                              <Badge variant="outline" className="text-xs">
                                <Mail className="h-3 w-3 mr-1" />
                                Invitation Sent
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{member.role}</Badge>
                        {!member.isVerified && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700"
                                onClick={() => handleResendEmail(member.id, member.name, member.email)}
                                disabled={resendingEmails[member.id]}
                              >
                                <RefreshCw className={`h-4 w-4 ${resendingEmails[member.id] ? 'animate-spin' : ''}`} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Resend invitation email</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleRemoveMember(member.id, member.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add TBB Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddStaff} className="space-y-4">
                <div>
                  <Label htmlFor="staff-name">Name</Label>
                  <Input
                    id="staff-name"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    placeholder="Enter staff name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="staff-email">Email</Label>
                  <Input
                    id="staff-email"
                    type="email"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <Button type="submit" disabled={isSubmittingStaff} className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  {isSubmittingStaff ? "Adding..." : "Add Staff Member"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Clients Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Clients ({clients.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {clients.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No clients added yet</p>
                  <p className="text-xs text-muted-foreground mt-2">Invite clients below and they'll receive invitation emails</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Building className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{client.name}</p>
                            {!client.isVerified && (
                              <Badge variant="outline" className="text-xs">
                                <Mail className="h-3 w-3 mr-1" />
                                Invitation Sent
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={client.isVerified ? "default" : "secondary"}>
                          {client.isVerified ? "Verified" : "Pending"}
                        </Badge>
                        {!client.isVerified && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700"
                                onClick={() => handleResendEmail(client.id, client.name, client.email)}
                                disabled={resendingEmails[client.id]}
                              >
                                <RefreshCw className={`h-4 w-4 ${resendingEmails[client.id] ? 'animate-spin' : ''}`} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Resend invitation email</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleRemoveMember(client.id, client.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invite Client</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddClient} className="space-y-4">
                <div>
                  <Label htmlFor="client-name">Name</Label>
                  <Input
                    id="client-name"
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                    placeholder="Enter client name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="client-email">Email</Label>
                  <Input
                    id="client-email"
                    type="email"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <Button type="submit" disabled={isSubmittingClient} className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  {isSubmittingClient ? "Inviting..." : "Invite Client"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}