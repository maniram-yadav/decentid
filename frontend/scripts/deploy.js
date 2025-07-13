const hre = require("hardhat");

async function main() {
  const DecentralizedIdentity = await hre.ethers.getContractFactory("DecentralizedIdentity");
  const decentralizedIdentity = await DecentralizedIdentity.deploy();

  await decentralizedIdentity.deployed();

  console.log(
    `DecentralizedIdentity deployed to ${decentralizedIdentity.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});