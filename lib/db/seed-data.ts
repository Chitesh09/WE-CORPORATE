/**
 * WE CORPORATE — Development Seed Data
 * 
 * NOTE: All data below is isolated development/test data representing realistic
 * opportunities across India for local development, visual verification, and testing.
 * Only listings with status: "published" are exposed to public endpoints.
 */

export interface PublicJob {
  id: string;
  title: string;
  slug: string;
  jobType: "full_time" | "internship" | "part_time" | "contract";
  workplaceType: "on_site" | "hybrid" | "remote";
  city: string;
  state: string;
  experienceLevel: "freshers" | "1-3_years" | "3-5_years" | "5+_years";
  minCompensation: number; // Annual CTC in INR or Monthly Stipend in INR
  maxCompensation: number;
  compensationType: "annual_ctc" | "monthly_stipend";
  isCompensationNegotiable: boolean;
  description: string;
  responsibilities: string[];
  requirements: string[];
  perks: string[];
  skills: string[];
  status: "draft" | "pending_moderation" | "published" | "paused" | "closed" | "rejected";
  publishedAt: string;
  company: {
    name: string;
    slug: string;
    logoUrl?: string;
    websiteUrl: string;
    corporateDomain: string;
    companySize: string;
    industry: string;
    headquartersCity: string;
    about: string;
    isVerified: boolean;
  };
}

