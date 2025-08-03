const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ChessGame", function () {
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
      expect(await chessGame.minStake()).to.equal(ethers.utils.parseEther("0.001"));
      expect(await chessGame.maxStake()).to.equal(ethers.utils.parseEther("10"));
      expect(await chessGame.gameTimeout()).to.equal(3600); // 1 hour
    });
  });

  describe("Game Creation", function () {
    it("Should create a game with correct parameters", async function () {
      const stake = ethers.utils.parseEther("0.1");
      
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
      const stake = ethers.utils.parseEther("0.1");
      
      await expect(
        chessGame.connect(player1).createGame(stake, { value: ethers.utils.parseEther("0.05") })
      ).to.be.revertedWith("Stake amount must match sent value");
    });

    it("Should fail if stake is too low", async function () {
      const stake = ethers.utils.parseEther("0.0005");
      
      await expect(
        chessGame.connect(player1).createGame(stake, { value: stake })
      ).to.be.revertedWith("Stake too low");
    });

    it("Should fail if stake is too high", async function () {
      const stake = ethers.utils.parseEther("15");
      
      await expect(
        chessGame.connect(player1).createGame(stake, { value: stake })
      ).to.be.revertedWith("Stake too high");
    });
  });

  describe("Game Joining", function () {
    beforeEach(async function () {
      const stake = ethers.utils.parseEther("0.1");
      await chessGame.connect(player1).createGame(stake, { value: stake });
    });

    it("Should allow a player to join a game", async function () {
      const stake = ethers.utils.parseEther("0.1");
      
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
      const stake = ethers.utils.parseEther("0.1");
      await chessGame.connect(player2).joinGame(1, { value: stake });
      
      await expect(
        chessGame.connect(player3).joinGame(1, { value: stake })
      ).to.be.revertedWith("Game not available");
    });

    it("Should fail if player tries to join their own game", async function () {
      const stake = ethers.utils.parseEther("0.1");
      
      await expect(
        chessGame.connect(player1).joinGame(1, { value: stake })
      ).to.be.revertedWith("Cannot join your own game");
    });

    it("Should fail if stake amount doesn't match", async function () {
      await expect(
        chessGame.connect(player2).joinGame(1, { value: ethers.utils.parseEther("0.05") })
      ).to.be.revertedWith("Stake amount must match");
    });
  });

  describe("Game Moves", function () {
    beforeEach(async function () {
      const stake = ethers.utils.parseEther("0.1");
      await chessGame.connect(player1).createGame(stake, { value: stake });
      await chessGame.connect(player2).joinGame(1, { value: stake });
    });

    it("Should allow a player to make a move", async function () {
      await expect(
        chessGame.connect(player1).makeMove(1, 6, 4, 4, 4, 0) // PAWN
      ).to.emit(chessGame, "MoveMade")
        .withArgs(1, player1.address, 6, 4, 4, 4);

      const game = await chessGame.getGame(1);
      expect(game.currentTurn).to.equal(player2.address);
      expect(game.moves.length).to.equal(1);
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

    it("Should fail if player is not in the game", async function () {
      await expect(
        chessGame.connect(player3).makeMove(1, 6, 4, 4, 4, 0)
      ).to.be.revertedWith("Not a player in this game");
    });

    it("Should fail for invalid coordinates", async function () {
      await expect(
        chessGame.connect(player1).makeMove(1, 8, 4, 4, 4, 0)
      ).to.be.revertedWith("Invalid coordinates");
    });

    it("Should fail if moving to the same square", async function () {
      await expect(
        chessGame.connect(player1).makeMove(1, 6, 4, 6, 4, 0)
      ).to.be.revertedWith("Must move to different square");
    });
  });

  describe("Game Ending", function () {
    beforeEach(async function () {
      const stake = ethers.utils.parseEther("0.1");
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
      await expect(chessGame.connect(player1).endGame(1, 3)) // BLACK_WON
        .to.emit(chessGame, "GameEnded")
        .withArgs(1, 3, player2.address);

      const game = await chessGame.getGame(1);
      expect(game.state).to.equal(3); // BLACK_WON
    });

    it("Should fail if game is not active", async function () {
      await chessGame.connect(owner).endGame(1, 2);
      
      await expect(
        chessGame.connect(owner).endGame(1, 3)
      ).to.be.revertedWith("Game not active");
    });

    it("Should fail if caller is not authorized", async function () {
      await expect(
        chessGame.connect(player3).endGame(1, 2)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should distribute stakes correctly for win", async function () {
      const initialBalance1 = await player1.getBalance();
      const initialBalance2 = await player2.getBalance();
      
      await chessGame.connect(owner).endGame(1, 2); // WHITE_WON
      
      const finalBalance1 = await player1.getBalance();
      const finalBalance2 = await player2.getBalance();
      
      // Player1 should receive most of the stake (minus platform fee)
      expect(finalBalance1).to.be.gt(initialBalance1);
      expect(finalBalance2).to.equal(initialBalance2);
    });

    it("Should distribute stakes correctly for draw", async function () {
      const initialBalance1 = await player1.getBalance();
      const initialBalance2 = await player2.getBalance();
      
      await chessGame.connect(owner).endGame(1, 4); // DRAW
      
      const finalBalance1 = await player1.getBalance();
      const finalBalance2 = await player2.getBalance();
      
      // Both players should receive part of the stake
      expect(finalBalance1).to.be.gt(initialBalance1);
      expect(finalBalance2).to.be.gt(initialBalance2);
    });
  });

  describe("Player Stats", function () {
    beforeEach(async function () {
      const stake = ethers.utils.parseEther("0.1");
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
      expect(player2Games.length).to.equal(1);
      expect(player1Games[0]).to.equal(1);
      expect(player2Games[0]).to.equal(1);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update platform fee", async function () {
      await chessGame.setPlatformFee(30);
      expect(await chessGame.platformFee()).to.equal(30);
    });

    it("Should fail if non-owner tries to update platform fee", async function () {
      await expect(
        chessGame.connect(player1).setPlatformFee(30)
      ).to.be.revertedWithCustomError(chessGame, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to update stake limits", async function () {
      await chessGame.setStakeLimits(
        ethers.utils.parseEther("0.002"),
        ethers.utils.parseEther("20")
      );
      
      expect(await chessGame.minStake()).to.equal(ethers.utils.parseEther("0.002"));
      expect(await chessGame.maxStake()).to.equal(ethers.utils.parseEther("20"));
    });

    it("Should allow owner to update game timeout", async function () {
      await chessGame.setGameTimeout(7200); // 2 hours
      expect(await chessGame.gameTimeout()).to.equal(7200);
    });

    it("Should allow owner to emergency withdraw", async function () {
      const stake = ethers.utils.parseEther("0.1");
      await chessGame.connect(player1).createGame(stake, { value: stake });
      await chessGame.connect(player2).joinGame(1, { value: stake });
      
      const initialBalance = await owner.getBalance();
      await chessGame.emergencyWithdraw();
      const finalBalance = await owner.getBalance();
      
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });
}); 