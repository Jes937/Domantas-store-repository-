import { useEffect, useState } from "react";
import { Link } from "react-router";

import { api } from "../api/client";
import {
    HolidayAccount,
    RequestStatus,
    type AccountBalance,
    type HolidayRequestSummary,
    type ScheduleVersion,
} from "../api/Api";
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

// "2026-12-21" → "Mon 21 Dec"
function shortDate(iso: string) {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function todayIso() {
    return new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD
}

// One ring: how much of the year's holiday is still free
function BalanceRing({ title, hours, yearHours, note }: { title: string; hours: number | null; yearHours: number; note: string }) {
    const percent = hours === null || yearHours <= 0 ? 0 : Math.max(0, Math.min(100, (hours / yearHours) * 100));

    return (
        <div className="overview-ring-box">
            <div className="overview-ring" style={{ background: `conic-gradient(var(--accent) ${percent}%, #eef1f4 0)` }}>
                <div className="overview-ring-inner">
                    <span>{hours === null ? "–" : hours.toFixed(2)}</span>
                    <small>hours free</small>
                </div>
            </div>
            <div>
                <strong>{title}</strong>
                <p>{note}</p>
            </div>
        </div>
    );
}

// Overview page - the first page after login
export function HomePage() {
    const user = getCurrentUser();
    const canManage = user?.role === "Accountant" || user?.role === "SystemOwner";
    const firstName = (user?.name ?? "").split(" ")[0];

    const [apiError, setApiError] = useState<string | null>(null);
    const [schedule, setSchedule] = useState<ScheduleVersion | null>(null);
    const [scheduleError, setScheduleError] = useState(false);
    const [balance, setBalance] = useState<AccountBalance[]>([]);
    const [balanceError, setBalanceError] = useState(false);
    const [balanceDate, setBalanceDate] = useState("");
    const [requests, setRequests] = useState<HolidayRequestSummary[]>([]);

    // Warn if the API is not running
    useEffect(() => {
        api.health.healthGet().catch(() => setApiError("Could not reach the API"));
    }, []);

    // My own work schedule for today
    useEffect(() => {
        if (!user?.id) return;
        api.schedule.scheduleGet(user.id)
            .then(res => setSchedule(res.data))
            .catch(() => setScheduleError(true));
    }, [user?.id]);

    // My balance - today, or on a chosen future date (Domantas, #43)
    useEffect(() => {
        api.balance.balanceGet({ date: balanceDate || undefined })
            .then(res => { setBalance(res.data); setBalanceError(false); })
            .catch(() => setBalanceError(true));
    }, [balanceDate]);

    // My requests, to find the next holiday
    useEffect(() => {
        api.holidayRequest.holidayRequestGetMine()
            .then(res => setRequests(res.data))
            .catch(() => setRequests([]));
    }, []);

    const hours = WORKDAYS.map(d => schedule?.hours?.[d.key] ?? 0);
    const maxHours = Math.max(8, ...hours);
    const weekTotal = hours.reduce((sum, h) => sum + h, 0);

    const weeks = balance.find(b => b.account === HolidayAccount.Week1To5);
    const sixth = balance.find(b => b.account === HolidayAccount.Week6);

    // Next holiday: the first approved or pending request that has not started yet
    const next = requests
        .filter(r => (r.status === RequestStatus.Pending || r.status === RequestStatus.Approved)
            && (r.startDate ?? "") >= todayIso())
        .sort((a, b) => (a.startDate ?? "").localeCompare(b.startDate ?? ""))[0];

    const daysUntil = next?.startDate
        ? Math.round((new Date(next.startDate + "T00:00:00").getTime() - new Date(todayIso() + "T00:00:00").getTime()) / 86400000)
        : 0;

    return (
        <section className="overview">
            <div className="overview-head">
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h1>{greeting()}, {firstName}</h1>
                    <p>Here is your holiday at a glance.</p>
                </div>
                <Link to="/apply" className="btn btn-primary overview-apply">+ Apply for holiday</Link>
            </div>

            {apiError && <p className="alert" role="alert">{apiError}</p>}

            <div className="overview-grid">
                {/* Left: holiday balance */}
                <div className="card overview-balance">
                    <div className="overview-balance-head">
                        <h2 style={{ margin: 0 }}>Holiday balance</h2>
                        <div className="field overview-date">
                            <label htmlFor="balanceDate">See balance on a date</label>
                            <input id="balanceDate" type="date" value={balanceDate}
                                   onChange={(e) => setBalanceDate(e.target.value)} />
                        </div>
                    </div>

                    {balanceError && <p className="alert" role="alert">Could not load your balance.</p>}

                    <div className="overview-rings">
                        <BalanceRing
                            title="Weeks 1–5"
                            hours={weeks?.hours ?? null}
                            yearHours={weekTotal * 5}
                            note={weeks?.expiresOn ? `Expires ${weeks.expiresOn}` : "Up to 1 week holiday debt · 0 or more on 31 Aug"}
                        />
                        <BalanceRing
                            title="6th holiday week"
                            hours={sixth?.hours ?? null}
                            yearHours={weekTotal}
                            note={sixth?.expiresOn ? `Expires ${sixth.expiresOn}` : "Separate account · no holiday debt"}
                        />
                    </div>

                    <p className="overview-muted" style={{ marginTop: 16, marginBottom: 0 }}>
                        {balanceDate ? `Showing your balance on ${shortDate(balanceDate)}.` : "Showing your balance today."}{" "}
                        <Link to="/my-requests">See my requests</Link>
                    </p>
                </div>

                {/* Right column */}
                <div className="overview-side">
                    <div className="overview-next">
                        <span className="overview-next-label">Next holiday</span>
                        {next?.startDate && next.endDate ? (
                            <>
                                <span className="overview-next-title">
                                    {next.startDate === next.endDate
                                        ? shortDate(next.startDate)
                                        : `${shortDate(next.startDate)} – ${shortDate(next.endDate)}`}
                                </span>
                                <span className="overview-next-chips">
                                    <span>{(next.hours ?? 0).toFixed(2)} h</span>
                                    <span>{next.account === HolidayAccount.Week6 ? "6th week" : "Weeks 1–5"}</span>
                                    <span>{next.status === RequestStatus.Pending ? "Pending" : "Approved"}</span>
                                    <span>{daysUntil === 0 ? "today" : `in ${daysUntil} days`}</span>
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="overview-next-title">No holiday planned</span>
                                <span className="overview-next-sub">Apply for holiday and it will show here.</span>
                            </>
                        )}
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