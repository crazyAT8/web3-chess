const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ChessNFT", function () {
  // Helper function to parse ether
  const parseEther = (amount) => ethers.parseEther(amount);
  let ChessNFT;
  let chessNFT;
  let owner;
  let user1;
  let user2;
  let user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    
    ChessNFT = await ethers.getContractFactory("ChessNFT");
    chessNFT = await ChessNFT.deploy();
    await chessNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await chessNFT.owner()).to.equal(owner.address);
    });

    it("Should have correct initial values", async function () {
      expect(await chessNFT.mintFee()).to.equal(parseEther("0.01"));
      expect(await chessNFT.maxSupply()).to.equal(10000);
      expect(await chessNFT.mintingEnabled()).to.be.true;
    });

    it("Should have correct name and symbol", async function () {
      expect(await chessNFT.name()).to.equal("ChessFi NFT");
      expect(await chessNFT.symbol()).to.equal("CHESS");
    });
  });

  describe("NFT Minting", function () {
    let mintFee;
    
    beforeEach(function () {
      mintFee = parseEther("0.01");
    });

    it("Should mint a single NFT", async function () {
      const nftType = 0; // PIECE
      const rarity = 0; // COMMON
      const name = "Test Piece";
      const description = "A test chess piece";
      const imageURI = "ipfs://QmTest";
      const mintPrice = parseEther("0.1");

      await expect(
        chessNFT.connect(user1).mintNFT(
          nftType,
          rarity,
          name,
          description,
          imageURI,
          mintPrice,
          { value: mintFee }
        )
      ).to.emit(chessNFT, "NFTMinted")
        .withArgs(1, user1.address, nftType, rarity);

      expect(await chessNFT.ownerOf(1)).to.equal(user1.address);
      expect(await chessNFT.tokenURI(1)).to.equal(imageURI);

      const metadata = await chessNFT.getNFTMetadata(1);
      expect(metadata.nftType).to.equal(nftType);
      expect(metadata.rarity).to.equal(rarity);
      expect(metadata.name).to.equal(name);
      expect(metadata.description).to.equal(description);
      expect(metadata.imageURI).to.equal(imageURI);
      expect(metadata.mintPrice).to.equal(mintPrice);
      expect(metadata.isTradeable).to.be.true;
      expect(metadata.creator).to.equal(user1.address);
    });

    it("Should fail if minting is disabled", async function () {
      await chessNFT.connect(owner).setMintingEnabled(false);

      await expect(
        chessNFT.connect(user1).mintNFT(
          0, 0, "Test", "Test", "ipfs://test", 0,
          { value: mintFee }
        )
      ).to.be.revertedWith("Minting is disabled");
    });

    it("Should fail if insufficient mint fee", async function () {
      await expect(
        chessNFT.connect(user1).mintNFT(
          0, 0, "Test", "Test", "ipfs://test", 0,
          { value: parseEther("0.005") }
        )
      ).to.be.revertedWith("Insufficient mint fee");
    });

    it("Should fail if name is empty", async function () {
      await expect(
        chessNFT.connect(user1).mintNFT(
          0, 0, "", "Test", "ipfs://test", 0,
          { value: mintFee }
        )
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should fail if image URI is empty", async function () {
      await expect(
        chessNFT.connect(user1).mintNFT(
          0, 0, "Test", "Test", "", 0,
          { value: mintFee }
        )
      ).to.be.revertedWith("Image URI cannot be empty");
    });
  });

  describe("Chess Set Minting", function () {
    let mintFee;
    
    beforeEach(function () {
      mintFee = parseEther("0.02"); // 2x fee for set
    });

    it("Should mint a complete chess set", async function () {
      const setName = "Royal Set";
      const description = "A royal chess set";
      const imageURI = "ipfs://QmSet";
      const pieceURIs = Array(32).fill("ipfs://QmPiece");

      await expect(
        chessNFT.connect(user1).mintChessSet(
          setName,
          description,
          imageURI,
          pieceURIs,
          { value: mintFee }
        )
      ).to.emit(chessNFT, "NFTMinted")
        .withArgs(1, user1.address, 3, 2); // SET, RARE

      // Check set NFT
      expect(await chessNFT.ownerOf(1)).to.equal(user1.address);
      const setMetadata = await chessNFT.getNFTMetadata(1);
      expect(setMetadata.nftType).to.equal(3); // SET
      expect(setMetadata.rarity).to.equal(2); // RARE
      expect(setMetadata.name).to.equal(setName);

      // Check individual pieces (tokens 2-33)
      for (let i = 2; i <= 33; i++) {
        expect(await chessNFT.ownerOf(i)).to.equal(user1.address);
        const pieceMetadata = await chessNFT.getNFTMetadata(i);
        expect(pieceMetadata.nftType).to.equal(0); // PIECE
        expect(pieceMetadata.rarity).to.equal(0); // COMMON
        expect(pieceMetadata.isTradeable).to.be.false;
      }
    });

    it("Should fail if wrong number of piece URIs", async function () {
      const pieceURIs = Array(30).fill("ipfs://QmPiece"); // Wrong number

      await expect(
        chessNFT.connect(user1).mintChessSet(
          "Test Set",
          "Test",
          "ipfs://test",
          pieceURIs,
          { value: mintFee }
        )
      ).to.be.revertedWith("Must provide 32 piece URIs");
    });
  });

  describe("NFT Burning", function () {
    beforeEach(async function () {
      await chessNFT.connect(user1).mintNFT(
        0, 0, "Test", "Test", "ipfs://test", 0,
        { value: parseEther("0.01") }
      );
    });

    it("Should allow owner to burn NFT", async function () {
      await expect(chessNFT.connect(user1).burnNFT(1))
        .to.emit(chessNFT, "NFTBurned")
        .withArgs(1, user1.address);

      await expect(chessNFT.ownerOf(1)).to.be.revertedWith("ERC721: invalid token ID");
    });

    it("Should fail if not owner or approved", async function () {
      await expect(
        chessNFT.connect(user2).burnNFT(1)
      ).to.be.revertedWith("Not authorized to burn");
    });
  });

  describe("Metadata Management", function () {
    beforeEach(async function () {
      await chessNFT.connect(user1).mintNFT(
        0, 0, "Test", "Test", "ipfs://test", 0,
        { value: parseEther("0.01") }
      );
    });

    it("Should allow owner to update rarity", async function () {
      await expect(chessNFT.connect(owner).updateRarity(1, 4)) // LEGENDARY
        .to.emit(chessNFT, "RarityUpdated")
        .withArgs(1, 4);

      const metadata = await chessNFT.getNFTMetadata(1);
      expect(metadata.rarity).to.equal(4);
    });

    it("Should allow owner to update mint price", async function () {
      const newPrice = parseEther("0.5");
      await expect(chessNFT.connect(owner).updateMintPrice(1, newPrice))
        .to.emit(chessNFT, "MintPriceUpdated")
        .withArgs(1, newPrice);

      const metadata = await chessNFT.getNFTMetadata(1);
      expect(metadata.mintPrice).to.equal(newPrice);
    });

    it("Should fail if non-owner tries to update metadata", async function () {
      await expect(
        chessNFT.connect(user2).updateRarity(1, 4)
      ).to.be.revertedWithCustomError(chessNFT, "OwnableUnauthorizedAccount");
    });
  });

  describe("Collection Queries", function () {
    beforeEach(async function () {
      // Mint different types of NFTs
      await chessNFT.connect(user1).mintNFT(0, 0, "Piece", "Piece", "ipfs://piece", 0, { value: parseEther("0.01") });
      await chessNFT.connect(user1).mintNFT(1, 1, "Board", "Board", "ipfs://board", 0, { value: parseEther("0.01") });
      await chessNFT.connect(user1).mintNFT(2, 2, "Avatar", "Avatar", "ipfs://avatar", 0, { value: parseEther("0.01") });
    });

    it("Should get tokens by owner", async function () {
      const tokens = await chessNFT.getTokensByOwner(user1.address);
      expect(tokens.length).to.equal(3);
      expect(tokens[0]).to.equal(1);
      expect(tokens[1]).to.equal(2);
      expect(tokens[2]).to.equal(3);
    });

    it("Should get tokens by type", async function () {
      const pieces = await chessNFT.getTokensByType(0, user1.address); // PIECE
      const boards = await chessNFT.getTokensByType(1, user1.address); // BOARD
      const avatars = await chessNFT.getTokensByType(2, user1.address); // AVATAR

      expect(pieces.length).to.equal(1);
      expect(boards.length).to.equal(1);
      expect(avatars.length).to.equal(1);
      expect(pieces[0]).to.equal(1);
      expect(boards[0]).to.equal(2);
      expect(avatars[0]).to.equal(3);
    });

    it("Should get tokens by rarity", async function () {
      const common = await chessNFT.getTokensByRarity(0, user1.address); // COMMON
      const uncommon = await chessNFT.getTokensByRarity(1, user1.address); // UNCOMMON
      const rare = await chessNFT.getTokensByRarity(2, user1.address); // RARE

      expect(common.length).to.equal(1);
      expect(uncommon.length).to.equal(1);
      expect(rare.length).to.equal(1);
    });

    it("Should get collection statistics", async function () {
      const stats = await chessNFT.getCollectionStats();
      expect(stats.totalSupply).to.equal(3);
      expect(stats.typeCountsArray[0]).to.equal(1); // PIECE
      expect(stats.typeCountsArray[1]).to.equal(1); // BOARD
      expect(stats.typeCountsArray[2]).to.equal(1); // AVATAR
      expect(stats.rarityCountsArray[0]).to.equal(1); // COMMON
      expect(stats.rarityCountsArray[1]).to.equal(1); // UNCOMMON
      expect(stats.rarityCountsArray[2]).to.equal(1); // RARE
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to set minting enabled", async function () {
      await chessNFT.connect(owner).setMintingEnabled(false);
      expect(await chessNFT.mintingEnabled()).to.be.false;

      await chessNFT.connect(owner).setMintingEnabled(true);
      expect(await chessNFT.mintingEnabled()).to.be.true;
    });

    it("Should allow owner to set mint fee", async function () {
      const newFee = parseEther("0.02");
      await chessNFT.connect(owner).setMintFee(newFee);
      expect(await chessNFT.mintFee()).to.equal(newFee);
    });

    it("Should allow owner to set max supply", async function () {
      const newMaxSupply = 5000;
      await chessNFT.connect(owner).setMaxSupply(newMaxSupply);
      expect(await chessNFT.maxSupply()).to.equal(newMaxSupply);
    });

    it("Should fail if non-owner tries to call admin functions", async function () {
      await expect(
        chessNFT.connect(user1).setMintingEnabled(false)
      ).to.be.revertedWithCustomError(chessNFT, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to withdraw fees", async function () {
      // Mint some NFTs to generate fees
      await chessNFT.connect(user1).mintNFT(0, 0, "Test", "Test", "ipfs://test", 0, { value: parseEther("0.01") });
      await chessNFT.connect(user2).mintNFT(0, 0, "Test2", "Test2", "ipfs://test2", 0, { value: parseEther("0.01") });

      const initialBalance = await owner.getBalance();
      await chessNFT.connect(owner).withdrawFees();
      const finalBalance = await owner.getBalance();

      expect(finalBalance).to.be.gt(initialBalance);
    });
  });

  describe("ERC721 Compliance", function () {
    beforeEach(async function () {
      await chessNFT.connect(user1).mintNFT(0, 0, "Test", "Test", "ipfs://test", 0, { value: parseEther("0.01") });
    });

    it("Should support ERC721 interface", async function () {
      expect(await chessNFT.supportsInterface("0x80ac58cd")).to.be.true; // ERC721
      expect(await chessNFT.supportsInterface("0x5b5e139f")).to.be.true; // ERC721Metadata
    });

    it("Should allow token transfers", async function () {
      await chessNFT.connect(user1).transferFrom(user1.address, user2.address, 1);
      expect(await chessNFT.ownerOf(1)).to.equal(user2.address);
    });

    it("Should allow approval and transfer", async function () {
      await chessNFT.connect(user1).approve(user2.address, 1);
      await chessNFT.connect(user2).transferFrom(user1.address, user3.address, 1);
      expect(await chessNFT.ownerOf(1)).to.equal(user3.address);
    });
  });
}); 