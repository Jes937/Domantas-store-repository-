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
## Testing strategy

- **TDD** for business logic: the rules from the case are written as unit tests first (red), then the code is written until they pass (green). Example: `HolidayCalculator` (`server/Tests/Unit/HolidayCalculatorTests.cs`).
- **Test-last** for controllers and UI: integration tests (authorization) and E2E tests (login) are written after the feature.

## Authorization

There are three roles. Every person has an Employee account. There is exactly one active Accountant and one active System owner account, each with its own login.

| Role | Can |
|---|---|
| Employee | Log in and see their own data |
| Accountant | Everything an Employee can, plus see all users and approve/decline holiday requests |
| System owner | Everything an Employee can, plus see all users and create, update and deactivate users |

| Endpoint | Who can call it |
|---|---|
| `POST /api/Auth/Login` | Everyone |
| `GET /api/Health` | Everyone |
| `GET /api/weeks` | Logged in users |
| `POST /api/holiday-requests` | Logged in users (always for themselves) |
| `GET /api/holiday-requests/pending` | Accountant |
| `POST /api/holiday-requests/{id}/approve` / `reject` | Accountant |
| `GET /api/users/{userId}/schedule` (+ `/history`) | The user themself, Accountant, System owner |
| `PUT` / `DELETE /api/users/{userId}/schedule/{effectiveFrom}` | Accountant, System owner |
| `GET /api/users` | Accountant, System owner |
| `POST /api/users` | System owner |
| `PUT /api/users/{id}` | System owner |
| `DELETE /api/users/{id}` | System owner |

The rules are tested in `server/Tests/Integration/AuthorizationTests.cs`.

### Test users (development only)
Created when the API runs in Development with an empty database. Password for all: `Password123`

Each test user also gets a full time work schedule (Mon-Thu 7.5, Fri 7 = 37 hours) starting today, and 185 hours on Weeks 1-5 and 37 hours on Week 6.

| Email | Role |
|---|---|
| employee@businessesbjerg.com | Employee |
| accountant@businessesbjerg.com | Accountant |
| owner@businessesbjerg.com | System owner |


## UI guide (frontend)

All pages follow the design in `docs/Holiday Planner modern app concept.pdf`.
Use the shared classes in `client/src/index.css` instead of writing your own colours or buttons.

### Colours
Use the CSS variables, never hard-coded colours:
`var(--accent)`, `var(--accent-dark)`, `var(--text)`, `var(--text-muted)`, `var(--bg)`, `var(--surface)`, `var(--border)`, `var(--danger)`, `var(--success)`.

### Shared classes
| Class | Use it for |
|---|---|
| `page-header` | The page title (`h1`) with a short line of text under it |
| `card` | A white box around a section |
| `table` | Tables (put it inside a `card` with `padding: 0`) |
| `btn` / `btn btn-primary` | Quiet button / main blue button |
| `field` | A form field: `label` on top, `input` or `select` below |
| `alert` | A red error message |
| `badge badge-pending` / `badge-approved` / `badge-rejected` / `badge-neutral` | Status labels |

### Add a new page
1. Create `client/src/pages/MyPage.tsx` and start it with a `page-header`.
2. Add a route in `client/src/App.tsx`, inside `RequireLogin` if a login is needed.
3. Add a `NavLink` with `className="sidebar-link"` in `client/src/components/Layout.tsx`, under the right role section.
4. If the page is planned but not built yet, use `ComingSoonPage` in `App.tsx` and swap it for the real page later.

### Planned pages (placeholders)
`/my-requests`, `/team-calendar` and `/rules` currently show `ComingSoonPage`. Replace them in `App.tsx` when the feature is built.