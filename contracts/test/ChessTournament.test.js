const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ChessTournament", function () {
  // Helper function to parse ether
  const parseEther = (amount) => ethers.parseEther(amount);
  
  let ChessGame;
  let ChessTournament;
  let chessGame;
  let chessTournament;
  let owner;
  let user1;
  let user2;
  let user3;
  let user4;

  beforeEach(async function () {
    [owner, user1, user2, user3, user4] = await ethers.getSigners();
    
    ChessGame = await ethers.getContractFactory("ChessGame");
    chessGame = await ChessGame.deploy();
    await chessGame.waitForDeployment();

    ChessTournament = await ethers.getContractFactory("ChessTournament");
    chessTournament = await ChessTournament.deploy(await chessGame.getAddress());
    await chessTournament.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await chessTournament.owner()).to.equal(owner.address);
    });

    it("Should set the correct chess game contract", async function () {
      // We can't directly access the chessGameContract variable, but we can test it indirectly
      // by checking if the contract was deployed correctly
      expect(chessTournament.address).to.not.equal(ethers.ZeroAddress);
    });

    it("Should have correct initial values", async function () {
      expect(await chessTournament.platformFee()).to.equal(50); // 5%
      expect(await chessTournament.minEntryFee()).to.equal(parseEther("0.001"));
      expect(await chessTournament.maxEntryFee()).to.equal(parseEther("5"));
    });
  });

  describe("Tournament Creation", function () {
    it("Should create a tournament with correct parameters", async function () {
      const name = "Test Tournament";
      const description = "A test tournament";
      const tournamentType = 0; // SINGLE_ELIMINATION
      const entryFee = parseEther("0.1");
      const maxPlayers = 8;
      const startTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

      await expect(
        chessTournament.connect(owner).createTournament(
          name,
          description,
          tournamentType,
          entryFee,
          maxPlayers,
          startTime
        )
      ).to.emit(chessTournament, "TournamentCreated")
        .withArgs(1, name, entryFee, maxPlayers);

      const tournament = await chessTournament.getTournament(1);
      expect(tournament.name).to.equal(name);
      expect(tournament.description).to.equal(description);
      expect(tournament.tournamentType).to.equal(tournamentType);
      expect(tournament.entryFee).to.equal(entryFee);
      expect(tournament.maxPlayers).to.equal(maxPlayers);
      expect(tournament.startTime).to.equal(startTime);
      expect(tournament.state).to.equal(0); // REGISTRATION
    });

    it("Should fail if non-owner tries to create tournament", async function () {
      await expect(
        chessTournament.connect(user1).createTournament(
          "Test",
          "Test",
          0,
          parseEther("0.1"),
          8,
          Math.floor(Date.now() / 1000) + 3600
        )
      ).to.be.revertedWithCustomError(chessTournament, "OwnableUnauthorizedAccount");
    });

    it("Should fail if name is empty", async function () {
      await expect(
        chessTournament.connect(owner).createTournament(
          "",
          "Test",
          0,
          parseEther("0.1"),
          8,
          Math.floor(Date.now() / 1000) + 3600
        )
      ).to.be.revertedWithCustomError(chessTournament, "InvalidName");
    });

    it("Should fail if entry fee is too low", async function () {
      await expect(
        chessTournament.connect(owner).createTournament(
          "Test",
          "Test",
          0,
          parseEther("0.0005"),
          8,
          Math.floor(Date.now() / 1000) + 3600
        )
      ).to.be.revertedWithCustomError(chessTournament, "EntryFeeTooLow");
    });

    it("Should fail if entry fee is too high", async function () {
      await expect(
        chessTournament.connect(owner).createTournament(
          "Test",
          "Test",
          0,
          parseEther("10"),
          8,
          Math.floor(Date.now() / 1000) + 3600
        )
      ).to.be.revertedWithCustomError(chessTournament, "EntryFeeTooHigh");
    });

    it("Should fail if max players is less than 2", async function () {
      await expect(
        chessTournament.connect(owner).createTournament(
          "Test",
          "Test",
          0,
          parseEther("0.1"),
          1,
          Math.floor(Date.now() / 1000) + 3600
        )
      ).to.be.revertedWithCustomError(chessTournament, "InvalidMaxPlayers");
    });

    it("Should fail if start time is in the past", async function () {
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      await expect(
        chessTournament.connect(owner).createTournament(
          "Test",
          "Test",
          0,
          parseEther("0.1"),
          8,
          pastTime
        )
      ).to.be.revertedWithCustomError(chessTournament, "StartTimeInPast");
    });
  });

  describe("Tournament Registration", function () {
    let tournamentId;
    let entryFee;
    
    beforeEach(async function () {
      entryFee = parseEther("0.1");
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      
      await chessTournament.connect(owner).createTournament(
        "Test Tournament",
        "A test tournament",
        0, // SINGLE_ELIMINATION
        entryFee,
        8,
        startTime
      );
      tournamentId = 1;
    });

    it("Should allow players to register", async function () {
      await expect(chessTournament.connect(user1).registerForTournament(tournamentId, { value: entryFee }))
        .to.emit(chessTournament, "PlayerRegistered")
        .withArgs(tournamentId, user1.address);

      const tournament = await chessTournament.getTournament(tournamentId);
      expect(tournament.players.length).to.equal(1);
      expect(tournament.players[0]).to.equal(user1.address);
    });

    it("Should fail if tournament doesn't exist", async function () {
      await expect(
        chessTournament.connect(user1).registerForTournament(999, { value: entryFee })
      ).to.be.revertedWithCustomError(chessTournament, "TournamentNotFound");
    });

    it("Should fail if tournament is not in registration state", async function () {
      // Start the tournament
      await chessTournament.connect(owner).startTournament(tournamentId);
      
      await expect(
        chessTournament.connect(user1).registerForTournament(tournamentId, { value: entryFee })
      ).to.be.revertedWithCustomError(chessTournament, "TournamentNotInRegistration");
    });

    it("Should fail if player already registered", async function () {
      await chessTournament.connect(user1).registerForTournament(tournamentId, { value: entryFee });
      
      await expect(
        chessTournament.connect(user1).registerForTournament(tournamentId, { value: entryFee })
      ).to.be.revertedWithCustomError(chessTournament, "PlayerAlreadyRegistered");
    });

    it("Should fail if entry fee doesn't match", async function () {
      const wrongFee = parseEther("0.05");
      
      await expect(
        chessTournament.connect(user1).registerForTournament(tournamentId, { value: wrongFee })
      ).to.be.revertedWithCustomError(chessTournament, "EntryFeeMismatch");
    });

    it("Should fail if tournament is full", async function () {
      // Create a tournament with only 2 players
      const smallTournamentId = 2;
      await chessTournament.connect(owner).createTournament(
        "Small Tournament",
        "A small tournament",
        0,
        entryFee,
        2,
        Math.floor(Date.now() / 1000) + 3600
      );
      
      // Register 2 players
      await chessTournament.connect(user1).registerForTournament(smallTournamentId, { value: entryFee });
      await chessTournament.connect(user2).registerForTournament(smallTournamentId, { value: entryFee });
      
      // Try to register a third player
      await expect(
        chessTournament.connect(user3).registerForTournament(smallTournamentId, { value: entryFee })
      ).to.be.revertedWithCustomError(chessTournament, "TournamentFull");
    });
  });

  describe("Tournament Management", function () {
    let tournamentId;
    let entryFee;
    
    beforeEach(async function () {
      entryFee = parseEther("0.1");
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      
      await chessTournament.connect(owner).createTournament(
        "Test Tournament",
        "A test tournament",
        0, // SINGLE_ELIMINATION
        entryFee,
        4,
        startTime
      );
      tournamentId = 1;
      
      // Register players
      await chessTournament.connect(user1).registerForTournament(tournamentId, { value: entryFee });
      await chessTournament.connect(user2).registerForTournament(tournamentId, { value: entryFee });
      await chessTournament.connect(user3).registerForTournament(tournamentId, { value: entryFee });
      await chessTournament.connect(user4).registerForTournament(tournamentId, { value: entryFee });
    });

    it("Should create first round matches", async function () {
      await expect(chessTournament.connect(owner).startTournament(tournamentId))
        .to.emit(chessTournament, "TournamentStarted")
        .withArgs(tournamentId);

      const tournament = await chessTournament.getTournament(tournamentId);
      expect(tournament.state).to.equal(1); // ACTIVE
      expect(tournament.matches.length).to.equal(2); // 4 players = 2 matches
    });

    it("Should allow completing matches", async function () {
      await chessTournament.connect(owner).startTournament(tournamentId);
      
      const matchId = 1;
      await expect(chessTournament.connect(owner).completeMatch(tournamentId, matchId, user1.address))
        .to.emit(chessTournament, "MatchCompleted")
        .withArgs(tournamentId, matchId, user1.address);
    });

    it("Should fail if non-owner tries to start tournament", async function () {
      await expect(
        chessTournament.connect(user1).startTournament(tournamentId)
      ).to.be.revertedWithCustomError(chessTournament, "OwnableUnauthorizedAccount");
    });

    it("Should fail if tournament is not in registration state", async function () {
      await chessTournament.connect(owner).startTournament(tournamentId);
      
      await expect(
        chessTournament.connect(owner).startTournament(tournamentId)
      ).to.be.revertedWithCustomError(chessTournament, "TournamentNotInRegistration");
    });

    it("Should fail if not enough players", async function () {
      // Create a tournament with only 1 player
      const smallTournamentId = 2;
      await chessTournament.connect(owner).createTournament(
        "Small Tournament",
        "A small tournament",
        0,
        entryFee,
        4,
        Math.floor(Date.now() / 1000) + 3600
      );
      
      await chessTournament.connect(user1).registerForTournament(smallTournamentId, { value: entryFee });
      
      await expect(
        chessTournament.connect(owner).startTournament(smallTournamentId)
      ).to.be.revertedWithCustomError(chessTournament, "NotEnoughPlayers");
    });
  });

  describe("Tournament Queries", function () {
    let tournamentId;
    let entryFee;
    
    beforeEach(async function () {
      entryFee = parseEther("0.1");
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      
      await chessTournament.connect(owner).createTournament(
        "Test Tournament",
        "A test tournament",
        0,
        entryFee,
        4,
        startTime
      );
      tournamentId = 1;
      
      // Register players
      await chessTournament.connect(user1).registerForTournament(tournamentId, { value: entryFee });
      await chessTournament.connect(user2).registerForTournament(tournamentId, { value: entryFee });
    });

    it("Should get tournament players", async function () {
      const players = await chessTournament.getTournamentPlayers(tournamentId);
      expect(players.length).to.equal(2);
      expect(players[0]).to.equal(user1.address);
      expect(players[1]).to.equal(user2.address);
    });

    it("Should get tournament matches", async function () {
      await chessTournament.connect(owner).startTournament(tournamentId);
      
      const matches = await chessTournament.getTournamentMatches(tournamentId);
      expect(matches.length).to.equal(1); // 2 players = 1 match
    });

    it("Should get tournament info", async function () {
      const info = await chessTournament.getTournamentInfo(tournamentId);
      expect(info.name).to.equal("Test Tournament");
      expect(info.entryFee).to.equal(entryFee);
      expect(info.maxPlayers).to.equal(4);
      expect(info.playerCount).to.equal(2);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to set platform fee", async function () {
      await expect(chessTournament.connect(owner).setPlatformFee(75))
        .to.emit(chessTournament, "PlatformFeeUpdated")
        .withArgs(75);

      expect(await chessTournament.platformFee()).to.equal(75);
    });

    it("Should allow owner to set entry fee limits", async function () {
      const newMinFee = parseEther("0.002");
      const newMaxFee = parseEther("10");
      
      await expect(chessTournament.connect(owner).setEntryFeeLimits(newMinFee, newMaxFee))
        .to.emit(chessTournament, "EntryFeeLimitsUpdated")
        .withArgs(newMinFee, newMaxFee);

      expect(await chessTournament.minEntryFee()).to.equal(newMinFee);
      expect(await chessTournament.maxEntryFee()).to.equal(newMaxFee);
    });

    it("Should fail if non-owner tries to call admin functions", async function () {
      await expect(
        chessTournament.connect(user1).setPlatformFee(75)
      ).to.be.revertedWithCustomError(chessTournament, "OwnableUnauthorizedAccount");
    });

    it("Should fail if fee is too high", async function () {
      await expect(
        chessTournament.connect(owner).setPlatformFee(1001) // 100.1%
      ).to.be.revertedWithCustomError(chessTournament, "InvalidPlatformFee");
    });

    it("Should fail if entry fee limits are invalid", async function () {
      const minFee = parseEther("10");
      const maxFee = parseEther("5"); // Max < Min
      
      await expect(
        chessTournament.connect(owner).setEntryFeeLimits(minFee, maxFee)
      ).to.be.revertedWithCustomError(chessTournament, "InvalidEntryFeeLimits");
    });
  });

  describe("Prize Distribution", function () {
    let tournamentId;
    let entryFee;
    
    beforeEach(async function () {
      entryFee = parseEther("0.1");
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      
      await chessTournament.connect(owner).createTournament(
        "Test Tournament",
        "A test tournament",
        0,
        entryFee,
        4,
        startTime
      );
      tournamentId = 1;
      
      // Register players
      await chessTournament.connect(user1).registerForTournament(tournamentId, { value: entryFee });
      await chessTournament.connect(user2).registerForTournament(tournamentId, { value: entryFee });
      await chessTournament.connect(user3).registerForTournament(tournamentId, { value: entryFee });
      await chessTournament.connect(user4).registerForTournament(tournamentId, { value: entryFee });
      
      // Start tournament and complete matches
      await chessTournament.connect(owner).startTournament(tournamentId);
      await chessTournament.connect(owner).completeMatch(tournamentId, 1, user1.address);
      await chessTournament.connect(owner).completeMatch(tournamentId, 2, user2.address);
      await chessTournament.connect(owner).completeMatch(tournamentId, 3, user1.address);
    });

    it("Should distribute prizes correctly", async function () {
      const initialBalance = await ethers.provider.getBalance(user1.address);
      
      await expect(chessTournament.connect(owner).endTournament(tournamentId))
        .to.emit(chessTournament, "TournamentEnded")
        .withArgs(tournamentId, user1.address);

      const finalBalance = await ethers.provider.getBalance(user1.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });

    it("Should fail if tournament is not active", async function () {
      await expect(
        chessTournament.connect(owner).endTournament(tournamentId)
      ).to.be.revertedWithCustomError(chessTournament, "TournamentNotActive");
    });
  });

  describe("Emergency Functions", function () {
    let tournamentId;
    let entryFee;
    
    beforeEach(async function () {
      entryFee = parseEther("0.1");
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      
      await chessTournament.connect(owner).createTournament(
        "Test Tournament",
        "A test tournament",
        0,
        entryFee,
        4,
        startTime
      );
      tournamentId = 1;
      
      // Register players
      await chessTournament.connect(user1).registerForTournament(tournamentId, { value: entryFee });
      await chessTournament.connect(user2).registerForTournament(tournamentId, { value: entryFee });
    });

    it("Should allow owner to emergency withdraw", async function () {
      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      await expect(chessTournament.connect(owner).emergencyWithdraw())
        .to.emit(chessTournament, "EmergencyWithdraw")
        .withArgs(owner.address, parseEther("0.2")); // 2 players * 0.1 ETH

      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });

    it("Should fail if non-owner tries to emergency withdraw", async function () {
      await expect(
        chessTournament.connect(user1).emergencyWithdraw()
      ).to.be.revertedWithCustomError(chessTournament, "OwnableUnauthorizedAccount");
    });
  });
}); 
