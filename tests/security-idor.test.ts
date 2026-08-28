import { candidateStore } from "@/lib/db/candidate-store";
import { employerStore } from "@/lib/db/employer-store";
import { jobStore } from "@/lib/db/job-store";
import { careerServiceStore } from "@/lib/db/career-service-store";

async function runSecurityIdorTests() {
  console.log("=== STARTING SECURITY IDOR & MULTI-TENANT ISOLATION TEST SUITE ===");
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

  const timestamp = Date.now();

  // Setup Candidate A and Candidate B
  const candA = await candidateStore.createCandidate({
    email: `candidate.a.${timestamp}@tenant.com`,
    password: "Password123!",
    fullName: "Alice Candidate",
  });
  const resumeA = await candidateStore.addResume({
    userId: candA.id,
    fileName: "Alice_Resume.pdf",
    storageKey: `candidates/${candA.id}/resumes/resumeA.pdf`,
    fileSizeBytes: 150000,
  });

  const candB = await candidateStore.createCandidate({
    email: `candidate.b.${timestamp}@tenant.com`,
    password: "Password123!",
    fullName: "Bob Candidate",
  });
  const resumeB = await candidateStore.addResume({
    userId: candB.id,
    fileName: "Bob_Resume.pdf",
    storageKey: `candidates/${candB.id}/resumes/resumeB.pdf`,
    fileSizeBytes: 160000,
  });

  // Setup Employer A and Employer B
  const { user: empA, company: compA } = await employerStore.createEmployer({
    email: `recruiter.a.${timestamp}@compA.com`,
    password: "Password123!",
    fullName: "Recruiter Alice",
    companyName: `Company A Corp ${timestamp}`,
  });
  compA.verificationStatus = "verified";

  const { user: empB, company: compB } = await employerStore.createEmployer({
    email: `recruiter.b.${timestamp}@compB.com`,
    password: "Password123!",
    fullName: "Recruiter Bob",
    companyName: `Company B Corp ${timestamp}`,
  });
  compB.verificationStatus = "verified";

  // Employer A creates & publishes Job A
  const jobA = await jobStore.createJobDraft({
    employerUserId: empA.id,
    companyId: compA.id,
    title: "Lead Frontend Engineer",
    jobType: "full_time",
    workplaceType: "remote",
    city: "Bengaluru",
    state: "Karnataka",
    experienceLevel: "3-5_years",
    minCompensation: 1800000,
    maxCompensation: 2800000,
    compensationType: "annual_ctc",
    isCompensationNegotiable: false,
    description: "Lead frontend engineering teams.",
    responsibilities: ["Build accessible React UI"],
    requirements: ["TypeScript and Next.js mastery"],
    perks: ["Health insurance"],
    skills: ["React", "TypeScript", "Next.js"],
  });
  await jobStore.submitJobForModeration(empA.id, compA.id, jobA.id);
  const pubJobA = await jobStore.approveJob("admin-root-001", jobA.id);

  // Candidate A applies to Job A
  const appA = await candidateStore.submitApplication({
    userId: candA.id,
    jobId: pubJobA.id,
    resumeId: resumeA.id,
    coverNote: "Candidate A application note",
  });

  // Candidate A books Consulting Order
  const orderA = await careerServiceStore.createOrder({
    userId: candA.id,
    candidateName: candA.fullName,
    candidateEmail: candA.email,
    serviceSlug: "resume-review",
    intake: {
      preferredDate: "2026-05-01",
      alternativeDate: "2026-05-05",
      preferredTimeSlot: "morning",
      timeZone: "Asia/Kolkata (IST)",
      careerGoal: "Target Senior Engineering Roles",
    },
  });

  // ==============================================================================
  // 1. CANDIDATE CROSS-TENANT IDOR TESTS
  // ==============================================================================
  console.log("\n--- 1. Candidate IDOR Protections ---");

  // IDOR 1.1: Candidate B cannot view Candidate A's application
  const candBApps = await candidateStore.getApplications(candB.id);
  assert(
    !candBApps.some((a) => a.id === appA.id),
    "Candidate B application list does not contain Candidate A's application"
  );

  // IDOR 1.2: Candidate B cannot delete Candidate A's resume
  let candBDeleteAResumeBlocked = false;
  try {
    await candidateStore.deleteResume(candB.id, resumeA.id);
  } catch {
    candBDeleteAResumeBlocked = true;
  }
  assert(candBDeleteAResumeBlocked, "Candidate B cannot delete Candidate A's resume");

  // IDOR 1.3: Candidate B cannot apply using Candidate A's resume
  let candBApplyWithAResumeBlocked = false;
  try {
    await candidateStore.submitApplication({
      userId: candB.id,
      jobId: pubJobA.id,
      resumeId: resumeA.id,
    });
  } catch {
    candBApplyWithAResumeBlocked = true;
  }
  assert(candBApplyWithAResumeBlocked, "Candidate B cannot apply with a resume owned by Candidate A");

  // IDOR 1.4: Candidate B cannot see Candidate A's consulting orders
  const candBOrders = await careerServiceStore.getOrdersForCandidate(candB.id);
  assert(
    !candBOrders.some((o) => o.id === orderA.id),
    "Candidate B consulting orders list does not expose Candidate A's order"
  );

  // ==============================================================================
  // 2. EMPLOYER CROSS-TENANT IDOR TESTS
  // ==============================================================================
  console.log("\n--- 2. Employer IDOR Protections ---");

  // IDOR 2.1: Employer B cannot modify Employer A's company profile
  let empBEditCompABlocked = false;
  try {
    await employerStore.updateCompanyProfile(empB.id, {
      about: "Malicious override of Company A profile",
    });
    // Verify Company A's about was not touched
    const refreshedCompA = await employerStore.getCompanyById(compA.id);
    if (refreshedCompA?.about !== "Malicious override of Company A profile") {
      empBEditCompABlocked = true;
    }
  } catch {
    empBEditCompABlocked = true;
  }
  assert(empBEditCompABlocked, "Employer B updateCompanyProfile is scoped strictly to Employer B's company");

  // IDOR 2.2: Employer B cannot edit Employer A's job
  let empBEditJobABlocked = false;
  try {
    await jobStore.updateJobDraft(empB.id, compB.id, pubJobA.id, {
      title: "Hijacked Job Title",
    });
  } catch {
    empBEditJobABlocked = true;
  }
  assert(empBEditJobABlocked, "Employer B cannot update Employer A's job draft/listing");

  // IDOR 2.3: Employer B cannot access Employer A's job applicants
  const empBApplicants = await candidateStore.getApplicationsForJob(compB.id, pubJobA.id);
  assert(
    empBApplicants.length === 0,
    "Employer B gets empty list when requesting applicants for Employer A's job"
  );

  const empBApplicantDirect = await candidateStore.getApplicationForEmployer(compB.id, pubJobA.id, appA.id);
  assert(
    empBApplicantDirect === null,
    "Employer B cannot retrieve specific applicant record from Employer A's job"
  );

  // IDOR 2.4: Employer B cannot transition Candidate A's application stage
  let empBTransitionAppABlocked = false;
  try {
    await candidateStore.updateApplicationStage({
      employerUserId: empB.id,
      companyId: compB.id,
      jobId: pubJobA.id,
      applicationId: appA.id,
      newStatus: "shortlisted",
    });
  } catch {
    empBTransitionAppABlocked = true;
  }
  assert(empBTransitionAppABlocked, "Employer B cannot update application stage for Employer A's job");

  console.log(`\n==================================================`);
  console.log(`SECURITY IDOR RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityIdorTests().catch((err) => {
  console.error("Security IDOR test execution failed:", err);
  process.exit(1);
});
