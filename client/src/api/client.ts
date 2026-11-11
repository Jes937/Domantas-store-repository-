import { Api } from "./Api";

// Api.ts is generated - don't edit it.
// Run "bun run generate-client" when the API changes.

// Use the deployed API URL if set, otherwise the local API
let envUrl: string | undefined;
try{
    envUrl = process.env.Bun_PUBLIC_API_URL;
} catch {
    envUrl = undefined;
}

export const api = new Api({ baseUrl: envUrl || "http://localhost:5221" });