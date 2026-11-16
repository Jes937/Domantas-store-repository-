import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import "./SchedulePage.css";

// Change these two to match how your login and client.ts work
const API_BASE = "http://localhost:5221";
const TOKEN_KEY = "token";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
type Day = (typeof DAYS)[number];
type Hours = Record<Day, number>;
type Version = { effectiveFrom: string | null; validUntil: string | null; hours: Hours };
type Week = { week: number; year: number; monday: string; sunday: string };

const LABELS: Record<Day, string> = {
    monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday",
    friday: "Friday", saturday: "Saturday", sunday: "Sunday",
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = localStorage.getItem(TOKEN_KEY);
    const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    if (res.status === 401) throw new Error("You are not logged in.");
    if (res.status === 403) throw new Error("You are not allowed to do that.");
    if (res.status === 404) throw new Error("User not found.");
    if (!res.ok) throw new Error((await res.text()) || `Request failed (${res.status})`);
    return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

// Dates are handled as "YYYY-MM-DD" text, which avoids time zone surprises
const pad = (n: number) => String(n).padStart(2, "0");
const todayIso = () => {
    const n = new Date();
    return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
};
const addDays = (iso: string, days: number) => {
    const d = new Date(`${iso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
};
const fmt = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
    });

const sum = (h: Hours) => Math.round(DAYS.reduce((s, d) => s + h[d], 0) * 100) / 100;
const toForm = (h: Hours) =>
    Object.fromEntries(DAYS.map((d) => [d, String(h[d])])) as Record<Day, string>;
const emptyForm = Object.fromEntries(DAYS.map((d) => [d, ""])) as Record<Day, string>;

const rangeText = (v: Version) =>
    v.effectiveFrom
        ? `From ${fmt(v.effectiveFrom)}${v.validUntil ? ` until ${fmt(v.validUntil)}` : " onwards"}`
        : `Default week${v.validUntil ? ` until ${fmt(v.validUntil)}` : ""}`;

export default function SchedulePage() {
    const { userId } = useParams();
    const [date, setDate] = useState(todayIso());
    const [version, setVersion] = useState<Version | null>(null);
    const [week, setWeek] = useState<Week | null>(null);
    const [history, setHistory] = useState<Version[]>([]);
    const [form, setForm] = useState<Record<Day, string>>(emptyForm);
    const [validFrom, setValidFrom] = useState(todayIso());
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        if (!userId) return;
        setError(null);
        try {
            const [v, w, h] = await Promise.all([
                request<Version>(`/api/users/${userId}/schedule?date=${date}`),
                request<Week>(`/api/weeks?date=${date}`),
                request<Version[]>(`/api/users/${userId}/schedule/history`),
            ]);
            setVersion(v);
            setWeek(w);
            setHistory(h);
            setForm(toForm(v.hours));
            setValidFrom(v.effectiveFrom ?? date);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong.");
        }
    }, [userId, date]);

    useEffect(() => {
        void load();
    }, [load]);

    function go(next: string) {
        setMessage(null);
        setDate(next);
    }

    // Same rule as the server: 0 to 24 hours per day
    function validate(): Hours | string {
        const out = {} as Hours;
        for (const d of DAYS) {
            const n = Number(form[d]);
            if (form[d].trim() === "" || Number.isNaN(n)) return `${LABELS[d]} needs a number.`;
            if (n < 0 || n > 24) return `${LABELS[d]} must be between 0 and 24 hours.`;
            out[d] = n;
        }
        return out;
    }

    async function save() {
        const result = validate();
        if (typeof result === "string") {
            setError(result);
            return;
        }
        setBusy(true);
        setError(null);
        setMessage(null);
        try {
            await request<void>(`/api/users/${userId}/schedule/${validFrom}`, {
                method: "PUT",
                body: JSON.stringify(result),
            });
            setMessage(`Saved. Applies from ${fmt(validFrom)}.`);
            if (validFrom === date) await load();
            else setDate(validFrom);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong.");
        } finally {
            setBusy(false);
        }
    }

    async function removeVersion() {
        if (!version?.effectiveFrom) return;
        if (!window.confirm(`Delete the schedule that starts ${fmt(version.effectiveFrom)}?`)) return;
        setBusy(true);
        setError(null);
        try {
            await request<void>(`/api/users/${userId}/schedule/${version.effectiveFrom}`, { method: "DELETE" });
            setMessage("Version deleted.");
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong.");
        } finally {
            setBusy(false);
        }
    }

    const total = Math.round(DAYS.reduce((s, d) => s + (Number(form[d]) || 0), 0) * 100) / 100;

    return (
        <main className="schedule">
            <section className="schedule-card">
                <h1>Work schedule</h1>
                <p className="schedule-sub">Hours per weekday. They turn holiday days into hours.</p>

                <div className="schedule-nav">
                    <button type="button" className="schedule-btn schedule-btn--ghost"
                            aria-label="Previous week" onClick={() => go(addDays(week?.monday ?? date, -7))}>←</button>
                    <div className="schedule-week">
                        <strong>{week ? `Week ${week.week}, ${week.year}` : "Loading…"}</strong>
                        <span>{week ? `${fmt(week.monday)} – ${fmt(week.sunday)}` : ""}</span>
                    </div>
                    <button type="button" className="schedule-btn schedule-btn--ghost"
                            aria-label="Next week" onClick={() => go(addDays(week?.monday ?? date, 7))}>→</button>
                    <input type="date" className="schedule-input" value={date}
                           onChange={(e) => e.target.value && go(e.target.value)} />
                </div>

                {version && <p className="schedule-range">{rangeText(version)}</p>}

                <div className="schedule-changes">
                    <button type="button" className="schedule-btn schedule-btn--ghost"
                            disabled={!version?.effectiveFrom}
                            onClick={() => version?.effectiveFrom && go(addDays(version.effectiveFrom, -1))}>
                        ← Previous change
                    </button>
                    <button type="button" className="schedule-btn schedule-btn--ghost"
                            disabled={!version?.validUntil}
                            onClick={() => version?.validUntil && go(addDays(version.validUntil, 1))}>
                        Next change →
                    </button>
                </div>

                <form className="schedule-form" onSubmit={(e) => { e.preventDefault(); void save(); }}>
                    <div className="schedule-grid">
                        {DAYS.map((d) => (
                            <label key={d} className="schedule-field">
                                <span>{LABELS[d]}</span>
                                <input type="number" inputMode="decimal" min={0} max={24} step={0.25}
                                       className="schedule-input" value={form[d]}
                                       onChange={(e) => setForm({ ...form, [d]: e.target.value })} />
                            </label>
                        ))}
                    </div>

                    <p className="schedule-total">Total per week: <strong>{total} hours</strong></p>

                    <label className="schedule-field">
                        <span>Valid from</span>
                        <input type="date" className="schedule-input" value={validFrom}
                               onChange={(e) => setValidFrom(e.target.value)} />
                    </label>

                    {error && <p className="schedule-error" role="alert">{error}</p>}
                    {message && <p className="schedule-message" role="status">{message}</p>}

                    <div className="schedule-actions">
                        <button type="submit" className="schedule-btn" disabled={busy}>Save schedule</button>
                        {version?.effectiveFrom && (
                            <button type="button" className="schedule-btn schedule-btn--danger"
                                    disabled={busy} onClick={() => void removeVersion()}>
                                Delete this version
                            </button>
                        )}
                    </div>
                </form>
            </section>

            {history.length > 0 && (
                <section className="schedule-card">
                    <h2>All versions</h2>
                    <ul className="schedule-history">
                        {history.map((h) => (
                            <li key={h.effectiveFrom}>
                                <button type="button" onClick={() => go(h.effectiveFrom!)}>{rangeText(h)}</button>
                                <span>{sum(h.hours)} h / week</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </main>
    );
}