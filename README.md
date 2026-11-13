# Business Esbjerg – Absence Resource Planning

## Structure

| Folder | What |
|---|---|
| `server/API` | .NET Web API (controllers, Swagger) |
| `server/Service` | Business logic |
| `server/Infrastructure` | Database access (Linq2db) |
| `server/Tests` | Unit and integration tests (xUnit) |
| `client` | React + TypeScript client (Bun, React Router) |
| `client/e2e` | E2E tests (Playwright) |

## Run locally

**API**
```bash
cd server
dotnet run --project API --launch-profile http
```
Swagger: http://localhost:5221/swagger

**Client** (in a new terminal)
```bash
cd client
bun install
bun dev
```
Client: http://localhost:3000

## Generate the API client

When an endpoint changes, regenerate the TypeScript client (the API must be running):
```bash
cd client
bun run generate-client
```
Don't edit `client/src/api/Api.ts` by hand.

## Running tests

**Unit + integration (xUnit)**
```bash
cd server
dotnet test
```

**E2E (Playwright)** – starts the API and client automatically
```bash
cd client
bun x playwright install chromium   # first time only
bun run test:e2e
```