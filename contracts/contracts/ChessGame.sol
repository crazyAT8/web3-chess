// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ChessGame
 * @dev Smart contract for managing chess games with Web3 integration
 */
contract ChessGame is ReentrancyGuard, Ownable {

    // Game states
    enum GameState {
        WAITING_FOR_PLAYER,
        ACTIVE,
        WHITE_WON,
        BLACK_WON,
        DRAW,
        CANCELLED
    }

    // Piece types
    enum PieceType {
        PAWN,
        ROOK,
        KNIGHT,
        BISHOP,
        QUEEN,
        KING
    }

    // Move structure
    struct Move {
        uint8 fromRow;
        uint8 fromCol;
        uint8 toRow;
        uint8 toCol;
        PieceType pieceType;
        bool isCapture;
        bool isCheck;
        bool isCheckmate;
        bool isDraw;
        uint256 timestamp;
    }

    // Game structure
    struct Game {
        address whitePlayer;
        address blackPlayer;
        GameState state;
        uint256 stake;
        uint256 gameId;
        uint256 createdAt;
        uint256 lastMoveAt;
        address currentTurn;
        Move[] moves;
        bool whiteAccepted;
        bool blackAccepted;
    }

    // Events
    event GameCreated(uint256 indexed gameId, address indexed creator, uint256 stake);
    event GameJoined(uint256 indexed gameId, address indexed player);
    event MoveMade(uint256 indexed gameId, address indexed player, uint8 fromRow, uint8 fromCol, uint8 toRow, uint8 toCol);
    event GameEnded(uint256 indexed gameId, GameState state, address winner);
    event StakeClaimed(uint256 indexed gameId, address indexed player, uint256 amount);

    // State variables
    uint256 private _gameIds;
    mapping(uint256 => Game) public games;
    mapping(address => uint256[]) public playerGames;
    mapping(address => uint256) public playerStats; // wins
    mapping(address => uint256) public playerRating; // ELO rating

    uint256 public platformFee = 25; // 2.5% (in basis points)
    uint256 public minStake = 0.001 ether;
    uint256 public maxStake = 10 ether;
    uint256 public gameTimeout = 1 hours;

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Create a new chess game
     * @param stake Amount of ETH to stake for the game
     */
    function createGame(uint256 stake) external payable nonReentrant {
        require(msg.value == stake, "Stake amount must match sent value");
        require(stake >= minStake, "Stake too low");
        require(stake <= maxStake, "Stake too high");

        _gameIds++;
        uint256 gameId = _gameIds;

        Game storage game = games[gameId];
        game.whitePlayer = msg.sender;
        game.stake = stake;
        game.gameId = gameId;
        game.createdAt = block.timestamp;
        game.lastMoveAt = block.timestamp;
        game.state = GameState.WAITING_FOR_PLAYER;
        game.whiteAccepted = true;

        playerGames[msg.sender].push(gameId);

        emit GameCreated(gameId, msg.sender, stake);
    }

    /**
     * @dev Join an existing chess game
     * @param gameId ID of the game to join
     */
    function joinGame(uint256 gameId) external payable nonReentrant {
        Game storage game = games[gameId];
        require(game.state == GameState.WAITING_FOR_PLAYER, "Game not available");
        require(msg.sender != game.whitePlayer, "Cannot join your own game");
        require(msg.value == game.stake, "Stake amount must match");

        game.blackPlayer = msg.sender;
        game.blackAccepted = true;
        game.state = GameState.ACTIVE;
        game.currentTurn = game.whitePlayer; // White goes first

        playerGames[msg.sender].push(gameId);

        emit GameJoined(gameId, msg.sender);
    }

    /**
     * @dev Make a move in the game
     * @param gameId ID of the game
     * @param fromRow Starting row (0-7)
     * @param fromCol Starting column (0-7)
     * @param toRow Target row (0-7)
     * @param toCol Target column (0-7)
     * @param pieceType Type of piece being moved
     */
    function makeMove(
        uint256 gameId,
        uint8 fromRow,
        uint8 fromCol,
        uint8 toRow,
        uint8 toCol,
        PieceType pieceType
    ) external nonReentrant {
        Game storage game = games[gameId];
        require(game.state == GameState.ACTIVE, "Game not active");
        require(msg.sender == game.currentTurn, "Not your turn");
        require(
            msg.sender == game.whitePlayer || msg.sender == game.blackPlayer,
            "Not a player in this game"
        );

        // Basic move validation (simplified - full chess logic would be more complex)
        require(fromRow < 8 && fromCol < 8 && toRow < 8 && toCol < 8, "Invalid coordinates");
        require(fromRow != toRow || fromCol != toCol, "Must move to different square");

        // Create move record
        Move memory newMove = Move({
            fromRow: fromRow,
            fromCol: fromCol,
            toRow: toRow,
            toCol: toCol,
            pieceType: pieceType,
            isCapture: false, // Would be determined by game logic
            isCheck: false,   // Would be determined by game logic
            isCheckmate: false, // Would be determined by game logic
            isDraw: false,    // Would be determined by game logic
            timestamp: block.timestamp
        });

        game.moves.push(newMove);
        game.lastMoveAt = block.timestamp;

        // Switch turns
        game.currentTurn = game.currentTurn == game.whitePlayer ? game.blackPlayer : game.whitePlayer;

        emit MoveMade(gameId, msg.sender, fromRow, fromCol, toRow, toCol);

        // Check for game timeout
        if (block.timestamp - game.lastMoveAt > gameTimeout) {
            _endGame(gameId, game.currentTurn == game.whitePlayer ? GameState.BLACK_WON : GameState.WHITE_WON);
        }
    }

    /**
     * @dev End game manually (for testing or admin purposes)
     * @param gameId ID of the game
     * @param state Final game state
     */
    function endGame(uint256 gameId, GameState state) external {
        Game storage game = games[gameId];
        require(
            msg.sender == game.whitePlayer || 
            msg.sender == game.blackPlayer || 
            msg.sender == owner(),
            "Not authorized"
        );
        require(game.state == GameState.ACTIVE, "Game not active");
        
        _endGame(gameId, state);
    }

    /**
     * @dev Internal function to end a game and distribute stakes
     * @param gameId ID of the game
     * @param state Final game state
     */
    function _endGame(uint256 gameId, GameState state) internal {
        Game storage game = games[gameId];
        game.state = state;

        address winner;
        if (state == GameState.WHITE_WON) {
            winner = game.whitePlayer;
            playerStats[game.whitePlayer]++;
        } else if (state == GameState.BLACK_WON) {
            winner = game.blackPlayer;
            playerStats[game.blackPlayer]++;
        }

        // Calculate payouts
        uint256 totalStake = game.stake * 2;
        uint256 fee = (totalStake * platformFee) / 1000;
        uint256 payout = totalStake - fee;

        if (winner != address(0)) {
            // Winner gets the payout
            payable(winner).transfer(payout);
            emit StakeClaimed(gameId, winner, payout);
        } else {
            // Draw - split the pot
            uint256 playerPayout = payout / 2;
            payable(game.whitePlayer).transfer(playerPayout);
            payable(game.blackPlayer).transfer(playerPayout);
            emit StakeClaimed(gameId, game.whitePlayer, playerPayout);
            emit StakeClaimed(gameId, game.blackPlayer, playerPayout);
        }

        // Transfer fee to owner
        if (fee > 0) {
            payable(owner()).transfer(fee);
        }

        emit GameEnded(gameId, state, winner);
    }

    /**
     * @dev Get game details
     * @param gameId ID of the game
     * @return Game details
     */
    function getGame(uint256 gameId) external view returns (Game memory) {
        return games[gameId];
    }

    /**
     * @dev Get player's games
     * @param player Player address
     * @return Array of game IDs
     */
    function getPlayerGames(address player) external view returns (uint256[] memory) {
        return playerGames[player];
    }

    /**
     * @dev Get player stats
     * @param player Player address
     * @return wins Number of wins
     * @return rating Player rating
     */
    function getPlayerStats(address player) external view returns (uint256 wins, uint256 rating) {
        return (playerStats[player], playerRating[player]);
    }

    /**
     * @dev Update platform fee (owner only)
     * @param newFee New fee in basis points
     */
    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 100, "Fee too high"); // Max 10%
        platformFee = newFee;
    }

    /**
     * @dev Update stake limits (owner only)
     * @param newMinStake New minimum stake
     * @param newMaxStake New maximum stake
     */
    function setStakeLimits(uint256 newMinStake, uint256 newMaxStake) external onlyOwner {
        require(newMinStake < newMaxStake, "Invalid stake limits");
        minStake = newMinStake;
        maxStake = newMaxStake;
    }

    /**
     * @dev Update game timeout (owner only)
     * @param newTimeout New timeout in seconds
     */
    function setGameTimeout(uint256 newTimeout) external onlyOwner {
        gameTimeout = newTimeout;
    }

    /**
     * @dev Emergency withdraw (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
} 