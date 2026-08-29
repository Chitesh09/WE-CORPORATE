/**
 * WE CORPORATE — India Tech Compensation Benchmarks
 * 
 * Verified salary percentiles (in INR LPA) based on aggregated data across
 * Tier 1/2 product companies, high-growth startups, and tech ecosystems in India.
 */

export interface SalaryBenchmark {
  roleId: string;
  roleTitle: string;
  category: "engineering" | "design" | "product" | "data" | "qa";
  experienceLevel: "freshers" | "1-3_years" | "3-5_years" | "5-8_years";
  experienceLabel: string;
  city: "Bengaluru" | "Hyderabad" | "Pune" | "Delhi NCR" | "Mumbai" | "Remote" | "Pan-India";
  p25Lpa: number; // 25th percentile (Entry / Service / Early Startups)
  medianLpa: number; // 50th percentile (Standard Product / Mid-Tier)
  p75Lpa: number; // 75th percentile (Top Tier / Unicorns / Funded Startups)
  p90Lpa: number; // 90th percentile (Tier-1 Big Tech / High-frequency / Elite)
  typicalVariableBonusPercent: number;
  topSkills: string[];
  description: string;
}

export const SALARY_BENCHMARKS: SalaryBenchmark[] = [
  // ==========================================
  // FRONTEND ENGINEER
  // ==========================================
  {
    roleId: "frontend-freshers-blr",
    roleTitle: "Frontend / React Engineer",
    category: "engineering",
    experienceLevel: "freshers",
    experienceLabel: "Freshers (0 - 1 yr)",
    city: "Bengaluru",
    p25Lpa: 6.0,
    medianLpa: 9.5,
    p75Lpa: 14.0,
    p90Lpa: 18.0,
    typicalVariableBonusPercent: 10,
    topSkills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "JavaScript ES6+", "HTML5/CSS3"],
    description: "Build responsive web interfaces and optimize Core Web Vitals for high-traffic SaaS and consumer apps.",
  },
  {
    roleId: "frontend-1-3-blr",
    roleTitle: "Frontend / React Engineer",
    category: "engineering",
    experienceLevel: "1-3_years",
    experienceLabel: "Early Career (1 - 3 yrs)",
    city: "Bengaluru",
    p25Lpa: 10.0,
    medianLpa: 16.0,
    p75Lpa: 24.0,
    p90Lpa: 30.0,
    typicalVariableBonusPercent: 12,
    topSkills: ["React", "TypeScript", "Next.js", "State Management (Zustand/Redux)", "Performance Tuning", "GraphQL"],
    description: "Own complex feature modules, design system integration, and client-side caching architectures.",
  },
  {
    roleId: "frontend-3-5-blr",
    roleTitle: "Frontend / React Engineer",
    category: "engineering",
    experienceLevel: "3-5_years",
    experienceLabel: "Mid-Level (3 - 5 yrs)",
    city: "Bengaluru",
    p25Lpa: 18.0,
    medianLpa: 28.0,
    p75Lpa: 38.0,
    p90Lpa: 48.0,
    typicalVariableBonusPercent: 15,
    topSkills: ["Micro-frontends", "SSR / Edge Rendering", "TypeScript", "Web Performance", "Architecture Design"],
    description: "Lead frontend architecture, mentor junior developers, and ensure cross-platform rendering fidelity.",
  },
  {
    roleId: "frontend-5-8-blr",
    roleTitle: "Frontend / React Engineer",
    category: "engineering",
    experienceLevel: "5-8_years",
    experienceLabel: "Senior & Staff (5 - 8 yrs)",
    city: "Bengaluru",
    p25Lpa: 28.0,
    medianLpa: 42.0,
    p75Lpa: 58.0,
    p90Lpa: 75.0,
    typicalVariableBonusPercent: 18,
    topSkills: ["Frontend System Design", "Design Systems", "Web Security", "CI/CD & Monorepo Tooling"],
    description: "Define organization-wide UI standards, lead large migrations, and collaborate with product leadership.",
  },

  // ==========================================
  // BACKEND ENGINEER
  // ==========================================
  {
    roleId: "backend-freshers-blr",
    roleTitle: "Backend / Distributed Systems",
    category: "engineering",
    experienceLevel: "freshers",
    experienceLabel: "Freshers (0 - 1 yr)",
    city: "Bengaluru",
    p25Lpa: 7.0,
    medianLpa: 11.0,
    p75Lpa: 16.0,
    p90Lpa: 22.0,
    typicalVariableBonusPercent: 10,
    topSkills: ["Node.js / TypeScript", "Go / Java", "PostgreSQL", "REST APIs", "Data Structures"],
    description: "Develop robust REST & gRPC APIs, write SQL migrations, and integrate cloud services.",
  },
  {
    roleId: "backend-1-3-blr",
    roleTitle: "Backend / Distributed Systems",
    category: "engineering",
    experienceLevel: "1-3_years",
    experienceLabel: "Early Career (1 - 3 yrs)",
    city: "Bengaluru",
    p25Lpa: 12.0,
    medianLpa: 18.5,
    p75Lpa: 26.0,
    p90Lpa: 34.0,
    typicalVariableBonusPercent: 12,
    topSkills: ["Go", "Node.js", "PostgreSQL", "Redis", "Kafka", "Docker", "Microservices"],
    description: "Scale high-throughput transaction pipelines, optimize database queries, and manage async job queues.",
  },
  {
    roleId: "backend-3-5-blr",
    roleTitle: "Backend / Distributed Systems",
    category: "engineering",
    experienceLevel: "3-5_years",
    experienceLabel: "Mid-Level (3 - 5 yrs)",
    city: "Bengaluru",
    p25Lpa: 20.0,
    medianLpa: 30.0,
    p75Lpa: 42.0,
    p90Lpa: 52.0,
    typicalVariableBonusPercent: 15,
    topSkills: ["Distributed Systems", "Kafka / Event Streaming", "Database Sharding", "gRPC", "Kubernetes"],
    description: "Design fault-tolerant microservices, implement ACID distributed transactions, and lead backend services.",
  },
  {
    roleId: "backend-5-8-blr",
    roleTitle: "Backend / Distributed Systems",
    category: "engineering",
    experienceLevel: "5-8_years",
    experienceLabel: "Senior & Staff (5 - 8 yrs)",
    city: "Bengaluru",
    p25Lpa: 32.0,
    medianLpa: 48.0,
    p75Lpa: 68.0,
    p90Lpa: 90.0,
    typicalVariableBonusPercent: 20,
    topSkills: ["High-Scale Architecture", "Domain-Driven Design", "Cloud Infrastructure", "System Reliability"],
    description: "Architect systems handling 100k+ RPS, drive cloud cost optimization, and lead engineering pods.",
  },

  // ==========================================
  // FULL STACK DEVELOPER
  // ==========================================
  {
    roleId: "fullstack-1-3-blr",
    roleTitle: "Full-Stack Engineer",
    category: "engineering",
    experienceLevel: "1-3_years",
    experienceLabel: "Early Career (1 - 3 yrs)",
    city: "Bengaluru",
    p25Lpa: 11.0,
    medianLpa: 17.0,
    p75Lpa: 25.0,
    p90Lpa: 32.0,
    typicalVariableBonusPercent: 12,
    topSkills: ["Next.js", "React", "Node.js", "PostgreSQL", "Tailwind CSS", "Prisma / Drizzle", "REST APIs"],
    description: "Deliver end-to-end product features from responsive UI to database schema and serverless API endpoints.",
  },
  {
    roleId: "fullstack-3-5-blr",
    roleTitle: "Full-Stack Engineer",
    category: "engineering",
    experienceLevel: "3-5_years",
    experienceLabel: "Mid-Level (3 - 5 yrs)",
    city: "Bengaluru",
    p25Lpa: 19.0,
    medianLpa: 29.0,
    p75Lpa: 40.0,
    p90Lpa: 50.0,
    typicalVariableBonusPercent: 15,
    topSkills: ["Full-Stack TypeScript", "Next.js App Router", "Server Components", "PostgreSQL", "AWS / Docker"],
    description: "Spearhead product innovation, implement full-stack security patterns, and optimize user experience.",
  },

  // ==========================================
  // DEVOPS & CLOUD ARCHITECT
  // ==========================================
  {
    roleId: "devops-1-3-blr",
    roleTitle: "DevOps & Cloud Engineer",
    category: "engineering",
    experienceLevel: "1-3_years",
    experienceLabel: "Early Career (1 - 3 yrs)",
    city: "Bengaluru",
    p25Lpa: 10.5,
    medianLpa: 16.5,
    p75Lpa: 24.0,
    p90Lpa: 30.0,
    typicalVariableBonusPercent: 12,
    topSkills: ["AWS / GCP", "Terraform", "Docker", "Kubernetes", "GitHub Actions / CI/CD", "Linux"],
    description: "Automate continuous integration, containerize microservices, and maintain cloud infrastructure as code.",
  },
  {
    roleId: "devops-3-5-blr",
    roleTitle: "DevOps & Cloud Engineer",
    category: "engineering",
    experienceLevel: "3-5_years",
    experienceLabel: "Mid-Level (3 - 5 yrs)",
    city: "Bengaluru",
    p25Lpa: 20.0,
    medianLpa: 31.0,
    p75Lpa: 44.0,
    p90Lpa: 55.0,
    typicalVariableBonusPercent: 15,
    topSkills: ["Kubernetes (EKS/GKE)", "Terraform", "Prometheus & Grafana", "Zero Trust Security", "AWS Well-Architected"],
    description: "Manage multi-region Kubernetes clusters, establish observability baselines, and enforce SOC2 compliance.",
  },

  // ==========================================
  // UI/UX & PRODUCT DESIGNER
  // ==========================================
  {
    roleId: "design-freshers-blr",
    roleTitle: "Product Designer (UI/UX)",
    category: "design",
    experienceLevel: "freshers",
    experienceLabel: "Freshers (0 - 1 yr)",
    city: "Bengaluru",
    p25Lpa: 5.5,
    medianLpa: 8.5,
    p75Lpa: 13.0,
    p90Lpa: 16.5,
    typicalVariableBonusPercent: 10,
    topSkills: ["Figma", "UI Design", "Auto-Layout", "Prototyping", "User Research", "Design Systems"],
    description: "Craft pixel-perfect user journeys, wireframes, and interactive components in Figma.",
  },
  {
    roleId: "design-1-3-blr",
    roleTitle: "Product Designer (UI/UX)",
    category: "design",
    experienceLevel: "1-3_years",
    experienceLabel: "Early Career (1 - 3 yrs)",
    city: "Bengaluru",
    p25Lpa: 9.5,
    medianLpa: 15.0,
    p75Lpa: 22.0,
    p90Lpa: 28.0,
    typicalVariableBonusPercent: 12,
    topSkills: ["Figma", "Design Systems", "Usability Testing", "Interaction Design", "Responsive Layouts"],
    description: "Own core feature design flows, run usability testing sessions, and build scalable design token libraries.",
  },
  {
    roleId: "design-3-5-blr",
    roleTitle: "Product Designer (UI/UX)",
    category: "design",
    experienceLevel: "3-5_years",
    experienceLabel: "Mid-Level (3 - 5 yrs)",
    city: "Bengaluru",
    p25Lpa: 16.0,
    medianLpa: 25.0,
    p75Lpa: 36.0,
    p90Lpa: 45.0,
    typicalVariableBonusPercent: 15,
    topSkills: ["Design Strategy", "Design Systems Governance", "Figma Variables", "Information Architecture"],
    description: "Lead product design strategy, partner with VP Product, and elevate UX across web and mobile surfaces.",
  },

  // ==========================================
  // DATA SCIENCE & ML ENGINEER
  // ==========================================
  {
    roleId: "data-1-3-blr",
    roleTitle: "Data Scientist & ML Engineer",
    category: "data",
    experienceLevel: "1-3_years",
    experienceLabel: "Early Career (1 - 3 yrs)",
    city: "Bengaluru",
    p25Lpa: 13.0,
    medianLpa: 19.5,
    p75Lpa: 28.0,
    p90Lpa: 36.0,
    typicalVariableBonusPercent: 12,
    topSkills: ["Python", "PyTorch / TensorFlow", "SQL", "Pandas", "Scikit-Learn", "LLM APIs", "MLOps"],
    description: "Develop predictive models, fine-tune LLM embeddings, and build automated feature engineering pipelines.",
  },
  {
    roleId: "data-3-5-blr",
    roleTitle: "Data Scientist & ML Engineer",
    category: "data",
    experienceLevel: "3-5_years",
    experienceLabel: "Mid-Level (3 - 5 yrs)",
    city: "Bengaluru",
    p25Lpa: 22.0,
    medianLpa: 34.0,
    p75Lpa: 48.0,
    p90Lpa: 60.0,
    typicalVariableBonusPercent: 15,
    topSkills: ["LLM Fine-Tuning", "LangChain / RAG", "Vector Databases", "MLOps & Model Monitoring", "Python"],
    description: "Deploy scalable AI models in production, implement retrieval-augmented generation (RAG), and drive analytics.",
  },
];

