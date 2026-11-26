import { useEffect, useState } from "react";
import { Link } from "react-router";

import { api } from "../api/client";
import type { ScheduleVersion } from "../api/Api";
import { getCurrentUser } from "../auth";

// Monday to Friday, with the keys the API uses
const WORKDAYS = [
    { key: "monday", label: "Mon" },
    { key: "tuesday", label: "Tue" },
    { key: "wednesday", label: "Wed" },
    { key: "thursday", label: "Thu" },
    { key: "friday", label: "Fri" },
] as const;

// "Good morning" / "Good afternoon" / "Good evening" from the clock
function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

// Overview page - the first page after login
export function HomePage() {
    const user = getCurrentUser();
    const canManage = user?.role === "Accountant" || user?.role === "SystemOwner";
    const firstName = (user?.name ?? "").split(" ")[0];

    const [schedule, setSchedule] = useState<ScheduleVersion | null>(null);
    const [scheduleError, setScheduleError] = useState(false);

    // Load my own work schedule for today
    useEffect(() => {
        if (!user?.id) return;
        api.schedule.scheduleGet(user.id)
            .then(res => setSchedule(res.data))
            .catch(() => setScheduleError(true));
    }, [user?.id]);

    const hours = WORKDAYS.map(d => schedule?.hours?.[d.key] ?? 0);
    const maxHours = Math.max(8, ...hours);
    const weekTotal = hours.reduce((sum, h) => sum + h, 0);

    return (
        <section className="overview">
            <div className="overview-head">
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h1>{greeting()}, {firstName}</h1>
                    <p>Here is your holiday at a glance.</p>
                </div>
                <Link to="/apply" className="btn btn-primary overview-apply">+ Apply for holiday</Link>
            </div>

            <div className="overview-grid">
                {/* Left: holiday balance (needs a new endpoint - round 2) */}
                <div className="card overview-balance">
                    <h2>Holiday balance <span className="badge badge-neutral">Coming soon</span></h2>
                    <div className="overview-rings">
                        <div className="overview-ring-box">
                            <div className="overview-ring"><span>–</span><small>hours free</small></div>
                            <div>
                                <strong>Weeks 1–5</strong>
                                <p>Up to 37.00 h holiday debt · 0 or more on 31 Aug</p>
                            </div>
                        </div>
                        <div className="overview-ring-box">
                            <div className="overview-ring"><span>–</span><small>hours free</small></div>
                            <div>
                                <strong>6th holiday week</strong>
                                <p>Separate account · no holiday debt</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="overview-side">
                    <div className="overview-next">
                        <span className="overview-next-label">Next holiday</span>
                        <span className="overview-next-title">Coming soon</span>
                        <span className="overview-next-sub">Your next approved or pending holiday will show here.</span>
                    </div>

                    <div className="card">
                        <h2 style={{ marginBottom: 4 }}>My work schedule</h2>
                        <p className="overview-muted">Set by accounting</p>

                        {scheduleError && <p className="overview-muted">Could not load your schedule.</p>}

                        {!scheduleError && (
                            <>
                                <div className="schedule-bars">
                                    {WORKDAYS.map((d, i) => (
                                        <div className="schedule-bar-row" key={d.key}>
                                            <span>{d.label}</span>
                                            <span className="schedule-bar-track">
                                                <span style={{ width: `${(hours[i]! / maxHours) * 100}%` }} />
                                            </span>
                                            <span className="schedule-bar-hours">{hours[i]!.toFixed(2)} h</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="schedule-bar-total">
                                    <span>Per week</span>
                                    <strong>{weekTotal.toFixed(2)} h</strong>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {canManage && (
                <div className="card overview-manage">
                    <div>
                        <h2 style={{ marginBottom: 4 }}>Employees</h2>
                        <p className="overview-muted">See everyone and open their work schedules.</p>
                    </div>
                    <Link to="/employees" className="btn" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
                        Go to employees
                    </Link>
                </div>
            )}
        </section>
    );
}