import Link from "next/link";
import { Briefcase, ShieldCheck } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-border-subtle bg-surface-card text-text-secondary text-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-brand-primary">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-primary text-white">
                <Briefcase className="h-4 w-4 text-brand-accent" />
              </div>
              <span>WE CORPORATE</span>
            </Link>
            <p className="text-xs text-text-muted leading-relaxed">
              Professional job & internship discovery portal for verified opportunities, high-trust recruitment, and actionable career growth in India.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-medium text-brand-accent">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified Employers & Moderated Listings</span>
            </div>
          </div>

          {/* Candidates Col */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-brand-primary uppercase tracking-wider">Candidates</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/jobs" className="hover:text-brand-primary transition-colors">Find Jobs</Link></li>
              <li><Link href="/internships" className="hover:text-brand-primary transition-colors">Student Internships</Link></li>
              <li><Link href="/career-services" className="hover:text-brand-primary transition-colors">Career Guidance & Services</Link></li>
              <li><Link href="/auth/signup" className="hover:text-brand-primary transition-colors">Candidate Registration</Link></li>
            </ul>
          </div>

          {/* Employers & Institutions Col */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-brand-primary uppercase tracking-wider">Partnerships</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/auth/employer/signup" className="hover:text-brand-primary transition-colors">Post Verified Jobs</Link></li>
              <li><Link href="/connect/college" className="hover:text-brand-primary transition-colors">College Connect</Link></li>
              <li><Link href="/connect/vendor" className="hover:text-brand-primary transition-colors">Vendor Connect</Link></li>
              <li><Link href="/about" className="hover:text-brand-primary transition-colors">About WE CORPORATE</Link></li>
            </ul>
          </div>

          {/* Legal & Trust Col */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-brand-primary uppercase tracking-wider">Trust & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/privacy" className="hover:text-brand-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-brand-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-brand-primary transition-colors">Contact & Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border-subtle pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
          <p>© {new Date().getFullYear()} WE CORPORATE. All rights reserved.</p>
          <p>Designed for trust, opportunity, and career growth.</p>
        </div>
      </div>
    </footer>
  );
}
