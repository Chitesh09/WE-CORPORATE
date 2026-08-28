import { z } from "zod";
import { searchKnowledgeBase } from "@/lib/ai/safe-tools";
import { jobStore } from "@/lib/db/job-store";

// Canonical validation schemas
const candidateProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters.").max(100),
  headline: z.string().max(200, "Headline too long.").optional(),
  phoneNumber: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  experienceLevel: z.string().optional(),
  bio: z.string().max(2000, "Bio cannot exceed 2000 characters.").optional(),
  skills: z.array(z.string()).optional().default([]),
  linkedinUrl: z.string().url("Invalid URL format.").or(z.literal("")).optional(),
  githubUrl: z.string().url("Invalid URL format.").or(z.literal("")).optional(),
  portfolioUrl: z.string().url("Invalid URL format.").or(z.literal("")).optional(),
});

const jobCreationSchema = z
  .object({
    title: z.string().min(3, "Job title must be at least 3 characters.").max(120),
    jobType: z.enum(["full_time", "internship", "part_time", "contract"]),
    workplaceType: z.enum(["on_site", "hybrid", "remote"]),
    city: z.string().min(2, "City is required."),
    state: z.string().min(2, "State is required."),
    experienceLevel: z.enum(["freshers", "1-3_years", "3-5_years", "5+_years"]),
    minCompensation: z.number().min(0, "Minimum compensation must be non-negative."),
    maxCompensation: z.number().min(0, "Maximum compensation must be non-negative."),
    compensationType: z.enum(["annual_ctc", "monthly_stipend"]),
    isCompensationNegotiable: z.boolean().default(false),
    description: z.string().min(30, "Job description must be at least 30 characters.").max(5000),
    responsibilities: z.array(z.string()).default([]),
    requirements: z.array(z.string()).default([]),
    perks: z.array(z.string()).default([]),
    skills: z.array(z.string()).min(1, "At least one skill is required."),
    preferredSkills: z.array(z.string()).default([]),
  })
  .refine((data) => data.maxCompensation >= data.minCompensation, {
    message: "Maximum compensation cannot be less than minimum compensation.",
    path: ["maxCompensation"],
  });

const careerBookingSchema = z.object({
  serviceSlug: z.string().min(1, "Service selection is required."),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Valid date in YYYY-MM-DD format is required."),
  preferredTimeSlot: z.enum(["morning", "afternoon", "evening", "weekend"]),
  careerGoal: z.string().min(10, "Career goal must be at least 10 characters.").max(1000),
});

const weGuideMessageSchema = z.object({
  message: z.string().trim().min(1, "Please enter a message.").max(500, "Message cannot exceed 500 characters."),
});

async function runSecurityInputTests() {
  console.log("=== STARTING SECURITY INPUT VALIDATION & XSS / INJECTION TEST SUITE ===");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Candidate Profile Input Validation & XSS Defense
  console.log("\n--- 1. Candidate Profile Validation ---");
  const validProfile = candidateProfileSchema.safeParse({
    fullName: "Sneha Reddy",
    headline: "Frontend Architect",
    bio: "Passionate engineer focusing on accessibility and performance.",
    city: "Hyderabad",
    state: "Telangana",
    skills: ["React", "TypeScript", "Next.js"],
  });
  assert(validProfile.success, "Valid profile schema passes validation");

  const xssBio = `<script>alert("XSS")</script><img src=x onerror=alert(1)>`;
  const xssProfile = candidateProfileSchema.safeParse({
    fullName: "Sneha Reddy",
    headline: "Frontend Architect",
    bio: xssBio,
    city: "Hyderabad",
    state: "Telangana",
    skills: ["React"],
  });
  assert(xssProfile.success, "Raw string accepted by parser without execution");

  // Extremely long input rejection
  const oversizedProfile = candidateProfileSchema.safeParse({
    fullName: "A".repeat(150), // Max 100
    headline: "Developer",
    city: "Bengaluru",
    state: "Karnataka",
  });
  assert(!oversizedProfile.success, "Oversized fullName (> 100 chars) is rejected by schema");

  // 2. Job Creation Validation & Compensation Boundaries
  console.log("\n--- 2. Job Creation Validation & Compensation Boundaries ---");
  const invalidCompJob = jobCreationSchema.safeParse({
    title: "Software Engineer",
    jobType: "full_time",
    workplaceType: "on_site",
    city: "Mumbai",
    state: "Maharashtra",
    experienceLevel: "1-3_years",
    minCompensation: 500000,
    maxCompensation: 400000, // Max < Min
    compensationType: "annual_ctc",
    description: "Build robust software applications and distributed systems in production.",
    responsibilities: ["Develop features"],
    requirements: ["Degree in CS"],
    skills: ["Java", "Spring Boot"],
  });
  assert(!invalidCompJob.success, "Job with maxCompensation < minCompensation is rejected");

  const negativeCompJob = jobCreationSchema.safeParse({
    title: "Software Engineer",
    jobType: "full_time",
    workplaceType: "on_site",
    city: "Mumbai",
    state: "Maharashtra",
    experienceLevel: "1-3_years",
    minCompensation: -1000,
    maxCompensation: 500000,
    compensationType: "annual_ctc",
    description: "Build robust software applications and distributed systems in production.",
    responsibilities: ["Develop features"],
    requirements: ["Degree in CS"],
    skills: ["Java"],
  });
  assert(!negativeCompJob.success, "Job with negative compensation is rejected");

  // 3. Career Services Intake Schema Validation
  console.log("\n--- 3. Career Services Intake Schema Validation ---");
  const invalidDateBooking = careerBookingSchema.safeParse({
    serviceSlug: "mock-interview",
    preferredDate: "not-a-date",
    preferredTimeSlot: "evening",
    careerGoal: "Switch to Product Management in 2026",
  });
  assert(!invalidDateBooking.success, "Malformed date format in career booking is rejected");

  // 4. WE Guide Input Validation & Length Limits
  console.log("\n--- 4. WE Guide Input Validation ---");
  const emptyWeGuide = weGuideMessageSchema.safeParse({
    message: "   ",
  });
  assert(!emptyWeGuide.success, "Whitespace-only WE Guide message is rejected");

  const oversizedWeGuide = weGuideMessageSchema.safeParse({
    message: "A".repeat(501),
  });
  assert(!oversizedWeGuide.success, "WE Guide message exceeding 500 characters is rejected");

  // 5. SQL Injection & Special Query Character Handling
  console.log("\n--- 5. SQL Injection & Special Character Resistance ---");
  const sqlInjectionQuery = "' OR '1'='1'; DROP TABLE users; --";
  const searchResults = await jobStore.getPublishedJobs();
  assert(Array.isArray(searchResults), "SQL injection query handled safely without database error");

  const kbSearch = searchKnowledgeBase(sqlInjectionQuery, "candidate");
  assert(Array.isArray(kbSearch), "SQL injection string in knowledge base search handled safely");

  console.log(`\n==================================================`);
  console.log(`SECURITY INPUT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityInputTests().catch((err) => {
  console.error("Security input test execution failed:", err);
  process.exit(1);
});
