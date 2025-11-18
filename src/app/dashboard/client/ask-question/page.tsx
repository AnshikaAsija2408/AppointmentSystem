"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MessageSquare, HelpCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AskQuestionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    category: "general"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Question submitted successfully! You will receive a response soon.');
        router.push('/dashboard/client');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit question');
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      alert('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/client">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ask a Question</h1>
          <p className="text-muted-foreground mt-2">
            Get support from the TBB team
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Your Question
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Brief summary of your question"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Please describe your question in detail..."
                    rows={6}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="account">Account Management</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="billing">Billing & Payments</SelectItem>
                      <SelectItem value="projects">Project Related</SelectItem>
                      <SelectItem value="meetings">Meeting Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Submitting..." : "Submit Question"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Support Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium">Submit Question</p>
                  <p className="text-xs text-muted-foreground">Fill out your question details</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium">Team Review</p>
                  <p className="text-xs text-muted-foreground">Our team will review and respond</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium">Get Response</p>
                  <p className="text-xs text-muted-foreground">You'll receive a detailed response</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Tips for Better Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                • Be specific about the issue you're facing
              </p>
              <p className="text-sm text-muted-foreground">
                • Include relevant details and context
              </p>
              <p className="text-sm text-muted-foreground">
                • Select the appropriate category for faster routing
              </p>
              <p className="text-sm text-muted-foreground">
                • For urgent matters, consider scheduling a meeting instead
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/client/schedule-meeting">
                <Button variant="outline" className="w-full justify-start">
                  Schedule Meeting Instead
                </Button>
              </Link>
              <Link href="/dashboard/client">
                <Button variant="ghost" className="w-full justify-start">
                  View Previous Questions
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
