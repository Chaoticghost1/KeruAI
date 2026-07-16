import { Link } from "wouter";
import { BlurOrbs } from "@/components/BlurOrbs";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { PublicLayout } from "@/components/PublicLayout";
import { PublicNav } from "@/components/PublicNav";
import { FeatureCard } from "@/components/FeatureCard";
import { Section } from "@/components/Section";
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
  Compass,
  FileText,
  Handshake,
  Heart
} from "lucide-react";
import { format } from "date-fns";

type LandingBlogPost = {
  id: number;
  title: string;
  excerpt?: string;
  category: string;
  publishedAt?: string;
};

export default function LandingPage() {
  const { t } = useLanguage();
  const { data: landingData } = useQuery<{ data: LandingBlogPost[] }>({
    queryKey: ["/api/blog/landing"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/blog/landing`);
      if (!res.ok) throw new Error("Failed to load featured posts");
      return res.json();
    },
  });
  const featuredPosts = landingData?.data ?? [];
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <PublicLayout>
      <PublicNav variant="landing" />

      {/* Hero Section */}
      <section className="pt-20 pb-16 sm:pt-24 sm:pb-20" data-testid="section-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4 rounded-youth-lg bg-youth-primary/15 text-youth-primary border-youth-primary/30" data-testid="badge-platform">
              {t.landingPage.allInOnePlatform}
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6" data-testid="text-hero-title">
              {t.landingPage.heroTitle}
              <span className="block text-youth-primary">
                {t.landingPage.heroTitleHighlight}
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              {t.landingPage.heroSubtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button 
                  size="lg" 
                  className="rounded-youth-lg bg-youth-primary hover:opacity-90 text-lg px-8"
                  data-testid="button-hero-getstarted"
                >
                  {t.auth.getStarted}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-youth-lg text-lg px-8 border-youth-muted hover:bg-youth-muted/50"
                onClick={scrollToFeatures}
                data-testid="button-hero-learnmore"
              >
                {t.common.learnMore}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Section id="features" title={t.landingPage.featuresTitle} subtitle={t.landingPage.featuresSubtitle} className="bg-card" data-testid="section-features">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <FeatureCard
              icon={<GraduationCap className="h-8 w-8 text-youth-primary" />}
              iconBgClassName="h-16 w-16 rounded-youth-lg bg-youth-primary/20"
              title={t.landingPage.studybuddyTitle}
              description={t.landingPage.studybuddyDesc}
              borderClassName="rounded-youth-lg border-2 border-youth-primary/30 hover:border-youth-primary hover:shadow-xl transition-all duration-300 bg-youth-surface"
              dataTestId="card-studybuddy"
              children={
                <div className="space-y-4 pt-2">
                  <p className="text-foreground font-medium">{t.landingPage.studybuddyLead}</p>
                  <ul className="space-y-3">
                    <li className="flex items-start" data-testid="feature-studybuddy-1">
                      <CheckCircle className="h-5 w-5 text-youth-success mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{t.landingPage.studybuddyF1}</span>
                    </li>
                    <li className="flex items-start" data-testid="feature-studybuddy-2">
                      <CheckCircle className="h-5 w-5 text-youth-success mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{t.landingPage.studybuddyF2}</span>
                    </li>
                    <li className="flex items-start" data-testid="feature-studybuddy-3">
                      <CheckCircle className="h-5 w-5 text-youth-success mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{t.landingPage.studybuddyF3}</span>
                    </li>
                    <li className="flex items-start" data-testid="feature-studybuddy-4">
                      <CheckCircle className="h-5 w-5 text-youth-success mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{t.landingPage.studybuddyF4}</span>
                    </li>
                  </ul>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Brain className="h-4 w-4" />
                    <span>{t.landingPage.studybuddyTag}</span>
                  </div>
                </div>
              }
            />
            <FeatureCard
              icon={<Wallet className="h-8 w-8 text-white" />}
              iconBgClassName="h-16 w-16 rounded-youth-lg bg-youth-success/90 flex items-center justify-center"
              title={t.landingPage.budgetpalTitle}
              description={t.landingPage.budgetpalDesc}
              borderClassName="rounded-youth-lg border-2 border-youth-muted/50 hover:border-youth-success hover:shadow-xl transition-all duration-300 bg-youth-surface"
              dataTestId="card-budgetpal"
              children={
                <div className="space-y-4 pt-2">
                  <p className="text-foreground font-medium">{t.landingPage.budgetpalLead}</p>
                  <ul className="space-y-3">
                    <li className="flex items-start" data-testid="feature-budgetpal-1">
                      <CheckCircle className="h-5 w-5 text-youth-success mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{t.landingPage.budgetpalF1}</span>
                    </li>
                    <li className="flex items-start" data-testid="feature-budgetpal-2">
                      <CheckCircle className="h-5 w-5 text-youth-success mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{t.landingPage.budgetpalF2}</span>
                    </li>
                    <li className="flex items-start" data-testid="feature-budgetpal-3">
                      <CheckCircle className="h-5 w-5 text-youth-success mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{t.landingPage.budgetpalF3}</span>
                    </li>
                    <li className="flex items-start" data-testid="feature-budgetpal-4">
                      <CheckCircle className="h-5 w-5 text-youth-success mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{t.landingPage.budgetpalF4}</span>
                    </li>
                  </ul>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>{t.landingPage.budgetpalTag}</span>
                  </div>
                </div>
              }
            />
            <FeatureCard
              icon={<Handshake className="h-8 w-8 text-youth-primary" />}
              iconBgClassName="h-16 w-16 rounded-youth-lg bg-youth-primary/20 flex items-center justify-center"
              title={t.landingPage.mentorshipTitle}
              description={t.landingPage.mentorshipDesc}
              borderClassName="rounded-youth-lg border-2 border-youth-muted/50 hover:border-youth-primary hover:shadow-xl transition-all duration-300 bg-youth-surface"
              dataTestId="card-centro-mentores"
              children={
                <div className="space-y-4 pt-2">
                  <p className="text-foreground font-medium">{t.landingPage.mentorshipLead}</p>
                  <ul className="space-y-3">
                    <li className="flex items-start" data-testid="feature-mentorship-1">
                      <CheckCircle className="h-5 w-5 text-youth-success mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{t.landingPage.mentorshipF1}</span>
                    </li>
                    <li className="flex items-start" data-testid="feature-mentorship-2">
                      <CheckCircle className="h-5 w-5 text-youth-success mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{t.landingPage.mentorshipF2}</span>
                    </li>
                    <li className="flex items-start" data-testid="feature-mentorship-3">
                      <CheckCircle className="h-5 w-5 text-youth-success mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{t.landingPage.mentorshipF3}</span>
                    </li>
                  </ul>
                  <div className="pt-4 flex flex-col gap-2">
                    <Link href="/mentorship">
                      <Button variant="outline" className="w-full rounded-youth-lg border-youth-primary/50 text-youth-primary hover:bg-youth-primary/10">
                        {t.landingPage.findMentor}
                      </Button>
                    </Link>
                    <Link href="/auth?tab=signup&return=/mentor-apply">
                      <Button className="w-full rounded-youth-lg bg-youth-primary hover:opacity-90">
                        <Heart className="h-4 w-4 mr-2" />
                        {t.landingPage.becomeMentor}
                      </Button>
                    </Link>
                  </div>
                </div>
              }
            />
            <FeatureCard
              icon={<Ship className="h-8 w-8 text-white" />}
              iconBgClassName="h-16 w-16 rounded-youth-lg bg-youth-accent flex items-center justify-center"
              title={t.landingPage.travelTitle}
              description={t.landingPage.travelDesc}
              borderClassName="rounded-youth-lg border-2 border-youth-muted/50 hover:border-youth-accent hover:shadow-xl transition-all duration-300 bg-youth-surface"
              dataTestId="card-travelblog"
              children={
                <div className="space-y-4 pt-2">
                  <p className="text-foreground font-medium">{t.landingPage.travelLead}</p>
                  <ul className="space-y-3">
                    <li className="flex items-start" data-testid="feature-travelblog-1">
                      <CheckCircle className="h-5 w-5 text-youth-success mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{t.landingPage.travelF1}</span>
                    </li>
                    <li className="flex items-start" data-testid="feature-travelblog-2">
                      <CheckCircle className="h-5 w-5 text-youth-success mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{t.landingPage.travelF2}</span>
                    </li>
                    <li className="flex items-start" data-testid="feature-travelblog-3">
                      <CheckCircle className="h-5 w-5 text-youth-success mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{t.landingPage.travelF3}</span>
                    </li>
                    <li className="flex items-start" data-testid="feature-travelblog-4">
                      <CheckCircle className="h-5 w-5 text-youth-success mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{t.landingPage.travelF4}</span>
                    </li>
                  </ul>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>{t.landingPage.travelTag}</span>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </Section>

      {/* Featured Travel / Viajes y Cruceros Section - from blog (showOnLanding) */}
      {featuredPosts.length > 0 && (
        <Section className="bg-gradient-to-b from-white to-youth-muted/30" data-testid="section-featured-travel" title={t.landingPage.featuredTravelTitle} subtitle={t.landingPage.featuredTravelSubtitle}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="border-2 border-purple-100 hover:shadow-lg transition-all duration-300 overflow-hidden" data-testid={`card-featured-${post.id}`}>
                  <CardHeader className="pb-2">
                    <Badge variant="secondary" className="w-fit mb-2">{post.category}</Badge>
                    <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                    {post.publishedAt && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {format(new Date(post.publishedAt), "PP")}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {post.excerpt || t.landingPage.travelStoryPlaceholder}
                    </p>
                    <Link href="/auth">
                      <Button variant="link" className="p-0 h-auto mt-2 text-purple-600">
                        {t.landingPage.readMore} <ArrowRight className="h-4 w-4 ml-1 inline" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/auth">
                <Button variant="outline" className="rounded-youth-lg border-youth-primary/50 text-youth-primary hover:bg-youth-primary/10">
                  <Globe className="w-4 h-4 mr-2" />
                  {t.landingPage.exploreTravelBlog}
                </Button>
              </Link>
            </div>
          </div>
        </Section>
      )}

      <Section className="bg-youth-muted/30" data-testid="section-howitworks" title={t.landingPage.howItWorksTitle} subtitle={t.landingPage.howItWorksSubtitle}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center" data-testid="step-1">
              <div className="h-16 w-16 bg-youth-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-youth-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t.landingPage.step1Title}</h3>
              <p className="text-muted-foreground">{t.landingPage.step1Desc}</p>
            </div>

            <div className="text-center" data-testid="step-2">
              <div className="h-16 w-16 bg-youth-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-youth-success">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t.landingPage.step2Title}</h3>
              <p className="text-muted-foreground">{t.landingPage.step2Desc}</p>
            </div>

            <div className="text-center" data-testid="step-3">
              <div className="h-16 w-16 bg-youth-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-youth-accent">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t.landingPage.step3Title}</h3>
              <p className="text-muted-foreground">{t.landingPage.step3Desc}</p>
            </div>
          </div>
        </div>
      </Section>

      <section className="py-20 bg-gradient-to-r from-youth-primary to-youth-accent" data-testid="section-cta">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6" data-testid="text-cta-title">
              {t.landingPage.ctaTitle}
            </h2>
            <p className="text-xl text-white/90 mb-8" data-testid="text-cta-subtitle">
              {t.landingPage.ctaSubtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth">
                <Button 
                  size="lg" 
                  className="bg-white text-youth-primary hover:bg-gray-100 text-lg px-8 py-6 rounded-youth-lg"
                  data-testid="button-cta-signup"
                >
                  {t.landingPage.signUpNow}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth">
                <span className="text-white hover:text-white/90 transition-colors" data-testid="link-cta-signin">
                  {t.landingPage.alreadyHaveAccount} <span className="underline font-semibold">{t.landingPage.signInLink}</span>
                </span>
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center" data-testid="stat-users">
                <div className="text-3xl font-bold text-white mb-1">10K+</div>
                <div className="text-white/80 text-sm">{t.landingPage.statUsers}</div>
              </div>
              <div className="text-center" data-testid="stat-sessions">
                <div className="text-3xl font-bold text-white mb-1">50K+</div>
                <div className="text-white/80 text-sm">{t.landingPage.statSessions}</div>
              </div>
              <div className="text-center" data-testid="stat-satisfaction">
                <div className="text-3xl font-bold text-white mb-1">98%</div>
                <div className="text-white/80 text-sm">{t.landingPage.statSatisfaction}</div>
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
              <span className="text-xl font-bold">{t.landingPage.brandName}</span>
            </div>
            <p className="text-gray-400 mb-6">
              {t.landingPage.footerPlatform}
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-400">
              <Link href="/auth">
                <span className="hover:text-white transition-colors" data-testid="link-footer-studybuddy">{t.landingPage.studybuddyTitle}</span>
              </Link>
              <span>•</span>
              <Link href="/auth">
                <span className="hover:text-white transition-colors" data-testid="link-footer-budgetpal">{t.landingPage.budgetpalTitle}</span>
              </Link>
              <span>•</span>
              <Link href="/auth">
                <span className="hover:text-white transition-colors" data-testid="link-footer-travelblog">{t.landingPage.travelTitle}</span>
              </Link>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              {t.landingPage.footerCopyright}
            </div>
          </div>
        </div>
      </footer>
    </PublicLayout>
  );
}
