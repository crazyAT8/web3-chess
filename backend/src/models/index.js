const User = require('./User');
const Game = require('./Game');
const Tournament = require('./Tournament');
const NFT = require('./NFT');

// User associations
User.hasMany(Game, { as: 'whiteGames', foreignKey: 'white_player_id' });
User.hasMany(Game, { as: 'blackGames', foreignKey: 'black_player_id' });
User.hasMany(Game, { as: 'wonGames', foreignKey: 'winner_id' });
User.hasMany(Tournament, { as: 'organizedTournaments', foreignKey: 'organizer_id' });
User.hasMany(NFT, { as: 'ownedNFTs', foreignKey: 'owner_id' });
User.hasMany(NFT, { as: 'createdNFTs', foreignKey: 'creator_id' });

// Game associations
Game.belongsTo(User, { as: 'whitePlayer', foreignKey: 'white_player_id' });
Game.belongsTo(User, { as: 'blackPlayer', foreignKey: 'black_player_id' });
Game.belongsTo(User, { as: 'winner', foreignKey: 'winner_id' });
Game.belongsTo(Tournament, { as: 'tournament', foreignKey: 'tournament_id' });

// Tournament associations
Tournament.belongsTo(User, { as: 'organizer', foreignKey: 'organizer_id' });
Tournament.hasMany(Game, { as: 'tournamentGames', foreignKey: 'tournament_id' });

// NFT associations
NFT.belongsTo(User, { as: 'owner', foreignKey: 'owner_id' });
NFT.belongsTo(User, { as: 'creator', foreignKey: 'creator_id' });

module.exports = {
  User,
  Game,
  Tournament,
  NFT
}; 