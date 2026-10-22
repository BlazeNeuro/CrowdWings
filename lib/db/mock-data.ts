export interface CampaignRecord {
  id: string;
  onChainId: number | null;
  title: string;
  slug: string;
  summary: string;
  storyMarkdown: string;
  category: string;
  bannerUrl: string;
  targetEth: string;
  raisedEth: string;
  deadline: string;
  creatorWallet: string;
  creatorName: string;
  creatorAvatar: string;
  status: "ACTIVE" | "SUCCEEDED" | "FAILED" | "CANCELLED";
  fundingType: "ALL_OR_NOTHING" | "FLEXIBLE";
  milestoneCount: number;
  backersCount: number;
  featured: boolean;
  createdAt: string;
}

export interface MilestoneRecord {
  id: string;
  campaignId: string;
  index: number;
  title: string;
  description: string;
  percentage: number;
  targetDate?: string;
  status: "PENDING" | "VOTING" | "APPROVED" | "REJECTED" | "PAID_OUT";
  votingDeadline?: string;
  votesForEth: string;
  votesAgainstEth: string;
}

export interface ContributionRecord {
  id: string;
  campaignId: string;
  backerWallet: string;
  backerName: string;
  amountEth: string;
  txHash: string;
  tierName?: string;
  message?: string;
  createdAt: string;
}

export interface UpdateRecord {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  authorWallet: string;
  createdAt: string;
}

export interface CommentRecord {
  id: string;
  campaignId: string;
  authorWallet: string;
  authorName: string;
  content: string;
  createdAt: string;
}

const now = 1774000000000; // Deterministic timestamp for prerendering
const dayMs = 24 * 60 * 60 * 1000;

