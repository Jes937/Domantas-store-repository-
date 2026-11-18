// Reads the logged-in user's name and role from the JWT token
export type CurrentUser = {
    name: string;
    role: string; // "Employee", "Accountant" or "SystemOwner"
};

export function getCurrentUser(): CurrentUser | null {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const payloadPart = token.split(".")[1];
        if (!payloadPart) return null;

        const payload = JSON.parse(
            atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"))
        );

        return {
            name: payload.unique_name
                ?? payload.name
                ?? payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]
                ?? "",
            role: payload.role ?? "",
        };
    } catch {
        return null;
    }
}