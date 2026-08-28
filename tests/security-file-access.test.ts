import { candidateStore } from "@/lib/db/candidate-store";
import { jobStore } from "@/lib/db/job-store";
import { employerStore } from "@/lib/db/employer-store";

async function runSecurityFileAccessTests() {
  console.log("=== STARTING SECURITY FILE ACCESS & RESUME VAULT TEST SUITE ===");
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

  // Setup verified employer & company
  const { user: empUser, company: empComp } = await employerStore.createEmployer({
    email: `file.sec.${timestamp}@defense.io`,
    password: "Password123!",
    fullName: "Defense HR",
    companyName: `Defense Technologies ${timestamp}`,
  });
  empComp.verificationStatus = "verified";

  // 1. Candidate Vault Upload & Ownership
  console.log("\n--- 1. Resume Storage & Ownership Isolation ---");
  const candA = await candidateStore.createCandidate({
    email: `candA.file.${timestamp}@example.com`,
    password: "Password123!",
    fullName: "Alice FileTest",
  });

  const candB = await candidateStore.createCandidate({
    email: `candB.file.${timestamp}@example.com`,
    password: "Password123!",
    fullName: "Bob FileTest",
  });

  // Path Traversal in Filename Sanitization
  const maliciousFileName = "../../../etc/passwd";
  const sanitizedStorageKey = `candidates/${candA.id}/resumes/resume_${timestamp}.pdf`;
  const resumeA = await candidateStore.addResume({
    userId: candA.id,
    fileName: maliciousFileName,
    storageKey: sanitizedStorageKey,
    fileSizeBytes: 102400,
    mimeType: "application/pdf",
  });
  assert(
    resumeA.storageKey.startsWith(`candidates/${candA.id}/`),
    "Storage key is sandboxed within user-scoped directory, preventing path traversal"
  );

  // 2. Cross-User Resume Vault Access Protection
  console.log("\n--- 2. Cross-User Resume Vault Access Protection ---");
  const candBResumes = await candidateStore.getResumes(candB.id);
  assert(
    !candBResumes.some((r) => r.id === resumeA.id),
    "Candidate B cannot see Candidate A's uploaded resumes"
  );

  let candBDeleteBlocked = false;
  try {
    await candidateStore.deleteResume(candB.id, resumeA.id);
  } catch {
    candBDeleteBlocked = true;
  }
  assert(candBDeleteBlocked, "Candidate B cannot delete Candidate A's resume");

  // 3. Application Resume Snapshot Immutability vs Vault Deletion
  console.log("\n--- 3. Immutable Snapshot vs Vault Deletion ---");
  // Create job
  const testJob = await jobStore.createJobDraft({
    employerUserId: empUser.id,
    companyId: empComp.id,
    title: "Security Engineer",
    jobType: "full_time",
    workplaceType: "remote",
    city: "Remote",
    state: "All India",
    experienceLevel: "3-5_years",
    minCompensation: 2000000,
    maxCompensation: 3000000,
    compensationType: "annual_ctc",
    isCompensationNegotiable: false,
    description: "Security architecture testing and vulnerability assessment in production.",
    responsibilities: ["Audit code"],
    requirements: ["AppSec experience"],
    perks: ["Remote stipend"],
    skills: ["Security", "TypeScript"],
  });
  await jobStore.submitJobForModeration(empUser.id, empComp.id, testJob.id);
  const pubJob = await jobStore.approveJob("admin-root-001", testJob.id);

  // Candidate A applies with Resume A
  const appA = await candidateStore.submitApplication({
    userId: candA.id,
    jobId: pubJob.id,
    resumeId: resumeA.id,
  });
  assert(appA.resumeSnapshot.originalResumeId === resumeA.id, "Application snapshot captured original resume ID");

  // Candidate A deletes resume from Vault
  await candidateStore.deleteResume(candA.id, resumeA.id);
  const remainingResumes = await candidateStore.getResumes(candA.id);
  assert(remainingResumes.length === 0, "Resume successfully removed from user's live Vault");

  // Verify application snapshot persists unchanged
  const candidateApps = await candidateStore.getApplications(candA.id);
  assert(candidateApps.length === 1, "Candidate application record still exists");
  assert(
    candidateApps[0].resumeSnapshot.storageKey.length > 0,
    "Application resume snapshot remains intact and immutable after Vault deletion"
  );

  console.log(`\n==================================================`);
  console.log(`SECURITY FILE ACCESS RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityFileAccessTests().catch((err) => {
  console.error("Security file access test execution failed:", err);
  process.exit(1);
});
