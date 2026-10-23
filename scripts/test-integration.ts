import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import { repository } from "../lib/db";
import { auth } from "../lib/auth/auth";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function runTests() {
  console.log("=== Integration Verification ===");

  // 1. Verify Neon DB campaigns retrieval
  console.log("\n[Test 1] Querying running campaigns from Neon DB via repository...");
  const campaigns = await repository.getCampaigns();
  console.log(`Found ${campaigns.length} campaigns in Neon DB:`);
  campaigns.forEach((c) => {
    console.log(` - [${c.status}] ${c.title} (Goal: ${c.targetEth} ETH, Raised: ${c.raisedEth} ETH)`);
  });
  if (campaigns.length === 0) {
    throw new Error("Expected seeded campaigns in Neon DB, but got 0");
  }

  // 2. Test Campaign Creation and Neon DB persistence
  console.log("\n[Test 2] Creating a test organization campaign...");
  const testTitle = `Decentralized AI Cluster-${Date.now()}`;
  const created = await repository.createCampaign({
    title: testTitle,
    slug: `ai-cluster-${Date.now()}`,
    summary: "Decentralized GPU computing cluster for open LLM inference.",
    storyMarkdown: "Building decentralized compute infrastructure.",
    category: "Tech",
    bannerUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    targetEth: "10.0",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    creatorWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    creatorName: "Compute DAO",
    creatorAvatar: "https://api.dicebear.com/7.x/identicon/svg?seed=compute",
    fundingType: "ALL_OR_NOTHING",
    milestoneCount: 2,
    featured: false,
    onChainId: 101,
    milestones: [
      { title: "Hardware Procurement", description: "Acquire first 8x H100 nodes", percentage: 50 },
      { title: "Mainnet Node Daemon", description: "Deploy scheduler contract", percentage: 50 },
    ],
  });
  console.log(`Successfully created campaign with ID: ${created.id}`);

  // Verify it exists in Neon DB
  const fetched = await repository.getCampaignById(created.id);
  if (!fetched || fetched.title !== testTitle) {
    throw new Error("Created campaign was not found in Neon DB!");
  }
  console.log(`Verified campaign ${fetched.id} exists in database with ${fetched.milestones.length} milestones!`);

  // 3. Verify Auth User Creation with Role
  console.log("\n[Test 3] Testing user registration in Neon DB with role 'investor'...");
  const testEmail = `investor-${Date.now()}@example.com`;
  const user = await auth.api.signUpEmail({
    body: {
      email: testEmail,
      password: "TestPassword123!",
      name: "Alice Web3 Investor",
      role: "investor",
    },
  });
  console.log(`Successfully registered user in Neon DB: ID=${user.user.id}, Email=${user.user.email}, Role=${(user.user as any).role}`);

  console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
