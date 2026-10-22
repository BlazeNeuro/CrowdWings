const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  const CrowdfundingPlatform = await hre.ethers.getContractFactory("CrowdfundingPlatform");
  const platform = await CrowdfundingPlatform.deploy();
  await platform.waitForDeployment();

  const address = await platform.getAddress();
  console.log(`CrowdfundingPlatform deployed to: ${address}`);

  // Create lib/contracts directory if needed
  const contractsDir = path.join(__dirname, "..", "lib", "contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  // Get artifact for ABI
  const artifact = await hre.artifacts.readArtifact("CrowdfundingPlatform");

  const contractData = {
    address: address,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    abi: artifact.abi,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(contractsDir, "CrowdfundingPlatform.json"),
    JSON.stringify(contractData, null, 2)
  );

  console.log(`Saved contract artifact to lib/contracts/CrowdfundingPlatform.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
