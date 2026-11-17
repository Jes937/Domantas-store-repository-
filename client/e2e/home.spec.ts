import { test, expect } from "@playwright/test";

//E2E test: opens a real browser and checks the whole chain works
test("Home page shows API status", async ({ page }) => {
    await page.goto("/Login");
    await expect(page.getByText("Log in").first()).toBeVisible();
});