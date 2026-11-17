
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";

//Shared layout for all pages: header with navigation and logout
export function Layout() {
    //The page the user is on right now
    const location = useLocation();
    const navigate = useNavigate();
    
    const onLoginPage = location.pathname === "/login";

    // Logout user
    function handleLogout() {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
    }

    return (
        <div className="app">
            <header className="app-header">
                <svg
                    aria-hidden="true"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0b5c7a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M3 10h18" />
                    <path d="M8 3v4" />
                    <path d="M16 3v4" />
                </svg>

                <span className="app-name">Holiday Planner</span>

                {!onLoginPage && (
                    <nav className="app-nav">
                        <NavLink to="/">Home</NavLink>

                        <button onClick={handleLogout}>
                            Logout
                        </button>
                    </nav>
                )}
            </header>

            <main className="app-main">
                {/* The current page is shown here */}
                <Outlet />
            </main>
        </div>
    );
}
