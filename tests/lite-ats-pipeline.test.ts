import { candidateStore } from "@/lib/db/candidate-store";
import { employerStore } from "@/lib/db/employer-store";
import { jobStore } from "@/lib/db/job-store";

async function runLiteAtsPipelineTests() {
  console.log("=== STARTING PHASE 7.3D LITE ATS / APPLICANT REVIEW TEST SUITE ===");
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

  // 1. Setup Test Employers, Companies, and Candidates
  console.log("\n--- 1. Setting up Test Employers, Jobs & Candidates ---");

  // Employer A (Company A)
  const { user: employerA, company: companyA } = await employerStore.createEmployer({
    email: `recruiterA.${timestamp}@companyA.com`,
    password: "Password123!",
    fullName: "Pooja Hegde",
    companyName: `Company A Innovations ${timestamp}`,
  });
  companyA.verificationStatus = "verified";

  // Employer B (Company B)
  const { user: employerB, company: companyB } = await employerStore.createEmployer({
    email: `recruiterB.${timestamp}@companyB.com`,
    password: "Password123!",
    fullName: "Rohan Varma",
    companyName: `Company B Labs ${timestamp}`,
  });
  companyB.verificationStatus = "verified";

  // Job for Company A
  const jobA = await jobStore.createJobDraft({
    employerUserId: employerA.id,
    companyId: companyA.id,
    title: "Senior React Engineer",
    jobType: "full_time",
    workplaceType: "hybrid",
    city: "Bengaluru",
    state: "Karnataka",
    experienceLevel: "3-5_years",
    minCompensation: 1500000,
    maxCompensation: 2200000,
    compensationType: "annual_ctc",
    isCompensationNegotiable: false,
    description: "Design high performance user interfaces using Next.js and React 19.",
    responsibilities: ["Lead frontend architecture"],
    requirements: ["Expertise in React and TypeScript"],
    perks: ["Health Insurance"],
    skills: ["React", "TypeScript", "Next.js"],
  });
  await jobStore.submitJobForModeration(employerA.id, companyA.id, jobA.id);
  await jobStore.approveJob("admin-root-001", jobA.id);

  // Job for Company B
  const jobB = await jobStore.createJobDraft({
    employerUserId: employerB.id,
    companyId: companyB.id,
    title: "Backend Cloud Specialist",
    jobType: "full_time",
    workplaceType: "remote",
    city: "Hyderabad",
    state: "Telangana",
    experienceLevel: "3-5_years",
    minCompensation: 1800000,
    maxCompensation: 2600000,
    compensationType: "annual_ctc",
    isCompensationNegotiable: false,
    description: "Cloud infrastructure architecting and API development.",
    responsibilities: ["Deploy AWS services"],
    requirements: ["Go / Python / AWS"],
    perks: [],
    skills: ["AWS", "Go", "Docker"],
  });
  await jobStore.submitJobForModeration(employerB.id, companyB.id, jobB.id);
  await jobStore.approveJob("admin-root-001", jobB.id);

  // Candidate
  const candidate = await candidateStore.createCandidate({
    email: `candidate.ats.${timestamp}@example.com`,
    password: "Password123!",
    fullName: "Sneha Reddy",
  });
  await candidateStore.updateProfile(candidate.id, {
    headline: "Frontend Engineer | React Enthusiast",
    city: "Bengaluru",
    state: "Karnataka",
    skills: ["React", "TypeScript", "Tailwind CSS"],
  });
  const resume = await candidateStore.addResume({
    userId: candidate.id,
    fileName: "Sneha_Reddy_Resume_V1.pdf",
    storageKey: `candidates/${candidate.id}/resumes/resume-v1.pdf`,
    fileSizeBytes: 180000,
    mimeType: "application/pdf",
  });

  // Candidate applies to Job A
  const application = await candidateStore.submitApplication({
    userId: candidate.id,
    jobId: jobA.id,
    resumeId: resume.id,
    coverNote: "Excited to apply for the Senior React Engineer position at Company A.",
  });

  assert(application.status === "applied", "Initial application status is 'applied'");
  assert(application.jobId === jobA.id, "Application correctly bound to Job A");

  // 2. Employer Applicant Visibility
  console.log("\n--- 2. Employer Applicant Visibility & Scoping ---");
  const employerAApplicants = await candidateStore.getApplicationsForJob(companyA.id, jobA.id);
  assert(employerAApplicants.length === 1, "Employer A retrieves candidate application for Job A");
  assert(
    employerAApplicants[0].profileSnapshot.fullName === "Sneha Reddy",
    "Candidate name correctly retrieved from snapshot"
  );

  const employerBApplicantsForJobA = await candidateStore.getApplicationsForJob(companyB.id, jobA.id);
  assert(
    employerBApplicantsForJobA.length === 0,
    "IDOR: Company B cannot access Company A's job applicants"
  );

  // 3. Immutable Snapshot Verification
  console.log("\n--- 3. Immutable Application Snapshot Integrity ---");
  // Candidate updates profile and deletes/replaces resume
  await candidateStore.updateProfile(candidate.id, {
    headline: "Senior Architect | Blockchain Lead",
    skills: ["Rust", "Solidity"],
  });
  await candidateStore.deleteResume(candidate.id, resume.id);
  await candidateStore.addResume({
    userId: candidate.id,
    fileName: "Sneha_Reddy_Resume_V2_Blockchain.pdf",
    storageKey: `candidates/${candidate.id}/resumes/resume-v2.pdf`,
    fileSizeBytes: 300000,
    mimeType: "application/pdf",
  });

  // Check application snapshot retrieved by employer
  const appSnapshot = await candidateStore.getApplicationForEmployer(companyA.id, jobA.id, application.id);
  assert(appSnapshot !== null, "Application found for employer review");
  assert(
    appSnapshot?.profileSnapshot.headline === "Frontend Engineer | React Enthusiast",
    "Profile snapshot headline is immutable against subsequent candidate profile updates"
  );
  assert(
    appSnapshot?.resumeSnapshot.fileName === "Sneha_Reddy_Resume_V1.pdf",
    "Resume snapshot file name is immutable even after resume deletion/replacement in Vault"
  );

  // 4. Application Stage Transitions
  console.log("\n--- 4. Application Pipeline Stage Transitions ---");

  // Valid: applied -> under_review
  const reviewedApp = await candidateStore.updateApplicationStage({
    employerUserId: employerA.id,
    companyId: companyA.id,
    jobId: jobA.id,
    applicationId: application.id,
    newStatus: "under_review",
    note: "Resume shortlisted for initial technical screening.",
  });
  assert(reviewedApp.status === "under_review", "Transitioned to 'under_review'");

  // Valid: under_review -> shortlisted
  const shortlistedApp = await candidateStore.updateApplicationStage({
    employerUserId: employerA.id,
    companyId: companyA.id,
    jobId: jobA.id,
    applicationId: application.id,
    newStatus: "shortlisted",
    note: "Cleared screening interview. Moving to final round.",
  });
  assert(shortlistedApp.status === "shortlisted", "Transitioned to 'shortlisted'");

  // Valid: shortlisted -> hired
  const hiredApp = await candidateStore.updateApplicationStage({
    employerUserId: employerA.id,
    companyId: companyA.id,
    jobId: jobA.id,
    applicationId: application.id,
    newStatus: "hired",
    note: "Offer accepted by candidate.",
  });
  assert(hiredApp.status === "hired", "Transitioned to 'hired'");

  // 5. Invalid Transition Rejections
  console.log("\n--- 5. Invalid State Transition Rejections ---");

  // Attempting to modify terminal 'hired' state
  let terminalMutationBlocked = false;
  try {
    await candidateStore.updateApplicationStage({
      employerUserId: employerA.id,
      companyId: companyA.id,
      jobId: jobA.id,
      applicationId: application.id,
      newStatus: "applied",
    });
  } catch {
    terminalMutationBlocked = true;
  }
  assert(terminalMutationBlocked, "Cannot transition out of terminal 'hired' stage");

  // 6. Candidate 2 for Rejection Testing
  console.log("\n--- 6. Not Selected State & Terminal Handling ---");
  const candidate2 = await candidateStore.createCandidate({
    email: `candidate2.ats.${timestamp}@example.com`,
    password: "Password123!",
    fullName: "Arjun Mehta",
  });
  const resume2 = await candidateStore.addResume({
    userId: candidate2.id,
    fileName: "Arjun_Mehta_Resume.pdf",
    storageKey: `candidates/${candidate2.id}/resumes/resume-01.pdf`,
    fileSizeBytes: 150000,
    mimeType: "application/pdf",
  });
  const app2 = await candidateStore.submitApplication({
    userId: candidate2.id,
    jobId: jobA.id,
    resumeId: resume2.id,
  });

  const rejectedApp = await candidateStore.updateApplicationStage({
    employerUserId: employerA.id,
    companyId: companyA.id,
    jobId: jobA.id,
    applicationId: app2.id,
    newStatus: "not_selected",
    note: "Skills did not match required experience range.",
  });
  assert(rejectedApp.status === "not_selected", "Transitioned to 'not_selected'");

  let rejectedTerminalBlocked = false;
  try {
    await candidateStore.updateApplicationStage({
      employerUserId: employerA.id,
      companyId: companyA.id,
      jobId: jobA.id,
      applicationId: app2.id,
      newStatus: "under_review",
    });
  } catch {
    rejectedTerminalBlocked = true;
  }
  assert(rejectedTerminalBlocked, "Cannot transition out of terminal 'not_selected' stage");

  // 7. Candidate Real-Time Status Visibility
  console.log("\n--- 7. Candidate Real-Time View ---");
  const candidateApplications = await candidateStore.getApplications(candidate.id);
  assert(candidateApplications.length === 1, "Candidate retrieves submitted application");
  assert(candidateApplications[0].status === "hired", "Candidate sees real-time 'hired' status");
  assert(
    candidateApplications[0].statusHistory.length === 4,
    "Candidate sees complete status history timeline (applied -> under_review -> shortlisted -> hired)"
  );

  // 8. Audit Trail Verification
  console.log("\n--- 8. ATS Audit Trail Verification ---");
  const auditLogs = await candidateStore.getApplicationAuditLogs(application.id);
  assert(auditLogs.length === 3, "All 3 status changes logged in immutable audit history");
  assert(auditLogs[0].prevStatus === "applied" && auditLogs[0].newStatus === "under_review", "Audit 1: applied -> under_review");
  assert(auditLogs[1].prevStatus === "under_review" && auditLogs[1].newStatus === "shortlisted", "Audit 2: under_review -> shortlisted");
  assert(auditLogs[2].prevStatus === "shortlisted" && auditLogs[2].newStatus === "hired", "Audit 3: shortlisted -> hired");

  // 9. Closed Job Application Persistence
  console.log("\n--- 9. Closed Job Application Persistence ---");
  await jobStore.closeJob(employerA.id, companyA.id, jobA.id);
  const closedJobApps = await candidateStore.getApplicationsForJob(companyA.id, jobA.id);
  assert(closedJobApps.length === 2, "Applications remain fully accessible after job is closed");

  console.log(`\n==================================================`);
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runLiteAtsPipelineTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
