import { useEffect, useState } from "react";
import { Link } from "react-router";

import { api } from "../api/client";
import type { HealthResponse } from "../api/Api";
import { getCurrentUser } from "../auth";

// Overview page - the first page after login
export function HomePage() {
    const [health, setHealth] = useState<HealthResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const user = getCurrentUser();
    const canManage = user?.role === "Accountant" || user?.role === "SystemOwner";

    // Check that the API is running
    useEffect(() => {
        api.health
            .healthGet()
            .then(res => setHealth(res.data))
            .catch(() => setError("Could not reach the API"));
    }, []);

    return (
        <section>
            <div className="page-header">
                <h1>Welcome, {user?.name}</h1>
                <p>Here you get an overview of holiday at Business Esbjerg.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                {canManage && (
                    <div className="card">
                        <h2>Employees</h2>
                        <p style={{ color: "var(--text-muted)" }}>
                            See everyone and open their work schedules.
                        </p>
                        <Link to="/employees">Go to employees</Link>
                    </div>
                )}

                <div className="card">
                    <h2>Holiday balance <span className="badge badge-neutral">Coming soon</span></h2>
                    <p style={{ color: "var(--text-muted)" }}>
                        Your free hours in Weeks 1–5 and the 6th week.
                    </p>
                </div>

                <div className="card">
                    <h2>My requests <span className="badge badge-neutral">Coming soon</span></h2>
                    <p style={{ color: "var(--text-muted)" }}>
                        Apply for holiday and follow your requests.
                    </p>
                </div>
            </div>

            <p style={{ marginTop: 32, fontSize: 13, color: "var(--text-muted)" }}>
                {health && <>API status: {health.status}</>}
                {error && <>{error}</>}
                {!health && !error && <>Checking API...</>}
            </p>
        </section>
    );
}