import { NavLink, Outlet } from "react-router";

//Shared layout for all pages
export function Layout() {
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
                <nav className="app-nav">
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/login">Log in</NavLink>
                </nav>
            </header>
            <main className="app-main">
                {/* The current page is shown here */}
                <Outlet />
            </main>
        </div>
    );
}