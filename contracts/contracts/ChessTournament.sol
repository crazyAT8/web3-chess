// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ChessGame.sol";

/**
 * @title ChessTournament
 * @dev Smart contract for managing chess tournaments with prize pools
 */
contract ChessTournament is ReentrancyGuard, Ownable {

    // Tournament states
    enum TournamentState {
        REGISTRATION,
        ACTIVE,
        FINISHED,
        CANCELLED
    }

    // Tournament types
    enum TournamentType {
        SINGLE_ELIMINATION,
        DOUBLE_ELIMINATION,
        ROUND_ROBIN,
        SWISS
    }

    // Match structure
    struct Match {
        uint256 matchId;
        address player1;
        address player2;
        uint256 gameId;
        address winner;
        bool isComplete;
        uint256 round;
        uint256 matchNumber;
    }

    // Tournament structure
    struct Tournament {
        uint256 tournamentId;
        string name;
        string description;
        TournamentType tournamentType;
        TournamentState state;
        uint256 entryFee;
        uint256 prizePool;
        uint256 maxPlayers;
        uint256 currentPlayers;
        uint256 startTime;
        uint256 endTime;
        address[] players;
        Match[] matches;
        mapping(address => bool) registeredPlayers;
        mapping(uint256 => Match) matchMap;
        uint256 totalRounds;
        uint256 currentRound;
    }

    // Events
    event TournamentCreated(uint256 indexed tournamentId, string name, uint256 entryFee, uint256 maxPlayers);
    event PlayerRegistered(uint256 indexed tournamentId, address indexed player);
    event TournamentStarted(uint256 indexed tournamentId);
    event MatchCreated(uint256 indexed tournamentId, uint256 indexed matchId, address player1, address player2);
    event MatchCompleted(uint256 indexed tournamentId, uint256 indexed matchId, address winner);
    event TournamentFinished(uint256 indexed tournamentId, address winner, uint256 prize);
    event PrizeDistributed(uint256 indexed tournamentId, address player, uint256 amount);

    // State variables
    uint256 private _tournamentIds;
    mapping(uint256 => Tournament) public tournaments;
    mapping(address => uint256[]) public playerTournaments;
    
    ChessGame public chessGameContract;
    uint256 public platformFee = 50; // 5% (in basis points)
    uint256 public minEntryFee = 0.001 ether;
    uint256 public maxEntryFee = 5 ether;

    constructor(address _chessGameContract) Ownable(msg.sender) {
        chessGameContract = ChessGame(_chessGameContract);
    }

    /**
     * @dev Create a new tournament
     * @param name Tournament name
     * @param description Tournament description
     * @param tournamentType Type of tournament
     * @param entryFee Entry fee per player
     * @param maxPlayers Maximum number of players
     * @param startTime Tournament start time
     */
    function createTournament(
        string memory name,
        string memory description,
        TournamentType tournamentType,
        uint256 entryFee,
        uint256 maxPlayers,
        uint256 startTime
    ) external onlyOwner {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(entryFee >= minEntryFee, "Entry fee too low");
        require(entryFee <= maxEntryFee, "Entry fee too high");
        require(maxPlayers >= 2, "Need at least 2 players");
        require(startTime > block.timestamp, "Start time must be in the future");

        _tournamentIds++;
        uint256 tournamentId = _tournamentIds;

        Tournament storage tournament = tournaments[tournamentId];
        tournament.tournamentId = tournamentId;
        tournament.name = name;
        tournament.description = description;
        tournament.tournamentType = tournamentType;
        tournament.state = TournamentState.REGISTRATION;
        tournament.entryFee = entryFee;
        tournament.maxPlayers = maxPlayers;
        tournament.startTime = startTime;
        tournament.currentRound = 0;

        // Calculate total rounds based on tournament type
        if (tournamentType == TournamentType.SINGLE_ELIMINATION) {
            tournament.totalRounds = _calculateRounds(maxPlayers);
        } else if (tournamentType == TournamentType.DOUBLE_ELIMINATION) {
            tournament.totalRounds = _calculateRounds(maxPlayers) * 2;
        } else {
            tournament.totalRounds = maxPlayers - 1; // Round robin
        }

        emit TournamentCreated(tournamentId, name, entryFee, maxPlayers);
    }

    /**
     * @dev Register for a tournament
     * @param tournamentId ID of the tournament
     */
    function registerForTournament(uint256 tournamentId) external payable nonReentrant {
        Tournament storage tournament = tournaments[tournamentId];
        require(tournament.state == TournamentState.REGISTRATION, "Tournament not in registration");
        require(!tournament.registeredPlayers[msg.sender], "Already registered");
        require(tournament.currentPlayers < tournament.maxPlayers, "Tournament full");
        require(msg.value == tournament.entryFee, "Incorrect entry fee");

        tournament.registeredPlayers[msg.sender] = true;
        tournament.players.push(msg.sender);
        tournament.currentPlayers++;
        tournament.prizePool += tournament.entryFee;

        playerTournaments[msg.sender].push(tournamentId);

        emit PlayerRegistered(tournamentId, msg.sender);

        // Auto-start tournament if full
        if (tournament.currentPlayers == tournament.maxPlayers) {
            _startTournament(tournamentId);
        }
    }

    /**
     * @dev Start a tournament manually (owner only)
     * @param tournamentId ID of the tournament
     */
    function startTournament(uint256 tournamentId) external onlyOwner {
        Tournament storage tournament = tournaments[tournamentId];
        require(tournament.state == TournamentState.REGISTRATION, "Tournament not in registration");
        require(tournament.currentPlayers >= 2, "Need at least 2 players");
        require(block.timestamp >= tournament.startTime, "Tournament not ready to start");

        _startTournament(tournamentId);
    }

    /**
     * @dev Internal function to start a tournament
     * @param tournamentId ID of the tournament
     */
    function _startTournament(uint256 tournamentId) internal {
        Tournament storage tournament = tournaments[tournamentId];
        tournament.state = TournamentState.ACTIVE;
        tournament.currentRound = 1;

        // Create first round matches
        _createRoundMatches(tournamentId, 1);

        emit TournamentStarted(tournamentId);
    }

    /**
     * @dev Create matches for a specific round
     * @param tournamentId ID of the tournament
     * @param round Round number
     */
    function _createRoundMatches(uint256 tournamentId, uint256 round) internal {
        Tournament storage tournament = tournaments[tournamentId];
        
        if (tournament.tournamentType == TournamentType.SINGLE_ELIMINATION) {
            _createSingleEliminationMatches(tournamentId, round);
        } else if (tournament.tournamentType == TournamentType.ROUND_ROBIN) {
            _createRoundRobinMatches(tournamentId, round);
        }
    }

    /**
     * @dev Create single elimination matches
     * @param tournamentId ID of the tournament
     * @param round Round number
     */
    function _createSingleEliminationMatches(uint256 tournamentId, uint256 round) internal {
        Tournament storage tournament = tournaments[tournamentId];
        
        if (round == 1) {
            // First round - pair all players
            uint256 matchCount = tournament.players.length / 2;
            for (uint256 i = 0; i < matchCount; i++) {
                address player1 = tournament.players[i * 2];
                address player2 = tournament.players[i * 2 + 1];
                
                _createMatch(tournamentId, player1, player2, round, i + 1);
            }
        } else {
            // Later rounds - create matches from previous winners
            address[] memory winners = _getRoundWinners(tournamentId, round - 1);
            uint256 matchCount = winners.length / 2;
            
            for (uint256 i = 0; i < matchCount; i++) {
                address player1 = winners[i * 2];
                address player2 = winners[i * 2 + 1];
                
                _createMatch(tournamentId, player1, player2, round, i + 1);
            }
        }
    }

    /**
     * @dev Create round robin matches
     * @param tournamentId ID of the tournament
     * @param round Round number
     */
    function _createRoundRobinMatches(uint256 tournamentId, uint256 round) internal {
        Tournament storage tournament = tournaments[tournamentId];
        
        // Simple round robin pairing
        uint256 playerCount = tournament.players.length;
        for (uint256 i = 0; i < playerCount / 2; i++) {
            address player1 = tournament.players[i];
            address player2 = tournament.players[playerCount - 1 - i];
            
            _createMatch(tournamentId, player1, player2, round, i + 1);
        }
    }

    /**
     * @dev Create a match
     * @param tournamentId ID of the tournament
     * @param player1 First player
     * @param player2 Second player
     * @param round Round number
     * @param matchNumber Match number in the round
     */
    function _createMatch(uint256 tournamentId, address player1, address player2, uint256 round, uint256 matchNumber) internal {
        Tournament storage tournament = tournaments[tournamentId];
        
        Match memory newMatch = Match({
            matchId: tournament.matches.length + 1,
            player1: player1,
            player2: player2,
            gameId: 0, // Will be set when game is created
            winner: address(0),
            isComplete: false,
            round: round,
            matchNumber: matchNumber
        });

        tournament.matches.push(newMatch);
        tournament.matchMap[newMatch.matchId] = newMatch;

        emit MatchCreated(tournamentId, newMatch.matchId, player1, player2);
    }

    /**
     * @dev Complete a match
     * @param tournamentId ID of the tournament
     * @param matchId ID of the match
     * @param winner Winner of the match
     */
    function completeMatch(uint256 tournamentId, uint256 matchId, address winner) external onlyOwner {
        Tournament storage tournament = tournaments[tournamentId];
        require(tournament.state == TournamentState.ACTIVE, "Tournament not active");
        
        Match storage currentMatch = tournament.matchMap[matchId];
        require(!currentMatch.isComplete, "Match already complete");
        require(winner == currentMatch.player1 || winner == currentMatch.player2, "Invalid winner");

        currentMatch.winner = winner;
        currentMatch.isComplete = true;

        emit MatchCompleted(tournamentId, matchId, winner);

        // Check if round is complete
        if (_isRoundComplete(tournamentId, currentMatch.round)) {
            if (currentMatch.round == tournament.totalRounds) {
                _finishTournament(tournamentId, winner);
            } else {
                _advanceToNextRound(tournamentId);
            }
        }
    }

    /**
     * @dev Check if a round is complete
     * @param tournamentId ID of the tournament
     * @param round Round number
     * @return True if round is complete
     */
    function _isRoundComplete(uint256 tournamentId, uint256 round) internal view returns (bool) {
        Tournament storage tournament = tournaments[tournamentId];
        
        for (uint256 i = 0; i < tournament.matches.length; i++) {
            if (tournament.matches[i].round == round && !tournament.matches[i].isComplete) {
                return false;
            }
        }
        return true;
    }

    /**
     * @dev Advance to the next round
     * @param tournamentId ID of the tournament
     */
    function _advanceToNextRound(uint256 tournamentId) internal {
        Tournament storage tournament = tournaments[tournamentId];
        tournament.currentRound++;
        _createRoundMatches(tournamentId, tournament.currentRound);
    }

    /**
     * @dev Finish a tournament
     * @param tournamentId ID of the tournament
     * @param winner Tournament winner
     */
    function _finishTournament(uint256 tournamentId, address winner) internal {
        Tournament storage tournament = tournaments[tournamentId];
        tournament.state = TournamentState.FINISHED;
        tournament.endTime = block.timestamp;

        // Calculate and distribute prizes
        uint256 totalPrize = tournament.prizePool;
        uint256 fee = (totalPrize * platformFee) / 1000;
        uint256 winnerPrize = totalPrize - fee;

        payable(winner).transfer(winnerPrize);
        if (fee > 0) {
            payable(owner()).transfer(fee);
        }

        emit TournamentFinished(tournamentId, winner, winnerPrize);
        emit PrizeDistributed(tournamentId, winner, winnerPrize);
    }

    /**
     * @dev Get winners from a specific round
     * @param tournamentId ID of the tournament
     * @param round Round number
     * @return Array of winner addresses
     */
    function _getRoundWinners(uint256 tournamentId, uint256 round) internal view returns (address[] memory) {
        Tournament storage tournament = tournaments[tournamentId];
        
        uint256 winnerCount = 0;
        for (uint256 i = 0; i < tournament.matches.length; i++) {
            if (tournament.matches[i].round == round && tournament.matches[i].isComplete) {
                winnerCount++;
            }
        }

        address[] memory winners = new address[](winnerCount);
        uint256 index = 0;
        for (uint256 i = 0; i < tournament.matches.length; i++) {
            if (tournament.matches[i].round == round && tournament.matches[i].isComplete) {
                winners[index] = tournament.matches[i].winner;
                index++;
            }
        }

        return winners;
    }

    /**
     * @dev Calculate number of rounds needed for single elimination
     * @param playerCount Number of players
     * @return Number of rounds
     */
    function _calculateRounds(uint256 playerCount) internal pure returns (uint256) {
        uint256 rounds = 0;
        uint256 temp = playerCount;
        while (temp > 1) {
            temp = temp / 2;
            rounds++;
        }
        return rounds;
    }

    /**
     * @dev Get tournament details
     * @param tournamentId ID of the tournament
     * @return id Tournament ID
     * @return name Tournament name
     * @return description Tournament description
     * @return tournamentType Tournament type
     * @return state Tournament state
     * @return entryFee Entry fee
     * @return prizePool Prize pool
     * @return maxPlayers Maximum players
     * @return currentPlayers Current players
     * @return startTime Start time
     * @return endTime End time
     * @return totalRounds Total rounds
     * @return currentRound Current round
     */
    function getTournament(uint256 tournamentId) external view returns (
        uint256 id,
        string memory name,
        string memory description,
        TournamentType tournamentType,
        TournamentState state,
        uint256 entryFee,
        uint256 prizePool,
        uint256 maxPlayers,
        uint256 currentPlayers,
        uint256 startTime,
        uint256 endTime,
        uint256 totalRounds,
        uint256 currentRound
    ) {
        Tournament storage tournament = tournaments[tournamentId];
        return (
            tournament.tournamentId,
            tournament.name,
            tournament.description,
            tournament.tournamentType,
            tournament.state,
            tournament.entryFee,
            tournament.prizePool,
            tournament.maxPlayers,
            tournament.currentPlayers,
            tournament.startTime,
            tournament.endTime,
            tournament.totalRounds,
            tournament.currentRound
        );
    }

    /**
     * @dev Get tournament players
     * @param tournamentId ID of the tournament
     * @return Array of player addresses
     */
    function getTournamentPlayers(uint256 tournamentId) external view returns (address[] memory) {
        return tournaments[tournamentId].players;
    }

    /**
     * @dev Get tournament matches
     * @param tournamentId ID of the tournament
     * @return Array of matches
     */
    function getTournamentMatches(uint256 tournamentId) external view returns (Match[] memory) {
        return tournaments[tournamentId].matches;
    }

    /**
     * @dev Check if player is registered for tournament
     * @param tournamentId ID of the tournament
     * @param player Player address
     * @return True if registered
     */
    function isPlayerRegistered(uint256 tournamentId, address player) external view returns (bool) {
        return tournaments[tournamentId].registeredPlayers[player];
    }

    /**
     * @dev Get player's tournaments
     * @param player Player address
     * @return Array of tournament IDs
     */
    function getPlayerTournaments(address player) external view returns (uint256[] memory) {
        return playerTournaments[player];
    }

    /**
     * @dev Set platform fee (owner only)
     * @param newFee New fee in basis points
     */
    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 100, "Fee too high"); // Max 10%
        platformFee = newFee;
    }

    /**
     * @dev Set entry fee limits (owner only)
     * @param newMinFee New minimum entry fee
     * @param newMaxFee New maximum entry fee
     */
    function setEntryFeeLimits(uint256 newMinFee, uint256 newMaxFee) external onlyOwner {
        require(newMinFee < newMaxFee, "Invalid fee limits");
        minEntryFee = newMinFee;
        maxEntryFee = newMaxFee;
    }

    /**
     * @dev Emergency withdraw (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
} 