import { candidateStore } from "@/lib/db/candidate-store";
import { employerStore } from "@/lib/db/employer-store";
import { jobStore } from "@/lib/db/job-store";
import { careerServiceStore } from "@/lib/db/career-service-store";

async function runSecurityBusinessLogicTests() {
  console.log("=== STARTING SECURITY BUSINESS LOGIC & STATE MACHINE TEST SUITE ===");
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

  // 1. Unverified Employer Publishing Gate
  console.log("\n--- 1. Employer Verification Gate Enforcement ---");
  const { user: unverifiedEmp, company: unverifiedComp } = await employerStore.createEmployer({
    email: `unverified.${timestamp}@fraud.com`,
    password: "Password123!",
    fullName: "Unverified User",
    companyName: `Unverified Fake Co ${timestamp}`,
  });

  const draftJob = await jobStore.createJobDraft({
    employerUserId: unverifiedEmp.id,
    companyId: unverifiedComp.id,
    title: "Fake High Paying Job",
    jobType: "full_time",
    workplaceType: "remote",
    city: "Remote",
    state: "All India",
    experienceLevel: "freshers",
    minCompensation: 5000000,
    maxCompensation: 8000000,
    compensationType: "annual_ctc",
    isCompensationNegotiable: false,
    description: "Suspicious job listing",
    responsibilities: ["None"],
    requirements: ["None"],
    perks: ["None"],
    skills: ["None"],
  });

  let unverifiedSubmitBlocked = false;
  try {
    await jobStore.submitJobForModeration(unverifiedEmp.id, unverifiedComp.id, draftJob.id);
  } catch {
    unverifiedSubmitBlocked = true;
  }
  assert(unverifiedSubmitBlocked, "Unverified employer cannot submit jobs for moderation");

  // 2. Closed Job Application Gate
  console.log("\n--- 2. Job Eligibility & Status Gate ---");
  // Setup verified company and published job
  const { user: verifiedEmp, company: verifiedComp } = await employerStore.createEmployer({
    email: `verified.${timestamp}@corp.com`,
    password: "Password123!",
    fullName: "Verified Recruiter",
    companyName: `Legit Corp ${timestamp}`,
  });
  verifiedComp.verificationStatus = "verified";

  const legitJob = await jobStore.createJobDraft({
    employerUserId: verifiedEmp.id,
    companyId: verifiedComp.id,
    title: "Backend Engineer",
    jobType: "full_time",
    workplaceType: "on_site",
    city: "Pune",
    state: "Maharashtra",
    experienceLevel: "1-3_years",
    minCompensation: 800000,
    maxCompensation: 1400000,
    compensationType: "annual_ctc",
    isCompensationNegotiable: false,
    description: "Build robust APIs with Node.js and PostgreSQL.",
    responsibilities: ["Develop REST APIs"],
    requirements: ["Node.js experience"],
    perks: ["Health insurance"],
    skills: ["Node.js", "PostgreSQL"],
  });
  await jobStore.submitJobForModeration(verifiedEmp.id, verifiedComp.id, legitJob.id);
  const pubJob = await jobStore.approveJob("admin-root-001", legitJob.id);

  // Close the job
  await jobStore.closeJob(verifiedEmp.id, verifiedComp.id, pubJob.id);

  const cand = await candidateStore.createCandidate({
    email: `cand.logic.${timestamp}@example.com`,
    password: "Password123!",
    fullName: "Logic Test Candidate",
  });
  const resume = await candidateStore.addResume({
    userId: cand.id,
    fileName: "Resume.pdf",
    storageKey: `candidates/${cand.id}/resumes/resume.pdf`,
    fileSizeBytes: 100000,
  });

  let closedApplyBlocked = false;
  try {
    await candidateStore.submitApplication({
      userId: cand.id,
      jobId: pubJob.id,
      resumeId: resume.id,
    });
  } catch {
    closedApplyBlocked = true;
  }
  assert(closedApplyBlocked, "Candidate cannot apply to a closed job");

  // 3. Admin Moderation Note Requirement on Rejection
  console.log("\n--- 3. Admin Moderation Audit Integrity ---");
  const jobToReject = await jobStore.createJobDraft({
    employerUserId: verifiedEmp.id,
    companyId: verifiedComp.id,
    title: "Junior QA Tester",
    jobType: "full_time",
    workplaceType: "remote",
    city: "Remote",
    state: "All India",
    experienceLevel: "freshers",
    minCompensation: 400000,
    maxCompensation: 600000,
    compensationType: "annual_ctc",
    isCompensationNegotiable: false,
    description: "Manual and automated QA testing.",
    responsibilities: ["Run test suites"],
    requirements: ["Detail oriented"],
    perks: ["Remote stipend"],
    skills: ["QA", "Testing"],
  });
  await jobStore.submitJobForModeration(verifiedEmp.id, verifiedComp.id, jobToReject.id);

  let emptyRejectNoteBlocked = false;
  try {
    await jobStore.rejectJob("admin-root-001", jobToReject.id, "   ");
  } catch {
    emptyRejectNoteBlocked = true;
  }
  assert(emptyRejectNoteBlocked, "Admin cannot reject job without a specific reason/feedback note");

  const validRejection = await jobStore.rejectJob(
    "admin-root-001",
    jobToReject.id,
    "Compensation range does not meet transparent industry benchmarks."
  );
  assert(validRejection.status === "rejected", "Job rejected with specific recorded feedback");

  // 4. Lite ATS Terminal State Machine Integrity
  console.log("\n--- 4. Lite ATS Terminal State Machine ---");
  const liveJob = await jobStore.createJobDraft({
    employerUserId: verifiedEmp.id,
    companyId: verifiedComp.id,
    title: "DevOps Engineer",
    jobType: "full_time",
    workplaceType: "hybrid",
    city: "Bengaluru",
    state: "Karnataka",
    experienceLevel: "3-5_years",
    minCompensation: 1800000,
    maxCompensation: 2500000,
    compensationType: "annual_ctc",
    isCompensationNegotiable: false,
    description: "Manage Kubernetes clusters and CI/CD pipelines.",
    responsibilities: ["Deploy infrastructure"],
    requirements: ["Kubernetes", "Docker"],
    perks: ["Health insurance"],
    skills: ["Kubernetes", "Docker", "AWS"],
  });
  await jobStore.submitJobForModeration(verifiedEmp.id, verifiedComp.id, liveJob.id);
  const activeJob = await jobStore.approveJob("admin-root-001", liveJob.id);

  const application = await candidateStore.submitApplication({
    userId: cand.id,
    jobId: activeJob.id,
    resumeId: resume.id,
  });

  // Transition to not_selected
  await candidateStore.updateApplicationStage({
    employerUserId: verifiedEmp.id,
    companyId: verifiedComp.id,
    jobId: activeJob.id,
    applicationId: application.id,
    newStatus: "not_selected",
    note: "Position filled by internal promotion.",
  });

  // Attempt transition out of terminal state
  let terminalEscapeBlocked = false;
  try {
    await candidateStore.updateApplicationStage({
      employerUserId: verifiedEmp.id,
      companyId: verifiedComp.id,
      jobId: activeJob.id,
      applicationId: application.id,
      newStatus: "shortlisted",
    });
  } catch {
    terminalEscapeBlocked = true;
  }
  assert(terminalEscapeBlocked, "Cannot transition application out of terminal 'not_selected' status");

  console.log(`\n==================================================`);
  console.log(`SECURITY BUSINESS LOGIC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityBusinessLogicTests().catch((err) => {
  console.error("Security business logic test execution failed:", err);
  process.exit(1);
});
