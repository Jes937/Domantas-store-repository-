import { useEffect, useState } from "react";
import { api } from "../api/client";
import { type TeamHolidayCalendarItem } from "../api/Api";

export function TeamCalendarPage() {
    const [items, setItems] = useState<TeamHolidayCalendarItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void load();
    }, []);

    async function load() {
        try {
            const response =
                await api.holidayRequest.holidayRequestGetCalendar();

            setItems(response.data);
            setError(null);
        } catch {
            setError("Could not load holiday calendar.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section>
            <div className="page-header">
                <h1>Holiday calendar</h1>
                <p>Approved holidays for all employees.</p>
            </div>

            <div className="card">
                {loading && (
                    <p>Loading...</p>
                )}

                {error && (
                    <p className="alert" role="alert">
                        {error}
                    </p>
                )}

                {!loading && !error && items.length === 0 && (
                    <p>No approved holidays found.</p>
                )}

                {!loading && !error && items.length > 0 && (
                    <table className="table">
                        <thead>
                        <tr>
                            <th>Employee</th>
                            <th>From</th>
                            <th>To</th>
                        </tr>
                        </thead>

                        <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>{item.userName ?? ""}</td>
                                <td>{item.startDate ?? ""}</td>
                                <td>{item.endDate ?? ""}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
}