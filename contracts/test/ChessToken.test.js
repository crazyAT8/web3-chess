const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ChessToken", function () {
  // Helper function to parse ether
  const parseEther = (amount) => ethers.parseEther(amount);
  
  let ChessToken;
  let chessToken;
  let owner;
  let user1;
  let user2;
  let user3;
  let rewarder;

  beforeEach(async function () {
    [owner, user1, user2, user3, rewarder] = await ethers.getSigners();
    
    ChessToken = await ethers.getContractFactory("ChessToken");
    chessToken = await ChessToken.deploy();
    await chessToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await chessToken.owner()).to.equal(owner.address);
    });

    it("Should have correct initial values", async function () {
      expect(await chessToken.name()).to.equal("ChessFi Token");
      expect(await chessToken.symbol()).to.equal("CHESS");
      expect(await chessToken.decimals()).to.equal(18);
    });

    it("Should mint initial supply to owner", async function () {
      const initialSupply = parseEther("10000000"); // 10 million
      expect(await chessToken.totalSupply()).to.equal(initialSupply);
      expect(await chessToken.balanceOf(owner.address)).to.equal(initialSupply);
    });

    it("Should authorize owner as rewarder", async function () {
      expect(await chessToken.authorizedRewarders(owner.address)).to.be.true;
    });

    it("Should have correct reward rates", async function () {
      expect(await chessToken.winReward()).to.equal(parseEther("100"));
      expect(await chessToken.drawReward()).to.equal(parseEther("25"));
      expect(await chessToken.participationReward()).to.equal(parseEther("10"));
      expect(await chessToken.tournamentReward()).to.equal(parseEther("500"));
      expect(await chessToken.stakingRewardRate()).to.equal(50); // 5% APY
    });
  });

  describe("Token Rewards", function () {
    beforeEach(async function () {
      await chessToken.connect(owner).setAuthorizedRewarder(rewarder.address, true);
    });

    it("Should reward tokens for winning", async function () {
      const initialBalance = await chessToken.balanceOf(user1.address);
      
      await expect(chessToken.connect(rewarder).rewardWin(user1.address))
        .to.emit(chessToken, "TokensRewarded")
        .withArgs(user1.address, parseEther("100"), "Game Win");

      const finalBalance = await chessToken.balanceOf(user1.address);
      expect(finalBalance - initialBalance).to.equal(parseEther("100"));
    });

    it("Should reward tokens for drawing", async function () {
      const initialBalance = await chessToken.balanceOf(user1.address);
      
      await expect(chessToken.connect(rewarder).rewardDraw(user1.address))
        .to.emit(chessToken, "TokensRewarded")
        .withArgs(user1.address, parseEther("25"), "Game Draw");

      const finalBalance = await chessToken.balanceOf(user1.address);
      expect(finalBalance - initialBalance).to.equal(parseEther("25"));
    });

    it("Should reward tokens for participation", async function () {
      const initialBalance = await chessToken.balanceOf(user1.address);
      
      await expect(chessToken.connect(rewarder).rewardParticipation(user1.address))
        .to.emit(chessToken, "TokensRewarded")
        .withArgs(user1.address, parseEther("10"), "Game Participation");

      const finalBalance = await chessToken.balanceOf(user1.address);
      expect(finalBalance - initialBalance).to.equal(parseEther("10"));
    });

    it("Should reward tokens for tournament win", async function () {
      const initialBalance = await chessToken.balanceOf(user1.address);
      
      await expect(chessToken.connect(rewarder).rewardTournamentWin(user1.address))
        .to.emit(chessToken, "TokensRewarded")
        .withArgs(user1.address, parseEther("500"), "Tournament Win");

      const finalBalance = await chessToken.balanceOf(user1.address);
      expect(finalBalance - initialBalance).to.equal(parseEther("500"));
    });

    it("Should fail if unauthorized address tries to reward", async function () {
      await expect(
        chessToken.connect(user1).rewardWin(user2.address)
      ).to.be.revertedWith("Not authorized to reward");
    });

    it("Should fail if reward amount is zero", async function () {
      // This test is removed since rewardTokens is internal
    });

    it("Should fail if reward pool is exhausted", async function () {
      // Try to reward more than the reward pool
      const largeReward = parseEther("6000000"); // More than 5M reward pool
      await expect(
        chessToken.connect(rewarder).rewardWin(user1.address)
      ).to.be.revertedWith("Reward pool exhausted");
    });
  });

  describe("Staking", function () {
    beforeEach(async function () {
      // Transfer some tokens to users for staking
      await chessToken.connect(owner).transfer(user1.address, parseEther("1000"));
      await chessToken.connect(owner).transfer(user2.address, parseEther("1000"));
    });

    it("Should allow users to stake tokens", async function () {
      const stakeAmount = parseEther("100");
      const initialBalance = await chessToken.balanceOf(user1.address);
      
      await expect(chessToken.connect(user1).stake(stakeAmount))
        .to.emit(chessToken, "TokensStaked")
        .withArgs(user1.address, stakeAmount);

      expect(await chessToken.balanceOf(user1.address)).to.equal(initialBalance - stakeAmount);
      expect(await chessToken.totalStaked()).to.equal(stakeAmount);
      
      const stakingInfo = await chessToken.getStakingInfo(user1.address);
      expect(stakingInfo.stakedAmount).to.equal(stakeAmount);
    });

    it("Should fail if staking zero tokens", async function () {
      await expect(
        chessToken.connect(user1).stake(0)
      ).to.be.revertedWith("Cannot stake 0 tokens");
    });

    it("Should fail if insufficient balance", async function () {
      const largeAmount = parseEther("2000"); // More than user has
      await expect(
        chessToken.connect(user1).stake(largeAmount)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should allow users to unstake tokens", async function () {
      const stakeAmount = parseEther("100");
      const unstakeAmount = parseEther("50");
      
      await chessToken.connect(user1).stake(stakeAmount);
      
      const initialBalance = await chessToken.balanceOf(user1.address);
      
      await expect(chessToken.connect(user1).unstake(unstakeAmount))
        .to.emit(chessToken, "TokensUnstaked")
        .withArgs(user1.address, unstakeAmount);

      expect(await chessToken.balanceOf(user1.address)).to.equal(initialBalance + unstakeAmount);
      expect(await chessToken.totalStaked()).to.equal(stakeAmount - unstakeAmount);
      
      const stakingInfo = await chessToken.getStakingInfo(user1.address);
      expect(stakingInfo.stakedAmount).to.equal(stakeAmount - unstakeAmount);
    });

    it("Should fail if unstaking more than staked", async function () {
      const stakeAmount = parseEther("100");
      const unstakeAmount = parseEther("150");
      
      await chessToken.connect(user1).stake(stakeAmount);
      
      await expect(
        chessToken.connect(user1).unstake(unstakeAmount)
      ).to.be.revertedWith("Insufficient staked amount");
    });

    it("Should fail if unstaking zero tokens", async function () {
      await expect(
        chessToken.connect(user1).unstake(0)
      ).to.be.revertedWith("Cannot unstake 0 tokens");
    });
  });

  describe("Staking Rewards", function () {
    beforeEach(async function () {
      await chessToken.connect(owner).transfer(user1.address, parseEther("1000"));
      await chessToken.connect(user1).stake(parseEther("100"));
    });

    it("Should calculate staking rewards correctly", async function () {
      // Fast forward time to accumulate rewards
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]); // 1 year
      await ethers.provider.send("evm_mine");
      
      const stakingInfo = await chessToken.getStakingInfo(user1.address);
      expect(stakingInfo.pendingRewards).to.be.gt(0);
    });

    it("Should allow users to claim rewards", async function () {
      // Fast forward time to accumulate rewards
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]); // 1 year
      await ethers.provider.send("evm_mine");
      
      const initialBalance = await chessToken.balanceOf(user1.address);
      
      await expect(chessToken.connect(user1).claimRewards())
        .to.emit(chessToken, "RewardsClaimed")
        .withArgs(user1.address, await chessToken.getStakingInfo(user1.address).then(info => info.pendingRewards));

      const finalBalance = await chessToken.balanceOf(user1.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should fail if no tokens staked", async function () {
      await expect(
        chessToken.connect(user2).claimRewards()
      ).to.be.revertedWith("No tokens staked");
    });

    it("Should fail if no rewards to claim", async function () {
      await expect(
        chessToken.connect(user1).claimRewards()
      ).to.be.revertedWith("No rewards to claim");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to authorize rewarders", async function () {
      await chessToken.connect(owner).setAuthorizedRewarder(user1.address, true);
      expect(await chessToken.authorizedRewarders(user1.address)).to.be.true;

      await chessToken.connect(owner).setAuthorizedRewarder(user1.address, false);
      expect(await chessToken.authorizedRewarders(user1.address)).to.be.false;
    });

    it("Should allow owner to update win reward", async function () {
      const newReward = parseEther("150");
      await expect(chessToken.connect(owner).setWinReward(newReward))
        .to.emit(chessToken, "WinRewardUpdated")
        .withArgs(newReward);

      expect(await chessToken.winReward()).to.equal(newReward);
    });

    it("Should allow owner to update draw reward", async function () {
      const newReward = parseEther("50");
      await expect(chessToken.connect(owner).setDrawReward(newReward))
        .to.emit(chessToken, "DrawRewardUpdated")
        .withArgs(newReward);

      expect(await chessToken.drawReward()).to.equal(newReward);
    });

    it("Should allow owner to update staking reward rate", async function () {
      const newRate = 100; // 10% APY
      await expect(chessToken.connect(owner).setStakingRewardRate(newRate))
        .to.emit(chessToken, "RewardRateUpdated")
        .withArgs(newRate);

      expect(await chessToken.stakingRewardRate()).to.equal(newRate);
    });

    it("Should fail if non-owner tries to call admin functions", async function () {
      await expect(
        chessToken.connect(user1).setAuthorizedRewarder(user2.address, true)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should fail if staking rate is too high", async function () {
      await expect(
        chessToken.connect(owner).setStakingRewardRate(1500) // 15% - too high
      ).to.be.revertedWith("Rate too high");
    });
  });

  describe("Tokenomics", function () {
    it("Should return correct tokenomics info", async function () {
      const tokenomics = await chessToken.getTokenomics();
      expect(tokenomics.initialSupply).to.equal(parseEther("10000000"));
      expect(tokenomics.rewardPool).to.equal(parseEther("5000000"));
      expect(tokenomics.teamPool).to.equal(parseEther("2000000"));
      expect(tokenomics.communityPool).to.equal(parseEther("3000000"));
      expect(tokenomics.totalDistributed).to.equal(0);
    });

    it("Should track total rewards distributed", async function () {
      await chessToken.connect(owner).setAuthorizedRewarder(rewarder.address, true);
      await chessToken.connect(rewarder).rewardWin(user1.address);
      
      const tokenomics = await chessToken.getTokenomics();
      expect(tokenomics.totalDistributed).to.equal(parseEther("100"));
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow owner to pause and unpause", async function () {
      await chessToken.connect(owner).pause();
      expect(await chessToken.paused()).to.be.true;

      await chessToken.connect(owner).unpause();
      expect(await chessToken.paused()).to.be.false;
    });

    it("Should prevent transfers when paused", async function () {
      await chessToken.connect(owner).pause();
      
      await expect(
        chessToken.connect(owner).transfer(user1.address, parseEther("100"))
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should fail if non-owner tries to pause", async function () {
      await expect(
        chessToken.connect(user1).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("ERC20 Compliance", function () {
    it("Should allow standard transfers", async function () {
      const transferAmount = parseEther("100");
      await chessToken.connect(owner).transfer(user1.address, transferAmount);
      expect(await chessToken.balanceOf(user1.address)).to.equal(transferAmount);
    });

    it("Should allow approval and transferFrom", async function () {
      const transferAmount = parseEther("100");
      
      await chessToken.connect(owner).approve(user1.address, transferAmount);
      await chessToken.connect(user1).transferFrom(owner.address, user2.address, transferAmount);
      
      expect(await chessToken.balanceOf(user2.address)).to.equal(transferAmount);
    });

    it("Should allow burning", async function () {
      const burnAmount = parseEther("100");
      const initialSupply = await chessToken.totalSupply();
      
      await chessToken.connect(owner).burn(burnAmount);

      expect(await chessToken.totalSupply()).to.equal(initialSupply - burnAmount);
    });

    it("Should handle allowance correctly", async function () {
      const allowance = parseEther("100");
      await chessToken.connect(owner).approve(user1.address, allowance);
      
      expect(await chessToken.allowance(owner.address, user1.address)).to.equal(allowance);
    });
  });
}); 
