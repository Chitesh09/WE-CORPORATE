/**
 * WE CORPORATE — India Campus Hiring Drives & TPO Connect
 * 
 * Verified campus placement drives conducted in partnership with
 * accredited Indian universities, NITs, IITs, IIITs, and state engineering colleges.
 */

export interface CampusDrive {
  id: string;
  title: string;
  organizer: string;
  companyName: string;
  targetBatch: string;
  eligibleDegrees: string[];
  hiringRoles: string[];
  compensationRange: string;
  workLocation: string;
  registrationDeadline: string;
  driveDate: string;
  driveFormat: "Virtual Online Assessment & Video Interview" | "On-Campus Pooled Drive" | "National Hackathon & Fast-Track";
  minCgpaCriteria: string;
  selectionProcess: string[];
  participatingCollegesCount: number;
  openingsCount: number;
  status: "open" | "closing_soon" | "concluded";
}

export const CAMPUS_DRIVES: CampusDrive[] = [
  {
    id: "drive-2026-001",
    title: "National Tech Sprint 2026 — Graduate Engineer Trainee",
    organizer: "WE CORPORATE Campus Alliance",
    companyName: "Nexus Cloud Systems & Kredo FinTech",
    targetBatch: "2025 & 2026 Batch",
    eligibleDegrees: ["B.Tech / B.E (CSE, IT, ECE, EEE)", "MCA", "Dual Degree M.Tech"],
    hiringRoles: ["Associate Software Engineer — Frontend", "Associate Backend Engineer", "Cloud & DevOps Trainee"],
    compensationRange: "?8.5 - 14.0 LPA",
    workLocation: "Bengaluru / Hyderabad / Hybrid",
    registrationDeadline: "2026-09-15T23:59:59Z",
    driveDate: "2026-09-20T10:00:00Z",
    driveFormat: "Virtual Online Assessment & Video Interview",
    minCgpaCriteria: "6.5 CGPA or 65% with no active backlogs",
    selectionProcess: [
      "Online Coding Assessment (DSA, Web Fundamentals, SQL) — 90 mins",
      "Technical Problem Solving & System Design Round — 45 mins",
      "Hiring Manager Culture & Values Fitment Round — 30 mins",
    ],
    participatingCollegesCount: 145,
    openingsCount: 120,
    status: "open",
  },
  {
    id: "drive-2026-002",
    title: "FinTech Innovation Campus Hiring Drive",
    organizer: "Kredo FinTech Solutions",
    companyName: "Kredo FinTech Solutions",
    targetBatch: "2025 & 2026 Batch",
    eligibleDegrees: ["B.Tech / B.E (All Engineering Branches)", "BCA / MCA", "B.Sc Computer Science"],
    hiringRoles: ["Software Developer Trainee (Go / TypeScript)", "QA Automation Engineer Trainee"],
    compensationRange: "?9.0 - 16.0 LPA",
    workLocation: "Bengaluru / Mumbai",
    registrationDeadline: "2026-09-10T23:59:59Z",
    driveDate: "2026-09-18T09:30:00Z",
    driveFormat: "Virtual Online Assessment & Video Interview",
    minCgpaCriteria: "7.0 CGPA or 70% in 10th, 12th & Degree",
    selectionProcess: [
      "Aptitude & Core CS Foundations Quiz — 60 mins",
      "Live Coding & Debugging Challenge — 60 mins",
      "Technical Bar Raiser Discussion — 45 mins",
    ],
    participatingCollegesCount: 88,
    openingsCount: 65,
    status: "closing_soon",
  },
  {
    id: "drive-2026-003",
    title: "Pan-India Product Design & Frontend Fellowship Drive",
    organizer: "WE Design Guild",
    companyName: "Nexus Cloud & ZetaStream Labs",
    targetBatch: "2025 & 2026 Batch",
    eligibleDegrees: ["B.Des / M.Des", "B.Tech / B.E", "B.Arch / Any Graduate with Portfolio"],
    hiringRoles: ["Associate UI/UX Designer", "Frontend Engineer (React / UI)"],
    compensationRange: "?7.5 - 12.5 LPA",
    workLocation: "Bengaluru / Remote",
    registrationDeadline: "2026-09-25T23:59:59Z",
    driveDate: "2026-10-02T10:00:00Z",
    driveFormat: "National Hackathon & Fast-Track",
    minCgpaCriteria: "No CGPA cutoff — Portfolio / GitHub project submission required",
    selectionProcess: [
      "Design / Code Portfolio Screening",
      "48-Hour Live Product Feature Prototype Hackathon",
      "Final Presentation & Offer Rollout",
    ],
    participatingCollegesCount: 110,
    openingsCount: 45,
    status: "open",
  },
  {
    id: "drive-2026-004",
    title: "Autonomous Systems & Big Data Engineering Campus Cohort",
    organizer: "ZetaStream Data Labs",
    companyName: "ZetaStream Data Labs",
    targetBatch: "2025 & 2026 Batch",
    eligibleDegrees: ["B.Tech / M.Tech (CSE, Data Science, AI/ML)", "MCA with ML specialization"],
    hiringRoles: ["Junior Data Engineer", "Machine Learning Associate"],
    compensationRange: "?10.0 - 18.0 LPA",
    workLocation: "Hyderabad / Remote",
    registrationDeadline: "2026-09-30T23:59:59Z",
    driveDate: "2026-10-08T10:00:00Z",
    driveFormat: "Virtual Online Assessment & Video Interview",
    minCgpaCriteria: "7.5 CGPA or equivalent",
    selectionProcess: [
      "Machine Learning & SQL Screening Test — 75 mins",
      "Algorithmic Data Engineering Problem Solving — 60 mins",
      "Founding Team Technical Interview — 45 mins",
    ],
    participatingCollegesCount: 65,
    openingsCount: 30,
    status: "open",
  },
];
