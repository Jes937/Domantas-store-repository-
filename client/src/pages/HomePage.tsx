import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { HealthResponse } from "../api/Api";

//Home page - shows if the client can reach the API
export function HomePage() {
    const [health, setHealth] = useState<HealthResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    //Call the API once the page loads
    useEffect(() => {
        api.health
            .healthGet()
            .then(res => setHealth(res.data))
            .catch(() => setError("Could not reach the API"));
    }, []);
    
    return (
        <section>
            <h1>Holiday planning</h1>
            {health && <p>API status: {health.status} ({health.serverTime})</p>}
            {error && <p>{error}</p>}
            {!health && !error && <p>Checking API...</p>}
        </section>
    );
}