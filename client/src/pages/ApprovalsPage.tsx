import { Fragment, useEffect, useState } from "react";
import { api } from "../api/client";
import { HolidayAccount, type PendingRequest } from "../api/Api";

const MAX_REASON = 500;

// Shows the server's message when it sends one
async function errorText(err: unknown, fallback: string) {
    return err instanceof Response ? await err.text() : fallback;
}

export function ApprovalsPage() {
    const [requests, setRequests] = useState<PendingRequest[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [reason, setReason] = useState("");
    const [approvedRequests, setApprovedRequests] = useState<PendingRequest[]>([]);


    async function load() {
        const pending =
            await api.holidayRequest.holidayRequestGetPending();

        const approved =
            await api.holidayRequest.holidayRequestGetApproved();

        setRequests(pending.data);
        setApprovedRequests(approved.data);
    }

    useEffect(() => {
        load().catch(() => setError("Could not load requests."));
    }, []);

    async function approve(id: string) {
        setBusy(true);
        setError(null);

        try {
            await api.holidayRequest.holidayRequestApprove(id);
            await load();
        } catch (err) {
            setError(await errorText(err, "Could not save the decision."));
        } finally {
            setBusy(false);
        }
    }

    function startReject(id: string) {
        setRejectingId(id);
        setReason("");
        setError(null);
    }

    function cancelReject() {
        setRejectingId(null);
        setReason("");
        setError(null);
    }
    async function confirmReject() {
        if (!rejectingId) return;

        const text = reason.trim();

        if (text === "") {
            setError("Write a reason, so the employee knows why.");
            return;
        }

        setBusy(true);
        setError(null);

        try {
            await api.holidayRequest.holidayRequestReject(
                rejectingId,
                {
                    reason: text,
                }
            );

            setRejectingId(null);
            setReason("");

            await load();
        } catch (err) {
            setError(await errorText(err, "Could not save the decision."));
        } finally {
            setBusy(false);
        }
    }

    async function cancelApproved(r: PendingRequest) {
        const message =
            `Cancel the approved holiday for ${r.userName}?\n\n` +
            `${r.startDate} – ${r.endDate} (${(r.hours ?? 0).toFixed(2)} hours)\n\n` +
            `The employee would have to apply again.`;

        // Stop here if the accountant presses Cancel in the popup
        if (!window.confirm(message)) return;

        setBusy(true);
        setError(null);

        try {
            await api.holidayRequest.holidayRequestCancelApproved(r.requestId!);
            await load();
        } catch (err) {
            setError(await errorText(err, "Could not cancel holiday."));
        } finally {
            setBusy(false);
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
                            <Fragment key={r.requestId}>
                                <tr>
                                    <td>{r.userName}</td>
                                    <td>{r.startDate}</td>
                                    <td>{r.endDate}</td>
                                    <td>{r.account === HolidayAccount.Week6 ? "Week 6" : "Weeks 1-5"}</td>
                                    <td>{(r.hours ?? 0).toFixed(2)}</td>
                                    <td style={{ display: "flex", gap: 8 }}>
                                        <button className="btn btn-primary" disabled={busy}
                                                onClick={() => approve(r.requestId!)}>
                                            Approve
                                        </button>
                                        <button className="btn" disabled={busy}
                                                onClick={() => startReject(r.requestId!)}>
                                            Reject
                                        </button>
                                    </td>
                                </tr>

                                {rejectingId === r.requestId && (
                                    <tr>
                                        <td colSpan={6}>
                                            <div className="field">
                                                <label htmlFor="reason">
                                                    Reason for rejecting (the employee will see this)
                                                </label>
                                                <textarea id="reason" rows={3} maxLength={MAX_REASON}
                                                          value={reason}
                                                          onChange={(e) => setReason(e.target.value)} />
                                                <small>{reason.length} / {MAX_REASON}</small>
                                            </div>
                                            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                                                <button className="btn btn-primary" disabled={busy}
                                                        onClick={confirmReject}>
                                                    Reject request
                                                </button>
                                                <button className="btn" disabled={busy} onClick={cancelReject}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="card" style={{ marginTop: 24 }}>
                <h2>Approved holidays</h2>

                {approvedRequests.length === 0 ? (
                    <p>No approved holidays.</p>
                ) : (
                    <table className="table">
                        <thead>
                        <tr>
                            <th>Employee</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Account</th>
                            <th>Hours</th>
                            <th></th>
                        </tr>
                        </thead>

                        <tbody>
                        {approvedRequests.map((r) => (
                            <tr key={r.requestId}>
                                <td>{r.userName}</td>
                                <td>{r.startDate}</td>
                                <td>{r.endDate}</td>
                                <td>
                                    {r.account === HolidayAccount.Week6
                                        ? "Week 6"
                                        : "Weeks 1-5"}
                                </td>
                                <td>{(r.hours ?? 0).toFixed(2)}</td>
                                <td>
                                    <button
                                        className="btn"
                                        disabled={busy}
                                        onClick={() => cancelApproved(r)}
                                    >
                                        Cancel holiday
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
}
