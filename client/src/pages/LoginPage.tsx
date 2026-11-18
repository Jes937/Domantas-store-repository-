import { useState } from "react";
import { useNavigate } from "react-router";

import { api } from "../api/client";

export function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function handleLogin(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();
        setError(null);

        try {
            const response = await api.auth.authLogin({
                email,
                password,
            });

            if (response.data.token) {
                localStorage.setItem(
                    "token",
                    response.data.token
                );

                navigate("/", { replace: true });
            } else {
                setError("Login failed");
            }
        } catch {
            setError("Invalid email or password");
        }
    }

    return (
        <section className="card" style={{ width: 420, maxWidth: "100%", boxSizing: "border-box", padding: 40, textAlign: "left" }}>
            <div className="page-header">
                <span className="brand-icon" style={{ marginBottom: 8 }}>
                    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"
                         stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <path d="M3 10h18" />
                        <path d="M8 3v4" />
                        <path d="M16 3v4" />
                    </svg>
                </span>
                <h1>Log in</h1>
                <p>Use your work email at Business Esbjerg.</p>
            </div>

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div className="field">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="name@businessesbjerg.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="field">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {error && <p className="alert" role="alert">{error}</p>}

                <button type="submit" className="btn btn-primary">
                    Log in
                </button>
            </form>
        </section>
    );
}