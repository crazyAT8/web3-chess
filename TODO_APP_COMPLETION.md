# ChessFi App – Full Completion To-Do List

Use this list to fully complete the ChessFi web3 chess application. Items are ordered by dependency and priority. Check off as you go.

---

## Phase 1: Environment & Backend Setup

- [ ] **1.1** Copy `backend/env.template` to `backend/.env` and set:
  - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
  - `POSTGRES_PASSWORD` (for create-database script)
  - `JWT_SECRET` (secure random string)
  - `CORS_ORIGIN` (e.g. `http://localhost:3000`)
- [ ] **1.2** Install and start PostgreSQL; create database (e.g. run `node backend/create-database.js`).
- [ ] **1.3** Run backend DB setup: `cd backend && npm run setup-db` (or equivalent migrations).
- [ ] **1.4** Verify DB: `node backend/test-db.js`.
- [ ] **1.5** Start backend: `cd backend && npm run dev`; confirm `/health` and Socket.IO.

---

## Phase 2: Frontend–Backend Auth (Wallet → JWT → Socket)

- [ ] **2.1** After wallet connect, call backend `GET /api/auth/nonce/:wallet_address` to get sign-in message.
- [ ] **2.2** Prompt user to sign message (e.g. with wagmi/viem `signMessage`).
- [ ] **2.3** Call `POST /api/auth/login` with `wallet_address`, `signature`, `message`; store returned JWT (e.g. `localStorage.setItem('token', token)`).
- [ ] **2.4** If user is new, show optional registration (username) and call `POST /api/auth/register` before or after first login as needed.
- [ ] **2.5** In `SocketContext.tsx`, use stored JWT for socket `auth.token` instead of `'demo-token'` when user is logged in.
- [ ] **2.6** Add logout: clear JWT and disconnect socket; optionally clear wallet state.

---

## Phase 3: On-Chain vs Backend Game Sync

- [ ] **3.1** Define single source of truth: either **backend-led** (create game via API, optional contract later) or **contract-led** (create/join on-chain, then sync to backend).
- [ ] **3.2** If contract-led: when user creates game via `ChessGame.createGame()` or joins via `joinGame(gameId)`:
  - After tx confirmation, call backend `POST /api/games` (or a dedicated endpoint like `POST /api/games/from-contract`) with contract `gameId`, stakes, and player wallet/user id so backend creates a `Game` with `status: 'active'` and links contract game id in metadata.
- [ ] **3.3** If backend-led: keep creating games via `POST /api/games` (opponent, time control, etc.); optionally add “stake with contract” step that creates/joins contract game and stores contract game id on the backend game.
- [ ] **3.4** Ensure game list and game detail (frontend) use backend `GET /api/games` and `GET /api/games/:gameId` so that the same game id is used for Socket.IO `join-game` and `make-move`.

---

## Phase 4: Game Page & Real-Time Play

- [ ] **4.1** Game entry: from “Create game” (contract or API) or “Join game”, set `gameId` to the **backend** game UUID (or the id used by socket and API).
- [ ] **4.2** When entering an active game, call `joinGame(gameId)` (socket) and load game state from `GET /api/games/:gameId` or from initial `game-state` socket event.
- [ ] **4.3** On move: emit `make-move` via socket with backend `gameId`; ensure backend updates `Game` (FEN, turn, moves) and broadcasts `move-made` / `game-state-updated`.
- [ ] **4.4** Fix double turn flip: in `Game.addMove()` (backend), do **not** flip `current_turn` (handler already sets it from `moveResult.turn`). Remove the turn flip from `addMove` or ensure handler is the single place that sets `current_turn`.
- [ ] **4.5** Chess clock: persist `white_time_remaining` and `black_time_remaining` on `Game`; decrement on server (e.g. per move or timer tick) and broadcast updates; frontend displays and optionally syncs with server.
- [ ] **4.6** Draw offer/accept and resign: already in socket handlers; verify frontend calls `offerDraw`, `respondToDraw`, `resign` and that game status/result updates and is reflected in UI.
- [ ] **4.7** Promotion: ensure promotion choice is sent in `move.promotion` and that backend/socket validate and apply it.

---

## Phase 5: Leaderboard & Profile

- [ ] **5.1** Leaderboard: replace hardcoded `topPlayers` in `frontend/src/app/leaderboard/page.tsx` with data from `GET /api/leaderboard/global` and `GET /api/leaderboard/top/:category` (and optionally `GET /api/leaderboard/stats`).
- [ ] **5.2** Profile: load current user from backend (e.g. `GET /api/users/me` or decode JWT and fetch by id); show username, rating, games played, wins, avatar; replace placeholder avatar with `avatar_url` or default.
- [ ] **5.3** Profile update: wire `PUT /api/auth/profile` or `/api/users/profile` for username/avatar if available.

