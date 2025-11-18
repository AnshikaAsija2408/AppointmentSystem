"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, Clock, Users, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface AvailableSlot {
  start: string;
  end: string;
  date: string;
  time: string;
}

export default function ScheduleMeetingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    selectedSlot: "",
    meetingType: "VIRTUAL"
  });
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSlotDetails, setSelectedSlotDetails] = useState<AvailableSlot | null>(null);

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch('/api/meetings/freebusy');
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.availableSlots || []);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to fetch available slots');
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Failed to fetch available slots');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlotSelect = (slotId: string) => {
    const slot = availableSlots.find(s => `${s.start}-${s.end}` === slotId);
    setSelectedSlotDetails(slot || null);
    setFormData(prev => ({ ...prev, selectedSlot: slotId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSlotDetails) {
      toast.error('Please select a time slot');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          startTime: selectedSlotDetails.start,
          endTime: selectedSlotDetails.end,
          meetingType: formData.meetingType,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Meeting scheduled successfully!');
        router.push('/dashboard/client');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to schedule meeting');
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupSlotsByDate = (slots: AvailableSlot[]) => {
    const grouped: { [key: string]: AvailableSlot[] } = {};
    slots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  };

  const groupedSlots = groupSlotsByDate(availableSlots);

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
          <h1 className="text-3xl font-bold text-foreground">Schedule Meeting</h1>
          <p className="text-muted-foreground mt-2">
            Book a meeting with the TBB team
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meeting Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Meeting Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Meeting Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Strategy Discussion, Account Review"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of what you'd like to discuss..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="meetingType">Meeting Type</Label>
                  <Select
                    value={formData.meetingType}
                    onValueChange={(value) => setFormData({ ...formData, meetingType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIRTUAL">Virtual (Google Meet)</SelectItem>
                      <SelectItem value="IN_PERSON">In Person</SelectItem>
                      <SelectItem value="PHONE">Phone Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedSlotDetails && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Selected Time Slot</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      {selectedSlotDetails.date} at {selectedSlotDetails.time}
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isSubmitting || !selectedSlotDetails} 
                  className="w-full"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Scheduling..." : "Schedule Meeting"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Available Time Slots */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Available Time Slots
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading available slots...
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No available slots found</p>
                  <p className="text-xs text-muted-foreground">Please try again later</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {Object.entries(groupedSlots).map(([date, slots]) => (
                    <div key={date} className="space-y-2">
                      <h4 className="font-medium text-sm text-foreground">
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {slots.map((slot) => {
                          const slotId = `${slot.start}-${slot.end}`;
                          const isSelected = formData.selectedSlot === slotId;
                          
                          return (
                            <Button
                              key={slotId}
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleSlotSelect(slotId)}
                              className="text-xs"
                            >
                              {slot.time}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Meeting Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                • Meetings are 30 minutes by default
              </p>
              <p className="text-sm text-muted-foreground">
                • Please provide clear meeting objectives
              </p>
              <p className="text-sm text-muted-foreground">
                • Google Meet link will be sent via email
              </p>
              <p className="text-sm text-muted-foreground">
                • You can reschedule up to 2 hours before
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
