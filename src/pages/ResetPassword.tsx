import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type Values = z.infer<typeof schema>;

const ResetPassword = () => {
  const [submitting, setSubmitting] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useForm<Values>({ resolver: zodResolver(schema) });

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }
  }, []);

  const handleSubmit = async (values: Values) => {
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: values.password });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated!", description: "You can now log in with your new password." });
      navigate("/auth");
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <p className="font-serif text-2xl font-bold text-foreground">Invalid reset link</p>
          <p className="mt-2 text-muted-foreground">Please request a new password reset.</p>
          <Button className="mt-4" onClick={() => navigate("/auth")}>Go to Login</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container flex items-center justify-center py-16">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-card">
          <h2 className="mb-6 font-serif text-2xl font-bold text-card-foreground">Set New Password</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;
