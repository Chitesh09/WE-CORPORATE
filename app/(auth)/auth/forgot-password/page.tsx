import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
      <Card>
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-brand-primary">Reset Password</h1>
            <p className="text-xs text-text-secondary">Enter your email to receive recovery instructions</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Registered Email</label>
              <Input type="email" placeholder="name@example.com" />
            </div>
            <Button className="w-full">Send Reset Link</Button>
          </div>

          <div className="text-center text-xs text-text-secondary pt-2">
            <Link href="/auth/login" className="font-semibold text-brand-accent hover:underline">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
