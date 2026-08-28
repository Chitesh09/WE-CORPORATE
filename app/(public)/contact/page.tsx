import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-brand-primary">Contact & Human Support</h1>
        <p className="text-sm text-text-secondary">
          Reach our platform support team for account assistance, employer verification escalations, or consulting questions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-base text-brand-primary">Send a Message</h3>
            <Input placeholder="Your Full Name" />
            <Input placeholder="Your Email Address" />
            <Input placeholder="Subject" />
            <textarea
              className="w-full h-28 rounded-md border border-border-strong p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
              placeholder="How can our team help you?"
            />
            <Button className="w-full">Submit Request</Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-brand-primary">
                <Mail className="h-4 w-4 text-brand-accent" />
                <span>Direct Email Support</span>
              </div>
              <p className="text-xs text-text-secondary">support@wecorporate.in</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
