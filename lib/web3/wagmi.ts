import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { hardhat, localhost, sepolia, mainnet } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "CrowdWings",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "c0a53b5fa53f2c99a613247071ef28ae",
  chains: [
    hardhat,
    localhost,
    sepolia,
    ...(process.env.NODE_ENV === "production" ? [mainnet] : []),
  ],
  ssr: true,
});
