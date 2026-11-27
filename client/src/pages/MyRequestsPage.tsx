import { api } from "../api/client";
import { useEffect, useState } from "react";
import { RequestStatus } from "../api/Api";
import type { HolidayRequestSummary } from "../api/Api";

// Shows the server's message when it sends one
async function errorText(err: unknown, fallback: string) {
    return err instanceof Response ? await err.text() : fallback;
}

export function MyRequestsPage() {
    const [requests, setRequests] = useState<HolidayRequestSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    useEffect(() => {
        void loadRequests();
    }, []);

    async function loadRequests() {
        try {
            const response = await api.holidayRequest.holidayRequestGetMine();

            setRequests(response.data);
            setError(null);
        } catch {
            setError("Could not load holiday requests.");
        } finally {
            setLoading(false);
        }
    }

    async function cancel(request: HolidayRequestSummary) {
        const period = `${request.startDate} - ${request.endDate}`;

        if (!window.confirm(`Cancel your request for ${period}?`)) return;

        setCancellingId(request.requestId ?? null);
        setActionError(null);
        setNotice(null);

        try {
            await api.holidayRequest.holidayRequestCancel(request.requestId!);
            setNotice(`The request for ${period} is cancelled.`);
        } catch (err) {
            setActionError(await errorText(err, "Could not cancel the request."));
        } finally {
            setCancellingId(null);
        }

        await loadRequests();
    }

    return (
        <section>
            <div className="page-header">
                <h1>My requests</h1>
                <p>Follow your holiday requests and see their status.</p>
            </div>

            <div className="card">
                {loading && <p>Loading...</p>}

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {actionError && <p className="alert" role="alert">{actionError}</p>}
                {notice && <p role="status">{notice}</p>}

                {!loading && !error && requests.length === 0 && (
                    <p>No holiday requests found.</p>
                )}

                {!loading && !error && requests.length > 0 && (
                    <ul className="schedule-history">
                        {requests.map((request) => (
                            <li key={request.requestId}>
                                <div>
                                    <strong>
                                        {request.startDate} - {request.endDate}
                                    </strong>

                                    <div>
                                        {(request.hours ?? 0).toFixed(2)} hours
                                    </div>

                                    <div>
                                        {request.account === 0
                                            ? "Weeks 1-5"
                                            : "Week 6"}
                                    </div>

                                    {request.reason && (
                                        <div>
                                            <strong>Reason:</strong> {request.reason}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <span>
                                        {request.status !== undefined
                                            ? RequestStatus[request.status]
                                            : "Unknown"}
                                    </span>

                                    {request.status === RequestStatus.Pending && (
                                        <button
                                            type="button"
                                            className="btn"
                                            disabled={cancellingId !== null}
                                            onClick={() => cancel(request)}
                                        >
                                            {cancellingId === request.requestId ? "Cancelling…" : "Cancel request"}
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}