export const DEVELOPMENT_JOBS: PublicJob[] = [
  {
    id: "job-001",
    title: "Associate Software Engineer — Frontend",
    slug: "associate-software-engineer-frontend-we-tech-001",
    jobType: "full_time",
    workplaceType: "hybrid",
    city: "Bengaluru",
    state: "Karnataka",
    experienceLevel: "freshers",
    minCompensation: 800000,
    maxCompensation: 1200000,
    compensationType: "annual_ctc",
    isCompensationNegotiable: false,
    description: "We are seeking a talented Associate Frontend Engineer to build high-performance, accessible web applications for our cloud ecosystem. You will collaborate closely with product designers and backend engineers to craft responsive user interfaces.",
    responsibilities: [
      "Develop modular, accessible UI components using React, Next.js, and TypeScript.",
      "Optimize web application performance to achieve excellent Core Web Vitals (INP < 200ms, LCP < 2.5s).",
      "Collaborate with UX strategists to translate Figma designs into pixel-perfect implementations.",
      "Write unit and integration tests to ensure cross-browser compatibility and state resilience."
    ],
    requirements: [
      "B.Tech/B.E/BCA/MCA in Computer Science or related engineering discipline (2025/2026 batch welcome).",
      "Strong foundation in JavaScript (ES6+), TypeScript, HTML5, and modern CSS/Tailwind.",
      "Hands-on experience with React, state management, and REST APIs.",
      "Understanding of web accessibility standards (WCAG 2.1 AA) and semantic markup."
    ],
    perks: [
      "Comprehensive Health & Medical Insurance",
      "Annual Learning & Certification Allowance (₹50,000)",
      "Hybrid Work Schedule (2 days WFH / 3 days Office)",
      "Wellness Stipend & Team Offsites"
    ],
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "REST APIs", "Git"],
    status: "published",
    publishedAt: "2026-08-27T09:00:00Z",
    company: {
      name: "Nexus Cloud Systems India",
      slug: "nexus-cloud-systems",
      websiteUrl: "https://nexuscloud.example.in",
      corporateDomain: "nexuscloud.in",
      companySize: "201-500 Employees",
      industry: "Enterprise SaaS & Cloud Infrastructure",
      headquartersCity: "Bengaluru",
      about: "Nexus Cloud Systems is a leading enterprise cloud management and observability platform powering Fortune 500 digital operations across Asia-Pacific.",
      isVerified: true
    }
  },
  {
    id: "job-002",
    title: "Product Design Intern (UI/UX)",
    slug: "product-design-intern-ui-ux-002",
    jobType: "internship",
    workplaceType: "hybrid",
    city: "Bengaluru",
    state: "Karnataka",
    experienceLevel: "freshers",
    minCompensation: 30000,
    maxCompensation: 40000,
    compensationType: "monthly_stipend",
    isCompensationNegotiable: false,
    description: "Join our design studio for a 6-month intensive internship where you will work on live B2B SaaS workflows, design systems, and mobile-first responsive interfaces.",
    responsibilities: [
      "Create wireframes, user flows, and high-fidelity interactive prototypes in Figma.",
      "Contribute to our unified design token system and component documentation.",
      "Participate in user research sessions and synthesize usability testing feedback.",
      "Work closely with frontend engineers to inspect design implementations."
    ],
    requirements: [
      "Current student or fresh graduate in Design, HCI, Architecture, or Engineering.",
      "Demonstrated design portfolio showcasing web and mobile interface projects.",
      "Proficiency in Figma, auto-layout, component variants, and interactive prototyping.",
      "Strong typography, spacing hierarchy, and visual design intuition."
    ],
    perks: [
      "Pre-Placement Offer (PPO) Opportunity upon successful completion",
      "Dedicated Senior Designer Mentorship",
      "Modern MacBook Pro provided for internship duration",
      "Flexible working hours"
    ],
    skills: ["Figma", "UI/UX Design", "Design Systems", "Prototyping", "User Research"],
    status: "published",
    publishedAt: "2026-08-26T14:30:00Z",
    company: {
      name: "Kredo FinTech Solutions",
      slug: "kredo-fintech",
      websiteUrl: "https://kredofin.example.in",
      corporateDomain: "kredofin.in",
      companySize: "51-200 Employees",
      industry: "Financial Technology & Digital Lending",
      headquartersCity: "Bengaluru",
      about: "Kredo is an RBI-regulated digital banking infrastructure platform simplifying merchant settlements and automated compliance across India.",
      isVerified: true
    }
  },
  {
    id: "job-003",
    title: "Backend Engineer — Distributed Systems",
    slug: "backend-engineer-distributed-systems-003",
    jobType: "full_time",
    workplaceType: "remote",
    city: "Pan-India",
    state: "Remote",
    experienceLevel: "1-3_years",
    minCompensation: 1400000,
    maxCompensation: 2200000,
    compensationType: "annual_ctc",
    isCompensationNegotiable: true,
    description: "We are looking for a Backend Engineer with 1-3 years of experience to scale our high-throughput transaction routing engine. You will design resilient PostgreSQL schemas, gRPC microservices, and asynchronous event streams.",
    responsibilities: [
      "Design, build, and maintain scalable microservices using Go and Node.js.",
      "Optimize relational database queries, indexing strategies, and connection pooling.",
      "Implement idempotent webhook handlers and payment processing pipelines.",
      "Participate in on-call rotations and system reliability engineering."
    ],
    requirements: [
      "1-3 years of professional experience in backend software engineering.",
      "Strong proficiency in TypeScript / Node.js or Go.",
      "Deep understanding of PostgreSQL, indexing, ACID transactions, and Redis caching.",
      "Experience building and consuming RESTful and gRPC APIs."
    ],
    perks: [
      "100% Remote Work Anywhere in India",
      "Home Office Setup Allowance (₹40,000)",
      "Generous Stock Options (ESOPs)",
      "Unlimited Paid Time Off (PTO) policy"
    ],
    skills: ["Node.js", "TypeScript", "PostgreSQL", "Redis", "Docker", "REST APIs"],
    status: "published",
    publishedAt: "2026-08-25T11:15:00Z",
    company: {
      name: "ZetaStream Data Labs",
      slug: "zetastream-labs",
      websiteUrl: "https://zetastream.example.in",
      corporateDomain: "zetastream.io",
      companySize: "51-200 Employees",
      industry: "Big Data & Real-Time Analytics",
      headquartersCity: "Hyderabad",
      about: "ZetaStream builds real-time event streaming and analytical pipeline engines for high-volume e-commerce and logistics networks.",
      isVerified: true
    }
  },
  {
    id: "job-004",
    title: "Software Engineering Intern — Backend (Python/Go)",
    slug: "software-engineering-intern-backend-004",
    jobType: "internship",
    workplaceType: "remote",
    city: "Pan-India",
    state: "Remote",
    experienceLevel: "freshers",
    minCompensation: 25000,
    maxCompensation: 35000,
    compensationType: "monthly_stipend",
    isCompensationNegotiable: false,
    description: "Are you passionate about backend architectures and API development? Join our engineering team to build data pipelines and microservices for smart logistics.",
    responsibilities: [
      "Build REST endpoints and asynchronous worker jobs in Python and Go.",
      "Write SQL migrations and unit tests for database repositories.",
      "Integrate third-party logistics APIs and webhook notification services.",
      "Learn and apply CI/CD and Docker containerization best practices."
    ],
    requirements: [
      "B.Tech / MCA in Computer Science or related fields (2026 / 2027 graduates).",
      "Proficient in Python, Go, or Java with solid Data Structures & Algorithms knowledge.",
      "Familiarity with SQL databases (PostgreSQL/MySQL) and Git version control.",
      "Strong problem-solving curiosity and eagerness to learn."
    ],
    perks: [
      "Full-Time Conversion Opportunity based on 6-month evaluation",
      "Remote Work Freedom",
      "Direct guidance from Senior Principal Engineers",
      "Monthly Team Learning Sessions"
    ],
    skills: ["Python", "Go", "PostgreSQL", "Data Structures", "Git"],
    status: "published",
    publishedAt: "2026-08-26T16:00:00Z",
    company: {
      name: "LogiNext HyperFleet",
      slug: "loginext-hyperfleet",
      websiteUrl: "https://loginextfleet.example.in",
      corporateDomain: "hyperfleet.in",
      companySize: "11-50 Employees",
      industry: "Supply Chain & Logistics Tech",
      headquartersCity: "Pune",
      about: "HyperFleet provides AI-driven fleet routing and automated dispatch infrastructure for Indian supply chain networks.",
      isVerified: true
    }
  },
  {
    id: "job-005",
    title: "Full Stack Developer (React & Node.js)",
    slug: "full-stack-developer-react-node-005",
    jobType: "full_time",
    workplaceType: "hybrid",
    city: "Pune",
    state: "Maharashtra",
    experienceLevel: "1-3_years",
    minCompensation: 1000000,
    maxCompensation: 1600000,
    compensationType: "annual_ctc",
    isCompensationNegotiable: false,
    description: "We are looking for a Full Stack Developer to build customer-facing dashboards and internal tooling for healthcare operations.",
    responsibilities: [
      "Build end-to-end features using React, Next.js, Node.js, and PostgreSQL.",
      "Design clean database schemas and secure RESTful endpoints.",
      "Implement role-based authorization and session management.",
      "Monitor application performance and resolve user issues."
    ],
    requirements: [
      "1-3 years full stack web development experience.",
      "Proficient with React, TypeScript, Node.js, and relational databases.",
      "Experience with Tailwind CSS and responsive design patterns.",
      "Understanding of security fundamentals (XSS, CSRF, input validation)."
    ],
    perks: [
      "Comprehensive Health Insurance for Employee & Family",
      "Hybrid Workplace in Hinjawadi Tech Park, Pune",
      "Annual Performance Bonus (up to 15%)",
      "Subsidized Cafeteria & Cab Services"
    ],
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Tailwind CSS", "Next.js"],
    status: "published",
    publishedAt: "2026-08-24T10:00:00Z",
    company: {
      name: "MedPulse Health Systems",
      slug: "medpulse-health",
      websiteUrl: "https://medpulse.example.in",
      corporateDomain: "medpulse.in",
      companySize: "501-1000 Employees",
      industry: "HealthTech & Hospital Management",
      headquartersCity: "Pune",
      about: "MedPulse Health provides clinical operations management and electronic health records software to over 400 hospitals across India.",
      isVerified: true
    }
  },
  {
    id: "job-006",
    title: "Data Analyst & Business Intelligence Intern",
    slug: "data-analyst-bi-intern-006",
    jobType: "internship",
    workplaceType: "on_site",
    city: "Mumbai",
    state: "Maharashtra",
    experienceLevel: "freshers",
    minCompensation: 20000,
    maxCompensation: 30000,
    compensationType: "monthly_stipend",
    isCompensationNegotiable: false,
    description: "Analyze recruitment trends, candidate conversion funnels, and market insights using SQL, Python, and modern BI dashboards.",
    responsibilities: [
      "Write complex SQL queries to extract and transform operational metrics.",
      "Build interactive dashboards in PowerBI/Tableau and Python notebooks.",
      "Analyze hiring funnels and identify drop-off patterns in application pipelines.",
      "Present data-backed recommendations to cross-functional product teams."
    ],
    requirements: [
      "Degree in Statistics, Mathematics, Economics, Computer Science, or Data Science.",
      "Strong proficiency in SQL and spreadsheet modeling (Excel/Google Sheets).",
      "Basic programming knowledge in Python (Pandas, NumPy).",
      "Strong analytical thinking and clear communication skills."
    ],
    perks: [
      "Stipend + Travel Allowance in Mumbai",
      "Certificate of Excellence & Letter of Recommendation",
      "Hands-on experience with massive production datasets",
      "Direct mentorship from VP of Analytics"
    ],
    skills: ["SQL", "Python", "Data Analysis", "PowerBI", "Excel"],
    status: "published",
    publishedAt: "2026-08-25T08:30:00Z",
    company: {
      name: "Altis Analytics India",
      slug: "altis-analytics",
      websiteUrl: "https://altisanalytics.example.in",
      corporateDomain: "altisanalytics.in",
      companySize: "51-200 Employees",
      industry: "Market Intelligence & Consulting",
      headquartersCity: "Mumbai",
      about: "Altis Analytics delivers market research and predictive talent intelligence to top corporate enterprises across India and the Middle East.",
      isVerified: true
    }
  },
  {
    id: "job-007",
    title: "DevOps & Cloud Infrastructure Engineer",
    slug: "devops-cloud-infrastructure-engineer-007",
    jobType: "full_time",
    workplaceType: "remote",
    city: "Pan-India",
    state: "Remote",
    experienceLevel: "3-5_years",
    minCompensation: 1800000,
    maxCompensation: 2800000,
    compensationType: "annual_ctc",
    isCompensationNegotiable: true,
    description: "Manage AWS/GCP cloud environments, automated CI/CD pipelines, Kubernetes clusters, and security compliance for enterprise SaaS platforms.",
    responsibilities: [
      "Design and maintain Infrastructure as Code (IaC) using Terraform.",
      "Manage Kubernetes (EKS) clusters, Helm charts, and containerized deployments.",
      "Implement automated GitHub Actions CI/CD workflows and security scanning.",
      "Establish observability with Prometheus, Grafana, and OpenTelemetry."
    ],
    requirements: [
      "3+ years experience in Cloud DevOps, SRE, or Infrastructure Engineering.",
      "Hands-on expertise with AWS, Kubernetes, Docker, and Terraform.",
      "Deep understanding of Linux networking, DNS, TLS, and VPC security.",
      "Experience with automated CI/CD pipelines and deployment rollbacks."
    ],
    perks: [
      "100% Remote (Pan-India)",
      "Annual Health & Wellness Budget (₹60,000)",
      "Conference & Global Travel Sponsorship",
      "High-spec Workstation Allowance"
    ],
    skills: ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "Linux"],
    status: "published",
    publishedAt: "2026-08-23T12:00:00Z",
    company: {
      name: "Nexus Cloud Systems India",
      slug: "nexus-cloud-systems",
      websiteUrl: "https://nexuscloud.example.in",
      corporateDomain: "nexuscloud.in",
      companySize: "201-500 Employees",
      industry: "Enterprise SaaS & Cloud Infrastructure",
      headquartersCity: "Bengaluru",
      about: "Nexus Cloud Systems is a leading enterprise cloud management and observability platform powering Fortune 500 digital operations across Asia-Pacific.",
      isVerified: true
    }
  },
  {
    id: "job-008",
    title: "Quality Assurance (QA) Automation Intern",
    slug: "qa-automation-intern-008",
    jobType: "internship",
    workplaceType: "hybrid",
    city: "Hyderabad",
    state: "Telangana",
    experienceLevel: "freshers",
    minCompensation: 22000,
    maxCompensation: 30000,
    compensationType: "monthly_stipend",
    isCompensationNegotiable: false,
    description: "Write automated end-to-end and API tests using Playwright and Jest to ensure high platform reliability and flawless user journeys.",
    responsibilities: [
      "Write automated end-to-end regression tests using TypeScript and Playwright.",
      "Execute automated API integration test suites and validate payload schemas.",
      "Document test plans, reproducible defect reports, and edge-case coverage.",
      "Collaborate with developers during sprint planning and release sign-offs."
    ],
    requirements: [
      "B.Tech / BCA / MCA student or recent graduate (2025/2026).",
      "Knowledge of JavaScript/TypeScript and web development basics.",
      "Understanding of QA concepts: Unit vs Integration vs End-to-End testing.",
      "Detail-oriented mindset with an eye for edge-case defects."
    ],
    perks: [
      "Full-Time Role Conversion Opportunity",
      "Stipend + Hybrid Office Facility in Hitec City, Hyderabad",
      "Free Lunch & Snacks at Office",
      "Training in Modern Automation Frameworks"
    ],
    skills: ["Playwright", "TypeScript", "QA Automation", "Jest", "Git"],
    status: "published",
    publishedAt: "2026-08-25T14:00:00Z",
    company: {
      name: "ZetaStream Data Labs",
      slug: "zetastream-labs",
      websiteUrl: "https://zetastream.example.in",
      corporateDomain: "zetastream.io",
      companySize: "51-200 Employees",
      industry: "Big Data & Real-Time Analytics",
      headquartersCity: "Hyderabad",
      about: "ZetaStream builds real-time event streaming and analytical pipeline engines for high-volume e-commerce and logistics networks.",
      isVerified: true
    }
  }
];
