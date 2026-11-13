import { useState } from "react";
import type { SubmitEvent } from "react";
import "./LoginPage.css";

//Login page - user logs
export function LoginPage() {
    //What the user has typed in the two fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    //Runs when the form is submitted
    function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        console.log("Login attempt for:", email);
    }

    return (
        <section className="login-card">
            <div className="login-heading">
                <h1>Log in</h1>
                <p className="login-intro">Use your work email to see your holiday.</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
                <div className="login-field">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        required
                        autoComplete="username"
                        placeholder="name@company.dk"
                        value={email}
                        onChange={event => setEmail(event.target.value)}
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
                        onChange={event => setPassword(event.target.value)}
                    />
                </div>

                <button className="login-button" type="submit">Log in</button>
            </form>

            <p className="login-note">No account? Your administrator creates it for you.</p>
        </section>
    );
}