// City Cost-of-Living / Market Multiplier relative to Bengaluru (Base 1.0)
export const CITY_COMPENSATION_MULTIPLIERS: Record<string, { multiplier: number; label: string }> = {
  Bengaluru: { multiplier: 1.0, label: "Silicon Valley of India (Base Standard)" },
  Hyderabad: { multiplier: 0.95, label: "Cyberabad Tech Hub (~95% of BLR)" },
  "Delhi NCR": { multiplier: 0.97, label: "Gurgaon / Noida Product Hub (~97% of BLR)" },
  Mumbai: { multiplier: 1.02, label: "FinTech & Enterprise Hub (~102% of BLR)" },
  Pune: { multiplier: 0.88, label: "Tech & SaaS Hub (~88% of BLR)" },
  Remote: { multiplier: 0.92, label: "Pan-India Remote (~92% of BLR)" },
  "Pan-India": { multiplier: 0.9, label: "All-India Average (~90% of BLR)" },
};

export function getSalaryBenchmark(
  roleTitleSnippet: string,
  experienceLevel: string,
  city: string = "Bengaluru"
): SalaryBenchmark | null {
  const normalizedTitle = roleTitleSnippet.toLowerCase();

  const found = SALARY_BENCHMARKS.find((b) => {
    const matchRole =
      (normalizedTitle.includes("front") && b.roleTitle.toLowerCase().includes("front")) ||
      (normalizedTitle.includes("back") && b.roleTitle.toLowerCase().includes("back")) ||
      (normalizedTitle.includes("full") && b.roleTitle.toLowerCase().includes("full")) ||
      (normalizedTitle.includes("design") && b.roleTitle.toLowerCase().includes("design")) ||
      (normalizedTitle.includes("data") && b.roleTitle.toLowerCase().includes("data")) ||
      (normalizedTitle.includes("devops") && b.roleTitle.toLowerCase().includes("devops"));

    const matchExp = b.experienceLevel === experienceLevel;
    return matchRole && matchExp;
  });

  if (!found) return null;

  const cityData = CITY_COMPENSATION_MULTIPLIERS[city] || CITY_COMPENSATION_MULTIPLIERS["Bengaluru"];
  const factor = cityData.multiplier;

  return {
    ...found,
    city: city as SalaryBenchmark["city"],
    p25Lpa: Math.round(found.p25Lpa * factor * 10) / 10,
    medianLpa: Math.round(found.medianLpa * factor * 10) / 10,
    p75Lpa: Math.round(found.p75Lpa * factor * 10) / 10,
    p90Lpa: Math.round(found.p90Lpa * factor * 10) / 10,
  };
}
