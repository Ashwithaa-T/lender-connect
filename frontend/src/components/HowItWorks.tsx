import { Database, Brain, CheckCircle, FileText } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Submit Application",
    description: "Business owner submits loan application with required documentation and consent for data access.",
  },
  {
    icon: Database,
    title: "Data Collection",
    description: "System automatically fetches CIBIL score, transaction history, existing loans, and financial records.",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Advanced algorithms analyze creditworthiness, repayment capacity, and risk factors in real-time.",
  },
  {
    icon: CheckCircle,
    title: "Instant Decision",
    description: "Banks receive comprehensive assessment report with approval recommendation and risk rating.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamlined loan assessment process powered by data and intelligence
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl bg-card border border-border hover:border-accent/50 hover:shadow-medium transition-all duration-300">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full group-hover:bg-accent/30 transition-all" />
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-accent-foreground" />
                  </div>
                </div>
                
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-medium">
                  {index + 1}
                </div>
                
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-accent to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
