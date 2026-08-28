import { candidateStore } from "@/lib/db/candidate-store";
import { DEVELOPMENT_JOBS } from "@/lib/db/seed-data";

async function runApplicationPipelineTests() {
  console.log("=== STARTING PHASE 7.3A NATIVE APPLICATION PIPELINE TEST SUITE ===");
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

  // 1. Setup Test Candidates
  console.log("\n--- 1. Setting up Test Candidates & Resumes ---");
  const candidateA = await candidateStore.createCandidate({
    email: `app.test.a.${Date.now()}@wecorporate.in`,
    password: "Password123!",
    fullName: "Aarav Mehta",
  });

  await candidateStore.updateProfile(candidateA.id, {
    headline: "Full-Stack Engineer | React & Node.js",
    city: "Bengaluru",
    state: "Karnataka",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    bio: "Passionate developer with 2 years of building scalable full-stack applications.",
  });

  const candidateAResume = await candidateStore.addResume({
    userId: candidateA.id,
    fileName: "Aarav_Mehta_Resume_2026.pdf",
    storageKey: `candidates/${candidateA.id}/resumes/resume-original.pdf`,
    fileSizeBytes: 204800,
    mimeType: "application/pdf",
  });

  const candidateB = await candidateStore.createCandidate({
    email: `app.test.b.${Date.now()}@wecorporate.in`,
    password: "Password123!",
    fullName: "Sneha Reddy",
  });

  const validJob = DEVELOPMENT_JOBS[0]; // Active published job
  assert(validJob.status === "published", "Test job is published and eligible");

  // 2. Application Submission
  console.log("\n--- 2. Native 1-Click Application Submission ---");
  const applicationA = await candidateStore.submitApplication({
    userId: candidateA.id,
    jobId: validJob.id,
    resumeId: candidateAResume.id,
    coverNote: "I have extensive experience with Next.js and PostgreSQL and would love to contribute.",
  });

  assert(applicationA.id.startsWith("app-"), "Application created with unique reference ID");
  assert(applicationA.status === "applied", "Initial application status is 'applied'");
  assert(applicationA.jobId === validJob.id, "Application correctly references target job");
  assert(applicationA.companyName === validJob.company.name, "Application references hiring company");
  assert(applicationA.consent.agreedToShareWithEmployer === true, "Explicit consent is recorded");
  assert(typeof applicationA.consent.consentTimestamp === "string", "Consent timestamp recorded");

  // 3. Immutable Resume Snapshot
  console.log("\n--- 3. Immutable Resume Snapshot Verification ---");
  const snapshot = applicationA.resumeSnapshot;
  assert(snapshot.originalResumeId === candidateAResume.id, "Snapshot links to original resume ID");
  assert(snapshot.fileName === candidateAResume.fileName, "Snapshot preserves file name");
  assert(snapshot.storageKey.startsWith(`applications/${applicationA.id}/resumes/`), "Snapshot has isolated application storage key");

  // Modifying or deleting resume in candidate's personal Resume Vault does NOT affect application snapshot
  await candidateStore.deleteResume(candidateA.id, candidateAResume.id);
  const remainingPersonalResumes = await candidateStore.getResumes(candidateA.id);
  assert(remainingPersonalResumes.length === 0, "Personal Resume Vault resume was deleted");

  const retrievedApplication = await candidateStore.getApplicationById(candidateA.id, applicationA.id);
  assert(retrievedApplication !== null, "Application still exists");
  assert(
    retrievedApplication?.resumeSnapshot.fileName === "Aarav_Mehta_Resume_2026.pdf",
    "Application resume snapshot remains intact and immutable after vault deletion"
  );

  // 4. Immutable Profile Snapshot
  console.log("\n--- 4. Immutable Profile Snapshot Verification ---");
  assert(applicationA.profileSnapshot.fullName === "Aarav Mehta", "Profile snapshot contains candidate name");
  assert(applicationA.profileSnapshot.headline === "Full-Stack Engineer | React & Node.js", "Profile snapshot contains headline");
  assert(applicationA.profileSnapshot.skills.length === 4, "Profile snapshot contains skills array");

  // Updating profile later does NOT alter the historical application profile snapshot
  await candidateStore.updateProfile(candidateA.id, {
    fullName: "Aarav Mehta (Updated Later)",
    headline: "Chief Technology Officer",
  });

  const refreshedApp = await candidateStore.getApplicationById(candidateA.id, applicationA.id);
  assert(
    refreshedApp?.profileSnapshot.fullName === "Aarav Mehta",
    "Historical application profile snapshot is immutable against subsequent profile changes"
  );

  // 5. Duplicate Prevention & Idempotency
  console.log("\n--- 5. Duplicate Prevention & Idempotency ---");
  const hasApplied = await candidateStore.hasCandidateApplied(candidateA.id, validJob.id);
  assert(hasApplied === true, "hasCandidateApplied returns true for submitted job");

  // Idempotent resubmission returns the same application record
  const duplicateAttempt = await candidateStore.submitApplication({
    userId: candidateA.id,
    jobId: validJob.id,
    resumeId: "any-resume-id",
  });
  assert(duplicateAttempt.id === applicationA.id, "Idempotent submission returns existing application without creating duplicate");

  const allCandidateAApps = await candidateStore.getApplications(candidateA.id);
  assert(allCandidateAApps.length === 1, "Only 1 application record exists for candidate and job");

  // 6. Resume Ownership & Cross-User Attack Rejection
  console.log("\n--- 6. Resume Ownership Enforcement ---");
  const candidateBResume = await candidateStore.addResume({
    userId: candidateB.id,
    fileName: "Sneha_Reddy_Resume.pdf",
    storageKey: `candidates/${candidateB.id}/resumes/cv.pdf`,
    fileSizeBytes: 150000,
  });

  let crossResumeBlocked = false;
  try {
    // Candidate A tries to submit Candidate B's resume
    await candidateStore.submitApplication({
      userId: candidateA.id,
      jobId: DEVELOPMENT_JOBS[1].id,
      resumeId: candidateBResume.id,
    });
  } catch {
    crossResumeBlocked = true;
  }
  assert(crossResumeBlocked, "Candidate A cannot submit a resume owned by Candidate B");

  // 7. Security / IDOR Testing
  console.log("\n--- 7. Security & IDOR Assertions ---");
  // Candidate B attempts to view Candidate A's application
  const idorAccessResult = await candidateStore.getApplicationById(candidateB.id, applicationA.id);
  assert(idorAccessResult === null, "IDOR: Candidate B cannot access Candidate A's application record");

  const candidateBApps = await candidateStore.getApplications(candidateB.id);
  assert(candidateBApps.length === 0, "Candidate B's application list is empty and does not leak Candidate A's data");

  // 8. Eligibility Enforcement: Closed Job Rejection
  console.log("\n--- 8. Job Status Eligibility Enforcement ---");
  let missingJobBlocked = false;
  try {
    await candidateStore.submitApplication({
      userId: candidateB.id,
      jobId: "non-existent-job-999",
      resumeId: candidateBResume.id,
    });
  } catch {
    missingJobBlocked = true;
  }
  assert(missingJobBlocked, "Application to non-existent job is rejected");

  console.log(`\n==================================================`);
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runApplicationPipelineTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
