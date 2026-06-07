import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    if (!oobCode) {
      setChecking(false);
      return;
    }

    verifyPasswordResetCode(auth, oobCode)
      .then(() => {
        setReady(true);
        setChecking(false);
      })
      .catch((error) => {
        toast({ title: "Invalid or expired link", description: error.message, variant: "destructive" });
        setChecking(false);
      });
  }, [oobCode, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (!oobCode) return;

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast({ title: "Password updated", description: "You can now sign in with your new password." });
      navigate("/login");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="border-border bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl text-foreground">Set New Password</CardTitle>
          <CardDescription className="text-muted-foreground">
              {ready
                ? "Enter your new password below"
                : checking
                  ? "Validating reset link..."
                  : "Reset link is invalid or has expired. Please request a new one."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">New Password</Label>
                <Input id="password" type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)} required
                  className="bg-input border-border" disabled={!ready} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-foreground">Confirm Password</Label>
                <Input id="confirm" type="password" value={confirm}
                  onChange={(e) => setConfirm(e.target.value)} required
                  className="bg-input border-border" disabled={!ready} />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !ready}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
