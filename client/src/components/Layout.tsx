import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { getCurrentUser } from "../auth";
import { HolidayYearCard}  from "./HolidayYearCard";

// Shared layout: dark sidebar on the left, the current page on the right
export function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const onLoginPage = location.pathname === "/login";
    const user = getCurrentUser();

    function handleLogout() {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
    }

    // The login page has no sidebar
    if (onLoginPage) {
        return (
            <main className="login-frame">
                <Outlet />
            </main>
        );
    }

    const isAccountant = user?.role === "Accountant";
    const isSystemOwner = user?.role === "SystemOwner";
    const initials = (user?.name ?? "")
        .split(" ")
        .map(part => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="app">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <span className="brand-icon">
                        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"
                             stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="5" width="18" height="16" rx="2" />
                            <path d="M3 10h18" />
                            <path d="M8 3v4" />
                            <path d="M16 3v4" />
                        </svg>
                    </span>
                    <span className="brand-text">
                        <span className="brand-name">Holiday Planner</span>
                        <span className="brand-sub">Holiday and absence</span>
                    </span>
                </div>

                <nav className="sidebar-nav" aria-label="Main">
                    <span className="sidebar-label">My holiday</span>
                    <NavLink to="/" end className="sidebar-link">Overview</NavLink>
                    <NavLink to="/apply" className="sidebar-link">Apply for holiday</NavLink>
                    <NavLink to="/my-requests" className="sidebar-link">My requests</NavLink>
                    <NavLink to="/team-calendar" className="sidebar-link">Team calendar</NavLink>

                    {(isAccountant || isSystemOwner) && (
                        <>
                            <span className="sidebar-label">
                                {isSystemOwner ? "System" : "Accounting"}
                            </span>
                            <NavLink to="/employees" className="sidebar-link">Employees</NavLink>
                            {isAccountant && <NavLink to="/approvals" className="sidebar-link">Approve holiday</NavLink>}
                            {isSystemOwner && <NavLink to="/rules" className="sidebar-link">Global rules</NavLink>}
                        </>
                    )}
                </nav>

                <div className="sidebar-bottom">
                    <HolidayYearCard />
                    <NavLink to="/policy" className="sidebar-link">Holiday policy</NavLink>
                    <div className="sidebar-user">
                        <span className="avatar">{initials}</span>
                        <span className="user-text">
                            <span className="user-name">{user?.name}</span>
                            <span className="user-role">{user?.role}</span>
                        </span>
                    </div>
                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </aside>

            <main className="app-main">
                {/* The current page is shown here */}
                <Outlet />
            </main>
        </div>
    );
}