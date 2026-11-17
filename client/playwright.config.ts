import { defineConfig } from "@playwright/test";

export default defineConfig({
    // Where the E2E tests are
    testDir: "./e2e",
    use: {
        baseURL: "http://localhost:3000",
    },
    // Starts the API and the client before the tests run
    webServer: [
        {
            command: "dotnet run --project ../server/API --launch-profile http",
            url: "http://localhost:5221/api/Health",
            reuseExistingServer: true,
            timeout: 120_000,
            // Own database for E2E, so the test users always exist
            env: { DB: "Data Source=e2e.db" },
        },
        {
            command: "bun src/index.ts",
            url: "http://localhost:3000",
            reuseExistingServer: true,
        },
    ],
});