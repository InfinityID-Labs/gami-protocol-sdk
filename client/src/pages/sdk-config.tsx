import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { FaCopy, FaKey, FaGlobe, FaBug, FaCode, FaStream } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useTutorial } from "@/hooks/use-tutorial";

const apiConfigSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  environment: z.enum(["development", "production"]),
  debugMode: z.boolean(),
  webhookUrl: z.string().url().optional().or(z.literal("")),
  customDomain: z.string().optional().or(z.literal("")),
  rateLimitPerMinute: z.number().min(10).max(1000),
});

type ApiConfigFormValues = z.infer<typeof apiConfigSchema>;

export default function SdkConfig() {
  const { toast } = useToast();
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const { startTutorial, forceStartTutorial } = useTutorial('sdk-config');
  
  // Start the tutorial when the component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      startTutorial();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [startTutorial]);

  const defaultValues: ApiConfigFormValues = {
    apiKey: "gami_3f8a9bc67d1234e5f6gh789ij0k1l2m3",
    environment: "development",
    debugMode: true,
    webhookUrl: "",
    customDomain: "",
    rateLimitPerMinute: 60,
  };

  const form = useForm<ApiConfigFormValues>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues,
  });

  function onSubmit(data: ApiConfigFormValues) {
    toast({
      title: "SDK configuration updated",
      description: "Your SDK configuration has been saved successfully.",
    });
    console.log(data);
  }

  async function generateNewApiKey() {
    setIsGeneratingKey(true);
    
    // Simulate API request
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newApiKey = `gami_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      form.setValue("apiKey", newApiKey);
      
      toast({
        title: "New API key generated",
        description: "Your new API key has been generated. Be sure to update your applications.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate new API key.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingKey(false);
    }
  }

  function copyApiKey() {
    const apiKey = form.getValues("apiKey");
    navigator.clipboard.writeText(apiKey);
    
    toast({
      title: "API key copied",
      description: "API key copied to clipboard.",
    });
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pb-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">SDK Configuration</h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage your SDK configuration and API keys
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              variant="outline" 
              onClick={() => forceStartTutorial()}
              className="flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Show Guide
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card className="sdk-section">
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between api-key-section">
                      <div>
                        <Label htmlFor="apiKey" className="font-medium text-sm">API Key</Label>
                        <div className="mt-1 flex items-center gap-2">
                          <Input 
                            id="apiKey" 
                            value={form.watch("apiKey")} 
                            readOnly 
                            className="w-72 font-mono text-sm"
                          />
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            onClick={copyApiKey}
                          >
                            <FaCopy className="mr-1 h-3 w-3" />
                            Copy
                          </Button>
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="bg-white" 
                        onClick={generateNewApiKey}
                        disabled={isGeneratingKey}
                      >
                        <FaKey className="mr-1 h-4 w-4" />
                        {isGeneratingKey ? "Generating..." : "Generate New Key"}
                      </Button>
                    </div>

                    <Separator />

                    <FormField
                      control={form.control}
                      name="environment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Environment</FormLabel>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="development"
                                value="development"
                                checked={field.value === "development"}
                                onChange={() => field.onChange("development")}
                                className="h-4 w-4 text-primary-500"
                              />
                              <label htmlFor="development" className="text-sm font-medium">
                                Development
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="production"
                                value="production"
                                checked={field.value === "production"}
                                onChange={() => field.onChange("production")}
                                className="h-4 w-4 text-primary-500"
                              />
                              <label htmlFor="production" className="text-sm font-medium">
                                Production
                              </label>
                            </div>
                          </div>
                          <FormDescription>
                            Choose the environment for this SDK configuration.
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="debugMode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Debug Mode</FormLabel>
                            <FormDescription>
                              Enable detailed logs and error messages.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="webhookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://your-webhook-url.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            URL to receive event notifications.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <div className="installation-guide bg-slate-50 p-4 rounded-lg">
                      <h3 className="font-medium text-sm mb-2">Installation Guide</h3>
                      <pre className="text-xs bg-slate-100 p-3 rounded overflow-x-auto">
                        <code>{`// Install using npm
npm install @gami-protocol/sdk

// Initialize in your application
import { GamiSDK } from '@gami-protocol/sdk';

const gami = new GamiSDK({
  apiKey: '${form.watch("apiKey")}',
  environment: '${form.watch("environment")}'
});

// Track events
gami.trackEvent('user_action', {
  userId: 'user-123',
  points: 50,
  actionType: 'completed_task'
});`}</code>
                      </pre>
                    </div>

                    <Button type="submit">Save Configuration</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Event Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-500 mb-6">
                  Configure how events are tracked and processed by the SDK.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <div className="text-base font-medium">Automatic Event Tracking</div>
                      <div className="text-sm text-slate-500">
                        SDK will automatically track standard events like page views.
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-start justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <div className="text-base font-medium">Batch Processing</div>
                      <div className="text-sm text-slate-500">
                        Events are sent to the server in batches to reduce network requests.
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-start justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <div className="text-base font-medium">Retry Failed Events</div>
                      <div className="text-sm text-slate-500">
                        Automatically retry sending events if the initial attempt fails.
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="mt-6">
                    <Label htmlFor="eventFlushInterval">Event Flush Interval (seconds)</Label>
                    <div className="flex items-center gap-4 mt-1">
                      <Input
                        id="eventFlushInterval"
                        type="number"
                        defaultValue={30}
                        min={5}
                        max={300}
                        className="w-24"
                      />
                      <div className="w-full max-w-md">
                        <div className="h-2 bg-slate-100 rounded-full">
                          <div className="h-2 bg-primary-500 rounded-full w-[40%]"></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      How often the SDK should send batched events to the server.
                    </p>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Button>Save Event Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form className="space-y-6">
                    <FormField
                      control={form.control}
                      name="customDomain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Domain (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex gap-2 items-center">
                              <FaGlobe className="text-slate-400" />
                              <Input placeholder="api.yourdomain.com" {...field} />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Set a custom domain for SDK API calls.
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rateLimitPerMinute"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rate Limit (requests per minute)</FormLabel>
                          <FormControl>
                            <div className="flex gap-2 items-center">
                              <FaStream className="text-slate-400" />
                              <Input 
                                type="number" 
                                min={10} 
                                max={1000} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                value={field.value}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Maximum number of API requests allowed per minute.
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <div className="rounded-lg border p-4 space-y-4">
                      <div className="font-medium">CORS Settings</div>
                      <div className="space-y-2">
                        <Label htmlFor="allowedOrigins">Allowed Origins</Label>
                        <Input id="allowedOrigins" placeholder="https://example.com, https://app.example.com" />
                        <p className="text-xs text-slate-500">
                          Comma-separated list of domains allowed to use the SDK.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4 space-y-4">
                      <div className="font-medium">SDK Features</div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="feature-wallets">Wallet Integration</Label>
                          <Switch id="feature-wallets" defaultChecked />
                        </div>
                        <div className="flex justify-between items-center">
                          <Label htmlFor="feature-xp">XP Tracking</Label>
                          <Switch id="feature-xp" defaultChecked />
                        </div>
                        <div className="flex justify-between items-center">
                          <Label htmlFor="feature-rewards">Rewards</Label>
                          <Switch id="feature-rewards" defaultChecked />
                        </div>
                        <div className="flex justify-between items-center">
                          <Label htmlFor="feature-analytics">Analytics</Label>
                          <Switch id="feature-analytics" defaultChecked />
                        </div>
                      </div>
                    </div>

                    <Button type="submit">Save Advanced Settings</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
