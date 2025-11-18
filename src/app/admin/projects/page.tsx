"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, Settings, Edit, Trash2, Building } from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  staffCount: number;
  clientCount: number;
  teamSize: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/admin/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the project from the local state
        setProjects(projects.filter(p => p.id !== projectId));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('An unexpected error occurred while deleting the project');
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage all projects in the TBB Portal
          </p>
        </div>
        <Link href="/admin/projects/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {project.description}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Link href={`/admin/projects/${project.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteProject(project.id, project.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{project.staffCount} Staff</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{project.clientCount} Clients</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant={project.isActive ? "default" : "secondary"}>
                  {project.isActive ? "Active" : "Inactive"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Created: {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex gap-2">
                {/* <Link href={`/admin/projects/${project.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link> */}
                <Link href={`/admin/projects/${project.id}/manage`} className="flex-1">
                  <Button className="w-full">
                    Manage
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-muted-foreground">No projects found</h3>
          <p className="text-muted-foreground mt-2">
            {searchTerm ? "Try adjusting your search terms" : "Create your first project to get started"}
          </p>
          {!searchTerm && (
            <Link href="/admin/projects/new">
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
