export interface KnowledgeBaseEntry {
  id: string;
  category:
    | "navigation"
    | "jobs"
    | "applications"
    | "career_services"
    | "employer"
    | "candidate"
    | "support"
    | "policy";
  keywords: string[];
  question: string;
  answer: string;
  ctaText?: string;
  ctaHref?: string;
  allowedRoles?: ("anonymous" | "candidate" | "employer" | "admin")[];
}

export const PLATFORM_KNOWLEDGE_BASE: KnowledgeBaseEntry[] = [
  // 1. JOBS & INTERNSHIPS DISCOVERY
  {
    id: "kb-001",
    category: "jobs",
    keywords: ["search", "find", "jobs", "openings", "positions", "vacancies", "filter", "explore"],
    question: "How do I search for jobs on WE CORPORATE?",
    answer:
      "You can search and filter verified job opportunities by keyword, city, experience level, employment type (full-time, part-time), and workplace mode (remote, hybrid, on-site) on our Jobs discovery page.",
    ctaText: "Browse Jobs",
    ctaHref: "/jobs",
  },
  {
    id: "kb-002",
    category: "jobs",
    keywords: ["internship", "intern", "college", "freshers", "students", "summer", "stipend"],
    question: "How do I search for internships?",
    answer:
      "You can explore early-career internships with verified stipends, structured mentorship, and transparent durations on our dedicated Internships discovery page.",
    ctaText: "Browse Internships",
    ctaHref: "/internships",
  },
  {
    id: "kb-003",
    category: "jobs",
    keywords: ["save", "bookmark", "saved", "favorite", "watchlist"],
    question: "How do I save a job or internship to view later?",
    answer:
      "Click the bookmark icon on any job card or job detail page. You can access and manage all your bookmarked opportunities anytime in your Candidate workspace under Saved Jobs.",
    ctaText: "Open Saved Jobs",
    ctaHref: "/c/saved",
    allowedRoles: ["candidate"],
  },

  // 2. NATIVE APPLICATION PIPELINE
  {
    id: "kb-004",
    category: "applications",
    keywords: ["apply", "application", "1-click", "submit", "apply now", "how to apply"],
    question: "How do I apply for an opportunity?",
    answer:
      "Open any published job or internship, click 'Apply Now', choose your primary resume from your private Resume Vault, add an optional cover note, accept the consent terms, and submit your 1-click application.",
    ctaText: "Find Opportunities to Apply",
    ctaHref: "/jobs",
  },
  {
    id: "kb-005",
    category: "applications",
    keywords: ["track", "status", "applications", "applied", "where are my applications", "my applications"],
    question: "Where can I see my submitted applications?",
    answer:
      "You can track all your active and historical applications, real-time recruiter review stages, and milestone timelines in your Candidate Applications Tracker.",
    ctaText: "View Applications",
    ctaHref: "/c/applications",
    allowedRoles: ["candidate"],
  },
  {
    id: "kb-006",
    category: "applications",
    keywords: ["status", "stage", "under review", "shortlisted", "not selected", "hired", "meaning"],
    question: "What do the different application statuses mean?",
    answer:
      "Applications progress through 5 verified stages: 'Applied' (received), 'Under Review' (recruiter evaluating profile snapshot), 'Shortlisted' (advanced to interview rounds), 'Hired' (offer finalized), and 'Not Selected' (application closed for this opening).",
    ctaText: "Track My Applications",
    ctaHref: "/c/applications",
    allowedRoles: ["candidate"],
  },
  {
    id: "kb-007",
    category: "applications",
    keywords: ["why rejected", "rejection reason", "why not selected"],
    question: "Why was my application not selected?",
    answer:
      "Selection decisions are made directly by the hiring employer based on specific experience requirements, role capacity, and team fit. WE Guide cannot speculate on specific hiring outcomes.",
    ctaText: "View Applications",
    ctaHref: "/c/applications",
    allowedRoles: ["candidate"],
  },

  // 3. CANDIDATE PROFILE & RESUME VAULT
  {
    id: "kb-008",
    category: "candidate",
    keywords: ["profile", "update profile", "headline", "skills", "bio", "experience"],
    question: "How do I update my profile?",
    answer:
      "Go to your Candidate Profile settings to update your headline, bio, location, education, and technical skills array. Updates reflect on future applications.",
    ctaText: "Edit Profile",
    ctaHref: "/c/profile",
    allowedRoles: ["candidate"],
  },
  {
    id: "kb-009",
    category: "candidate",
    keywords: ["resume", "vault", "pdf", "upload resume", "primary resume", "delete resume"],
    question: "Where are my resumes stored and how do I upload a new one?",
    answer:
      "Your documents are securely stored in your private Resume Vault. You can upload multiple PDF resumes, set a default primary resume, or remove old versions without affecting previously submitted application snapshots.",
    ctaText: "Open Resume Vault",
    ctaHref: "/c/resumes",
    allowedRoles: ["candidate"],
  },

  // 4. CAREER SERVICES & ADVISORY
  {
    id: "kb-010",
    category: "career_services",
    keywords: ["career services", "consulting", "resume review", "mock interview", "guidance", "advisory", "coaching"],
    question: "How do Career Services work on WE CORPORATE?",
    answer:
      "We provide 1-on-1 personalized advisory sessions with verified corporate hiring managers and engineering leads. Offerings include Comprehensive Resume Teardown (₹1,499), Mock Technical Interviews (₹2,499), Placement Strategy (₹1,999), and Portfolio Audits (₹999).",
    ctaText: "Explore Career Services",
    ctaHref: "/career-services",
  },
  {
    id: "kb-011",
    category: "career_services",
    keywords: ["book", "consultation", "booking", "how to book", "schedule session"],
    question: "How do I book a career consultation?",
    answer:
      "Select a service from our catalog, provide your availability preferences (preferred & alternative dates, time slot), describe your primary career goal, and proceed through our secure Razorpay checkout.",
    ctaText: "Book a Consultation",
    ctaHref: "/career-services",
  },
  {
    id: "kb-012",
    category: "career_services",
    keywords: ["after payment", "payment success", "what happens next", "fulfillment", "refund", "razorpay"],
    question: "What happens after I complete payment for a career service?",
    answer:
      "Once payment is verified, your booking enters our Admin Fulfillment queue. Our operations team assigns a mentor with relevant domain expertise, confirms your meeting slot, and sends session agenda details to your Consulting Hub.",
    ctaText: "View Consulting Hub",
    ctaHref: "/c/consulting",
    allowedRoles: ["candidate"],
  },

  // 5. EMPLOYER WORKSPACE & HIRING
  {
    id: "kb-013",
    category: "employer",
    keywords: ["post job", "create job", "new job", "hiring", "employer post", "publish opening"],
    question: "How do employers create and publish job listings?",
    answer:
      "Verified employers can create job drafts in their Employer Workspace. Once submitted, drafts undergo Admin moderation to verify compensation clarity and authenticity before public publishing.",
    ctaText: "Employer Job Manager",
    ctaHref: "/e/jobs",
    allowedRoles: ["employer", "admin"],
  },
  {
    id: "kb-014",
    category: "employer",
    keywords: ["employer verification", "verification status", "company verify", "gst", "cin", "approval"],
    question: "How does Employer Verification work?",
    answer:
      "To protect candidates from fraudulent postings, employers must submit corporate verification details (work email, official website, and registration identifier like CIN/GSTIN). Once approved by Admin, job creation is unlocked.",
    ctaText: "Verification Portal",
    ctaHref: "/e/verification",
    allowedRoles: ["employer", "admin"],
  },
  {
    id: "kb-015",
    category: "employer",
    keywords: ["view applicants", "ats", "review candidates", "shortlist", "applicant pipeline"],
    question: "Where do employers review job applicants?",
    answer:
      "Employers can access the Lite ATS pipeline directly from their Employer Job Manager. Click 'Applicants' on any job to view candidate profile snapshots, review attached resumes, and transition candidate stages.",
    ctaText: "View My Jobs",
    ctaHref: "/e/jobs",
    allowedRoles: ["employer", "admin"],
  },

  // 6. POLICIES & ETHICAL BOUNDARIES
  {
    id: "kb-016",
    category: "policy",
    keywords: ["guaranteed job", "guaranteed placement", "100% placement", "guaranteed salary", "fake job"],
    question: "Does WE CORPORATE guarantee jobs or placement?",
    answer:
      "No. WE CORPORATE strictly adheres to ethical recruitment standards and does not sell false placement or salary guarantees. Our Career Services focus on genuine skill benchmarking, ATS optimization, and interview preparation.",
    ctaText: "Explore Career Services",
    ctaHref: "/career-services",
  },
  {
    id: "kb-017",
    category: "support",
    keywords: ["contact", "support", "help", "email support", "inquiry", "human support"],
    question: "How do I contact WE CORPORATE human support?",
    answer:
      "You can reach our corporate support team anytime via our Contact page for partnership inquiries, verification assistance, or booking questions.",
    ctaText: "Contact Support",
    ctaHref: "/contact",
  },
];
