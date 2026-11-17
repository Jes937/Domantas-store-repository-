
import { Navigate, Outlet, useLocation } from "react-router";

const TOKEN_KEY = "token";

// Checks whether the JWT exists and is not expired.
function hasValidToken(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) return false;

    try {
        const payloadPart = token.split(".")[1];

        if (!payloadPart) return false;

        const payload = JSON.parse(
            atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"))
        );

        return (
            typeof payload.exp === "number" &&
            payload.exp * 1000 > Date.now()
        );
    } catch {
        return false;
    }
}

// Protects routes that require authentication.
export function RequireLogin() {
    const location = useLocation();

    return hasValidToken() ? (
        <Outlet />
    ) : (
        <Navigate
            to="/login"
            replace
            state={{ from: location.pathname }}
        />
    );
}
