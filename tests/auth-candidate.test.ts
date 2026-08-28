import { candidateStore } from "@/lib/db/candidate-store";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSessionToken, verifySessionToken } from "@/lib/auth/session";

async function runTests() {
  console.log("=== STARTING PHASE 7.2 AUTH & CANDIDATE TEST SUITE ===");
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

  // 1. Password Hashing & Verification
  console.log("\n--- 1. Password Hashing & Verification ---");
  const plainPassword = "SecurePassword123!";
  const hash = await hashPassword(plainPassword);
  assert(await verifyPassword(plainPassword, hash), "Password verifies against bcrypt hash");
  assert(!(await verifyPassword("WrongPassword123!", hash)), "Incorrect password fails verification");

  // 2. Session Token Creation & Verification
  console.log("\n--- 2. JWT Session Token Security ---");
  const sampleUser = {
    id: "cand-test-01",
    email: "test.candidate@wecorporate.in",
    fullName: "Priya Patel",
    role: "candidate" as const,
    status: "active" as const,
  };
  const token = await createSessionToken(sampleUser);
  const payload = await verifySessionToken(token);
  assert(payload !== null, "Session token is successfully signed and verified");
  assert(payload?.userId === sampleUser.id, "Session payload contains correct user ID");
  assert(payload?.role === "candidate", "Session payload contains correct role");

  // 3. Candidate Signup & Duplicate Prevention
  console.log("\n--- 3. Candidate Signup & Unique Constraints ---");
  const uniqueEmail = `test.user.${Date.now()}@example.com`;
  const newUser = await candidateStore.createCandidate({
    email: uniqueEmail,
    password: "StrongPassword123!",
    fullName: "Priya Patel",
  });
  assert(newUser.id.startsWith("candidate-"), "Candidate user created with unique ID");
  assert(newUser.email === uniqueEmail.toLowerCase(), "Email is normalized and stored");

  let duplicateThrew = false;
  try {
    await candidateStore.createCandidate({
      email: uniqueEmail,
      password: "AnotherPassword123!",
      fullName: "Duplicate User",
    });
  } catch {
    duplicateThrew = true;
  }
  assert(duplicateThrew, "Duplicate registration with existing email is rejected");

  // 4. Candidate Profile Management & Ownership
  console.log("\n--- 4. Candidate Profile Updates ---");
  await candidateStore.updateProfile(newUser.id, {
    headline: "Frontend Specialist | Next.js & TypeScript",
    city: "Mumbai",
    state: "Maharashtra",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
  });
  const updated = await candidateStore.getProfile(newUser.id);
  assert(updated?.profile.headline === "Frontend Specialist | Next.js & TypeScript", "Profile headline saved");
  assert(updated?.profile.city === "Mumbai", "Profile location saved");
  assert(updated?.profile.skills.length === 4, "Skills array saved correctly");

  // 5. Resume Vault & IDOR Security
  console.log("\n--- 5. Resume Vault & IDOR Security ---");
  const userAResume = await candidateStore.addResume({
    userId: newUser.id,
    fileName: "Priya_Patel_CV.pdf",
    storageKey: `candidates/${newUser.id}/resumes/cv.pdf`,
    fileSizeBytes: 180000,
  });
  assert(userAResume.isPrimary === true, "First uploaded resume automatically set as primary");

  const userAResumes = await candidateStore.getResumes(newUser.id);
  assert(userAResumes.length === 1, "Resume list returns candidate's resumes");

  // IDOR Attack Simulation: Candidate B tries to delete Candidate A's resume
  const candidateB = await candidateStore.createCandidate({
    email: `cand.b.${Date.now()}@example.com`,
    password: "PasswordB123!",
    fullName: "Attacker Candidate",
  });

  let idorDeleteBlocked = false;
  try {
    await candidateStore.deleteResume(candidateB.id, userAResume.id);
  } catch {
    idorDeleteBlocked = true;
  }
  assert(idorDeleteBlocked, "IDOR: Candidate B cannot delete Candidate A's resume");

  // Candidate A can delete their own resume
  await candidateStore.deleteResume(newUser.id, userAResume.id);
  const remainingResumes = await candidateStore.getResumes(newUser.id);
  assert(remainingResumes.length === 0, "Candidate A can delete their own resume");

  // 6. Saved Jobs & Duplicate Prevention
  console.log("\n--- 6. Saved Jobs & Uniqueness ---");
  const saved1 = await candidateStore.saveJob(newUser.id, "job-001");
  assert(saved1.jobId === "job-001", "Job successfully saved");

  // Duplicate save returns existing record without creating duplicates
  const saved2 = await candidateStore.saveJob(newUser.id, "job-001");
  assert(saved1.id === saved2.id, "Duplicate save prevented (idempotent)");

  const isSaved = await candidateStore.isJobSaved(newUser.id, "job-001");
  assert(isSaved === true, "isJobSaved returns true");

  await candidateStore.unsaveJob(newUser.id, "job-001");
  const isSavedAfterUnsave = await candidateStore.isJobSaved(newUser.id, "job-001");
  assert(isSavedAfterUnsave === false, "Job successfully unsaved");

  // 7. Password Change Verification
  console.log("\n--- 7. Password Change & Security ---");
  let wrongPassBlocked = false;
  try {
    await candidateStore.changePassword(newUser.id, "WrongCurrentPass123!", "NewSecretPass123!");
  } catch {
    wrongPassBlocked = true;
  }
  assert(wrongPassBlocked, "Password change with incorrect current password is rejected");

  await candidateStore.changePassword(newUser.id, "StrongPassword123!", "NewSecretPass123!");
  const userAfterPassChange = await candidateStore.findById(newUser.id);
  assert(
    await verifyPassword("NewSecretPass123!", userAfterPassChange!.passwordHash),
    "Password successfully updated with new hash"
  );

  // 8. Data Export Portability
  console.log("\n--- 8. Data Export Portability ---");
  const exportData = await candidateStore.exportData(newUser.id);
  assert(exportData.account.email === newUser.email, "Export contains verified account email");
  assert(exportData.profile.city === "Mumbai", "Export contains profile data");
  assert(typeof exportData.exportedAt === "string", "Export contains ISO timestamp");

  console.log(`\n==================================================`);
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
