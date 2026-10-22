import type { Abi } from "viem";
import contractArtifact from "./CrowdfundingPlatform.json";

export const CROWDFUNDING_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  contractArtifact.address ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3") as `0x${string}`;

export const CROWDFUNDING_ABI = contractArtifact.abi as Abi;
