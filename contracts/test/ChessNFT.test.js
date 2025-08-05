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
      ).to.be.revertedWithCustomError(chessNFT, "MintingDisabled");
    });

    it("Should fail if insufficient mint fee", async function () {
      await expect(
        chessNFT.connect(user1).mintNFT(
          0, 0, "Test", "Test", "ipfs://test", 0,
          { value: parseEther("0.005") }
        )
      ).to.be.revertedWithCustomError(chessNFT, "InsufficientMintFee");
    });

    it("Should fail if name is empty", async function () {
      await expect(
        chessNFT.connect(user1).mintNFT(
          0, 0, "", "Test", "ipfs://test", 0,
          { value: mintFee }
        )
      ).to.be.revertedWithCustomError(chessNFT, "InvalidName");
    });

    it("Should fail if image URI is empty", async function () {
      await expect(
        chessNFT.connect(user1).mintNFT(
          0, 0, "Test", "Test", "", 0,
          { value: mintFee }
        )
      ).to.be.revertedWithCustomError(chessNFT, "InvalidImageURI");
    });

    it("Should fail if max supply reached", async function () {
      // Set max supply to 1 for testing
      await chessNFT.connect(owner).setMaxSupply(1);
      
      // Mint first NFT
      await chessNFT.connect(user1).mintNFT(
        0, 0, "Test1", "Test1", "ipfs://test1", 0,
        { value: mintFee }
      );
      
      // Try to mint second NFT
      await expect(
        chessNFT.connect(user2).mintNFT(
          0, 0, "Test2", "Test2", "ipfs://test2", 0,
          { value: mintFee }
        )
      ).to.be.revertedWithCustomError(chessNFT, "MaxSupplyReached");
    });
  });

  describe("Chess Set Minting", function () {
    let mintFee;
    
    beforeEach(function () {
      mintFee = parseEther("0.01");
    });

    it("Should mint a complete chess set", async function () {
      const setName = "Classic Set";
      const description = "A classic chess set";
      const imageURI = "ipfs://QmSet";
      const pieceURIs = [
        "ipfs://QmKing", "ipfs://QmQueen", "ipfs://QmRook1", "ipfs://QmRook2",
        "ipfs://QmBishop1", "ipfs://QmBishop2", "ipfs://QmKnight1", "ipfs://QmKnight2",
        "ipfs://QmPawn1", "ipfs://QmPawn2", "ipfs://QmPawn3", "ipfs://QmPawn4",
        "ipfs://QmPawn5", "ipfs://QmPawn6", "ipfs://QmPawn7", "ipfs://QmPawn8"
      ];

      await expect(
        chessNFT.connect(user1).mintChessSet(
          setName,
          description,
          imageURI,
          pieceURIs,
          { value: mintFee }
        )
      ).to.emit(chessNFT, "ChessSetMinted")
        .withArgs(1, user1.address, setName);

      // Check that all pieces were minted
      for (let i = 1; i <= 16; i++) {
        expect(await chessNFT.ownerOf(i)).to.equal(user1.address);
      }
    });

    it("Should fail if wrong number of piece URIs", async function () {
      const pieceURIs = ["ipfs://QmKing", "ipfs://QmQueen"]; // Only 2 pieces

      await expect(
        chessNFT.connect(user1).mintChessSet(
          "Test Set",
          "Test",
          "ipfs://QmSet",
          pieceURIs,
          { value: mintFee }
        )
      ).to.be.revertedWithCustomError(chessNFT, "InvalidPieceCount");
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

      await expect(chessNFT.ownerOf(1)).to.be.revertedWithCustomError(chessNFT, "ERC721NonexistentToken");
    });

    it("Should fail if not owner or approved", async function () {
      await expect(
        chessNFT.connect(user2).burnNFT(1)
      ).to.be.revertedWithCustomError(chessNFT, "ERC721InsufficientApproval");
    });
  });

  describe("Metadata Management", function () {
    beforeEach(async function () {
      await chessNFT.connect(user1).mintNFT(
        0, 0, "Test", "Test", "ipfs://test", parseEther("0.1"),
        { value: parseEther("0.01") }
      );
    });

    it("Should allow owner to update rarity", async function () {
      await expect(chessNFT.connect(owner).updateRarity(1, 2)) // RARE
        .to.emit(chessNFT, "RarityUpdated")
        .withArgs(1, 2);

      const metadata = await chessNFT.getNFTMetadata(1);
      expect(metadata.rarity).to.equal(2);
    });

    it("Should allow owner to update mint price", async function () {
      const newPrice = parseEther("0.2");
      await expect(chessNFT.connect(owner).updateMintPrice(1, newPrice))
        .to.emit(chessNFT, "MintPriceUpdated")
        .withArgs(1, newPrice);

      const metadata = await chessNFT.getNFTMetadata(1);
      expect(metadata.mintPrice).to.equal(newPrice);
    });

    it("Should fail if non-owner tries to update metadata", async function () {
      await expect(
        chessNFT.connect(user1).updateRarity(1, 2)
      ).to.be.revertedWithCustomError(chessNFT, "OwnableUnauthorizedAccount");
    });
  });

  describe("Collection Queries", function () {
    beforeEach(async function () {
      // Mint several NFTs
      await chessNFT.connect(user1).mintNFT(0, 0, "Piece1", "Test", "ipfs://1", 0, { value: parseEther("0.01") });
      await chessNFT.connect(user1).mintNFT(1, 1, "Board1", "Test", "ipfs://2", 0, { value: parseEther("0.01") });
      await chessNFT.connect(user2).mintNFT(2, 2, "Avatar1", "Test", "ipfs://3", 0, { value: parseEther("0.01") });
    });

    it("Should get tokens by owner", async function () {
      const user1Tokens = await chessNFT.getTokensByOwner(user1.address);
      const user2Tokens = await chessNFT.getTokensByOwner(user2.address);

      expect(user1Tokens.length).to.equal(2);
      expect(user2Tokens.length).to.equal(1);
      expect(user1Tokens[0]).to.equal(1);
      expect(user1Tokens[1]).to.equal(2);
      expect(user2Tokens[0]).to.equal(3);
    });

    it("Should get tokens by type", async function () {
      const pieces = await chessNFT.getTokensByType(0); // PIECE
      const boards = await chessNFT.getTokensByType(1); // BOARD
      const avatars = await chessNFT.getTokensByType(2); // AVATAR

      expect(pieces.length).to.equal(1);
      expect(boards.length).to.equal(1);
      expect(avatars.length).to.equal(1);
      expect(pieces[0]).to.equal(1);
      expect(boards[0]).to.equal(2);
      expect(avatars[0]).to.equal(3);
    });

    it("Should get tokens by rarity", async function () {
      const common = await chessNFT.getTokensByRarity(0); // COMMON
      const rare = await chessNFT.getTokensByRarity(1); // RARE
      const epic = await chessNFT.getTokensByRarity(2); // EPIC

      expect(common.length).to.equal(1);
      expect(rare.length).to.equal(1);
      expect(epic.length).to.equal(1);
      expect(common[0]).to.equal(1);
      expect(rare[0]).to.equal(2);
      expect(epic[0]).to.equal(3);
    });

    it("Should get collection statistics", async function () {
      const stats = await chessNFT.getCollectionStats();
      
      expect(stats.totalSupply).to.equal(3);
      expect(stats.totalMinted).to.equal(3);
      expect(stats.totalBurned).to.equal(0);
      expect(stats.piecesCount).to.equal(1);
      expect(stats.boardsCount).to.equal(1);
      expect(stats.avatarsCount).to.equal(1);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to set minting enabled", async function () {
      await expect(chessNFT.connect(owner).setMintingEnabled(false))
        .to.emit(chessNFT, "MintingEnabledUpdated")
        .withArgs(false);

      expect(await chessNFT.mintingEnabled()).to.be.false;
    });

    it("Should allow owner to set mint fee", async function () {
      const newFee = parseEther("0.02");
      await expect(chessNFT.connect(owner).setMintFee(newFee))
        .to.emit(chessNFT, "MintFeeUpdated")
        .withArgs(newFee);

      expect(await chessNFT.mintFee()).to.equal(newFee);
    });

    it("Should allow owner to set max supply", async function () {
      const newMaxSupply = 5000;
      await expect(chessNFT.connect(owner).setMaxSupply(newMaxSupply))
        .to.emit(chessNFT, "MaxSupplyUpdated")
        .withArgs(newMaxSupply);

      expect(await chessNFT.maxSupply()).to.equal(newMaxSupply);
    });

    it("Should fail if non-owner tries to call admin functions", async function () {
      await expect(
        chessNFT.connect(user1).setMintingEnabled(false)
      ).to.be.revertedWithCustomError(chessNFT, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to withdraw fees", async function () {
      // Mint an NFT to generate fees
      await chessNFT.connect(user1).mintNFT(
        0, 0, "Test", "Test", "ipfs://test", 0,
        { value: parseEther("0.01") }
      );

      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      await expect(chessNFT.connect(owner).withdrawFees())
        .to.emit(chessNFT, "FeesWithdrawn")
        .withArgs(owner.address, parseEther("0.01"));

      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });
  });

  describe("ERC721 Compliance", function () {
    beforeEach(async function () {
      await chessNFT.connect(user1).mintNFT(
        0, 0, "Test", "Test", "ipfs://test", 0,
        { value: parseEther("0.01") }
      );
    });

    it("Should support ERC721 interface", async function () {
      expect(await chessNFT.supportsInterface("0x80ac58cd")).to.be.true; // ERC721
      expect(await chessNFT.supportsInterface("0x5b5e139f")).to.be.true; // ERC721Metadata
    });

    it("Should allow token transfers", async function () {
      await expect(chessNFT.connect(user1).transferFrom(user1.address, user2.address, 1))
        .to.emit(chessNFT, "Transfer")
        .withArgs(user1.address, user2.address, 1);

      expect(await chessNFT.ownerOf(1)).to.equal(user2.address);
    });

    it("Should allow approval and transfer", async function () {
      await chessNFT.connect(user1).approve(user3.address, 1);
      await chessNFT.connect(user3).transferFrom(user1.address, user2.address, 1);

      expect(await chessNFT.ownerOf(1)).to.equal(user2.address);
    });

    it("Should handle token URI correctly", async function () {
      expect(await chessNFT.tokenURI(1)).to.equal("ipfs://test");
      
      await expect(chessNFT.tokenURI(999)).to.be.revertedWithCustomError(chessNFT, "ERC721NonexistentToken");
    });
  });
}); 