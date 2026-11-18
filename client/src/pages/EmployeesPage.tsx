import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Roles } from "../api/Api";
import type { UserSummary } from "../api/Api";
import { api } from "../api/client";

// Employees page (#9): list of all users, with a link to each person's work schedule
export function EmployeesPage() {
    const [employees, setEmployees] = useState<UserSummary[]>([]);
    const [error, setError] = useState<string | null>(null);

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

    return (
        <section>
            <div className="page-header">
                <h1>Employees</h1>
                <p>Everyone with an account at Business Esbjerg. Open a person to see their work schedule.</p>
            </div>

            {error && <p className="alert" role="alert">{error}</p>}

            {!error && (
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
        </section>
    );
}