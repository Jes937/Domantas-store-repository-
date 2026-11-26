import { api } from "../api/client";
import { useEffect, useState } from "react";
import { RequestStatus } from "../api/Api";
import type { HolidayRequestSummary } from "../api/Api";

export function MyRequestsPage() {
    const [requests, setRequests] = useState<HolidayRequestSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadRequests();
    }, []);

    async function loadRequests() {
        try {
            const response =
                await api.holidayRequest.holidayRequestGetMine();

            setRequests(response.data);
        } catch {
            setError("Could not load holiday requests.");
        } finally {
            setLoading(false);
        }
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
                                        {request.hours} hours
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

                                <span>
                                    {request.status !== undefined
                                        ? RequestStatus[request.status]
                                        : "Unknown"}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}