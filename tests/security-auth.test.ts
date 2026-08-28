import bcrypt from "bcryptjs";
import { createSessionToken, verifySessionToken } from "@/lib/auth/session";
import { candidateStore } from "@/lib/db/candidate-store";
import { employerStore } from "@/lib/db/employer-store";

async function runSecurityAuthTests() {
  console.log("=== STARTING SECURITY AUTHENTICATION & RBAC TEST SUITE ===");
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

  // 1. Password Hashing & Brute-force / Timing Resistance
  console.log("\n--- 1. Password Hashing & Verification Security ---");
  const rawPassword = "HighlySecureP@ssw0rd2026!";
  const hash = await bcrypt.hash(rawPassword, 12);
  assert(await bcrypt.compare(rawPassword, hash), "Valid password authenticates against bcrypt hash");
  assert(!(await bcrypt.compare("WrongPassword123!", hash)), "Invalid password fails authentication");
  assert(!(await bcrypt.compare("", hash)), "Empty password fails authentication");

  // 2. JWT Session Token Integrity & Anti-Tampering
  console.log("\n--- 2. JWT Session Token Anti-Tampering ---");
  const validToken = await createSessionToken({
    id: "usr_cand_001",
    email: "candidate@example.com",
    role: "candidate",
    status: "active",
    fullName: "Test Candidate",
  });
  const verifiedPayload = await verifySessionToken(validToken);
  assert(verifiedPayload !== null, "Legitimate session token verifies correctly");
  assert(verifiedPayload?.role === "candidate", "Session payload extracts role = 'candidate'");

  // Tampered payload attempt
  const parts = validToken.split(".");
  if (parts.length === 3) {
    // Attempt to tamper payload to grant admin role
    const decodedPayload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    decodedPayload.role = "admin";
    const forgedPayload = Buffer.from(JSON.stringify(decodedPayload)).toString("base64url");
    const forgedToken = `${parts[0]}.${forgedPayload}.${parts[2]}`;
    const forgedVerification = await verifySessionToken(forgedToken);
    assert(forgedVerification === null, "Tampered JWT payload is rejected by signature validator");
  }

  // Corrupted signature attempt
  const corruptedSignatureToken = validToken.slice(0, -5) + "abcde";
  const corruptedVerification = await verifySessionToken(corruptedSignatureToken);
  assert(corruptedVerification === null, "Corrupted JWT signature is rejected");

  // 3. Email Normalization & Account Collision Defense
  console.log("\n--- 3. Email Normalization & Account Collision Defense ---");
  const testEmail = `Security.User.${timestamp}@TestDomain.com`;
  const candUser = await candidateStore.createCandidate({
    email: testEmail,
    password: "Password123!",
    fullName: "Security Test User",
  });
  assert(candUser.email === testEmail.toLowerCase(), "Email is normalized to lowercase in store");

  let collisionPrevented = false;
  try {
    await candidateStore.createCandidate({
      email: testEmail.toUpperCase(),
      password: "Password123!",
      fullName: "Attacker Impersonator",
    });
  } catch {
    collisionPrevented = true;
  }
  assert(collisionPrevented, "Uppercase duplicate registration prevented via normalization");

  // 4. Role Escalation & Account Status Protection
  console.log("\n--- 4. Account Status & Role Escalation Defense ---");
  // Suspended candidate mutation block
  candUser.status = "suspended";
  let suspendedMutationBlocked = false;
  try {
    await candidateStore.updateProfile(candUser.id, { headline: "Malicious modification" });
  } catch {
    suspendedMutationBlocked = true;
  }
  assert(suspendedMutationBlocked, "Suspended candidate is blocked from updating profile");

  // Suspended employer mutation block
  const { user: empUser, company: empCompany } = await employerStore.createEmployer({
    email: `recruiter.sec.${timestamp}@defense.com`,
    password: "Password123!",
    fullName: "Defense Recruiter",
    companyName: `Defense Systems ${timestamp}`,
  });
  empUser.status = "suspended";
  let suspendedEmployerBlocked = false;
  try {
    await employerStore.updateCompanyProfile(empUser.id, { about: "Unauthorized company update" });
  } catch {
    suspendedEmployerBlocked = true;
  }
  assert(suspendedEmployerBlocked, "Suspended employer is blocked from updating company profile");

  console.log(`\n==================================================`);
  console.log(`SECURITY AUTH RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityAuthTests().catch((err) => {
  console.error("Security auth test execution failed:", err);
  process.exit(1);
});
