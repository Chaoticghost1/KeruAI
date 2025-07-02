import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Mail, Phone, User, Lock, GraduationCap } from "lucide-react";

interface FormData {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState("");
  const [loginData, setLoginData] = useState({
    identifier: "", // Can be username, email, or phone
    password: ""
  });
  const [registerData, setRegisterData] = useState<FormData>({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "student"
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!loginData.identifier || !loginData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      // Determine if identifier is email, phone, or username
      const isEmail = loginData.identifier.includes("@");
      const isPhone = /^\+?[\d\s-()]+$/.test(loginData.identifier);
      
      const payload = {
        password: loginData.password,
        ...(isEmail ? { email: loginData.identifier } : 
           isPhone ? { phoneNumber: loginData.identifier } : 
           { username: loginData.identifier })
      };

      await loginMutation.mutateAsync(payload);
      setLocation("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!registerData.username || !registerData.password) {
      setError("Username and password are required");
      return;
    }

    if (!registerData.email && !registerData.phoneNumber) {
      setError("Email or phone number is required");
      return;
    }

    try {
      await registerMutation.mutateAsync(registerData);
      setLocation("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
  };

  const updateLoginData = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  const updateRegisterData = (field: string, value: string) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Hero Section */}
        <div className="space-y-6 text-center lg:text-left">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              Welcome to <span className="text-blue-600 dark:text-blue-400">Keru.ai</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-lg">
              Your comprehensive educational platform with AI-powered tutoring, content management, and gamified learning experiences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <GraduationCap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Students</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">Learn & Progress</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <User className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Teachers</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">Create Content</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <Lock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Admin</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">Manage Platform</p>
            </div>
          </div>
        </div>

        {/* Authentication Form */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Access Your Account
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to your existing account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>
              
              {error && (
                <Alert className="mt-4" variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="login" className="space-y-4 mt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="identifier">Username, Email, or Phone</Label>
                    <Input
                      id="identifier"
                      type="text"
                      placeholder="Enter username, email, or phone number"
                      value={loginData.identifier}
                      onChange={(e) => updateLoginData("identifier", e.target.value)}
                      disabled={loginMutation.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => updateLoginData("password", e.target.value)}
                      disabled={loginMutation.isPending}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={registerData.firstName}
                        onChange={(e) => updateRegisterData("firstName", e.target.value)}
                        disabled={registerMutation.isPending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={registerData.lastName}
                        onChange={(e) => updateRegisterData("lastName", e.target.value)}
                        disabled={registerMutation.isPending}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a username"
                      value={registerData.username}
                      onChange={(e) => updateRegisterData("username", e.target.value)}
                      disabled={registerMutation.isPending}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={registerData.email}
                      onChange={(e) => updateRegisterData("email", e.target.value)}
                      disabled={registerMutation.isPending}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={registerData.phoneNumber}
                      onChange={(e) => updateRegisterData("phoneNumber", e.target.value)}
                      disabled={registerMutation.isPending}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={registerData.role} onValueChange={(value) => updateRegisterData("role", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">Password *</Label>
                    <Input
                      id="registerPassword"
                      type="password"
                      placeholder="Create a strong password"
                      value={registerData.password}
                      onChange={(e) => updateRegisterData("password", e.target.value)}
                      disabled={registerMutation.isPending}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}