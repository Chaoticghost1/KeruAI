import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./hooks/use-auth";
import { Sidebar } from "./components/Sidebar";
import { ProtectedRoute } from "./lib/protected-route";
import Home from "./pages/Home";
import StudyBuddy from "./pages/StudyBuddy";
import BudgetPal from "./pages/BudgetPal";
import Blog from "./pages/Blog";
import Chat from "./pages/Chat";
import CruiseWord from "./pages/CruiseWord";
import DAO from "./pages/DAO";
import AethosByte from "./pages/AethosByte";
import AuthPage from "./pages/auth-page";
import AdminDashboard from "./pages/admin-dashboard";
import LandingPage from "./pages/landing-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Switch>
          {/* Public routes */}
          <Route path="/auth" component={AuthPage} />
          
          {/* Public landing page for unauthenticated users */}
          <Route path="/" component={LandingPage} />
          
          {/* Protected routes with sidebar */}
          <Route path="/dashboard">
            {() => (
              <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 lg:ml-80 pt-16 lg:pt-0">
                  <Switch>
                    <ProtectedRoute path="/dashboard" component={Home} />
                    <ProtectedRoute path="/dashboard/admin" component={AdminDashboard} roles={['teacher', 'superuser']} />
                    <ProtectedRoute path="/dashboard/studybuddy" component={StudyBuddy} />
                    <ProtectedRoute path="/dashboard/budgetpal" component={BudgetPal} />
                    <ProtectedRoute path="/dashboard/blog" component={Blog} />
                    <ProtectedRoute path="/dashboard/chat" component={Chat} />
                    <ProtectedRoute path="/dashboard/cruiseword" component={CruiseWord} />
                    <ProtectedRoute path="/dashboard/dao" component={DAO} />
                    <ProtectedRoute path="/dashboard/aethosbyte" component={AethosByte} />
                    <Route component={NotFound} />
                  </Switch>
                </main>
              </div>
            )}
          </Route>
          
          <Route component={NotFound} />
        </Switch>
      </AuthProvider>
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
