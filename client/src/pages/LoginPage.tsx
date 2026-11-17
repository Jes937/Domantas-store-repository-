import { useState } from "react";
import type { SubmitEvent } from "react";
import { useNavigate } from "react-router";
import { api } from "../api/client";
import "./LoginPage.css";

// Login page - user logs in
export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        setError(null);

        try {
            const response = await api.auth.authLogin({
                email,
                password,
            });

            localStorage.setItem(
                "token",
                response.data.token ?? ""
            );


            navigate("home");
        } catch (err) {
            console.error("Login failed", err);

            const status = (err as { status?: number }).status;

            setError(
                status === 401
                    ? "Wrong email or password. Try again."
                    : "Could not reach the server. Try again later."
            );
        }
    }

    return (
        <section className="login-card">
            <div className="login-heading">
                <h1>Log in</h1>
                <p className="login-intro">
                    Use your work email to see your holiday.
                </p>
            </div>

            {error && (
                <p className="login-error" role="alert">
                    {error}
                </p>
            )}

            <form
                className="login-form"
                onSubmit={handleSubmit}
            >
                <div className="login-field">
                    <label htmlFor="email">Email</label>

                    <input
                        id="email"
                        type="email"
                        required
                        autoComplete="username"
                        placeholder="name@company.dk"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                    />
                </div>

                <div className="login-field">
                    <label htmlFor="password">Password</label>

                    <input
                        id="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                    />
                </div>

                <button
                    className="login-button"
                    type="submit"
                >
                    Log in
                </button>
            </form>

            <p className="login-note">
                No account? Your administrator creates it for you.
            </p>
        </section>
    );
}