import { jobStore } from "@/lib/db/job-store";
import { employerStore } from "@/lib/db/employer-store";
import { getPublicJobs, getPublicJobBySlug } from "@/lib/services/job-service";

async function runJobCreationModerationTests() {
  console.log("=== STARTING PHASE 7.3C JOB CREATION & MODERATION TEST SUITE ===");
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

  // 1. Setup Verified Employer & Unverified Employer
  console.log("\n--- 1. Setting up Verified & Unverified Employers ---");
  const timestamp = Date.now();

  // Create Verified Employer
  const { user: verifiedEmployer, company: verifiedCompany } = await employerStore.createEmployer({
    email: `recruiter.verified.${timestamp}@razorpay.com`,
    password: "Password123!",
    fullName: "Ananya Deshmukh",
    companyName: "Razorpay Software Pvt Ltd",
  });
  verifiedCompany.verificationStatus = "verified"; // Admin approved state

  assert(verifiedEmployer !== null, "Verified employer created");
  assert(verifiedCompany.verificationStatus === "verified", "Employer company is verified");

  // Create Unverified Employer
  const { user: unverifiedEmployer, company: unverifiedCompany } = await employerStore.createEmployer({
    email: `recruiter.unverified.${timestamp}@newstartup.in`,
    password: "Password123!",
    fullName: "Karan Johar",
    companyName: "NewStartup Technologies",
  });
  assert(unverifiedCompany.verificationStatus === "unverified", "New employer is unverified");

  // 2. Draft Creation
  console.log("\n--- 2. Job Draft Creation ---");
  const draftJob = await jobStore.createJobDraft({
    employerUserId: verifiedEmployer.id,
    companyId: verifiedCompany.id,
    title: "Senior Backend Engineer (Go & PostgreSQL)",
    jobType: "full_time",
    workplaceType: "hybrid",
    city: "Bengaluru",
    state: "Karnataka",
    experienceLevel: "3-5_years",
    minCompensation: 1800000,
    maxCompensation: 2800000,
    compensationType: "annual_ctc",
    isCompensationNegotiable: false,
    description: "Build robust high-throughput payment transaction pipelines with high availability.",
    responsibilities: ["Design distributed ledger microservices", "Optimize SQL queries"],
    requirements: ["4+ years Go experience", "Deep knowledge of PostgreSQL"],
    perks: ["Medical Insurance", "Annual Retreat"],
    skills: ["Go", "PostgreSQL", "Kafka", "Docker"],
  });

  assert(draftJob.status === "draft", "New job is strictly in 'draft' status");
  assert(draftJob.company.name === verifiedCompany.name, "Job bound to authorized company");

  // 3. Draft Hidden from Public Discovery
  console.log("\n--- 3. Public Publishing Gate (Draft Isolation) ---");
  const publicListingBeforeApproval = await getPublicJobBySlug(draftJob.slug);
  assert(publicListingBeforeApproval === null, "Draft job is strictly hidden from public discovery");

  const discoveryResults = await getPublicJobs({ query: "Senior Backend Engineer (Go & PostgreSQL)" });
  assert(
    !discoveryResults.jobs.some((j) => j.id === draftJob.id),
    "Draft job is not included in public keyword search"
  );

  // 4. Unverified Employer Submission Gate
  console.log("\n--- 4. Unverified Employer Moderation Gate ---");
  const unverifiedDraft = await jobStore.createJobDraft({
    employerUserId: unverifiedEmployer.id,
    companyId: unverifiedCompany.id,
    title: "Junior QA Tester",
    jobType: "full_time",
    workplaceType: "on_site",
    city: "Mumbai",
    state: "Maharashtra",
    experienceLevel: "freshers",
    minCompensation: 400000,
    maxCompensation: 600000,
    compensationType: "annual_ctc",
    isCompensationNegotiable: false,
    description: "Manual and automated test script development for web portals.",
    responsibilities: ["Write test cases"],
    requirements: ["Basic Java"],
    perks: [],
    skills: ["Selenium", "Java"],
  });

  let unverifiedSubmissionBlocked = false;
  try {
    await jobStore.submitJobForModeration(
      unverifiedEmployer.id,
      unverifiedCompany.id,
      unverifiedDraft.id
    );
  } catch {
    unverifiedSubmissionBlocked = true;
  }
  assert(unverifiedSubmissionBlocked, "Unverified employer cannot submit job for moderation");

  // 5. Verified Employer Moderation Submission
  console.log("\n--- 5. Verified Employer Moderation Submission ---");
  const submittedJob = await jobStore.submitJobForModeration(
    verifiedEmployer.id,
    verifiedCompany.id,
    draftJob.id
  );
  assert(submittedJob.status === "pending_moderation", "Job transitioned from 'draft' to 'pending_moderation'");

  const pendingQueue = await jobStore.getPendingModerationQueue();
  assert(
    pendingQueue.some((j) => j.id === draftJob.id),
    "Submitted job appears in Admin Moderation Queue"
  );

  // 6. Admin Approval & Live Publication
  console.log("\n--- 6. Admin Approval & Live Publication ---");
  const adminId = "admin-root-001";
  const approvedJob = await jobStore.approveJob(adminId, draftJob.id);

  assert(approvedJob.status === "published", "Job status transitioned to 'published'");
  assert(typeof approvedJob.publishedAt === "string", "publishedAt timestamp recorded");

  // Now the job is accessible in public discovery!
  const publicListingAfterApproval = await getPublicJobBySlug(draftJob.slug);
  assert(publicListingAfterApproval !== null, "Approved job is now visible at /jobs/[slug]");
  assert(publicListingAfterApproval?.title === draftJob.title, "Public job title matches");

  // 7. Admin Rejection with Feedback Note
  console.log("\n--- 7. Admin Rejection & Moderation Note Requirement ---");
  // Create another draft to test rejection
  const spamJob = await jobStore.createJobDraft({
    employerUserId: verifiedEmployer.id,
    companyId: verifiedCompany.id,
    title: "Data Entry Operator Work From Home",
    jobType: "part_time",
    workplaceType: "remote",
    city: "Remote",
    state: "Pan-India",
    experienceLevel: "freshers",
    minCompensation: 100000,
    maxCompensation: 200000,
    compensationType: "annual_ctc",
    isCompensationNegotiable: false,
    description: "Earn daily money with simple typing tasks. Registration fee applicable.",
    responsibilities: ["Typing"],
    requirements: ["None"],
    perks: [],
    skills: ["Typing"],
  });

  await jobStore.submitJobForModeration(verifiedEmployer.id, verifiedCompany.id, spamJob.id);

  // Attempt rejection without note should fail
  let emptyNoteBlocked = false;
  try {
    await jobStore.rejectJob(adminId, spamJob.id, "");
  } catch {
    emptyNoteBlocked = true;
  }
  assert(emptyNoteBlocked, "Rejection without a specific moderation note is rejected");

  const rejectedJob = await jobStore.rejectJob(
    adminId,
    spamJob.id,
    "Violates Zero-Fee Policy: Candidate registration fees are strictly prohibited on WE CORPORATE."
  );
  assert(rejectedJob.status === "rejected", "Job status is 'rejected'");
  assert(Boolean(rejectedJob.moderationFeedback?.includes("Zero-Fee Policy")), "Moderation feedback recorded");

  // Rejected job hidden from public
  const rejectedPublic = await getPublicJobBySlug(spamJob.slug);
  assert(rejectedPublic === null, "Rejected job is hidden from public discovery");

  // 8. Lifecycle: Pause & Close
  console.log("\n--- 8. Job Lifecycle: Pause & Close ---");
  const pausedJob = await jobStore.pauseJob(verifiedEmployer.id, verifiedCompany.id, draftJob.id);
  assert(pausedJob.status === "paused", "Published job paused");

  const pausedPublic = await getPublicJobBySlug(draftJob.slug);
  assert(pausedPublic === null, "Paused job is immediately excluded from public discovery");

  const closedJob = await jobStore.closeJob(verifiedEmployer.id, verifiedCompany.id, draftJob.id);
  assert(closedJob.status === "closed", "Job closed");

  // 9. IDOR Hardening: Employer A cannot mutate Employer B's job
  console.log("\n--- 9. IDOR & Ownership Security ---");
  let idorBlocked = false;
  try {
    await jobStore.updateJobDraft(unverifiedEmployer.id, unverifiedCompany.id, draftJob.id, {
      title: "Hacked Job Title",
    });
  } catch {
    idorBlocked = true;
  }
  assert(idorBlocked, "Employer B cannot update Employer A's job");

  // 10. Audit Trail Verification
  console.log("\n--- 10. Moderation Audit Trail Verification ---");
  const auditLogs = await jobStore.getModerationAuditLogs();
  assert(auditLogs.length >= 2, "Moderation audit records created for approve & reject actions");
  assert(auditLogs.some((l) => l.action === "APPROVE"), "APPROVE action audited");
  assert(auditLogs.some((l) => l.action === "REJECT"), "REJECT action audited");

  console.log(`\n==================================================`);
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runJobCreationModerationTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
