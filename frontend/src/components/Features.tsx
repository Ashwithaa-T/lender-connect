import { Shield, Zap, BarChart3, Lock, Users, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Advanced Risk Assessment",
    description: "Multi-factor analysis including CIBIL score, transaction patterns, and debt obligations for accurate risk profiling.",
  },
  {
    icon: Zap,
    title: "Instant Processing",
    description: "Real-time data aggregation and analysis delivers assessment results in seconds, not days.",
  },
  {
    icon: BarChart3,
    title: "Comprehensive Analytics",
    description: "Deep insights into financial behavior, cash flow patterns, and repayment capacity with visual dashboards.",
  },
  {
    icon: Lock,
    title: "Bank-Grade Security",
    description: "End-to-end encryption, compliance with RBI guidelines, and secure data handling protocols.",
  },
  {
    icon: Users,
    title: "Borrower Profiling",
    description: "Detailed business profiles with industry benchmarking and performance comparison metrics.",
  },
  {
    icon: RefreshCw,
    title: "Continuous Monitoring",
    description: "Ongoing credit monitoring and early warning alerts for existing loan portfolios.",
  },
];

const Features = () => {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Powerful Features for Better Lending
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to make confident, data-driven lending decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-medium transition-all duration-300 group hover:border-accent/50"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className="mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
