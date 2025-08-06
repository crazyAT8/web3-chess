// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ChessNFT
 * @dev NFT contract for chess pieces, boards, and player avatars
 */
contract ChessNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    // Custom errors
    error MintingDisabled();
    error InsufficientMintFee();
    error MaxSupplyReached();
    error InvalidName();
    error InvalidImageURI();
    error InvalidPieceCount();
    error NotAuthorizedToBurn();
    error TokenDoesNotExist();
    error InvalidRarity();
    error InvalidMintPrice();

    // NFT Types
    enum NFTType {
        PIECE,      // Individual chess pieces
        BOARD,      // Chess boards
        AVATAR,     // Player avatars
        SET         // Complete chess sets
    }

    // Rarity levels
    enum Rarity {
        COMMON,
        UNCOMMON,
        RARE,
        EPIC,
        LEGENDARY
    }

    // NFT metadata structure
    struct NFTMetadata {
        NFTType nftType;
        Rarity rarity;
        string name;
        string description;
        string imageURI;
        uint256 mintPrice;
        bool isTradeable;
        uint256 createdAt;
        address creator;
    }

    // Events
    event NFTMinted(uint256 indexed tokenId, address indexed owner, NFTType nftType, Rarity rarity);
    event NFTBurned(uint256 indexed tokenId, address indexed owner);
    event RarityUpdated(uint256 indexed tokenId, Rarity newRarity);
    event MintPriceUpdated(uint256 indexed tokenId, uint256 newPrice);
    event ChessSetMinted(uint256 indexed tokenId, address indexed owner, string setName);
    event MintingEnabledUpdated(bool enabled);
    event MintFeeUpdated(uint256 newFee);
    event MaxSupplyUpdated(uint256 newMaxSupply);
    event FeesWithdrawn(address indexed owner, uint256 amount);

    // State variables
    uint256 private _tokenIds;
    mapping(uint256 => NFTMetadata) public tokenMetadata;
    mapping(address => uint256[]) public ownerTokens;
    mapping(NFTType => uint256) public typeCounts;
    mapping(Rarity => uint256) public rarityCounts;

    uint256 public mintFee = 0.01 ether;
    uint256 public maxSupply = 10000;
    bool public mintingEnabled = true;

    constructor() ERC721("ChessFi NFT", "CHESS") Ownable(msg.sender) {}

    /**
     * @dev Mint a new chess NFT
     * @param nftType Type of NFT to mint
     * @param rarity Rarity level
     * @param name Name of the NFT
     * @param description Description
     * @param imageURI IPFS or HTTP URI for the image
     * @param mintPrice Price for minting
     */
    function mintNFT(
        NFTType nftType,
        Rarity rarity,
        string memory name,
        string memory description,
        string memory imageURI,
        uint256 mintPrice
    ) external payable nonReentrant {
        if (!mintingEnabled) revert MintingDisabled();
        if (msg.value < mintFee) revert InsufficientMintFee();
        if (_tokenIds >= maxSupply) revert MaxSupplyReached();
        if (bytes(name).length == 0) revert InvalidName();
        if (bytes(imageURI).length == 0) revert InvalidImageURI();

        _tokenIds++;
        uint256 tokenId = _tokenIds;

        // Create metadata
        NFTMetadata memory metadata = NFTMetadata({
            nftType: nftType,
            rarity: rarity,
            name: name,
            description: description,
            imageURI: imageURI,
            mintPrice: mintPrice,
            isTradeable: true,
            createdAt: block.timestamp,
            creator: msg.sender
        });

        tokenMetadata[tokenId] = metadata;
        ownerTokens[msg.sender].push(tokenId);
        typeCounts[nftType]++;
        rarityCounts[rarity]++;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, imageURI);

        emit NFTMinted(tokenId, msg.sender, nftType, rarity);
    }

    /**
     * @dev Mint a complete chess set
     * @param setName Name of the set
     * @param description Set description
     * @param imageURI Set image URI
     * @param pieceURIs Array of piece image URIs
     */
    function mintChessSet(
        string memory setName,
        string memory description,
        string memory imageURI,
        string[] memory pieceURIs
    ) external payable nonReentrant {
        if (!mintingEnabled) revert MintingDisabled();
        if (msg.value < mintFee * 2) revert InsufficientMintFee();
        if (pieceURIs.length != 16) revert InvalidPieceCount(); // 16 pieces for a complete set

        // Mint the set NFT
        _tokenIds++;
        uint256 setId = _tokenIds;

        NFTMetadata memory setMetadata = NFTMetadata({
            nftType: NFTType.SET,
            rarity: Rarity.RARE,
            name: setName,
            description: description,
            imageURI: imageURI,
            mintPrice: mintFee * 2,
            isTradeable: true,
            createdAt: block.timestamp,
            creator: msg.sender
        });

        tokenMetadata[setId] = setMetadata;
        ownerTokens[msg.sender].push(setId);
        typeCounts[NFTType.SET]++;
        rarityCounts[Rarity.RARE]++;

        _safeMint(msg.sender, setId);
        _setTokenURI(setId, imageURI);

        emit ChessSetMinted(setId, msg.sender, setName);

        // Mint individual pieces
        for (uint256 i = 0; i < 16; i++) {
            _tokenIds++;
            uint256 pieceId = _tokenIds;

            NFTMetadata memory pieceMetadata = NFTMetadata({
                nftType: NFTType.PIECE,
                rarity: Rarity.COMMON,
                name: string(abi.encodePacked(setName, " Piece ", Strings.toString(i))),
                description: "Part of a complete chess set",
                imageURI: pieceURIs[i],
                mintPrice: 0, // Pieces are part of set
                isTradeable: false,
                createdAt: block.timestamp,
                creator: msg.sender
            });

            tokenMetadata[pieceId] = pieceMetadata;
            ownerTokens[msg.sender].push(pieceId);
            typeCounts[NFTType.PIECE]++;
            rarityCounts[Rarity.COMMON]++;

            _safeMint(msg.sender, pieceId);
            _setTokenURI(pieceId, pieceURIs[i]);

            emit NFTMinted(pieceId, msg.sender, NFTType.PIECE, Rarity.COMMON);
        }
    }

    /**
     * @dev Burn an NFT (only owner or approved)
     * @param tokenId ID of the token to burn
     */
    function burnNFT(uint256 tokenId) external {
        if (ownerOf(tokenId) != msg.sender && getApproved(tokenId) != msg.sender && !isApprovedForAll(ownerOf(tokenId), msg.sender)) {
            revert NotAuthorizedToBurn();
        }
        
        NFTMetadata memory metadata = tokenMetadata[tokenId];
        
        // Update counters
        typeCounts[metadata.nftType]--;
        rarityCounts[metadata.rarity]--;
        
        // Remove from owner's tokens
        uint256[] storage tokens = ownerTokens[ownerOf(tokenId)];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }

        _burn(tokenId);
        delete tokenMetadata[tokenId];

        emit NFTBurned(tokenId, msg.sender);
    }

    /**
     * @dev Update NFT rarity (owner only)
     * @param tokenId ID of the token
     * @param newRarity New rarity level
     */
    function updateRarity(uint256 tokenId, Rarity newRarity) external onlyOwner {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        
        Rarity oldRarity = tokenMetadata[tokenId].rarity;
        rarityCounts[oldRarity]--;
        rarityCounts[newRarity]++;
        
        tokenMetadata[tokenId].rarity = newRarity;
        
        emit RarityUpdated(tokenId, newRarity);
    }

    /**
     * @dev Update mint price (owner only)
     * @param tokenId ID of the token
     * @param newPrice New mint price
     */
    function updateMintPrice(uint256 tokenId, uint256 newPrice) external onlyOwner {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        
        tokenMetadata[tokenId].mintPrice = newPrice;
        
        emit MintPriceUpdated(tokenId, newPrice);
    }

    /**
     * @dev Get all tokens owned by an address
     * @param owner Owner address
     * @return Array of token IDs
     */
    function getTokensByOwner(address owner) external view returns (uint256[] memory) {
        return ownerTokens[owner];
    }

    /**
     * @dev Get tokens by type
     * @param nftType Type to filter by
     * @return Array of token IDs
     */
    function getTokensByType(NFTType nftType) external view returns (uint256[] memory) {
        uint256[] memory allTokens = new uint256[](_tokenIds);
        
        uint256 count = 0;
        uint256[] memory temp = new uint256[](_tokenIds);
        
        for (uint256 i = 1; i <= _tokenIds; i++) {
            if (tokenMetadata[i].nftType == nftType) {
                temp[count] = i;
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = temp[i];
        }
        
        return result;
    }

    /**
     * @dev Get tokens by rarity
     * @param rarity Rarity to filter by
     * @return Array of token IDs
     */
    function getTokensByRarity(Rarity rarity) external view returns (uint256[] memory) {
        uint256 count = 0;
        uint256[] memory temp = new uint256[](_tokenIds);
        
        for (uint256 i = 1; i <= _tokenIds; i++) {
            if (tokenMetadata[i].rarity == rarity) {
                temp[count] = i;
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = temp[i];
        }
        
        return result;
    }

    /**
     * @dev Get NFT metadata
     * @param tokenId ID of the token
     * @return NFT metadata
     */
    function getNFTMetadata(uint256 tokenId) external view returns (NFTMetadata memory) {
        if (ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();
        return tokenMetadata[tokenId];
    }

    /**
     * @dev Get collection statistics
     * @return totalSupply Total number of NFTs
     * @return totalMinted Total minted
     * @return totalBurned Total burned
     * @return piecesCount Number of pieces
     * @return boardsCount Number of boards
     * @return avatarsCount Number of avatars
     */
    function getCollectionStats() external view returns (
        uint256 totalSupply,
        uint256 totalMinted,
        uint256 totalBurned,
        uint256 piecesCount,
        uint256 boardsCount,
        uint256 avatarsCount
    ) {
        totalSupply = _tokenIds;
        totalMinted = _tokenIds;
        totalBurned = 0; // Not implemented yet
        piecesCount = typeCounts[NFTType.PIECE];
        boardsCount = typeCounts[NFTType.BOARD];
        avatarsCount = typeCounts[NFTType.AVATAR];
    }

    /**
     * @dev Set minting status (owner only)
     * @param enabled Whether minting is enabled
     */
    function setMintingEnabled(bool enabled) external onlyOwner {
        mintingEnabled = enabled;
        emit MintingEnabledUpdated(enabled);
    }

    /**
     * @dev Set mint fee (owner only)
     * @param newFee New mint fee
     */
    function setMintFee(uint256 newFee) external onlyOwner {
        mintFee = newFee;
        emit MintFeeUpdated(newFee);
    }

    /**
     * @dev Set max supply (owner only)
     * @param newMaxSupply New max supply
     */
    function setMaxSupply(uint256 newMaxSupply) external onlyOwner {
        if (newMaxSupply < _tokenIds) revert MaxSupplyReached();
        maxSupply = newMaxSupply;
        emit MaxSupplyUpdated(newMaxSupply);
    }

    /**
     * @dev Withdraw collected fees (owner only)
     */
    function withdrawFees() external onlyOwner {
        uint256 amount = address(this).balance;
        payable(owner()).transfer(amount);
        emit FeesWithdrawn(owner(), amount);
    }

    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 