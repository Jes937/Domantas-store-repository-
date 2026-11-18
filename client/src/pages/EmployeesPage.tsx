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
            <h1>Employees</h1>

            {error && <p role="alert">{error}</p>}

            {!error && (
                <table>
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
                            <td>{employee.userName}</td>
                            <td>{employee.email}</td>
                            <td>{Roles[employee.role]}</td>
                            <td>{employee.startDate ?? "–"}</td>
                            <td>{employee.isActive ? "Active" : "Deactivated"}</td>
                            <td>
                                <Link to={`/users/${employee.userId}/schedule`}>Open</Link>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </section>
    );