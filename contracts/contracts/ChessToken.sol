// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ChessToken
 * @dev ERC20 token for ChessFi platform rewards and governance
 */
contract ChessToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    // Custom errors
    error NotAuthorizedToReward();
    error InvalidRewardAmount();
    error RewardPoolExhausted();
    error CannotStakeZero();
    error InsufficientBalance();
    error InsufficientStakedAmount();
    error CannotUnstakeZero();
    error NoTokensStaked();
    error NoRewardsToClaim();
    error RateTooHigh();
    
    // Tokenomics
    uint256 public constant INITIAL_SUPPLY = 10000000 * 10**18; // 10 million tokens
    uint256 public constant REWARD_POOL = 5000000 * 10**18;     // 5 million for rewards
    uint256 public constant TEAM_POOL = 2000000 * 10**18;       // 2 million for team
    uint256 public constant COMMUNITY_POOL = 3000000 * 10**18;  // 3 million for community

    // Reward rates (tokens per action)
    uint256 public winReward = 100 * 10**18;      // 100 tokens for winning
    uint256 public drawReward = 25 * 10**18;      // 25 tokens for drawing
    uint256 public participationReward = 10 * 10**18; // 10 tokens for participation
    uint256 public tournamentReward = 500 * 10**18;   // 500 tokens for tournament win

    // Staking rewards
    uint256 public stakingRewardRate = 50; // 5% APY (in basis points)
    uint256 public lastRewardTime;
    uint256 public totalStaked;

    // Staking structure
    struct Staker {
        uint256 stakedAmount;
        uint256 lastRewardTime;
        uint256 pendingRewards;
    }

    // Events
    event TokensRewarded(address indexed player, uint256 amount, string reason);
    event TokensStaked(address indexed staker, uint256 amount);
    event TokensUnstaked(address indexed staker, uint256 amount);
    event RewardsClaimed(address indexed staker, uint256 amount);
    event RewardRateUpdated(uint256 newRate);
    event WinRewardUpdated(uint256 newReward);
    event DrawRewardUpdated(uint256 newReward);

    // State variables
    mapping(address => Staker) public stakers;
    mapping(address => bool) public authorizedRewarders;
    uint256 public totalRewardsDistributed;

    constructor() ERC20("ChessFi Token", "CHESS") Ownable(msg.sender) {
        // Mint initial supply
        _mint(msg.sender, INITIAL_SUPPLY);
        lastRewardTime = block.timestamp;
        
        // Authorize owner as rewarder
        authorizedRewarders[msg.sender] = true;
    }

    /**
     * @dev Reward tokens to a player
     * @param player Player address
     * @param amount Amount to reward
     * @param reason Reason for reward
     */
    function _rewardTokens(address player, uint256 amount, string memory reason) internal {
        if (!authorizedRewarders[msg.sender]) revert NotAuthorizedToReward();
        if (amount == 0) revert InvalidRewardAmount();
        if (totalRewardsDistributed + amount > REWARD_POOL) revert RewardPoolExhausted();

        _mint(player, amount);
        totalRewardsDistributed += amount;

        emit TokensRewarded(player, amount, reason);
    }

    /**
     * @dev Reward for winning a game
     * @param player Winner address
     */
    function rewardWin(address player) external {
        if (!authorizedRewarders[msg.sender]) revert NotAuthorizedToReward();
        _rewardTokens(player, winReward, "Game Win");
    }

    /**
     * @dev Reward for drawing a game
     * @param player Player address
     */
    function rewardDraw(address player) external {
        if (!authorizedRewarders[msg.sender]) revert NotAuthorizedToReward();
        _rewardTokens(player, drawReward, "Game Draw");
    }

    /**
     * @dev Reward for participating in a game
     * @param player Player address
     */
    function rewardParticipation(address player) external {
        if (!authorizedRewarders[msg.sender]) revert NotAuthorizedToReward();
        _rewardTokens(player, participationReward, "Game Participation");
    }

    /**
     * @dev Reward for winning a tournament
     * @param player Winner address
     */
    function rewardTournamentWin(address player) external {
        if (!authorizedRewarders[msg.sender]) revert NotAuthorizedToReward();
        _rewardTokens(player, tournamentReward, "Tournament Win");
    }

    /**
     * @dev Stake tokens to earn rewards
     * @param amount Amount to stake
     */
    function stake(uint256 amount) external nonReentrant {
        if (amount == 0) revert CannotStakeZero();
        if (balanceOf(msg.sender) < amount) revert InsufficientBalance();

        Staker storage staker = stakers[msg.sender];
        
        // Claim pending rewards first
        if (staker.stakedAmount > 0) {
            _claimStakingRewards(msg.sender);
        }

        // Update staking info
        staker.stakedAmount += amount;
        staker.lastRewardTime = block.timestamp;
        totalStaked += amount;

        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);

        emit TokensStaked(msg.sender, amount);
    }

    /**
     * @dev Unstake tokens
     * @param amount Amount to unstake
     */
    function unstake(uint256 amount) external nonReentrant {
        if (amount == 0) revert CannotUnstakeZero();
        
        Staker storage staker = stakers[msg.sender];
        if (staker.stakedAmount < amount) revert InsufficientStakedAmount();

        // Claim pending rewards first
        _claimStakingRewards(msg.sender);

        // Update staking info
        staker.stakedAmount -= amount;
        totalStaked -= amount;

        // Transfer tokens back to user
        _transfer(address(this), msg.sender, amount);

        emit TokensUnstaked(msg.sender, amount);
    }

    /**
     * @dev Claim staking rewards
     */
    function claimRewards() external nonReentrant {
        Staker storage staker = stakers[msg.sender];
        if (staker.stakedAmount == 0) revert NoTokensStaked();

        uint256 rewards = _calculateStakingRewards(msg.sender);
        if (rewards == 0) revert NoRewardsToClaim();

        staker.pendingRewards = 0;
        staker.lastRewardTime = block.timestamp;

        _mint(msg.sender, rewards);

        emit RewardsClaimed(msg.sender, rewards);
    }

    /**
     * @dev Calculate staking rewards for a user
     * @param user User address
     * @return Rewards amount
     */
    function _calculateStakingRewards(address user) internal view returns (uint256) {
        Staker storage staker = stakers[user];
        if (staker.stakedAmount == 0) return 0;

        uint256 timeElapsed = block.timestamp - staker.lastRewardTime;
        uint256 rewards = (staker.stakedAmount * stakingRewardRate * timeElapsed) / (365 days * 10000);
        
        return rewards + staker.pendingRewards;
    }

    /**
     * @dev Claim staking rewards (internal)
     * @param user User address
     */
    function _claimStakingRewards(address user) internal {
        uint256 rewards = _calculateStakingRewards(user);
        if (rewards > 0) {
            stakers[user].pendingRewards = rewards;
        }
    }

    /**
     * @dev Get staking info for a user
     * @param user User address
     * @return stakedAmount Amount staked
     * @return pendingRewards Pending rewards
     * @return totalRewards Total rewards earned
     */
    function getStakingInfo(address user) external view returns (
        uint256 stakedAmount,
        uint256 pendingRewards,
        uint256 totalRewards
    ) {
        Staker storage staker = stakers[user];
        stakedAmount = staker.stakedAmount;
        pendingRewards = _calculateStakingRewards(user);
        totalRewards = pendingRewards; // Simplified - in reality you'd track total rewards
    }

    /**
     * @dev Authorize an address to reward tokens
     * @param rewarder Address to authorize
     * @param authorized Whether to authorize or revoke
     */
    function setAuthorizedRewarder(address rewarder, bool authorized) external onlyOwner {
        authorizedRewarders[rewarder] = authorized;
    }

    /**
     * @dev Update win reward amount
     * @param newReward New reward amount
     */
    function setWinReward(uint256 newReward) external onlyOwner {
        winReward = newReward;
        emit WinRewardUpdated(newReward);
    }

    /**
     * @dev Update draw reward amount
     * @param newReward New reward amount
     */
    function setDrawReward(uint256 newReward) external onlyOwner {
        drawReward = newReward;
        emit DrawRewardUpdated(newReward);
    }

    /**
     * @dev Update staking reward rate
     * @param newRate New rate in basis points
     */
    function setStakingRewardRate(uint256 newRate) external onlyOwner {
        if (newRate > 1000) revert RateTooHigh(); // Max 10%
        stakingRewardRate = newRate;
        emit RewardRateUpdated(newRate);
    }

    /**
     * @dev Pause token transfers (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get tokenomics info
     * @return initialSupply Initial token supply
     * @return rewardPool Reward pool size
     * @return teamPool Team pool size
     * @return communityPool Community pool size
     * @return totalDistributed Total rewards distributed
     */
    function getTokenomics() external view returns (
        uint256 initialSupply,
        uint256 rewardPool,
        uint256 teamPool,
        uint256 communityPool,
        uint256 totalDistributed
    ) {
        return (
            INITIAL_SUPPLY,
            REWARD_POOL,
            TEAM_POOL,
            COMMUNITY_POOL,
            totalRewardsDistributed
        );
    }

    // Override required functions
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }
} 