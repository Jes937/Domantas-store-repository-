import { useEffect, useState } from "react";
import { Link } from "react-router";

import { api } from "../api/client";
import { HolidayAccount, type AccountBalance, type HealthResponse } from "../api/Api";
import { getCurrentUser } from "../auth";

// Overview page - the first page after login
export function HomePage() {
    const [health, setHealth] = useState<HealthResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [balance, setBalance] = useState<AccountBalance[]>([]);
    const [date, setDate] = useState("");
    const user = getCurrentUser();
    const canManage = user?.role === "Accountant" || user?.role === "SystemOwner";

    // Check that the API is running
    useEffect(() => {
        api.health
            .healthGet()
            .then(res => setHealth(res.data))
            .catch(() => setError("Could not reach the API"));
    }, []);

    useEffect(() => {
        api.balance.balanceGet({ date: date || undefined })
            .then(res => setBalance(res.data))
            .catch(() => setError("Could not load your balance"));
    }, [date]);

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
                    <h2>Holiday balance</h2>
                    <div className="field">
                        <label htmlFor="balanceDate">On date (leave empty for today)</label>
                        <input id="balanceDate" type="date" value={date}
                               onChange={(e) => setDate(e.target.value)} />
                    </div>
                    {balance.map(b => (
                        <p key={b.account}>
                            <strong>{b.account === HolidayAccount.Week6 ? "Week 6" : "Weeks 1-5"}:</strong>{" "}
                            {b.hours?.toFixed(2)} hours
                            {b.expiresOn && <span style={{ color: "var(--text-muted)" }}> · expires {b.expiresOn}</span>}
                        </p>
                    ))}
                </div>

                <div className="card">
                    <h2>My requests</h2>

                    <p style={{ color: "var(--text-muted)" }}>
                        Apply for holiday and follow your requests.
                    </p>

                    <Link to="/my-requests">
                        View my requests
                    </Link>
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