---

## Phase 6: NFT & Tokens

- [ ] **6.1** Replace placeholder `contract_address` in `backend/src/routes/nfts.js` with real ChessNFT address from env or config.
- [ ] **6.2** NFT minting: ensure frontend mint flow uses correct ChessNFT ABI and address; optionally store minted NFT metadata (token id, URI) in backend via `POST /api/nfts` for profile/leaderboard avatars.
- [ ] **6.3** IPFS: add IPFS upload for NFT metadata/image (e.g. Pinata, NFT.Storage, or Infura) and use returned URI in mint.
- [ ] **6.4** Token staking: wire staking form to contract; show balance and staked amount from contract; optional: backend tracking of staked amounts if needed for rewards/display.
- [ ] **6.5** Staking rewards: implement or wire contract/admin flows so ChessToken rewards are sent to players (e.g. after game end or tournament); ensure ChessGame/ChessTournament are set as authorized rewarders on ChessToken.

---

## Phase 7: Tournaments

- [ ] **7.1** Tournament list page: fetch `GET /api/tournaments` and display; filters (status, format) if supported.
- [ ] **7.2** Tournament detail: fetch `GET /api/tournaments/:id`, show info, standings, and games; register button calling `POST /api/tournaments/:id/register` when user is authenticated.
- [ ] **7.3** Optional: sync tournament creation/registration with ChessTournament contract (entry fee, prize pool) and backend; store contract tournament id on backend Tournament model.
- [ ] **7.4** Organizer: start tournament `POST /api/tournaments/:id/start`; implement or refine bracket/pairing (e.g. Swiss) and creation of tournament games in backend.

---

## Phase 8: Polish & Edge Cases

- [ ] **8.1** Game replay: add UI to replay a completed game from `Game.moves` / `current_fen` history (step forward/back).
- [ ] **8.2** Game history list: show user’s games (from API) with result, opponent, date; link to replay or active game.
- [ ] **8.3** Error handling: user-friendly messages for contract revert, network errors, and backend 4xx/5xx; optional toast/notification component.
- [ ] **8.4** Loading states: skeleton or spinners for leaderboard, profile, game list, and during contract txs.
- [ ] **8.5** Replace remaining placeholder avatars (e.g. `/placeholder.svg`) with backend `avatar_url` or default asset.

---

## Phase 9: Smart Contracts

- [ ] **9.1** Run contract tests on deployed Sepolia contracts: `cd contracts && npm run test:deployed` (or equivalent).
- [ ] **9.2** Verify contracts on Etherscan (e.g. `npx hardhat run scripts/verify-sepolia.js` or Etherscan UI).
- [ ] **9.3** If ABIs changed, re-copy from `contracts/artifacts` into `frontend/src/lib/contracts.ts` (or frontend ABI files) and redeploy or refresh addresses in env.
- [ ] **9.4** (Optional) Implement or remove `totalBurned` in ChessNFT if it’s required by interface; currently noted as “not implemented.”

---

## Phase 10: Testing & Deployment

- [ ] **10.1** Backend: run any existing tests; add tests for auth, games, validation, and socket behavior if missing.
- [ ] **10.2** Frontend: add E2E (e.g. Playwright/Cypress) for: connect wallet → login → create/join game → make move; optional: leaderboard and profile.
- [ ] **10.3** Deployment:
  - Backend: set production env (DB, JWT_SECRET, CORS_ORIGIN); deploy (e.g. Railway, Render, Fly.io).
  - Frontend: set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_*` contract/env vars; build and deploy (Vercel/Netlify/etc.).
  - Contracts: deploy to mainnet when ready; verify and update frontend env with production addresses.

---

## Quick Reference – Key Files

| Area            | Backend                          | Frontend                           |
|----------------|-----------------------------------|------------------------------------|
| Auth           | `routes/auth.js`, `middleware/auth.js` | `SocketContext.tsx`, wallet hooks   |
| Games          | `routes/games.js`, `socket/handlers.js`, `models/Game.js` | `app/game/page.tsx`, `GameCreationForm.tsx` |
| Validation     | `routes/validation.js`            | `app/api/validate-move/route.ts`, `chess-utils.ts` |
| Leaderboard    | `routes/leaderboard.js`           | `app/leaderboard/page.tsx`         |
| Tournaments    | `routes/tournaments.js`, `models/Tournament.js` | Add tournament pages                |
| NFTs           | `routes/nfts.js`                  | `app/mint/page.tsx`, `NFTMintForm.tsx` |
| Contracts      | -                                | `lib/contracts.ts`, `config/contracts.ts` |

---

**Status:** In progress — use this list alongside `SETUP_COMPLETION_GUIDE.md` for setup details and troubleshooting.
