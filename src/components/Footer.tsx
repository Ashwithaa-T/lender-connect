import { Shield, CreditCard } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 px-6 bg-card border-t border-border">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              LendAssess
            </span>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground">
              © 2024 LendAssess. Secure lending platform for banks.
            </p>
            <div className="flex items-center justify-center md:justify-end gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-secondary" />
                RBI Compliant
              </span>
              <span>•</span>
              <span>Bank-Grade Security</span>
              <span>•</span>
              <span>Real-Time Assessment</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
