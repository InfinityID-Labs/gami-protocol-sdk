import { useState } from "react";
import Layout from "@/components/Layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface XPEvent {
  id: number;
  name: string;
  description: string | null;
  xpAmount: number;
  status: string;
}

const newEventSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters").max(50, "Event name must be less than 50 characters"),
  description: z.string().optional(),
  xpAmount: z.number().int().positive("XP amount must be positive"),
  status: z.enum(["active", "inactive", "testing"], {
    required_error: "Please select a status",
  }),
});

type NewEventFormValues = z.infer<typeof newEventSchema>;

export default function XPManagement() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch XP events
  const { data: events = [], isLoading } = useQuery<XPEvent[]>({
    queryKey: ['/api/admin/events'],
  });

  // Create a new XP event
  const createEvent = useMutation({
    mutationFn: async (data: NewEventFormValues) => {
      return apiRequest('POST', '/api/admin/events', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      toast({
        title: "Event created",
        description: "XP event has been created successfully.",
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create XP event",
        variant: "destructive",
      });
    },
  });

  // Update event status
  const updateEventStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest('PATCH', `/api/admin/events/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      toast({
        title: "Event updated",
        description: "XP event status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update XP event",
        variant: "destructive",
      });
    },
  });

  const form = useForm<NewEventFormValues>({
    resolver: zodResolver(newEventSchema),
    defaultValues: {
      name: "",
      description: "",
      xpAmount: 10,
      status: "active",
    },
  });

  function onSubmit(data: NewEventFormValues) {
    createEvent.mutate(data);
  }

  const filteredEvents = events.filter((event) => {
    if (activeTab === "all") return true;
    return event.status === activeTab;
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-slate-900">XP Management</h2>
            <p className="mt-1 text-sm text-slate-500">
              Create and manage XP events for your gamification system
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  Create New XP Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New XP Event</DialogTitle>
                  <DialogDescription>
                    Define a new XP event to award users for specific actions.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., complete_lesson" {...field} />
                          </FormControl>
                          <FormDescription>
                            Use a descriptive, unique name for this event
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe what triggers this event" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="xpAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>XP Amount</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1}
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Amount of XP awarded when this event occurs
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="testing">Testing</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Only active events will award XP points
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit" disabled={createEvent.isPending}>
                        {createEvent.isPending ? "Creating..." : "Create Event"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>XP Events</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="testing">Testing</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
              
              <div className="rounded-md border">
                <div className="grid grid-cols-12 p-4 bg-slate-50 text-sm font-medium text-slate-500 border-b">
                  <div className="col-span-4">Name</div>
                  <div className="col-span-3">Description</div>
                  <div className="col-span-2 text-center">XP Amount</div>
                  <div className="col-span-2 text-center">Status</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
                
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
                    <p className="mt-2 text-sm text-slate-500">Loading events...</p>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-slate-500">No events found.</p>
                    <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                      Create your first XP event
                    </Button>
                  </div>
                ) : (
                  <>
                    {filteredEvents.map((event) => (
                      <div key={event.id} className="grid grid-cols-12 p-4 border-b last:border-0 items-center">
                        <div className="col-span-4 font-medium">{event.name}</div>
                        <div className="col-span-3 text-sm text-slate-600 truncate">
                          {event.description || "-"}
                        </div>
                        <div className="col-span-2 text-center font-mono">{event.xpAmount}</div>
                        <div className="col-span-2 text-center">
                          <Badge
                            className={event.status === "testing" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80" : ""}
                            variant={event.status === "active" ? "default" : "secondary"}
                          >
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="col-span-1 text-right">
                          <Select
                            defaultValue={event.status}
                            onValueChange={(value) => 
                              updateEventStatus.mutate({ id: event.id, status: value })
                            }
                          >
                            <SelectTrigger className="w-[110px]">
                              <SelectValue placeholder="Change status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Set Active</SelectItem>
                              <SelectItem value="testing">Set Testing</SelectItem>
                              <SelectItem value="inactive">Set Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-8 grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-600 space-y-4">
                <p>
                  To track XP events in your application, use the Gami SDK track method:
                </p>
                <div className="bg-slate-800 text-slate-100 rounded-md p-3 mb-2 font-mono text-xs overflow-x-auto">
                  <pre>{`gamiSDK.trackEvent({
  userId: 'user-123',
  event: 'complete_lesson',
  metadata: {
    lessonId: 'lesson-456',
    timeSpent: 300
  }
});`}</pre>
                </div>
                <p>
                  Important tips for XP event implementation:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use consistent event names across your application</li>
                  <li>Include relevant metadata to provide context</li>
                  <li>Test new events in "testing" mode before activating</li>
                  <li>Consider using automatic event tracking for common actions</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>XP Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium">Total Events</span>
                  <span className="text-lg font-bold">{events.length}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium">Active Events</span>
                  <span className="text-lg font-bold">
                    {events.filter(e => e.status === "active").length}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium">Testing Events</span>
                  <span className="text-lg font-bold">
                    {events.filter(e => e.status === "testing").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Avg. XP per Event</span>
                  <span className="text-lg font-bold">
                    {events.length > 0
                      ? Math.round(
                          events.reduce((sum, e) => sum + e.xpAmount, 0) / events.length
                        )
                      : 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
