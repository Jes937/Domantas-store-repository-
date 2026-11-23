import { useCallback, useEffect, useState } from "react";
import { getCurrentUser } from "../auth";
import { Link, useParams } from "react-router";
import { api } from "../api/client";
import "./SchedulePage.css";

const DAYS = [
    "monday", "tuesday", "wednesday", "thursday",
    "friday", "saturday", "sunday"
] as const;

type Day = (typeof DAYS)[number];
type Hours = Record<Day, number>;

type Version = {
    effectiveFrom: string | null;
    validUntil: string | null;
    hours: Hours;
};

type Week = {
    week: number;
    year: number;
    monday: string;
    sunday: string;
};

const LABELS: Record<Day, string> = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
};

const emptyForm: Record<Day, string> = {
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
    sunday: "",
};


// Turns an API error into a readable message
function errorText(e: unknown) {
    if (e instanceof Response) {
        if (e.status === 401) return "You are not logged in.";
        if (e.status === 403) return "You are not allowed to do that.";
        if (e.status === 404) return "Not found.";
        return "Request failed (" + e.status + ")";
    }
    return e instanceof Error ? e.message : "Something went wrong.";
}

// Date
function todayIso() {
    return new Date().toLocaleDateString("sv-SE");
}

function addDays(iso: string, days: number) {
    const d = new Date(iso + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + days);

    return d.toISOString().slice(0, 10);
}

function fmt(iso: string) {
    return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    });
}

function sumHours(values: number[]) {
    let total = 0;

    for (const v of values) {
        total += v;
    }

    return Math.round(total * 100) / 100;
}

function toForm(h: Hours) {
    const form = {} as Record<Day, string>;

    for (const d of DAYS) {
        form[d] = String(h[d]);
    }

    return form;
}

function rangeText(v: Version) {
    if (!v.effectiveFrom) {
        if (v.validUntil) return "No schedule until " + fmt(v.validUntil);
        return "No schedule";
    }

    if (v.validUntil) {
        return "From " + fmt(v.effectiveFrom) + " until " + fmt(v.validUntil);
    }

    return "From " + fmt(v.effectiveFrom) + " onwards";
}

