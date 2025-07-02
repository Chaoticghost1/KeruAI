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
import Dashboard from "./pages/Dashboard";
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
                    <Route path="/studybuddy" component={StudyBuddy} />
                    <Route path="/budgetpal" component={BudgetPal} />
                    <Route path="/blog" component={Blog} />
                    <Route path="/chat" component={Chat} />
                    <Route path="/cruiseword" component={CruiseWord} />
                    <Route path="/dao" component={DAO} />
                    <Route path="/aethosbyte" component={AethosByte} />
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
