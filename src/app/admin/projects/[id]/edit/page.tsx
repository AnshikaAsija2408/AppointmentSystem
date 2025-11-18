"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
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

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/admin/projects/${projectId}`);
        if (response.ok) {
          const project: Project = await response.json();
          setFormData({
            name: project.name,
            description: project.description
          });
        } else {
          alert('Project not found');
          router.push('/admin/projects');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        alert('Failed to load project');
        router.push('/admin/projects');
      } finally {
        setIsLoadingProject(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form data
    if (!formData.name.trim()) {
      alert('Project name is required');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim()
        }),
      });

      const result = await response.json();

      if (response.ok) {
        router.push('/admin/projects');
      } else {
        alert(result.error || "Failed to update project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Validate length constraints based on Project model
    if (name === 'name' && value.length > 255) {
      return; // Don't update if exceeds limit
    }
    if (name === 'description' && value.length > 1000) {
      return; // Don't update if exceeds limit
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Project</h1>
          <p className="text-muted-foreground mt-2">
            Update project details and settings
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter project name"
                    required
                    maxLength={255}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum 255 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the project objectives and scope"
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum 1000 characters ({formData.description.length}/1000)
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading || !formData.name.trim()}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? "Updating..." : "Update Project"}
                </Button>
                <Link href="/admin/projects">
                  <Button variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
