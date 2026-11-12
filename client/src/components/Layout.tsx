import { NavLink, Outlet } from "react-router";

//Shared layout for all pages
export function Layout() {
    return (
        <div className="app">
            <header>
                <strong>Business Esbjerg - Ferie</strong>
                <nav>
                    <NavLink to="/">Home</NavLink>
                </nav>
            </header>
            <main>
                {/* The current page is show here */}
                <Outlet />
            </main>
        </div>
    );
}