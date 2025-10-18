const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ChessGame", function () {
  // Helper function to parse ether
  const parseEther = (amount) => ethers.parseEther(amount);
  
  let ChessGame;
  let chessGame;
  let owner;
  let player1;
  let player2;
  let player3;

  beforeEach(async function () {
    [owner, player1, player2, player3] = await ethers.getSigners();
    
    ChessGame = await ethers.getContractFactory("ChessGame");
    chessGame = await ChessGame.deploy();
    await chessGame.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await chessGame.owner()).to.equal(owner.address);
    });

    it("Should have correct initial values", async function () {
      expect(await chessGame.platformFee()).to.equal(25); // 2.5%
      expect(await chessGame.minStake()).to.equal(parseEther("0.001"));
      expect(await chessGame.maxStake()).to.equal(parseEther("10"));
      expect(await chessGame.gameTimeout()).to.equal(3600); // 1 hour
    });
  });

  describe("Game Creation", function () {
    it("Should create a game with correct parameters", async function () {
      const stake = parseEther("0.1");
      
      await expect(chessGame.connect(player1).createGame(stake, { value: stake }))
        .to.emit(chessGame, "GameCreated")
        .withArgs(1, player1.address, stake);

      const game = await chessGame.getGame(1);
      expect(game.whitePlayer).to.equal(player1.address);
      expect(game.stake).to.equal(stake);
      expect(game.state).to.equal(0); // WAITING_FOR_PLAYER
      expect(game.whiteAccepted).to.be.true;
      expect(game.blackAccepted).to.be.false;
    });

    it("Should fail if stake amount doesn't match sent value", async function () {
      const stake = parseEther("0.1");
      
      await expect(
        chessGame.connect(player1).createGame(stake, { value: parseEther("0.05") })
      ).to.be.revertedWithCustomError(chessGame, "StakeAmountMismatch");
    });

    it("Should fail if stake is too low", async function () {
      const stake = parseEther("0.0005");
      
      await expect(
        chessGame.connect(player1).createGame(stake, { value: stake })
      ).to.be.revertedWithCustomError(chessGame, "StakeTooLow");
    });

    it("Should fail if stake is too high", async function () {
      const stake = parseEther("15");
      
      await expect(
        chessGame.connect(player1).createGame(stake, { value: stake })
      ).to.be.revertedWithCustomError(chessGame, "StakeTooHigh");
    });
  });

  describe("Game Joining", function () {
    beforeEach(async function () {
      const stake = parseEther("0.1");
      await chessGame.connect(player1).createGame(stake, { value: stake });
    });

    it("Should allow a player to join a game", async function () {
      const stake = parseEther("0.1");
      
      await expect(chessGame.connect(player2).joinGame(1, { value: stake }))
        .to.emit(chessGame, "GameJoined")
        .withArgs(1, player2.address);

      const game = await chessGame.getGame(1);
      expect(game.blackPlayer).to.equal(player2.address);
      expect(game.state).to.equal(1); // ACTIVE
      expect(game.blackAccepted).to.be.true;
      expect(game.currentTurn).to.equal(player1.address); // White goes first
    });

    it("Should fail if game is not in waiting state", async function () {
      const stake = parseEther("0.1");
      await chessGame.connect(player2).joinGame(1, { value: stake });
      
      await expect(
        chessGame.connect(player3).joinGame(1, { value: stake })
      ).to.be.revertedWith("Game not available");
    });

    it("Should fail if player tries to join their own game", async function () {
      const stake = parseEther("0.1");
      
      await expect(
        chessGame.connect(player1).joinGame(1, { value: stake })
      ).to.be.revertedWith("Cannot join your own game");
    });

    it("Should fail if stake amount doesn't match game stake", async function () {
      const stake = parseEther("0.1");
      const wrongStake = parseEther("0.05");
      
      await expect(
        chessGame.connect(player2).joinGame(1, { value: wrongStake })
      ).to.be.revertedWith("Stake amount must match");
    });
  });

  describe("Game Moves", function () {
    beforeEach(async function () {
      const stake = parseEther("0.1");
      await chessGame.connect(player1).createGame(stake, { value: stake });
      await chessGame.connect(player2).joinGame(1, { value: stake });
    });

    it("Should allow a player to make a move", async function () {
      await expect(
        chessGame.connect(player1).makeMove(1, 6, 4, 4, 4, 0) // e2e4
      ).to.emit(chessGame, "MoveMade")
        .withArgs(1, player1.address, 6, 4, 4, 4);

      const game = await chessGame.getGame(1);
      expect(game.currentTurn).to.equal(player2.address);
      expect(game.lastMoveAt).to.be.greaterThan(0);
    });

    it("Should fail if it's not the player's turn", async function () {
      await expect(
        chessGame.connect(player2).makeMove(1, 6, 4, 4, 4, 0)
      ).to.be.revertedWith("Not your turn");
    });

    it("Should fail if game is not active", async function () {
      // End the game first
      await chessGame.connect(owner).endGame(1, 2); // WHITE_WON
      
      await expect(
        chessGame.connect(player1).makeMove(1, 6, 4, 4, 4, 0)
      ).to.be.revertedWith("Game not active");
    });

    it("Should fail if move is invalid", async function () {
      // Try to move to the same square
      await expect(
        chessGame.connect(player1).makeMove(1, 6, 4, 6, 4, 0)
      ).to.be.revertedWith("Must move to different square");
    });
  });

  describe("Game Ending", function () {
    beforeEach(async function () {
      const stake = parseEther("0.1");
      await chessGame.connect(player1).createGame(stake, { value: stake });
      await chessGame.connect(player2).joinGame(1, { value: stake });
    });

    it("Should allow owner to end game", async function () {
      await expect(chessGame.connect(owner).endGame(1, 2)) // WHITE_WON
        .to.emit(chessGame, "GameEnded")
        .withArgs(1, 2, player1.address);

      const game = await chessGame.getGame(1);
      expect(game.state).to.equal(2); // WHITE_WON
    });

    it("Should allow players to end game", async function () {
      await expect(chessGame.connect(player1).endGame(1, 2)) // WHITE_WON
        .to.emit(chessGame, "GameEnded")
        .withArgs(1, 2, player1.address);

      const game = await chessGame.getGame(1);
      expect(game.state).to.equal(2); // WHITE_WON
    });

    it("Should fail if game is not active", async function () {
      await chessGame.connect(owner).endGame(1, 2);
      
      await expect(
        chessGame.connect(owner).endGame(1, 3)
      ).to.be.revertedWith("Game not active");
    });
  });

  describe("Player Stats", function () {
    beforeEach(async function () {
      const stake = parseEther("0.1");
      await chessGame.connect(player1).createGame(stake, { value: stake });
      await chessGame.connect(player2).joinGame(1, { value: stake });
    });

    it("Should track player wins correctly", async function () {
      await chessGame.connect(owner).endGame(1, 2); // WHITE_WON
      
      const [wins1, rating1] = await chessGame.getPlayerStats(player1.address);
      const [wins2, rating2] = await chessGame.getPlayerStats(player2.address);
      
      expect(wins1).to.equal(1);
      expect(wins2).to.equal(0);
    });

    it("Should track player games correctly", async function () {
      const player1Games = await chessGame.getPlayerGames(player1.address);
      const player2Games = await chessGame.getPlayerGames(player2.address);
      
      expect(player1Games.length).to.equal(1);
      expect(player2Games.length).to.equal(1); // player2 has joined the game
      expect(player1Games[0]).to.equal(1);
      expect(player2Games[0]).to.equal(1);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update platform fee", async function () {
      await expect(chessGame.connect(owner).setPlatformFee(30))
        .to.not.be.reverted;

      expect(await chessGame.platformFee()).to.equal(30);
    });

    it("Should fail if non-owner tries to update platform fee", async function () {
      await expect(
        chessGame.connect(player1).setPlatformFee(30)
      ).to.be.revertedWithCustomError(chessGame, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to update stake limits", async function () {
      await expect(chessGame.connect(owner).setStakeLimits(parseEther("0.01"), parseEther("20")))
        .to.not.be.reverted;

      expect(await chessGame.minStake()).to.equal(parseEther("0.01"));
      expect(await chessGame.maxStake()).to.equal(parseEther("20"));
    });

    it("Should allow owner to update game timeout", async function () {
      await expect(chessGame.connect(owner).setGameTimeout(7200))
        .to.not.be.reverted;

      expect(await chessGame.gameTimeout()).to.equal(7200);
    });

    it("Should allow owner to emergency withdraw", async function () {
      const stake = parseEther("0.1");
      await chessGame.connect(player1).createGame(stake, { value: stake });
      
      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      await expect(chessGame.connect(owner).emergencyWithdraw())
        .to.not.be.reverted;

      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });
  });
}); 