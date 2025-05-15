import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FaRocket, FaChartLine, FaAward, FaWallet } from "react-icons/fa";
import { PuzzleIcon, StarIcon } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  // Redirect if user is already logged in
  // This must be after all hooks are called
  if (user) {
    navigate("/dashboard");
    return null;
  }

  function onLoginSubmit(data: LoginValues) {
    loginMutation.mutate(data);
  }

  function onRegisterSubmit(data: RegisterValues) {
    registerMutation.mutate({
      username: data.username,
      email: data.email,
      password: data.password,
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full mx-auto flex flex-col lg:flex-row overflow-hidden rounded-xl shadow-xl">
        {/* Hero Section */}
        <div className="lg:w-1/2 bg-gradient-to-br from-[#7631f9] to-[#9156ff] p-8 lg:p-12 text-white">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center mr-[-0.5rem] relative z-10">
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.439 7.85c-.049.322.059.648.291.878l1.568 1.568c.47.47.47 1.229 0 1.698l-1.42 1.42c-.141.141-.22.332-.22.531v1.07c0 .663-.568 1.204-1.231 1.204h-.251c-.13 0-.257.049-.355.135l-1.909 1.667c-.226.197-.523.296-.825.268l-1.07-.099c-.2-.018-.361.05-.486.175l-1.563 1.563c-.47.47-1.229.47-1.698 0l-1.138-1.138c-.09-.09-.199-.149-.315-.177l-2.14-.518c-.316-.076-.553-.347-.584-.67l-.113-1.189c-.023-.236-.129-.456-.297-.618l-1.629-1.579c-.21-.203-.328-.483-.328-.775v-.301c0-.253-.085-.498-.242-.696l-1.406-1.773c-.329-.415-.303-1.003.062-1.384l1.638-1.712c.228-.238.313-.573.227-.884l-.418-1.493c-.118-.416.039-.866.398-1.136l1.228-.921c.164-.123.365-.187.57-.18l1.823.064c.327.011.646-.118.864-.349l1.105-1.172c.263-.28.645-.392 1.008-.294l2.035.548c.545.147.872.693.772 1.251l-.178.991c-.1.558.161 1.111.659 1.393l.891.503c.232.131.49.192.745.178l1.759-.098c.892-.05 1.522.852 1.183 1.671l-.711 1.712z" />
                  </svg>
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Gami Protocol</h1>
            <p className="text-purple-100">Blockchain-based gamification platform</p>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Boost User Engagement with Blockchain Rewards</h2>
            <p className="text-purple-100">
              Integrate our SDK to add powerful gamification features to your application, including XP tracking, achievements, and token rewards.
            </p>
            
            <div className="space-y-4 mt-8">
              <div className="flex items-start">
                <div className="bg-white/10 p-2 rounded mr-4">
                  <FaRocket className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium">Seamless Integration</h3>
                  <p className="text-sm text-purple-100">Quick implementation with our JavaScript/TypeScript SDK</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-white/10 p-2 rounded mr-4">
                  <FaChartLine className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium">XP & Achievement Tracking</h3>
                  <p className="text-sm text-purple-100">Design custom XP systems and achievement criteria</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-white/10 p-2 rounded mr-4">
                  <FaAward className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium">Reward Campaigns</h3>
                  <p className="text-sm text-purple-100">Create time-limited engagement campaigns with rewards</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-white/10 p-2 rounded mr-4">
                  <FaWallet className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium">Token Rewards</h3>
                  <p className="text-sm text-purple-100">Distribute GAMI tokens as rewards on the Solana blockchain</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Auth Forms */}
        <div className="lg:w-1/2 bg-white p-8 lg:p-12">
          <div className="max-w-md mx-auto">
            <Tabs 
              defaultValue="login" 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as "login" | "register")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-8 tabs-list">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome Back</CardTitle>
                    <CardDescription>Log in to access your Gami Protocol dashboard</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Your username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Your password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-[#7631f9] hover:bg-[#9156ff]" 
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? "Logging in..." : "Log In"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button 
                      variant="link" 
                      onClick={() => setActiveTab("register")}
                      className="text-sm text-[#7631f9] hover:text-[#9156ff]"
                    >
                      Don't have an account? Sign up
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>Sign up to start using Gami Protocol</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Choose a username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Your email address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Create a password" {...field} />
                              </FormControl>
                              <FormDescription>
                                Password must be at least 6 characters
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Confirm your password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-[#7631f9] hover:bg-[#9156ff]" 
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? "Creating account..." : "Create Account"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button 
                      variant="link" 
                      onClick={() => setActiveTab("login")}
                      className="text-sm text-[#7631f9] hover:text-[#9156ff]"
                    >
                      Already have an account? Log in
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}