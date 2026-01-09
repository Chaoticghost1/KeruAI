import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { DataSaverProvider } from "./components/DataSaverMode";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { initializeOfflineStorage } from "./lib/offline-storage";
import { useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { ProtectedRoute } from "./lib/protected-route";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import StudyBuddy from "./pages/StudyBuddy";
import BudgetPal from "./pages/BudgetPal";
import Blog from "./pages/Blog";
import CruiseWord from "./pages/CruiseWord";
import AuthPage from "./pages/auth-page";
import AdminDashboard from "./pages/admin-dashboard";
import StudentRevision from "./pages/StudentRevision";
import DAO from "./pages/DAO";
import LandingPage from "./pages/landing-page";
import NotFound from "@/pages/not-found";
import { Redirect } from "./components/Redirect";

function Router() {
  useEffect(() => {
    // Initialize offline storage for Honduras-first strategy
    initializeOfflineStorage().then((success) => {
      if (success) {
        console.log('Offline storage initialized for Honduras platform');
      } else {
        console.warn('Offline storage initialization failed');
      }
    });
  }, []);

  return (
    <LanguageProvider>
      <DataSaverProvider>
        <AuthProvider>
          <Switch>
          {/* Public routes */}
          <Route path="/auth" component={AuthPage} />
          
          {/* Public landing page for unauthenticated users, redirect authenticated users */}
          <Route path="/">
            {() => {
              const { user } = useAuth();
              if (user) {
                return <Redirect to="/dashboard" />;
              }
              return <LandingPage />;
            }}
          </Route>
          
          {/* Admin panel route - standalone without sidebar */}
          <ProtectedRoute path="/admin" component={AdminDashboard} roles={['teacher', 'superuser']} />
          
          {/* Main application routes with sidebar */}
          <Route>
            {() => (
              <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 lg:ml-80 pt-16 lg:pt-0">
                  <Switch>
                    <ProtectedRoute path="/dashboard" component={Dashboard} />
                    <ProtectedRoute path="/studybuddy" component={StudyBuddy} />
                    <ProtectedRoute path="/revision" component={StudentRevision} roles={['student']} />
                    <ProtectedRoute path="/budgetpal" component={BudgetPal} />
                    <ProtectedRoute path="/blog" component={Blog} />
                    <ProtectedRoute path="/cruiseword" component={CruiseWord} />
                    <ProtectedRoute path="/dao" component={DAO} />
                    <Route component={NotFound} />
                  </Switch>
                </main>
              </div>
            )}
          </Route>
          
          <Route component={NotFound} />
        </Switch>
        </AuthProvider>
      </DataSaverProvider>
    </LanguageProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
