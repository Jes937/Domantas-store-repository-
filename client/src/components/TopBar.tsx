import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { api } from "../api/client";
import type { WeekDto } from "../api/Api";
import { getCurrentUser } from "../auth";

// Turns the address into "section › page", e.g. "/employees" → ["System", "Employees"]
function getBreadcrumb(path: string, adminSection: string): [string, string] {
    if (path === "/") return ["My holiday", "Overview"];
    if (path === "/apply") return ["My holiday", "Apply for holiday"];
    if (path === "/my-requests") return ["My holiday", "My requests"];
    if (path === "/team-calendar") return ["My holiday", "Team calendar"];
    if (path === "/employees") return [adminSection, "Employees"];
    if (path === "/approvals") return [adminSection, "Approve holiday"];
    if (path === "/rules") return [adminSection, "Global rules"];
    if (path.startsWith("/users/")) return ["Employees", "Work schedule"];
    if (path === "/policy") return ["Help", "Holiday policy"];
    return ["Holiday Planner", "Page not found"];
}

// White bar at the top of every page: breadcrumb on the left, week and date on the right
export function TopBar() {
    const location = useLocation();
    const [week, setWeek] = useState<WeekDto | null>(null);

    const adminSection = getCurrentUser()?.role === "SystemOwner" ? "System" : "Accounting";
    const [section, page] = getBreadcrumb(location.pathname, adminSection);

    const today = new Date().toLocaleDateString("en-GB", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
    });

    // Ask the API which week it is (same rules as the backend)
    useEffect(() => {
        api.week.weekGet()
            .then(res => setWeek(res.data))
            .catch(() => setWeek(null));
    }, []);

    return (
        <header className="top-bar">
            <nav aria-label="Breadcrumb" className="breadcrumb">
                <span>{section}</span>
                <span aria-hidden="true">›</span>
                <span aria-current="page" className="breadcrumb-current">{page}</span>
            </nav>
            <span className="date-chip">
                {week ? `Week ${week.week} · ${today}` : today}
            </span>
        </header>
    );
}