export default function SchedulePage() {
    const { userId } = useParams();
    const currentUser = getCurrentUser();
    const canEdit = currentUser?.role === "SystemOwner" || currentUser?.role === "Accountant";

    const [date, setDate] = useState(todayIso());
    const [version, setVersion] = useState<Version | null>(null);
    const [week, setWeek] = useState<Week | null>(null);
    const [history, setHistory] = useState<Version[]>([]);
    const [form, setForm] = useState<Record<Day, string>>(emptyForm);
    const [validFrom, setValidFrom] = useState(todayIso());
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    // Load the schedule, the week and the history
    const load = useCallback(async () => {
        if (!userId) {
            setError("No user ID was provided in the URL.");
            return;
        }

        setError(null);

        try {
            const v = (await api.schedule.scheduleGet(userId, { date })).data as Version;
            const w = (await api.week.weekGet({ date })).data as Week;
            const h = (await api.schedule.scheduleGetHistory(userId)).data as Version[];

            setVersion(v);
            setWeek(w);
            setHistory(h);
            setForm(toForm(v.hours));
            setValidFrom(v.effectiveFrom ?? date);
        } catch (e) {
            setError(errorText(e));
        }
    }, [userId, date]);

    useEffect(() => {
        void load();
    }, [load]);

    function go(next: string) {
        setMessage(null);
        setDate(next);
    }

    function goWeek(days: number) {
        go(addDays(week?.monday ?? date, days));
    }

    function goPreviousChange() {
        if (version?.effectiveFrom) {
            go(addDays(version.effectiveFrom, -1));
        }
    }

    function goNextChange() {
        if (version?.validUntil) {
            go(addDays(version.validUntil, 1));
        }
    }

    function dayError(d: Day) {
        const text = form[d].trim();
        const n = Number(text);

        if (text === "" || Number.isNaN(n)) {
            return LABELS[d] + " needs a number.";
        }

        if (n < 0 || n > 24) {
            return LABELS[d] + " must be between 0 and 24 hours.";
        }

        return null;
    }

    // Save
    async function save() {
        if (!userId) {
            setError("No user ID was provided.");
            return;
        }

        if (!canEdit) {
            setError("You are not allowed to edit schedules.");
            return;
        }

        if (!validFrom) {
            setError("Please select a valid start date.");
            return;
        }

        const hours = {} as Hours;

        for (const d of DAYS) {
            const problem = dayError(d);

            if (problem) {
                setError(problem);
                return;
            }

            hours[d] = Number(form[d]);
        }

        setBusy(true);
        setError(null);
        setMessage(null);

        try {
            await api.schedule.scheduleSave(userId, validFrom, hours);

            setMessage("Saved. Applies from " + fmt(validFrom) + ".");

            if (validFrom === date) {
                await load();
            } else {
                setDate(validFrom);
            }
        } catch (e) {
            setError(errorText(e));
        } finally {
            setBusy(false);
        }
    }

    // Delete schedule
    async function removeVersion() {
        if (!canEdit) {
            setError("You are not allowed to delete schedules.");
            return;
        }

        if (!userId || !version?.effectiveFrom) {
            return;
        }

        if (!window.confirm("Delete the schedule that starts " + fmt(version.effectiveFrom) + "?")) {
            return;
        }

        setBusy(true);
        setError(null);

        try {
            await api.schedule.scheduleDelete(userId, version.effectiveFrom);

            setMessage("Version deleted.");
            await load();
        } catch (e) {
            setError(errorText(e));
        } finally {
            setBusy(false);
        }
    }

    const total = sumHours(DAYS.map((d) => Number(form[d]) || 0));

    return (
        <main className="schedule">
            <Link to="/employees">← All employees</Link>

            <section className="schedule-card">
                <h1>Work schedule</h1>

                <p className="schedule-sub">
                    Hours per week
                </p>

                <div className="schedule-nav">
                    <button
                        type="button"
                        className="schedule-btn schedule-btn--ghost"
                        aria-label="Previous week"
                        onClick={() => goWeek(-7)}
                    >
                        ←
                    </button>

                    <div className="schedule-week">
                        <strong>
                            {week ? `Week ${week.week}, ${week.year}` : "Loading…"}
                        </strong>

                        <span>
                            {week ? `${fmt(week.monday)} – ${fmt(week.sunday)}` : ""}
                        </span>
                    </div>

                    <button
                        type="button"
                        className="schedule-btn schedule-btn--ghost"
                        aria-label="Next week"
                        onClick={() => goWeek(7)}
                    >
                        →
                    </button>

                    <input
                        type="date"
                        className="schedule-input"
                        value={date}
                        onChange={(e) => e.target.value && go(e.target.value)}
                    />
                </div>

                {version && <p className="schedule-range">{rangeText(version)}</p>}

                <div className="schedule-changes">
                    <button
                        type="button"
                        className="schedule-btn schedule-btn--ghost"
                        disabled={!version?.effectiveFrom}
                        onClick={goPreviousChange}
                    >
                        ← Previous change
                    </button>

                    <button
                        type="button"
                        className="schedule-btn schedule-btn--ghost"
                        disabled={!version?.validUntil}
                        onClick={goNextChange}
                    >
                        Next change →
                    </button>
                </div>

                <form
                    className="schedule-form"
                    noValidate
                    onSubmit={(e) => {
                        e.preventDefault();
                        void save();
                    }}
                >
                    <p className="schedule-hint">Hours per day, between 0 and 24.</p>

                    <div className="schedule-grid">
                        {DAYS.map((d) => {
                            const bad = dayError(d) !== null;

                            return (
                                <label key={d} className="schedule-field">
                                    <span>{LABELS[d]}</span>

                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        min={0}
                                        max={24}
                                        step={0.25}
                                        disabled={!canEdit}
                                        className={bad ? "schedule-input schedule-input--invalid" : "schedule-input"}
                                        aria-invalid={bad}
                                        value={form[d]}
                                        onChange={(e) => setForm({ ...form, [d]: e.target.value })}
                                    />
                                </label>
                            );
                        })}
                    </div>

                    <p className="schedule-total">
                        Total per week: <strong>{total} hours</strong>
                    </p>

                    <label className="schedule-field">
                        <span>Valid from</span>

                        <input
                            type="date"
                            className="schedule-input"
                            value={validFrom}
                            disabled={!canEdit}
                            onChange={(e) => setValidFrom(e.target.value)}
                        />
                    </label>

                    {error && (
                        <p className="schedule-error" role="alert">
                            {error}
                        </p>
                    )}

                    {message && (
                        <p className="schedule-message" role="status">
                            {message}
                        </p>
                    )}

                    <div className="schedule-actions">
                        {canEdit && (
                            <button type="submit" className="schedule-btn" disabled={busy}>
                                Save schedule
                            </button>
                        )}

                        {canEdit && version?.effectiveFrom && (
                            <button
                                type="button"
                                className="schedule-btn schedule-btn--danger"
                                disabled={busy}
                                onClick={() => void removeVersion()}
                            >
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
                                <button
                                    type="button"
                                    onClick={() => h.effectiveFrom && go(h.effectiveFrom)}
                                >
                                    {rangeText(h)}
                                </button>

                                <span>{sumHours(DAYS.map((d) => h.hours[d]))} h / week</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </main>
    );
}