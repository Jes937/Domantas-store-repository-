import { test, expect } from "@playwright/test";

//E2E test: opens a real browser and checks the whole chain works
test("Home page shows API status", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("API status: ok")).toBeVisible();
});