export const INITIAL_CAMPAIGNS: CampaignRecord[] = [
  {
    id: "camp-solarnet",
    onChainId: 1,
    title: "HeliosMesh: Decentralized Solar Micro-Grids",
    slug: "heliosmesh-decentralized-solar",
    summary: "Building open-source IoT hardware and smart contracts for peer-to-peer clean solar energy trading in rural communities.",
    storyMarkdown: `### The Problem
Over 750 million people globally live without reliable access to clean electricity. Traditional energy grids are centralized, costly, and fossil-dependent.

### The Solution: HeliosMesh
HeliosMesh is an autonomous hardware and decentralized software mesh that allows homeowners with solar panels to sell surplus micro-power to neighbors directly over smart contracts using zero-latency IoT telemetry.

### What We Are Building
- **Helios Node v1**: Low-cost ESP32 smart meter hardware that reads kilowatt-hours and signs meter readings on-chain.
- **Micro-P2P Settlement Contract**: Automated energy credit settlement on Ethereum L2.
- **Mobile Solar Wallet**: Simple offline-capable mobile app for microgrid participants.

### Fund Allocation
- 40% Hardware prototyping & initial pilot manufacture (100 units).
- 30% Embedded firmware security audit & smart contract deployment.
- 30% Field deployment in pilot villages and open-source documentation.`,
    category: "Climate",
    bannerUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
    targetEth: "8.5",
    raisedEth: "5.75",
    deadline: new Date(now + 18 * dayMs).toISOString(),
    creatorWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    creatorName: "Elena Vance (SunTech DAO)",
    creatorAvatar: "https://api.dicebear.com/7.x/identicon/svg?seed=elena",
    status: "ACTIVE",
    fundingType: "ALL_OR_NOTHING",
    milestoneCount: 3,
    backersCount: 42,
    featured: true,
    createdAt: new Date(now - 12 * dayMs).toISOString(),
  },
  {
    id: "camp-aivault",
    onChainId: 2,
    title: "NeuralSwarm: Verifiable Open-Source AI Inference",
    slug: "neuralswarm-verifiable-ai",
    summary: "Zero-Knowledge zk-SNARK cryptographic verification for open-weight AI agent inference, guaranteeing uncensored and verifiable outputs.",
    storyMarkdown: `### Mission
Centralized AI APIs are black boxes. They can alter system prompts, censor outputs, and log private user queries without consent.

NeuralSwarm introduces verifiable decentralized AI inference. By generating zk-proofs alongside LLM token streams, users can cryptographically verify that an open-weight model was executed faithfully without tampering.

### Milestones & Roadmaps
- **Phase 1**: Core zkML prover library written in Rust and WebAssembly.
- **Phase 2**: Decentralized node runner client for consumer GPUs.
- **Phase 3**: Web3 SDK enabling any smart contract to trigger verifiable LLM calls.`,
    category: "Tech",
    bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    targetEth: "15.0",
    raisedEth: "16.8",
    deadline: new Date(now + 24 * dayMs).toISOString(),
    creatorWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    creatorName: "Kaelen Thorne",
    creatorAvatar: "https://api.dicebear.com/7.x/identicon/svg?seed=kaelen",
    status: "SUCCEEDED",
    fundingType: "ALL_OR_NOTHING",
    milestoneCount: 3,
    backersCount: 118,
    featured: true,
    createdAt: new Date(now - 8 * dayMs).toISOString(),
  },
  {
    id: "camp-rpgverse",
    onChainId: 3,
    title: "Aetheria: Community-Owned On-Chain Rogue-Lite",
    slug: "aetheria-on-chain-roguelite",
    summary: "A retro pixel procedural dungeon crawler where dungeons, loot, and lore are completely generated and permanently recorded on the blockchain.",
    storyMarkdown: `### The Vision
Games shut down when developer servers turn off. In Aetheria, the entire game engine, item generation mechanics, and dungeon seeds live eternally on-chain.

### Community Governance
Every backer receives governance voting weight over dungeon balance patches, new weapon classes, and lore additions.

### Perks
- **0.1 ETH**: Early backer alpha test pass & Genesis adventurer badge.
- **0.5 ETH**: Name a legendary relic in the dungeon generation table.
- **2.0 ETH**: Custom NPC guardian designed alongside our art team.`,
    category: "Gaming",
    bannerUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    targetEth: "12.0",
    raisedEth: "4.2",
    deadline: new Date(now + 9 * dayMs).toISOString(),
    creatorWallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    creatorName: "PixelForge Studios",
    creatorAvatar: "https://api.dicebear.com/7.x/identicon/svg?seed=pixelforge",
    status: "ACTIVE",
    fundingType: "ALL_OR_NOTHING",
    milestoneCount: 2,
    backersCount: 29,
    featured: false,
    createdAt: new Date(now - 5 * dayMs).toISOString(),
  },
  {
    id: "camp-waterdao",
    onChainId: 4,
    title: "AquaFlow: Sensor-Verified Clean Water Wells",
    slug: "aquaflow-sensor-verified-water",
    summary: "Deploying solar-powered atmospheric water generators with cryptographic water purity telemetry in drought-affected regions.",
    storyMarkdown: `### Transparency in Charity
Traditional charity donations often get lost in administrative overhead. AquaFlow builds IoT-enabled water filtration stations where every single liter generated and distributed is logged on a public blockchain ledger.

### Real-Time Proof of Impact
Donors can view real-time flow meters and water quality sensor data directly through our mobile and web app.`,
    category: "Community",
    bannerUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    targetEth: "6.0",
    raisedEth: "6.4",
    deadline: new Date(now + 3 * dayMs).toISOString(),
    creatorWallet: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    creatorName: "AquaFlow DAO",
    creatorAvatar: "https://api.dicebear.com/7.x/identicon/svg?seed=aquaflow",
    status: "SUCCEEDED",
    fundingType: "ALL_OR_NOTHING",
    milestoneCount: 2,
    backersCount: 84,
    featured: false,
    createdAt: new Date(now - 14 * dayMs).toISOString(),
  }
];

