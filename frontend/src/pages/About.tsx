import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { Shield, TrendingUp, Users, CheckCircle2, BarChart3, Brain, Lock, Zap, ArrowLeft } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Assessment",
      description: "Our advanced algorithms analyze multiple parameters to provide accurate loan eligibility predictions in seconds."
    },
    {
      icon: Shield,
      title: "Risk Evaluation",
      description: "Comprehensive risk scoring system that considers CIBIL score, revenue patterns, and repayment capacity."
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Interactive dashboards with visual insights into loan applications, approval trends, and portfolio health."
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get loan decisions in real-time with detailed breakdowns of EMI, interest rates, and recommended amounts."
    },
    {
      icon: Lock,
      title: "Secure Processing",
      description: "Bank-grade security ensures your financial data is protected throughout the assessment process."
    },
    {
      icon: Users,
      title: "Small Business Focus",
      description: "Tailored specifically for small business lending with industry-specific evaluation criteria."
    }
  ];

  const criteria = [
    { label: "CIBIL Score", range: "300-900", ideal: "750+" },
    { label: "Age Range", range: "21-65 years", ideal: "25-55 years" },
    { label: "Loan-to-Revenue", range: "Up to 10x", ideal: "Below 4x" },
    { label: "EMI Burden", range: "Up to 60%", ideal: "Below 40%" },
    { label: "Business Age", range: "6+ months", ideal: "24+ months" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <NavLink to="/">
          <Button variant="ghost" size="sm" className="gap-2 mb-6 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </NavLink>

        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <Badge variant="secondary" className="mb-4">
            Trusted by 500+ Businesses
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Smart Loan Assessment Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Empowering financial institutions with intelligent loan decisioning tools 
            for small business lending.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Eligibility Criteria */}
        <Card className="mb-16 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
              Eligibility Criteria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {criteria.map((item) => (
                <div key={item.label} className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                  <p className="font-semibold">{item.range}</p>
                  <Badge variant="outline" className="mt-2">
                    Ideal: {item.ideal}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Submit Application", desc: "Enter business and financial details" },
              { step: "2", title: "AI Analysis", desc: "Our system evaluates all parameters" },
              { step: "3", title: "Risk Assessment", desc: "Calculate risk score and eligibility" },
              { step: "4", title: "Get Decision", desc: "Receive instant loan recommendation" },
            ].map((item, index) => (
              <div 
                key={item.step} 
                className="text-center animate-fade-in"
                style={{ animationDelay: `${0.8 + index * 0.1}s` }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-accent-foreground">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "₹50Cr+", label: "Loans Assessed" },
            { value: "10,000+", label: "Applications Processed" },
            { value: "72%", label: "Approval Rate" },
            { value: "<30s", label: "Average Decision Time" },
          ].map((stat, index) => (
            <Card 
              key={stat.label} 
              className="text-center animate-fade-in"
              style={{ animationDelay: `${1.2 + index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <p className="text-3xl font-bold text-accent mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;