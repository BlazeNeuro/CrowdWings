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

const now = 1774000000000;
const dayMs = 24 * 60 * 60 * 1000;

export const INITIAL_CAMPAIGNS: CampaignRecord[] = [
  {
    id: "camp-florasprout",
    onChainId: 1,
    title: "FloraSprout: Autonomous Drone Seedling & Native Tree Reforestation",
    slug: "florasprout-drone-seedling-reforestation",
    summary: "Deploying drone seed-dispersal pods and IoT sapling moisture telemetry to plant and grow 50,000 native hardwood trees across degraded watersheds.",
    storyMarkdown: `### The Mission: Healing Our Earth from the Soil Up
Deforestation claims over 10 million hectares of planetary canopy annually. Traditional manual tree planting cannot scale quickly enough to restore critical biodiversity corridors.

### Our Solution: Bio-Inoculated Seed Pods & Drone Dispersal
FloraSprout manufactures organic nutrient seed capsules containing mycorrhizal fungi, biochar, and moisture-retaining gel. Our autonomous solar-charged drones plant up to 20,000 seeds per day across difficult mountainous terrain.

### Milestone Deliverables:
- **Phase 1**: Formulation of native hardwood seed pellets (Oak, Cedar, Walnut) and greenhouse germination tests.
- **Phase 2**: Aerial dispersion over 400 hectares of watershed land.
- **Phase 3**: IoT canopy sensor network installation and verifiable satellite vegetative growth index tracking on Ethereum.`,
    category: "Reforestation",
    bannerUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
    targetEth: "12.0",
    raisedEth: "8.4",
    deadline: new Date(now + 21 * dayMs).toISOString(),
    creatorWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    creatorName: "GreenCanopy Earth DAO",
    creatorAvatar: "https://api.dicebear.com/7.x/identicon/svg?seed=greencanopy",
    status: "ACTIVE",
    fundingType: "ALL_OR_NOTHING",
    milestoneCount: 3,
    backersCount: 94,
    featured: true,
    createdAt: new Date(now - 8 * dayMs).toISOString(),
  },
  {
    id: "camp-verdantearth",
    onChainId: 2,
    title: "VerdantEarth: Open-Source Regenerative Agroforestry & Food Forests",
    slug: "verdantearth-regenerative-agroforestry",
    summary: "Restoring dead desertified farmland into multi-layered perennial food forests that store carbon and harvest rainwater naturally.",
    storyMarkdown: `### Healing Depleted Farmland
Monoculture and chemical fertilizers have stripped topsoil of its natural microbiology. VerdantEarth transforms barren farmland into thriving permaculture food forests with native companion plants, fruit trees, and perennial ground cover.

### How Funds Are Used:
- **40% Seedling stock**: 15,000 heirloom fruit and nitrogen-fixing trees.
- **30% Rainwater harvesting**: Swales, retention ponds, and gravity-fed drip systems.
- **30% Community stewardship**: Training local farmers in regenerative agroforestry and open-source sensor monitoring.`,
    category: "Agroforestry",
    bannerUrl: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=1200&q=80",
    targetEth: "8.0",
    raisedEth: "5.6",
    deadline: new Date(now + 14 * dayMs).toISOString(),
    creatorWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    creatorName: "EarthPulse Permaculture",
    creatorAvatar: "https://api.dicebear.com/7.x/identicon/svg?seed=earthpulse",
    status: "ACTIVE",
    fundingType: "ALL_OR_NOTHING",
    milestoneCount: 3,
    backersCount: 68,
    featured: true,
    createdAt: new Date(now - 10 * dayMs).toISOString(),
  },
  {
    id: "camp-mangroveroots",
    onChainId: 3,
    title: "MangroveRoots: Coastal Blue Carbon & Tidal Mangrove Restoration",
    slug: "mangroveroots-coastal-blue-carbon",
    summary: "Propagating 100,000 red mangrove saplings to safeguard coastlines against storm surges and capture 4x more carbon than terrestrial forests.",
    storyMarkdown: `### Protecting Marine Sanctuaries & Coastal Communities
Mangrove forests are the nursery of the ocean. Their complex roots trap sediment, prevent coastal erosion, and provide a critical sanctuary for endangered marine life while sequestering vast quantities of blue carbon.

### Verifiable Milestone Releases:
- **Milestone 1**: 50,000 propagules germinated in coastal nurseries.
- **Milestone 2**: Tidal mudflat transplantation and biodegradable root cage protection.
- **Milestone 3**: Drone photogrammetry and survivor rate verification before escrow release.`,
    category: "Planet Rescue",
    bannerUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80",
    targetEth: "10.0",
    raisedEth: "10.5",
    deadline: new Date(now + 5 * dayMs).toISOString(),
    creatorWallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    creatorName: "OceanBlue Alliance",
    creatorAvatar: "https://api.dicebear.com/7.x/identicon/svg?seed=oceanblue",
    status: "SUCCEEDED",
    fundingType: "ALL_OR_NOTHING",
    milestoneCount: 3,
    backersCount: 142,
    featured: false,
    createdAt: new Date(now - 15 * dayMs).toISOString(),
  },
  {
    id: "camp-canopyguard",
    onChainId: 4,
    title: "CanopyGuard: Amazon Rainforest Biological Corridor Land Buyback",
    slug: "canopyguard-amazon-corridor-preservation",
    summary: "Acquiring vulnerable tropical rainforest land to permanently stop deforestation and reforest clear-cut gaps with native Brazilian nut and açaí palms.",
    storyMarkdown: `### Preserving the Lungs of the Planet
Every square kilometer of primary Amazon rainforest protects millions of plant and animal species. CanopyGuard places key biological corridors into permanent non-profit land trusts, replanting clearings with endangered native canopy trees.

### Transparency Guaranteed by Smart Contracts
Every parcel of land purchased and every hectare replanted is minted as a verifiable conservation record with satellite heat maps and bio-acoustic bird survey data.`,
    category: "Biodiversity",
    bannerUrl: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80",
    targetEth: "16.0",
    raisedEth: "12.3",
    deadline: new Date(now + 28 * dayMs).toISOString(),
    creatorWallet: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    creatorName: "Amazonia Sacred Land Trust",
    creatorAvatar: "https://api.dicebear.com/7.x/identicon/svg?seed=amazonia",
    status: "ACTIVE",
    fundingType: "ALL_OR_NOTHING",
    milestoneCount: 3,
    backersCount: 110,
    featured: false,
    createdAt: new Date(now - 5 * dayMs).toISOString(),
  },
  {
    id: "camp-urbangreens",
    onChainId: 5,
    title: "UrbanGreens: Vertical Botanical Hubs & Air-Purifying Moss Sanctuaries",
    slug: "urbangreens-botanical-living-walls",
    summary: "Building solar-powered vertical living walls covered in native ferns, moss, and flowering pollinator plants to combat urban heat islands.",
    storyMarkdown: `### Bringing Nature Back into Concrete Cities
Cities suffer from severe heat island effects and dangerous particulate air pollution. UrbanGreens builds vertical living plant systems equipped with automated rainwater misting.

### Expected Impact:
- Up to 4.5°C reduction in ambient urban micro-temperatures.
- Absorption of fine particulate matter (PM2.5) by living moss mats.
- Re-establishment of native butterfly and honeybee corridors in downtown districts.`,
    category: "Clean Cities",
    bannerUrl: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80",
    targetEth: "6.0",
    raisedEth: "6.35",
    deadline: new Date(now + 2 * dayMs).toISOString(),
    creatorWallet: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
    creatorName: "BioCity Urban Ecology",
    creatorAvatar: "https://api.dicebear.com/7.x/identicon/svg?seed=biocity",
    status: "SUCCEEDED",
    fundingType: "ALL_OR_NOTHING",
    milestoneCount: 2,
    backersCount: 78,
    featured: false,
    createdAt: new Date(now - 12 * dayMs).toISOString(),
  }
];

