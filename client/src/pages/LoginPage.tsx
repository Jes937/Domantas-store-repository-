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
        <section>
            <h1>Log in</h1>

            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />
                </div>

                {error && (
                    <p style={{ color: "red" }}>
                        {error}
                    </p>
                )}

                <button type="submit">
                    Log in
                </button>
            </form>
        </section>
    );
}