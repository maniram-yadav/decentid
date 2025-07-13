const hre = require("hardhat");

async function main() {
  const DecentralizedIdentity = await ethers.getContractFactory("DecentralizedIdentity");
  const decentralizedIdentity = await DecentralizedIdentity.deploy();

  const de = await decentralizedIdentity.waitForDeployment();
  console.log(`DecentralizedIdentity deployed to ${await decentralizedIdentity.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});