export const INITIAL_MILESTONES: MilestoneRecord[] = [
  {
    id: "ms-1",
    campaignId: "camp-florasprout",
    index: 0,
    title: "Native Seed Pod Formulation & Biochar Inoculation",
    description: "Produce 50,000 bio-encapsulated seed balls inoculated with mycorrhizal fungi and organic water-retaining biochar.",
    percentage: 40,
    targetDate: "Month 1",
    status: "VOTING",
    votingDeadline: new Date(now + 5 * dayMs).toISOString(),
    votesForEth: "6.8",
    votesAgainstEth: "0.2",
  },
  {
    id: "ms-2",
    campaignId: "camp-florasprout",
    index: 1,
    title: "Drone Aerial Dispersal over 400 Hectares",
    description: "Deploy autonomous GPS-guided seeding drones across degraded watershed hillsides.",
    percentage: 30,
    targetDate: "Month 3",
    status: "PENDING",
    votesForEth: "0",
    votesAgainstEth: "0",
  },
  {
    id: "ms-3",
    campaignId: "camp-florasprout",
    index: 2,
    title: "Sapling Germination & Satellite Canopy Proof",
    description: "Verify seedling emergence and canopy coverage using multi-spectral satellite imagery.",
    percentage: 30,
    targetDate: "Month 6",
    status: "PENDING",
    votesForEth: "0",
    votesAgainstEth: "0",
  },
  {
    id: "ms-4",
    campaignId: "camp-verdantearth",
    index: 0,
    title: "Swale Excavation & Rainwater Retention Ponds",
    description: "Landscape earthworks to capture 100% of seasonal runoff and stop soil erosion.",
    percentage: 35,
    targetDate: "Month 1",
    status: "VOTING",
    votingDeadline: new Date(now + 3 * dayMs).toISOString(),
    votesForEth: "4.5",
    votesAgainstEth: "0.1",
  },
  {
    id: "ms-5",
    campaignId: "camp-verdantearth",
    index: 1,
    title: "Planting 15,000 Nitrogen-Fixing & Fruit Trees",
    description: "Establish the upper and middle canopy layers with native companion plants.",
    percentage: 35,
    targetDate: "Month 3",
    status: "PENDING",
    votesForEth: "0",
    votesAgainstEth: "0",
  },
  {
    id: "ms-6",
    campaignId: "camp-verdantearth",
    index: 2,
    title: "Microbiology Sensor Grid & Open Telemetry",
    description: "Install soil moisture and microbial activity sensors feeding open live data.",
    percentage: 30,
    targetDate: "Month 5",
    status: "PENDING",
    votesForEth: "0",
    votesAgainstEth: "0",
  },
  {
    id: "ms-7",
    campaignId: "camp-mangroveroots",
    index: 0,
    title: "Coastal Nursery Germination of 50,000 Saplings",
    description: "Nurture red mangrove propagules in brackish water nurseries until robust root initiation.",
    percentage: 40,
    targetDate: "Completed",
    status: "PAID_OUT",
    votesForEth: "9.8",
    votesAgainstEth: "0.1",
  },
  {
    id: "ms-8",
    campaignId: "camp-mangroveroots",
    index: 1,
    title: "Tidal Mudflat Transplantation",
    description: "Secure saplings in intertidal zones with bio-degradable protective frames.",
    percentage: 30,
    targetDate: "Completed",
    status: "PAID_OUT",
    votesForEth: "10.1",
    votesAgainstEth: "0.0",
  },
  {
    id: "ms-9",
    campaignId: "camp-mangroveroots",
    index: 2,
    title: "LiDAR Blue Carbon & Biomass Verification",
    description: "Measure root depth and aerial biomass to calculate net carbon sequestration.",
    percentage: 30,
    targetDate: "In Progress",
    status: "VOTING",
    votingDeadline: new Date(now + 2 * dayMs).toISOString(),
    votesForEth: "8.9",
    votesAgainstEth: "0.3",
  }
];

