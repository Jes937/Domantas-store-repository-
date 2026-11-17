import { test, expect } from "@playwright/test";

// Not logged in: you are sent to the login page
test("redirects to login when not logged in", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
});

// Log in through the real UI, API and database
test("employee can log in", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("employee@businessesbjerg.com");
    await page.getByLabel("Password").fill("Password123");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
});