export const INITIAL_MILESTONES: MilestoneRecord[] = [
  {
    id: "ms-1",
    campaignId: "camp-solarnet",
    index: 0,
    title: "Prototype Firmware & PCB Validation",
    description: "Finalize hardware schematics, test ESP32 optical pulse sensor, and release open-source Gerber files.",
    percentage: 40,
    targetDate: "Month 2",
    status: "VOTING",
    votingDeadline: new Date(now + 4 * dayMs).toISOString(),
    votesForEth: "4.2",
    votesAgainstEth: "0.4",
  },
  {
    id: "ms-2",
    campaignId: "camp-solarnet",
    index: 1,
    title: "Manufacturing Pilot (100 Nodes)",
    description: "Assemble first batch of 100 weather-proof outdoor nodes and distribute to beta testing community.",
    percentage: 30,
    targetDate: "Month 4",
    status: "PENDING",
    votesForEth: "0",
    votesAgainstEth: "0",
  },
  {
    id: "ms-3",
    campaignId: "camp-solarnet",
    index: 2,
    title: "Peer-to-Peer Settlement Mainnet Launch",
    description: "Deploy audit-verified smart contracts to production and enable automated micro-transactions.",
    percentage: 30,
    targetDate: "Month 6",
    status: "PENDING",
    votesForEth: "0",
    votesAgainstEth: "0",
  },
  {
    id: "ms-4",
    campaignId: "camp-aivault",
    index: 0,
    title: "zkML Circuit Verification Engine",
    description: "Deliver Halo2 / Groth16 circuit proofs for quantized Llama inference.",
    percentage: 35,
    targetDate: "Completed",
    status: "PAID_OUT",
    votesForEth: "14.5",
    votesAgainstEth: "0.2",
  },
  {
    id: "ms-5",
    campaignId: "camp-aivault",
    index: 1,
    title: "GPU Node Runner Daemon",
    description: "Release CLI runner for RTX 4090 / A100 GPU hosts with automated staking rewards.",
    percentage: 35,
    targetDate: "In Progress",
    status: "VOTING",
    votingDeadline: new Date(now + 2 * dayMs).toISOString(),
    votesForEth: "12.8",
    votesAgainstEth: "1.1",
  },
  {
    id: "ms-6",
    campaignId: "camp-aivault",
    index: 2,
    title: "Public Developer Gateway & SDK",
    description: "TypeScript and Python SDKs for one-line verifiable model queries.",
    percentage: 30,
    targetDate: "Next Month",
    status: "PENDING",
    votesForEth: "0",
    votesAgainstEth: "0",
  }
];

export const INITIAL_CONTRIBUTIONS: ContributionRecord[] = [
  {
    id: "contrib-1",
    campaignId: "camp-solarnet",
    backerWallet: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    backerName: "Alex (Web3 Eco)",
    amountEth: "2.5",
    txHash: "0x78ab...91f2",
    tierName: "Guardian Tier",
    message: "Clean energy access is crucial! Full support for the ESP32 mesh.",
    createdAt: new Date(now - 3 * dayMs).toISOString(),
  },
  {
    id: "contrib-2",
    campaignId: "camp-solarnet",
    backerWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    backerName: "Anonymous Backer",
    amountEth: "1.25",
    txHash: "0x33dc...ae40",
    tierName: "Believer Tier",
    message: "Excited to see this in rural micro-grids.",
    createdAt: new Date(now - 2 * dayMs).toISOString(),
  },
  {
    id: "contrib-3",
    campaignId: "camp-aivault",
    backerWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    backerName: "ZeroKnowledge Fan",
    amountEth: "5.0",
    txHash: "0x918a...560a",
    tierName: "Core Patron",
    message: "Verifiable inference is the only way forward for autonomous agents.",
    createdAt: new Date(now - 5 * dayMs).toISOString(),
  }
];

export const INITIAL_UPDATES: UpdateRecord[] = [
  {
    id: "upd-1",
    campaignId: "camp-solarnet",
    title: "Phase 1 PCB Prototype Successful Bench Test!",
    content: "We just finished a 72-hour continuous test of the Helios Node v1 hardware connected to a 400W solar array. Zero packet loss over LoRaWAN!",
    authorWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    createdAt: new Date(now - 1 * dayMs).toISOString(),
  },
  {
    id: "upd-2",
    campaignId: "camp-aivault",
    title: "Zero-Knowledge Circuit Prover Benchmarks Released",
    content: "Proof generation speed has improved by 400% thanks to GPU acceleration shaders. Milestone 2 voting is now live!",
    authorWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    createdAt: new Date(now - 2 * dayMs).toISOString(),
  }
];

export const INITIAL_COMMENTS: CommentRecord[] = [
  {
    id: "com-1",
    campaignId: "camp-solarnet",
    authorWallet: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
    authorName: "DegenResearcher",
    content: "What is the expected hardware unit cost once manufactured at scale?",
    createdAt: new Date(now - 1 * dayMs).toISOString(),
  },
  {
    id: "com-2",
    campaignId: "camp-solarnet",
    authorWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    authorName: "Elena (Creator)",
    content: "Great question! We are targeting under $25 per node in quantities of 500+.",
    createdAt: new Date(now - 18 * 60 * 60 * 1000).toISOString(),
  }
];