export const INITIAL_CONTRIBUTIONS: ContributionRecord[] = [
  {
    id: "contrib-1",
    campaignId: "camp-florasprout",
    backerWallet: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    backerName: "Elena (EcoGuardian)",
    amountEth: "3.5",
    txHash: "0x78ab...91f2",
    tierName: "Canopy Guardian",
    message: "Planting native trees is the single best climate investment. Full support for the drone seeders!",
    createdAt: new Date(now - 3 * dayMs).toISOString(),
  },
  {
    id: "contrib-2",
    campaignId: "camp-florasprout",
    backerWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    backerName: "Marcus (Soil Regenerator)",
    amountEth: "2.0",
    txHash: "0x33dc...ae40",
    tierName: "Sprout Patron",
    message: "Looking forward to seeing the satellite germination updates.",
    createdAt: new Date(now - 2 * dayMs).toISOString(),
  },
  {
    id: "contrib-3",
    campaignId: "camp-verdantearth",
    backerWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    backerName: "Permaculture Network",
    amountEth: "2.5",
    txHash: "0x918a...560a",
    tierName: "Earth Steward",
    message: "Food forests heal both the planet and community nutrition.",
    createdAt: new Date(now - 4 * dayMs).toISOString(),
  }
];

export const INITIAL_UPDATES: UpdateRecord[] = [
  {
    id: "upd-1",
    campaignId: "camp-florasprout",
    title: "First 15,000 Seed Pellets Prepared with Biochar Inoculation!",
    content: "Our greenhouse team has completed formulation for the first batch of drought-hardy native oak and cedar seed pods. Mycorrhizal colonization rates exceeded 95% in lab tests!",
    authorWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    createdAt: new Date(now - 1 * dayMs).toISOString(),
  },
  {
    id: "upd-2",
    campaignId: "camp-verdantearth",
    title: "Rainwater Swales Finished Ahead of Schedule",
    content: "All three contour swales are excavated and lined with organic mulch. First rainfall captured over 180,000 liters of natural groundwater recharge!",
    authorWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    createdAt: new Date(now - 2 * dayMs).toISOString(),
  }
];

export const INITIAL_COMMENTS: CommentRecord[] = [
  {
    id: "com-1",
    campaignId: "camp-florasprout",
    authorWallet: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
    authorName: "ReforestNow",
    content: "What native tree species are selected for high-altitude rocky slopes?",
    createdAt: new Date(now - 1 * dayMs).toISOString(),
  },
  {
    id: "com-2",
    campaignId: "camp-florasprout",
    authorWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    authorName: "GreenCanopy (Creator)",
    content: "We use a mix of Juniper, Mountain Oak, and fast-rooting shrubs to anchor topsoil before hardwood emergence.",
    createdAt: new Date(now - 18 * 60 * 60 * 1000).toISOString(),
  }
];
