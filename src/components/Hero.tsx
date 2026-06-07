import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, TrendingUp, CheckCircle2 } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 py-20">
      <div 
        className="absolute inset-0 z-0 opacity-5"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium">
            <Shield className="w-4 h-4" />
            Secure & Compliant Lending Platform
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            Smart Loan Assessment for{" "}
            <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
              Small Businesses
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Empower banks with AI-driven insights to evaluate creditworthiness based on CIBIL scores, transaction history, and existing loans.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button variant="cta" size="lg" className="group">
              View Demo Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto">
            {[
              { icon: TrendingUp, label: "99.2% Accuracy", desc: "Prediction rate" },
              { icon: Shield, label: "Bank-Grade", desc: "Security" },
              { icon: CheckCircle2, label: "Real-Time", desc: "Assessment" },
            ].map((stat, i) => (
              <div 
                key={i} 
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-soft"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <stat.icon className="w-6 h-6 text-accent" />
                <div className="text-2xl font-bold text-foreground">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
