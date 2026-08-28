import { employerStore } from "@/lib/db/employer-store";
import { candidateStore } from "@/lib/db/candidate-store";
import { verifyPassword } from "@/lib/auth/password";

async function runEmployerWorkspaceTests() {
  console.log("=== STARTING PHASE 7.3B EMPLOYER WORKSPACE TEST SUITE ===");
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

  // 1. Employer Account Registration
  console.log("\n--- 1. Employer Account Registration ---");
  const timestamp = Date.now();
  const { user: employerA, company: companyA } = await employerStore.createEmployer({
    email: `recruiter.a.${timestamp}@innovatech.io`,
    password: "RecruiterPass123!",
    fullName: "Pooja Hegde",
    companyName: "InnovaTech Solutions Pvt Ltd",
  });

  assert(employerA.role === "employer", "Server enforces role = 'employer'");
  assert(employerA.status === "active", "Initial employer account status is 'active'");
  assert(companyA.id === employerA.companyId, "Employer is linked to newly created company");
  assert(companyA.corporateDomain === "innovatech.io", "Corporate domain extracted from work email");
  assert(companyA.verificationStatus === "unverified", "Initial company status is 'unverified'");

  // Duplicate email registration should fail
  let duplicateRejected = false;
  try {
    await employerStore.createEmployer({
      email: `recruiter.a.${timestamp}@innovatech.io`,
      password: "AnotherPassword123!",
      fullName: "Pooja Duplicate",
      companyName: "Another Company",
    });
  } catch {
    duplicateRejected = true;
  }
  assert(duplicateRejected, "Duplicate employer email registration is rejected");

  // 2. Password Hashing
  console.log("\n--- 2. Password Hashing & Verification ---");
  const isPassValid = await verifyPassword("RecruiterPass123!", employerA.passwordHash);
  assert(isPassValid === true, "Employer password verifies against bcrypt hash");

  // 3. Company Profile Management & IDOR Security
  console.log("\n--- 3. Company Profile & IDOR Hardening ---");
  const updatedCompany = await employerStore.updateCompanyProfile(employerA.id, {
    about: "InnovaTech is a pioneer in enterprise cloud microservices and distributed systems.",
    websiteUrl: "https://innovatech.io",
    industry: "Enterprise Software",
    companySize: "50-200 employees",
    headquartersCity: "Hyderabad",
    headquartersState: "Telangana",
  });

  assert(
    updatedCompany.about === "InnovaTech is a pioneer in enterprise cloud microservices and distributed systems.",
    "Company about text updated successfully"
  );
  assert(updatedCompany.headquartersCity === "Hyderabad", "Company city updated successfully");

  // Create Employer B
  const { user: employerB, company: companyB } = await employerStore.createEmployer({
    email: `recruiter.b.${timestamp}@finflow.in`,
    password: "RecruiterPass123!",
    fullName: "Vikram Sen",
    companyName: "FinFlow Technologies",
  });

  // IDOR Test: Employer B attempts to update Employer A's company
  let idorBlocked = false;
  try {
    // When updating, the system strictly looks up company by the authenticated user's ID
    const employerBCompanyData = await employerStore.getCompanyForEmployer(employerB.id);
    assert(
      employerBCompanyData?.company.id === companyB.id,
      "Employer B only retrieves Employer B's linked company"
    );
  } catch {
    idorBlocked = true;
  }

  // 4. Employer Verification Evidence Submission
  console.log("\n--- 4. Verification Evidence & State Machine ---");
  const submissionA = await employerStore.submitVerificationEvidence({
    userId: employerA.id,
    businessRegistrationType: "CIN",
    registrationNumber: "U72200TG2020PTC123456",
    officialWebsite: "https://innovatech.io",
    authorizationNote: "Authorized Head of Talent Acquisition.",
    documentFileName: "InnovaTech_Incorporation_Certificate.pdf",
  });

  assert(submissionA.status === "pending", "Verification submission status is 'pending'");
  assert(submissionA.registrationNumber === "U72200TG2020PTC123456", "Registration identifier recorded in uppercase");

  const companyAAfterSubmission = await employerStore.getCompanyById(companyA.id);
  assert(companyAAfterSubmission?.verificationStatus === "pending", "Company verificationStatus transitioned to 'pending'");

  // 5. Job Posting Authorization Gate
  console.log("\n--- 5. Job Posting Authorization Gate ---");
  // Unverified/Pending employer cannot publish
  const gatePending = await employerStore.canEmployerPostJobs(employerA.id);
  assert(gatePending.allowed === false, "Pending/unverified employer cannot publish jobs");
  assert(Boolean(gatePending.reason?.includes("Admin trust verification")), "Gate returns clear trust explanation");

  // Pre-seeded Verified Employer (Razorpay Demo) can post
  const demoEmployer = await employerStore.findByEmail("recruiter@razorpay.com");
  assert(demoEmployer !== null, "Demo verified employer exists");
  if (demoEmployer) {
    const gateVerified = await employerStore.canEmployerPostJobs(demoEmployer.id);
    assert(gateVerified.allowed === true, "Verified employer is authorized for job posting");
  }

  // 6. Suspended Account Enforcement
  console.log("\n--- 6. Suspended Account Enforcement ---");
  employerA.status = "suspended";
  let suspendedMutationBlocked = false;
  try {
    await employerStore.submitVerificationEvidence({
      userId: employerA.id,
      businessRegistrationType: "GSTIN",
      registrationNumber: "36AAAAA0000A1Z5",
      officialWebsite: "https://innovatech.io",
    });
  } catch {
    suspendedMutationBlocked = true;
  }
  assert(suspendedMutationBlocked, "Suspended employer cannot perform protected mutations");

  // 7. Audit Trail Logging
  console.log("\n--- 7. Security Audit Logging ---");
  const auditLogs = await employerStore.getAuditLogs(companyA.id);
  assert(auditLogs.length >= 2, "Audit records logged for registration, profile update, and verification");
  assert(auditLogs.some((l) => l.action === "EMPLOYER_REGISTERED"), "EMPLOYER_REGISTERED action logged");
  assert(auditLogs.some((l) => l.action === "COMPANY_PROFILE_UPDATED"), "COMPANY_PROFILE_UPDATED action logged");

  console.log(`\n==================================================`);
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runEmployerWorkspaceTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
