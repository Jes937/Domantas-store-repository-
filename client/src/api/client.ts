import { Api } from "./Api";

// Api.ts is generated - don't edit it.
// Run "bun run generate-client" when the API changes.

// Use the deployed API URL if set, otherwise the local API
let envUrl: string | undefined;
try{
    envUrl = process.env.BUN_PUBLIC_API_URL;
} catch {
    envUrl = undefined;
}

export const api = new Api({
    baseUrl: envUrl || "http://localhost:5221",
    
    //Runs before every call that needs login
    securityWorker: () => {
        //Get the token that the login page saved
        const token = localStorage.getItem("token");
    
        //Not logged in: Send nothing extra
        if (!token) return {};
    
        //Logged in: Send the token in the header
        return { headers: { Authorization: `Bearer ${token}` } };
    },
});