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

// The five working days shown in "My work schedule"
const WORKDAYS = [
    { key: "monday", label: "Mon" },
    { key: "tuesday", label: "Tue" },
    { key: "wednesday", label: "Wed" },
    { key: "thursday", label: "Thu" },
    { key: "friday", label: "Fri" },
] as const;

// ---------- Small helpers ----------

// "Good morning" / "Good afternoon" / "Good evening"
function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

// A date as "YYYY-MM-DD" in local time
function toIso(d: Date) {
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
}

// "2026-12-21" -> "21 Dec"
function shortDate(iso?: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// "2026-12-21" -> "Mon 21 Dec"
function dayDate(iso?: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

// 12.5 -> "12.50"
function h(value: number) {
    return value.toFixed(2);
}

// The dates for "Plan ahead": today, the 1st of every month, and 31 Aug
// (the holiday year runs from 1 Sep to 31 Aug)
function planDates() {
    const today = new Date();
    const endYear = today.getMonth() >= 8 ? today.getFullYear() + 1 : today.getFullYear();
    const end = new Date(endYear, 7, 31);

    const dates = [{ iso: toIso(today), label: "Today" }];
    const d = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    while (d <= end) {
        dates.push({ iso: toIso(d), label: shortDate(toIso(d)) });
        d.setMonth(d.getMonth() + 1);
    }
    dates.push({ iso: toIso(end), label: "31 Aug" });
    return dates;
}

// ---------- The ring ----------

// Draws one ring: free (blue), planned (orange) and used (grey) as parts of "total"
const CIRCLE = 2 * Math.PI * 50;

function Ring({ free, planned, used = 0, total }: { free: number; planned: number; used?: number; total: number }) {
    const part = (value: number) => (total > 0 ? (Math.max(0, value) / total) * CIRCLE : 0);
    const a = part(free);
    const b = part(planned);
    const c = part(used);

    return (
        <div className="ring">
            <svg aria-hidden="true" width="124" height="124" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" className="ring-track" />
                <circle cx="60" cy="60" r="50" className="ring-free"
                        strokeDasharray={`${a} ${CIRCLE}`} transform="rotate(-90 60 60)" />
                <circle cx="60" cy="60" r="50" className="ring-planned"
                        strokeDasharray={`${b} ${CIRCLE}`} strokeDashoffset={-a} transform="rotate(-90 60 60)" />
                <circle cx="60" cy="60" r="50" className="ring-used"
                        strokeDasharray={`${c} ${CIRCLE}`} strokeDashoffset={-(a + b)} transform="rotate(-90 60 60)" />
            </svg>
            <div className="ring-label">
                <span>{h(free)}</span>
                <small>hours free</small>
            </div>
        </div>
    );
}

// ---------- The page ----------

// Overview page - the first page after login
export function HomePage() {
    const user = getCurrentUser();
    const canManage = user?.role === "Accountant" || user?.role === "SystemOwner";

    const [apiError, setApiError] = useState<string | null>(null);
    const [schedule, setSchedule] = useState<ScheduleVersion | null>(null);
    const [balance, setBalance] = useState<AccountBalance[]>([]);
    const [balanceError, setBalanceError] = useState<string | null>(null);
    const [requests, setRequests] = useState<HolidayRequestSummary[]>([]);

    // Plan ahead: free hours in Weeks 1-5 on each date
    const [plan] = useState(planDates);
    const [planHours, setPlanHours] = useState<number[]>([]);
    const [picked, setPicked] = useState(Math.min(2, plan.length - 1));

    // Check that the API is running (only shows something if it is not)
    useEffect(() => {
        api.health.healthGet().catch(() => setApiError("Could not reach the API"));
    }, []);

    // My work schedule
    useEffect(() => {
        if (!user?.id) return;
        api.schedule
            .scheduleGet(user.id)
            .then(res => setSchedule(res.data))
            .catch(() => setSchedule(null));
    }, [user?.id]);

    // Balance today
    useEffect(() => {
        api.balance
            .balanceGet()
            .then(res => setBalance(res.data))
            .catch(() => setBalanceError("Could not load your balance"));
    }, []);

    // Balance on every "Plan ahead" date (Domantas's future balance endpoint)
    useEffect(() => {
        Promise.all(plan.map(p => api.balance.balanceGet({ date: p.iso })))
            .then(results => setPlanHours(results.map(res =>
                res.data.find(b => b.account === HolidayAccount.Week1To5)?.hours ?? 0)))
            .catch(() => setPlanHours([]));
    }, [plan]);

    // My holiday requests
    useEffect(() => {
        void loadRequests();
    }, []);

    async function loadRequests() {
        try {
            const res = await api.holidayRequest.holidayRequestGetMine();
            setRequests(res.data);
        } catch {
            setRequests([]);
        }
    }

    // Cancel a pending request (Jes's cancel endpoint)
    async function cancelRequest(request: HolidayRequestSummary) {
        if (!window.confirm("Cancel this holiday request?")) return;

        try {
            await api.holidayRequest.holidayRequestCancel(request.requestId!);
            await loadRequests();
            const res = await api.balance.balanceGet();
            setBalance(res.data);
        } catch {
            setApiError("Could not cancel the request");
        }
    }

    // ---------- Numbers for the cards ----------

    const today = toIso(new Date());
    const hours = schedule?.hours;
    const dayHours = WORKDAYS.map(d => ({ label: d.label, value: hours?.[d.key] ?? 0 }));
    const weekTotal = dayHours.reduce((sum, d) => sum + d.value, 0);
    const maxDay = Math.max(...dayHours.map(d => d.value), 1);
    const hoursPerDay = weekTotal / 5;

    const weeks1To5 = balance.find(b => b.account === HolidayAccount.Week1To5);
    const week6 = balance.find(b => b.account === HolidayAccount.Week6);
    const freeW = weeks1To5?.hours ?? 0;
    const freeS = week6?.hours ?? 0;

    // Planned = pending or approved holiday that has not started yet
    const upcoming = requests
        .filter(r =>
            (r.status === RequestStatus.Pending || r.status === RequestStatus.Approved) &&
            (r.startDate ?? "") >= today)
        .sort((a, b) => (a.startDate ?? "").localeCompare(b.startDate ?? ""));

    const plannedIn = (account: HolidayAccount) =>
        upcoming.filter(r => r.account === account).reduce((sum, r) => sum + (r.hours ?? 0), 0);
    const plannedW = plannedIn(HolidayAccount.Week1To5);
    const plannedS = plannedIn(HolidayAccount.Week6);

    // Used 6th week = approved holiday this holiday year that has already started
    const now = new Date();
    const yearStart = toIso(new Date(now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1, 8, 1));
    const usedS = requests
        .filter(r =>
            r.account === HolidayAccount.Week6 &&
            r.status === RequestStatus.Approved &&
            (r.startDate ?? "") < today &&
            (r.startDate ?? "") >= yearStart)
        .reduce((sum, r) => sum + (r.hours ?? 0), 0);

    // Next holiday
    const next = upcoming[0];
    const daysUntil = next?.startDate
        ? Math.round((new Date(next.startDate).getTime() - new Date(today).getTime()) / 86400000)
        : null;

    // Plan ahead
    const maxPlan = Math.max(...planHours, 1);
    const pickedHours = planHours[picked] ?? 0;
    const pickedLabel = picked === 0
        ? "today"
        : new Date(plan[picked]!.iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

    return (
        <section className="overview">
            {/* Heading + Apply button */}
            <div className="overview-header">
                <div>
                    <h1>{greeting()}, {user?.name}</h1>
                    <p>
                        You have {h(freeW)} hours free in Weeks 1–5 and {h(freeS)} hours in your 6th week.
                        Your schedule is {h(weekTotal)} hours a week.
                    </p>
                </div>
                <Link to="/apply" className="btn btn-primary">+ Apply for holiday</Link>
            </div>

            {apiError && <div className="alert">{apiError}</div>}
            {balanceError && <div className="alert">{balanceError}</div>}

            {/* Top row: balance on the left, next holiday + transfer on the right */}
            <div className="overview-top">
                <div className="card overview-balance">
                    <div className="overview-card-head">
                        <h2>Holiday balance</h2>
                        <div className="legend">
                            <span><i className="legend-free" />Free</span>
                            <span><i className="legend-planned" />Planned</span>
                            <span><i className="legend-used" />Used</span>
                        </div>
                    </div>

                    <div className="overview-accounts">
                        <div className="account">
                            <Ring free={freeW} planned={plannedW} total={Math.max(freeW + plannedW, weekTotal * 5)} />
                            <div className="account-rows">
                                <strong>Weeks 1–5</strong>
                                <div><span>Balance</span><b>{h(freeW + plannedW)} h</b></div>
                                <div><span>Planned</span><b>{h(plannedW)} h</b></div>
                                <div><span>Earned per month</span><b>{h((weekTotal * 5) / 12)} h</b></div>
                                <small>
                                    {weeks1To5?.expiresOn ? `Use by ${shortDate(weeks1To5.expiresOn)}` : "Main holiday"}
                                </small>
                            </div>
                        </div>

                        <div className="account">
                            <Ring free={freeS} planned={plannedS} used={usedS}
                                  total={Math.max(freeS + plannedS + usedS, weekTotal)} />
                            <div className="account-rows">
                                <strong>6th holiday week</strong>
                                <div><span>This year</span><b>{h(weekTotal)} h</b></div>
                                <div><span>Planned</span><b>{h(plannedS)} h</b></div>
                                <div><span>Used</span><b>{h(usedS)} h</b></div>
                                <small>
                                    Separate account
                                    {week6?.expiresOn ? ` · use by ${shortDate(week6.expiresOn)}` : ""}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overview-side">
                    {/* Next holiday (dark card) */}
                    <div className="overview-next">
                        <div className="overview-next-head">
                            <span className="overview-next-label">Next holiday</span>
                            {next && (
                                <span className={next.status === RequestStatus.Approved ? "pill pill-approved" : "pill pill-pending"}>
                                    {next.status === RequestStatus.Approved ? "Approved" : "Pending"}
                                </span>
                            )}
                        </div>

                        {next ? (
                            <>
                                <span className="overview-next-title">
                                    {dayDate(next.startDate)} – {dayDate(next.endDate)}
                                </span>
                                <div className="overview-next-chips">
                                    <span className="mono">{h(next.hours ?? 0)} h</span>
                                    <span>{next.account === HolidayAccount.Week6 ? "6th week" : "Weeks 1–5"}</span>
                                    {daysUntil !== null && <span>{daysUntil === 0 ? "Today" : `in ${daysUntil} days`}</span>}
                                </div>
                                {next.status === RequestStatus.Pending && (
                                    <button type="button" className="overview-next-cancel" onClick={() => cancelRequest(next)}>
                                        Cancel request
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <span className="overview-next-title">No holiday planned</span>
                                <Link to="/my-requests" className="overview-next-link">See my requests →</Link>
                            </>
                        )}
                    </div>

                    {/* Transfer (not built yet - shown switched off) */}
                    <div className="card overview-transfer">
                        <h2>⇄ Transfer to next year</h2>
                        <p>Up to 1 week of unused holiday can move on, with the accountant's approval and a written agreement.</p>
                        <div className="overview-transfer-foot">
                            <button type="button" className="btn" disabled>Request transfer</button>
                            <span>Switched off by the company for now</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plan ahead */}
            <div className="card overview-plan">
                <div className="overview-plan-text">
                    <h2>Plan ahead</h2>
                    <p>How much could you take if you wait? Pick a date to see your free hours in Weeks 1–5 on that day.</p>
                    <div className="overview-plan-result">
                        <span>Free on {pickedLabel}</span>
                        <strong>{h(pickedHours)} h</strong>
                        <span>
                            About {hoursPerDay > 0 ? (pickedHours / hoursPerDay).toFixed(1) : "0"} working days
                        </span>
                    </div>
                </div>

                <div className="overview-plan-chart">
                    <div className="plan-bars" style={{ gridTemplateColumns: `repeat(${plan.length}, minmax(0, 1fr))` }}>
                        {plan.map((p, i) => (
                            <button
                                key={p.iso}
                                type="button"
                                className={i === picked ? "plan-bar plan-bar-picked" : "plan-bar"}
                                style={{ height: `${((planHours[i] ?? 0) / maxPlan) * 100}%` }}
                                aria-pressed={i === picked}
                                aria-label={`${p.label}: ${h(planHours[i] ?? 0)} hours`}
                                onClick={() => setPicked(i)}
                            >
                                {Math.round(planHours[i] ?? 0)}
                            </button>
                        ))}
                    </div>
                    <div className="plan-labels" style={{ gridTemplateColumns: `repeat(${plan.length}, minmax(0, 1fr))` }}>
                        {plan.map((p, i) => (
                            <span key={p.iso} className={i === picked ? "plan-label-picked" : ""}>{p.label}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom row: my schedule (+ employees for managers) */}
            <div className="overview-bottom">
                <div className="card">
                    <div className="overview-card-head">
                        <h2>My work schedule</h2>
                        <span className="muted">{h(weekTotal)} h a week</span>
                    </div>
                    <div className="schedule-bars">
                        {dayHours.map(d => (
                            <div key={d.label} className="schedule-bar-row">
                                <span>{d.label}</span>
                                <div className="schedule-bar-track">
                                    <span style={{ width: `${(d.value / maxDay) * 100}%` }} />
                                </div>
                                <span className="schedule-bar-hours">{h(d.value)} h</span>
                            </div>
                        ))}
                    </div>
                </div>

                {canManage && (
                    <div className="card overview-manage">
                        <h2>Employees</h2>
                        <p>See everyone and open their work schedules.</p>
                        <Link to="/employees" className="btn btn-primary">Go to employees</Link>
                    </div>
                )}
            </div>
        </section>
    );
}