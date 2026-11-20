import { useEffect, useState } from "react";
import { api } from "../api/client";
import { HolidayAccount, type PendingRequest } from "../api/Api";

export function ApprovalsPage() {
    const [requests, setRequests] = useState<PendingRequest[]>([]);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        const res = await api.holidayRequest.holidayRequestGetPending();
        setRequests(res.data);
    }

    useEffect(() => {
        load().catch(() => setError("Could not load requests."));
    }, []);

    async function decide(id: string, approve: boolean) {
        try {
            if (approve) await api.holidayRequest.holidayRequestApprove(id);
            else await api.holidayRequest.holidayRequestReject(id);
            await load();
        } catch {
            setError("Could not save the decision.");
        }
    }

    return (
        <section>
            <div className="page-header">
                <h1>Approve holiday</h1>
                <p>Requests waiting for your decision.</p>
            </div>

            {error && <p className="alert" role="alert">{error}</p>}

            {requests.length === 0 ? (
                <p>No requests waiting.</p>
            ) : (
                <div className="card" style={{ padding: 0, overflowX: "auto" }}>
                    <table className="table">
                        <thead>
                        <tr><th>Employee</th><th>From</th><th>To</th><th>Account</th><th>Hours</th><th></th></tr>
                        </thead>
                        <tbody>
                        {requests.map((r) => (
                            <tr key={r.requestId}>
                                <td>{r.userName}</td>
                                <td>{r.startDate}</td>
                                <td>{r.endDate}</td>
                                <td>{r.account === HolidayAccount.Week6 ? "Week 6" : "Weeks 1-5"}</td>
                                <td>{r.hours}</td>
                                <td style={{ display: "flex", gap: 8 }}>
                                    <button className="btn btn-primary" onClick={() => decide(r.requestId!, true)}>Approve</button>
                                    <button className="btn" onClick={() => decide(r.requestId!, false)}>Reject</button>
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