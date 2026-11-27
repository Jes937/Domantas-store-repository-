import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { api } from "../api/client";
import { HolidayAccount } from "../api/Api";

export function ApplyPage() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [account, setAccount] = useState(HolidayAccount.Week1To5);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setMessage(null);
        setError(null);
        setBusy(true);

        try {
            const res = await api.holidayRequest.holidayRequestCreate({ startDate, endDate, account });
            setMessage(`Sent! ${Number(res.data.hours).toFixed(2)} hours, waiting for approval.`);
        } catch (err) {
            setError(err instanceof Response ? await err.text() : "Something went wrong.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <section>
            <div className="page-header">
                <h1>Apply for holiday</h1>
                <p>Choose your days and which account to use.</p>
            </div>

            <form className="card" onSubmit={handleSubmit}
                  style={{ maxWidth: 420, display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="field">
                    <label htmlFor="startDate">First day</label>
                    <input id="startDate" type="date" value={startDate}
                           onChange={(e) => setStartDate(e.target.value)} required />
                </div>

                <div className="field">
                    <label htmlFor="endDate">Last day</label>
                    <input id="endDate" type="date" value={endDate} min={startDate}
                           onChange={(e) => setEndDate(e.target.value)} required />
                </div>

                <div className="field">
                    <label htmlFor="account">Account</label>
                    <select id="account" value={account}
                            onChange={(e) => setAccount(Number(e.target.value))}>
                        <option value={HolidayAccount.Week1To5}>Weeks 1-5</option>
                        <option value={HolidayAccount.Week6}>Week 6</option>
                    </select>
                </div>

                {error && <p className="alert" role="alert">{error}</p>}
                {message && (
                    <p role="status">
                        {message} <Link to="/my-requests">See my requests</Link>
                    </p>
                )}

                <button type="submit" className="btn btn-primary" disabled={busy}>
                    {busy ? "Sending…" : "Apply"}
                </button>
            </form>
        </section>
    );
}