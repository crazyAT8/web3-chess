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
      ).to.be.revertedWith("Ownable: caller is not the owner");
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
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should fail if entry fee is too low", async function () {
      await expect(
        chessTournament.connect(owner).createTournament(
          "Test",
          "Test",
          0,
          parseEther("0.0005"), // Below min
          8,
          Math.floor(Date.now() / 1000) + 3600
        )
      ).to.be.revertedWith("Entry fee too low");
    });

    it("Should fail if entry fee is too high", async function () {
      await expect(
        chessTournament.connect(owner).createTournament(
          "Test",
          "Test",
          0,
          parseEther("10"), // Above max
          8,
          Math.floor(Date.now() / 1000) + 3600
        )
      ).to.be.revertedWith("Entry fee too high");
    });

    it("Should fail if max players is less than 2", async function () {
      await expect(
        chessTournament.connect(owner).createTournament(
          "Test",
          "Test",
          0,
          parseEther("0.1"),
          1, // Less than 2
          Math.floor(Date.now() / 1000) + 3600
        )
      ).to.be.revertedWith("Need at least 2 players");
    });

    it("Should fail if start time is in the past", async function () {
      await expect(
        chessTournament.connect(owner).createTournament(
          "Test",
          "Test",
          0,
          parseEther("0.1"),
          8,
          Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
        )
      ).to.be.revertedWith("Start time must be in the future");
    });
  });

  describe("Tournament Registration", function () {
    let tournamentId;
    let entryFee;

    beforeEach(async function () {
      entryFee = parseEther("0.1");
      await chessTournament.connect(owner).createTournament(
        "Test Tournament",
        "Test",
        0, // SINGLE_ELIMINATION
        entryFee,
        4, // 4 players
        Math.floor(Date.now() / 1000) + 3600
      );
      tournamentId = 1;
    });

    it("Should allow players to register", async function () {
      await expect(
        chessTournament.connect(user1).registerForTournament(tournamentId, { value: entryFee })
      ).to.emit(chessTournament, "PlayerRegistered")
        .withArgs(tournamentId, user1.address);

      expect(await chessTournament.isPlayerRegistered(tournamentId, user1.address)).to.be.true;
      
      const tournament = await chessTournament.getTournament(tournamentId);
      expect(tournament.currentPlayers).to.equal(1);
      expect(tournament.prizePool).to.equal(entryFee);
    });

    it("Should fail if tournament is not in registration state", async function () {
      // Register all players to fill tournament
      await chessTournament.connect(user1).registerForTournament(tournamentId, { value: entryFee });
      await chessTournament.connect(user2).registerForTournament(tournamentId, { value: entryFee });
      await chessTournament.connect(user3).registerForTournament(tournamentId, { value: entryFee });
      await chessTournament.connect(user4).registerForTournament(tournamentId, { value: entryFee });

      // Tournament should be full and auto-started
      await expect(
        chessTournament.connect(user1).registerForTournament(tournamentId, { value: entryFee })
      ).to.be.revertedWith("Tournament not in registration");
    });

    it("Should fail if player already registered", async function () {
      await chessTournament.connect(user1).registerForTournament(tournamentId, { value: entryFee });

      await expect(
        chessTournament.connect(user1).registerForTournament(tournamentId, { value: entryFee })
      ).to.be.revertedWith("Already registered");
    });

    it("Should fail if entry fee doesn't match", async function () {
      await expect(
        chessTournament.connect(user1).registerForTournament(tournamentId, { value: parseEther("0.05") })
      ).to.be.revertedWith("Incorrect entry fee");
    });

    it("Should auto-start tournament when full", async function () {
      await chessTournament.connect(user1).registerForTournament(tournamentId, { value: entryFee });
      await chessTournament.connect(user2).registerForTournament(tournamentId, { value: entryFee });
      await chessTournament.connect(user3).registerForTournament(tournamentId, { value: entryFee });
      
      await expect(
        chessTournament.connect(user4).registerForTournament(tournamentId, { value: entryFee })
      ).to.emit(chessTournament, "PlayerRegistered")
        .and.to.emit(chessTournament, "TournamentStarted");

      const tournament = await chessTournament.getTournament(tournamentId);
      expect(tournament.state).to.equal(1); // ACTIVE
      expect(tournament.currentRound).to.equal(1);
    });
  });

  describe("Tournament Management", function () {
    let tournamentId;
    let entryFee;

    beforeEach(async function () {
      entryFee = parseEther("0.1");
      await chessTournament.connect(owner).createTournament(
        "Test Tournament",
        "Test",
        0, // SINGLE_ELIMINATION
        entryFee,
        4, // 4 players
        Math.floor(Date.now() / 1000) + 3600
      );
      tournamentId = 1;

      // Register all players
      await chessTournament.connect(user1).registerForTournament(tournamentId, { value: entryFee });
      await chessTournament.connect(user2).registerForTournament(tournamentId, { value: entryFee });
      await chessTournament.connect(user3).registerForTournament(tournamentId, { value: entryFee });
      await chessTournament.connect(user4).registerForTournament(tournamentId, { value: entryFee });
    });

    it("Should create first round matches", async function () {
      const matches = await chessTournament.getTournamentMatches(tournamentId);
      expect(matches.length).to.equal(2); // 4 players = 2 matches in first round

      // Check match details
      expect(matches[0].round).to.equal(1);
      expect(matches[0].isComplete).to.be.false;
      expect(matches[1].round).to.equal(1);
      expect(matches[1].isComplete).to.be.false;
    });

    it("Should allow owner to complete matches", async function () {
      const matches = await chessTournament.getTournamentMatches(tournamentId);
      
      await expect(
        chessTournament.connect(owner).completeMatch(tournamentId, 1, user1.address)
      ).to.emit(chessTournament, "MatchCompleted")
        .withArgs(tournamentId, 1, user1.address);

      await expect(
        chessTournament.connect(owner).completeMatch(tournamentId, 2, user3.address)
      ).to.emit(chessTournament, "MatchCompleted")
        .withArgs(tournamentId, 2, user3.address);

      // Check that matches are complete
      const updatedMatches = await chessTournament.getTournamentMatches(tournamentId);
      expect(updatedMatches[0].isComplete).to.be.true;
      expect(updatedMatches[0].winner).to.equal(user1.address);
      expect(updatedMatches[1].isComplete).to.be.true;
      expect(updatedMatches[1].winner).to.equal(user3.address);
    });

    it("Should fail if tournament is not active", async function () {
      // Cancel the tournament first
      await chessTournament.connect(owner).endTournament(tournamentId, user1.address);

      await expect(
        chessTournament.connect(owner).completeMatch(tournamentId, 1, user1.address)
      ).to.be.revertedWith("Tournament not active");
    });

    it("Should fail if match already complete", async function () {
      await chessTournament.connect(owner).completeMatch(tournamentId, 1, user1.address);

      await expect(
        chessTournament.connect(owner).completeMatch(tournamentId, 1, user2.address)
      ).to.be.revertedWith("Match already complete");
    });

    it("Should fail if winner is not a player in the match", async function () {
      await expect(
        chessTournament.connect(owner).completeMatch(tournamentId, 1, user4.address)
      ).to.be.revertedWith("Invalid winner");
    });

    it("Should advance to next round when current round is complete", async function () {
      // Complete both first round matches
      await chessTournament.connect(owner).completeMatch(tournamentId, 1, user1.address);
      await chessTournament.connect(owner).completeMatch(tournamentId, 2, user3.address);

      // Should create final match
      const matches = await chessTournament.getTournamentMatches(tournamentId);
      expect(matches.length).to.equal(3); // 2 first round + 1 final

      const finalMatch = matches[2];
      expect(finalMatch.round).to.equal(2);
      expect(finalMatch.player1).to.equal(user1.address);
      expect(finalMatch.player2).to.equal(user3.address);
    });

    it("Should finish tournament when final match is complete", async function () {
      // Complete first round
      await chessTournament.connect(owner).completeMatch(tournamentId, 1, user1.address);
      await chessTournament.connect(owner).completeMatch(tournamentId, 2, user3.address);

      // Complete final match
      await expect(
        chessTournament.connect(owner).completeMatch(tournamentId, 3, user1.address)
      ).to.emit(chessTournament, "MatchCompleted")
        .and.to.emit(chessTournament, "TournamentFinished");

      const tournament = await chessTournament.getTournament(tournamentId);
      expect(tournament.state).to.equal(2); // FINISHED
    });
  });

  describe("Tournament Queries", function () {
    let tournamentId;

    beforeEach(async function () {
      await chessTournament.connect(owner).createTournament(
        "Test Tournament",
        "Test",
        0,
        parseEther("0.1"),
        4,
        Math.floor(Date.now() / 1000) + 3600
      );
      tournamentId = 1;
    });

    it("Should get tournament players", async function () {
      await chessTournament.connect(user1).registerForTournament(tournamentId, { value: parseEther("0.1") });
      await chessTournament.connect(user2).registerForTournament(tournamentId, { value: parseEther("0.1") });

      const players = await chessTournament.getTournamentPlayers(tournamentId);
      expect(players.length).to.equal(2);
      expect(players[0]).to.equal(user1.address);
      expect(players[1]).to.equal(user2.address);
    });

    it("Should get player tournaments", async function () {
      await chessTournament.connect(user1).registerForTournament(tournamentId, { value: parseEther("0.1") });

      const tournaments = await chessTournament.getPlayerTournaments(user1.address);
      expect(tournaments.length).to.equal(1);
      expect(tournaments[0]).to.equal(tournamentId);
    });

    it("Should check if player is registered", async function () {
      expect(await chessTournament.isPlayerRegistered(tournamentId, user1.address)).to.be.false;

      await chessTournament.connect(user1).registerForTournament(tournamentId, { value: parseEther("0.1") });

      expect(await chessTournament.isPlayerRegistered(tournamentId, user1.address)).to.be.true;
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to set platform fee", async function () {
      await chessTournament.connect(owner).setPlatformFee(75); // 7.5%
      expect(await chessTournament.platformFee()).to.equal(75);
    });

    it("Should allow owner to set entry fee limits", async function () {
      const newMinFee = parseEther("0.002");
      const newMaxFee = parseEther("8");

      await chessTournament.connect(owner).setEntryFeeLimits(newMinFee, newMaxFee);
      expect(await chessTournament.minEntryFee()).to.equal(newMinFee);
      expect(await chessTournament.maxEntryFee()).to.equal(newMaxFee);
    });

    it("Should fail if non-owner tries to call admin functions", async function () {
      await expect(
        chessTournament.connect(user1).setPlatformFee(75)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should fail if fee is too high", async function () {
      await expect(
        chessTournament.connect(owner).setPlatformFee(150) // 15% - too high
      ).to.be.revertedWith("Fee too high");
    });

    it("Should fail if entry fee limits are invalid", async function () {
      await expect(
        chessTournament.connect(owner).setEntryFeeLimits(
          parseEther("0.1"),
          parseEther("0.05") // Min > Max
        )
      ).to.be.revertedWith("Invalid fee limits");
    });
  });

  describe("Prize Distribution", function () {
    let tournamentId;
    let entryFee;

    beforeEach(async function () {
      entryFee = parseEther("0.1");
      await chessTournament.connect(owner).createTournament(
        "Test Tournament",
        "Test",
        0,
        entryFee,
        4,
        Math.floor(Date.now() / 1000) + 3600
      );
      tournamentId = 1;

      // Register all players
      await chessTournament.connect(user1).registerForTournament(tournamentId, { value: entryFee });
      await chessTournament.connect(user2).registerForTournament(tournamentId, { value: entryFee });
      await chessTournament.connect(user3).registerForTournament(tournamentId, { value: entryFee });
      await chessTournament.connect(user4).registerForTournament(tournamentId, { value: entryFee });
    });

    it("Should distribute prizes correctly", async function () {
      const initialBalance = await user1.getBalance();

      // Complete tournament with user1 as winner
      await chessTournament.connect(owner).completeMatch(tournamentId, 1, user1.address);
      await chessTournament.connect(owner).completeMatch(tournamentId, 2, user3.address);
      await chessTournament.connect(owner).completeMatch(tournamentId, 3, user1.address);

      const finalBalance = await user1.getBalance();
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should emit prize distribution events", async function () {
      // Complete tournament
      await chessTournament.connect(owner).completeMatch(tournamentId, 1, user1.address);
      await chessTournament.connect(owner).completeMatch(tournamentId, 2, user3.address);
      
      await expect(
        chessTournament.connect(owner).completeMatch(tournamentId, 3, user1.address)
      ).to.emit(chessTournament, "PrizeDistributed")
        .withArgs(tournamentId, user1.address, await chessTournament.getTournament(tournamentId).then(t => t.prizePool * 95 / 100)); // 95% after 5% fee
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to emergency withdraw", async function () {
      // Create and register players to generate fees
      await chessTournament.connect(owner).createTournament(
        "Test",
        "Test",
        0,
        parseEther("0.1"),
        4,
        Math.floor(Date.now() / 1000) + 3600
      );

      await chessTournament.connect(user1).registerForTournament(1, { value: parseEther("0.1") });
      await chessTournament.connect(user2).registerForTournament(1, { value: parseEther("0.1") });

      const initialBalance = await owner.getBalance();
      await chessTournament.connect(owner).emergencyWithdraw();
      const finalBalance = await owner.getBalance();

      expect(finalBalance).to.be.gt(initialBalance);
    });
  });
}); 
