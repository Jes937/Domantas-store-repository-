import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Roles } from "../api/Api";
import type { UserSummary } from "../api/Api";
import { api } from "../api/client";
import { getCurrentUser } from "../auth";
import { AddEmployeePanel } from "../components/AddEmployeePanel";

type Version = {
    effectiveFrom: string | null;
    hours: Record<string, number>;
};

type SchedulesByUser = Record<string, Version[]>;

const WEEKDAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function toIsoDate(date: Date) {
    return date.toLocaleDateString("sv-SE"); // YYYY-MM-DD
}

function getMonday(date: Date) {
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    return monday;
}

function getWeekDays(monday: Date) {
    return Array.from(
        { length: 7 },
        (_, i) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
    );
}

function findActiveVersion(versions: Version[], date: Date) {
    const isoDate = toIsoDate(date);
    const started = versions.filter(v => v.effectiveFrom && v.effectiveFrom <= isoDate);

    if (started.length === 0) return null;

    return started.reduce((newest, v) => (v.effectiveFrom! > newest.effectiveFrom! ? v : newest));
}

function getHoursOn(versions: Version[], date: Date) {
    const version = findActiveVersion(versions, date);
    const weekday = WEEKDAY_KEYS[date.getDay()];

    if (!version || !weekday) return 0;

    return version.hours[weekday] ?? 0;
}

const gridCell = {
    border: "1px solid #999",
    padding: "10px 14px",
    textAlign: "center",
} as const;

function WeekPicker({ first, last, onMove }: { first: Date; last: Date; onMove: (weeks: number) => void }) {
    const format = (d: Date) =>
        d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

    return (
        <div>
            <button type="button" onClick={() => onMove(-1)}>←</button>
            <h2>{format(first)} – {format(last)}</h2>
            <button type="button" onClick={() => onMove(1)}>→</button>
        </div>
    );
}

function HeaderRow({ days }: { days: Date[] }) {
    return (
        <tr>
            <th style={{ ...gridCell, textAlign: "left" }}>Employees</th>
            {days.map(day => (
                <th key={toIsoDate(day)} style={gridCell}>
                    <div>{day.toLocaleDateString("en-GB", { weekday: "short" })}</div>
                    <div>{day.getDate()}</div>
                </th>
            ))}
        </tr>
    );
}

function EmployeeRow({ employee, versions, days }: { employee: UserSummary; versions: Version[]; days: Date[] }) {
    return (
        <tr>
            <td style={{ ...gridCell, textAlign: "left", whiteSpace: "nowrap" }}>{employee.userName}</td>
            {days.map(day => (
                <td key={toIsoDate(day)} style={gridCell}>{getHoursOn(versions, day) || ""}</td>
            ))}
        </tr>
    );
}

function EmployeesCalendar({ employees }: { employees: UserSummary[] }) {
    const [monday, setMonday] = useState(() => getMonday(new Date()));
    const [schedules, setSchedules] = useState<SchedulesByUser>({});

    // Load every employees schedule
    useEffect(() => {
        async function loadSchedules() {
            const result: SchedulesByUser = {};

            for (const employee of employees) {
                try {
                    const response = await api.schedule.scheduleGetHistory(employee.userId!);
                    result[employee.userId!] = response.data as Version[];
                } catch {
                    result[employee.userId!] = []; // one failure only blanks that person
                }
            }

            setSchedules(result);
        }

        void loadSchedules();
    }, [employees]);

    function moveWeek(weeks: number) {
        setMonday(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + weeks * 7));
    }

    const days = getWeekDays(monday);

    return (
        <section>
            <WeekPicker
                first={monday}
                last={new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)}
                onMove={moveWeek}
            />
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                <HeaderRow days={days} />
                </thead>
                <tbody>
                {employees.map(employee => (
                    <EmployeeRow
                        key={employee.userId}
                        employee={employee}
                        versions={schedules[employee.userId!] ?? []}
                        days={days}
                    />
                ))}
                </tbody>
            </table>
        </section>
    );
}

export function EmployeesPage() {
    const [employees, setEmployees] = useState<UserSummary[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [panelOpen, setPanelOpen] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    const currentRole = getCurrentUser()?.role;

    const isSystemOwner = currentRole === "SystemOwner";
    const isEmployee = currentRole === "Employee";

    useEffect(() => {
        api.user.userGetAll()
            .then(res => setEmployees(res.data))
            .catch(err => {
                const status = (err as { status?: number }).status;
                if (status === 401) setError("You need to log in to see this page.");
                else if (status === 403) setError("Only the accountant or the system owner can see employees.");
                else setError("Could not load the employees.");
            });
    }, []);

    // Called by the panel when the API
    function handleCreated(user: UserSummary) {
        setPanelOpen(false);
        setNotice(`${user.userName} is created and can log in as ${user.email}.`);
        // Add the new person to the list
        setEmployees(previous => [...previous, user]);
    }

    return (
        <section>
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    gap: 16
                }}
            >
                {isSystemOwner && (
                    <div className="page-header">
                        <h1>Employees</h1>
                        <p>
                            Everyone with an account at Business Esbjerg.
                            Open a person to see their work schedule.
                        </p>
                    </div>
                )}

                {isSystemOwner && (
                    <button
                        className="btn btn-primary"
                        style={{ marginBottom: 24 }}
                        onClick={() => setPanelOpen(true)}
                    >
                        + Add employee
                    </button>
                )}
            </div>
            {notice && (
                <p className="badge badge-approved" role="status"
                   style={{ display: "block", padding: "10px 12px", borderRadius: 10, fontSize: 14, marginBottom: 16 }}>
                    {notice}
                </p>
            )}

            {error && <p className="alert" role="alert">{error}</p>}

            {!error && isSystemOwner && (
                <div className="card" style={{ padding: 0, overflowX: "auto" }}>
                    <table className="table">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Work email</th>
                            <th>Role</th>
                            <th>Started</th>
                            <th>Status</th>
                            <th>Work schedule</th>
                        </tr>
                        </thead>
                        <tbody>
                        {employees.map(employee => (
                            <tr key={employee.userId}>
                                <td style={{ fontWeight: 600 }}>{employee.userName}</td>
                                <td>{employee.email}</td>
                                <td>{employee.role !== undefined ? Roles[employee.role] : "–"}</td>
                                <td>{employee.startDate ?? "–"}</td>
                                <td>
                                    <span className={employee.isActive ? "badge badge-approved" : "badge badge-neutral"}>
                                        {employee.isActive ? "Active" : "Deactivated"}
                                    </span>
                                </td>
                                <td>
                                    <Link to={`/users/${employee.userId}/schedule`}>Open</Link>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!error && <EmployeesCalendar employees={employees} />}

            {panelOpen && (
                <AddEmployeePanel onClose={() => setPanelOpen(false)} onCreated={handleCreated} />
            )}
        </section>
    );
}