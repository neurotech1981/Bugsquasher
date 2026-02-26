# AGENTS.md

## Cursor Cloud specific instructions

### Architecture

BugSquasher is a Norwegian-language bug/issue tracking web application with:
- **Frontend**: React 17 (CRA) on port 3000 — root `package.json`
- **Backend**: Express.js API on port 3001 + Socket.IO on port 4000 — `src/backend/`
- **Database**: MongoDB on port 27017

The frontend proxies API calls to the backend via `"proxy": "http://localhost:3001"` in the root `package.json`.

### Starting services

1. **MongoDB**: `sudo mongod --dbpath /data/db --fork --logpath /var/log/mongod.log`
2. **Backend**: `cd src/backend && npm run start:dev` (uses nodemon + babel-node)
3. **Frontend**: `GENERATE_SOURCEMAP=false BROWSER=none npx react-scripts start` from the workspace root (or `npm start`)

### Non-obvious caveats

- **Node version**: The project requires Node 18 (`engines` in `package.json`). Use `nvm use 18`.
- **Legacy peer deps**: Frontend `npm install` requires `--legacy-peer-deps` due to peer dependency conflicts (chartist/react-chartist).
- **ESLint/Prettier**: All ESLint/Prettier formatting errors have been fixed. The frontend builds cleanly without workarounds. Run `npx prettier --write 'src/**/*.js' 'src/**/*.jsx'` after making changes to auto-format.
- **MongoDB IPv6**: On systems where `localhost` resolves to `::1`, MongoDB connections fail. The backend config (`src/backend/config/index.js`) must use `127.0.0.1` instead of `localhost`.
- **Backend config**: `src/backend/config/index.js` is gitignored. Copy from `config/index_example.js` and set `mongoURI` to `mongodb://127.0.0.1:27017/bugsquasher`.
- **Email config**: `src/helpers/config.json` is gitignored. Create it with stub SMTP settings (email features are optional). Example:
  ```json
  {"emailFrom": "noreply@bugsquasher.local", "smtpOptions": {"host": "localhost", "port": 587, "auth": {"user": "", "pass": ""}}}
  ```
- **Uploads directory**: Create `assets/uploads` at the workspace root for multer image uploads.
- **Socket.IO port conflicts**: The backend uses Node.js clustering and forks multiple workers. Only one worker can bind port 4000 for Socket.IO — `EADDRINUSE` errors on port 4000 from other workers are expected and harmless.
- **Backend tests**: Run `cd src/backend && npm test` — 17 tests covering auth and issues API using Jest + Supertest + mongodb-memory-server.
- **Frontend tests**: `CI=true npm test -- --watchAll=false --passWithNoTests` — no frontend tests exist yet.

### Lint / Test / Build

- **Lint**: `npm run lint` (from root) — runs ESLint on `src/**/*.js src/**/*.jsx`
- **Test**: `CI=true npm test -- --watchAll=false --passWithNoTests` (from root)
- **Build**: `npm run build` (from root)

### Test account

Register a user via API (first user gets Admin role):
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@bugsquasher.local","password":"TestPass123","passwordConfirmation":"TestPass123"}'
```
