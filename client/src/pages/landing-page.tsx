import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Wallet, 
  Ship,
  BookOpen,
  ArrowRight,
  Globe,
  CheckCircle,
  Award,
  TrendingUp,
  Map,
  DollarSign,
  Brain,
  Target,
  Compass
} from "lucide-react";

export default function LandingPage() {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2" data-testid="nav-logo">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Keru.ai Suite
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="ghost" data-testid="button-signin">Sign In</Button>
              </Link>
              <Link href="/auth">
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  data-testid="button-getstarted"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 sm:pt-24 sm:pb-20" data-testid="section-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" data-testid="badge-platform">
              All-in-One Platform
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6" data-testid="text-hero-title">
              Keru.ai Suite: Your Complete
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Learning & Life Management Platform
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              Master your studies with AI tutoring, manage your finances effortlessly, and explore the world with our comprehensive travel guide—all in one powerful suite.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8"
                  data-testid="button-hero-getstarted"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={scrollToFeatures}
                data-testid="button-hero-learnmore"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white dark:bg-gray-800" data-testid="section-features">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4" data-testid="text-features-title">
              Three Powerful Tools, One Platform
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto" data-testid="text-features-subtitle">
              Everything you need to succeed in learning, finances, and travel
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* StudyBuddy */}
            <Card className="border-2 border-blue-200 dark:border-blue-800 hover:shadow-xl transition-all duration-300" data-testid="card-studybuddy">
              <CardHeader>
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white" data-testid="text-studybuddy-title">
                  StudyBuddy
                </CardTitle>
                <CardDescription className="text-base text-gray-600 dark:text-gray-300" data-testid="text-studybuddy-desc">
                  AI Study Assistant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 dark:text-gray-200 font-medium">
                  Get personalized help from AI tutors in Math, Science, Languages, and more
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start" data-testid="feature-studybuddy-1">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">24/7 AI tutoring across all subjects</span>
                  </li>
                  <li className="flex items-start" data-testid="feature-studybuddy-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Interactive learning with instant feedback</span>
                  </li>
                  <li className="flex items-start" data-testid="feature-studybuddy-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Progress tracking and performance analytics</span>
                  </li>
                  <li className="flex items-start" data-testid="feature-studybuddy-4">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Badges & rewards for achievements</span>
                  </li>
                </ul>
                <div className="pt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Brain className="h-4 w-4" />
                    <span>Smart AI-powered learning</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BudgetPal */}
            <Card className="border-2 border-green-200 dark:border-green-800 hover:shadow-xl transition-all duration-300" data-testid="card-budgetpal">
              <CardHeader>
                <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Wallet className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white" data-testid="text-budgetpal-title">
                  BudgetPal
                </CardTitle>
                <CardDescription className="text-base text-gray-600 dark:text-gray-300" data-testid="text-budgetpal-desc">
                  Personal Finance Tracker
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 dark:text-gray-200 font-medium">
                  Track your spending, set budgets, and achieve your financial goals
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start" data-testid="feature-budgetpal-1">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Category tracking for all expenses</span>
                  </li>
                  <li className="flex items-start" data-testid="feature-budgetpal-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Set budget limits and get alerts</span>
                  </li>
                  <li className="flex items-start" data-testid="feature-budgetpal-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Expense insights with visual charts</span>
                  </li>
                  <li className="flex items-start" data-testid="feature-budgetpal-4">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Monthly summaries and reports</span>
                  </li>
                </ul>
                <div className="pt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <DollarSign className="h-4 w-4" />
                    <span>Smart financial management</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Travel Blog */}
            <Card className="border-2 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all duration-300" data-testid="card-travelblog">
              <CardHeader>
                <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Ship className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white" data-testid="text-travelblog-title">
                  Travel Blog
                </CardTitle>
                <CardDescription className="text-base text-gray-600 dark:text-gray-300" data-testid="text-travelblog-desc">
                  Honduras Travel Guide
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 dark:text-gray-200 font-medium">
                  Discover travel tips, cruise information, and explore Honduras
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start" data-testid="feature-travelblog-1">
                    <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Comprehensive travel guides</span>
                  </li>
                  <li className="flex items-start" data-testid="feature-travelblog-2">
                    <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Cruise deals and information</span>
                  </li>
                  <li className="flex items-start" data-testid="feature-travelblog-3">
                    <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Local insights and hidden gems</span>
                  </li>
                  <li className="flex items-start" data-testid="feature-travelblog-4">
                    <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Adventure planning tools</span>
                  </li>
                </ul>
                <div className="pt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Globe className="h-4 w-4" />
                    <span>Explore Honduras with ease</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900" data-testid="section-howitworks">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, Powerful, Effective
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get started in minutes and experience the power of our integrated platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center" data-testid="step-1">
              <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sign Up</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create your free account in seconds
              </p>
            </div>

            <div className="text-center" data-testid="step-2">
              <div className="h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Choose Your Tool</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Access StudyBuddy, BudgetPal, or Travel Blog
              </p>
            </div>

            <div className="text-center" data-testid="step-3">
              <div className="h-16 w-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Start Achieving</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Reach your learning, financial, and travel goals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600" data-testid="section-cta">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6" data-testid="text-cta-title">
              Ready to Transform Your Life?
            </h2>
            <p className="text-xl text-blue-100 mb-8" data-testid="text-cta-subtitle">
              Join thousands of users who are already learning smarter, managing finances better, and exploring more.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
                  data-testid="button-cta-signup"
                >
                  Sign Up Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth">
                <span className="text-white hover:text-blue-100 transition-colors" data-testid="link-cta-signin">
                  Already have an account? <span className="underline font-semibold">Sign In</span>
                </span>
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center" data-testid="stat-users">
                <div className="text-3xl font-bold text-white mb-1">10K+</div>
                <div className="text-blue-100 text-sm">Active Users</div>
              </div>
              <div className="text-center" data-testid="stat-sessions">
                <div className="text-3xl font-bold text-white mb-1">50K+</div>
                <div className="text-blue-100 text-sm">Study Sessions</div>
              </div>
              <div className="text-center" data-testid="stat-satisfaction">
                <div className="text-3xl font-bold text-white mb-1">98%</div>
                <div className="text-blue-100 text-sm">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12" data-testid="footer">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Keru.ai Suite</span>
            </div>
            <p className="text-gray-400 mb-6">
              Your Complete Learning & Life Management Platform
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-400">
              <Link href="/auth">
                <span className="hover:text-white transition-colors" data-testid="link-footer-studybuddy">StudyBuddy</span>
              </Link>
              <span>•</span>
              <Link href="/auth">
                <span className="hover:text-white transition-colors" data-testid="link-footer-budgetpal">BudgetPal</span>
              </Link>
              <span>•</span>
              <Link href="/auth">
                <span className="hover:text-white transition-colors" data-testid="link-footer-travelblog">Travel Blog</span>
              </Link>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              © 2024 Keru.ai Suite. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
