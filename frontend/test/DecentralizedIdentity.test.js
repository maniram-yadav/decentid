const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DecentralizedIdentity", function () {
  let DecentralizedIdentity;
  let decentralizedIdentity;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    DecentralizedIdentity = await ethers.getContractFactory("DecentralizedIdentity");
    decentralizedIdentity = await DecentralizedIdentity.deploy();
    await decentralizedIdentity.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const own = await decentralizedIdentity.owner();
      const contractAdd = decentralizedIdentity.address
      console.log(own);
      expect(await decentralizedIdentity.owner()).to.equal(owner.address);
    });
  });

  describe("Identity Management", function () {
    it("Should create a new identity", async function () {
      await expect(
        decentralizedIdentity.connect(addr1).createIdentity(
          "Alice",
          "alice@example.com",
          25,
          "USA"
        )
      )
        .to.emit(decentralizedIdentity, "IdentityCreated")
        .withArgs(addr1.address, "Alice");

      const identity = await decentralizedIdentity.identities(addr1.address);
      expect(identity.name).to.equal("Alice");
      expect(identity.email).to.equal("alice@example.com");
      expect(identity.age).to.equal(25);
      expect(identity.country).to.equal("USA");
      expect(identity.exists).to.be.true;
    });

    it("Should prevent duplicate identity creation", async function () {
      await decentralizedIdentity.connect(addr1).createIdentity(
        "Alice",
        "alice@example.com",
        25,
        "USA"
      );

      await expect(
        decentralizedIdentity.connect(addr1).createIdentity(
          "Alice",
          "alice@example.com",
          25,
          "USA"
        )
      ).to.be.revertedWith("Identity already exists");
    });

    it("Should update an existing identity", async function () {
      await decentralizedIdentity.connect(addr1).createIdentity(
        "Alice",
        "alice@example.com",
        25,
        "USA"
      );

      await expect(
        decentralizedIdentity.connect(addr1).updateIdentity(
          "Alice Updated",
          "alice.updated@example.com",
          26,
          "Canada"
        )
      )
        .to.emit(decentralizedIdentity, "IdentityUpdated")
        .withArgs(addr1.address, "Alice Updated");

      const identity = await decentralizedIdentity.identities(addr1.address);
      expect(identity.name).to.equal("Alice Updated");
      expect(identity.email).to.equal("alice.updated@example.com");
      expect(identity.age).to.equal(26);
      expect(identity.country).to.equal("Canada");
    });

    it("Should get an existing identity", async function () {
      await decentralizedIdentity.connect(addr1).createIdentity(
        "Alice",
        "alice@example.com",
        25,
        "USA"
      );

      const identity = await decentralizedIdentity.getIdentity(addr1.address);
      expect(identity.name).to.equal("Alice");
      expect(identity.email).to.equal("alice@example.com");
    });

    it("Should delete an existing identity", async function () {
      await decentralizedIdentity.connect(addr1).createIdentity(
        "Alice",
        "alice@example.com",
        25,
        "USA"
      );

      await decentralizedIdentity.connect(addr1).deleteIdentity();

      const identity = await decentralizedIdentity.identities(addr1.address);
      expect(identity.exists).to.be.false;
      expect(await decentralizedIdentity.registeredAddresses(addr1.address)).to.be.false;
    });

    it("Should prevent updating non-existent identity", async function () {
      await expect(
        decentralizedIdentity.connect(addr1).updateIdentity(
          "Alice",
          "alice@example.com",
          25,
          "USA"
        )
      ).to.be.revertedWith("Identity does not exist");
    });

    it("Should prevent getting non-existent identity", async function () {
      await expect(
        decentralizedIdentity.getIdentity(addr1.address)
      ).to.be.revertedWith("Identity does not exist");
    });

    it("Should prevent deleting non-existent identity", async function () {
      await expect(
        decentralizedIdentity.connect(addr1).deleteIdentity()
      ).to.be.revertedWith("Identity does not exist");
    });
  });

});