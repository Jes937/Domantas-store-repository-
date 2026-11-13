import { useState } from "react";
import type { FormEvent } from "react";

//Login page - the user logs in here
export function LoginPage() {
    //What the user has typed in the two fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    //Runs when the form is submitted
    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        console.log("Login attempt for:", email);
    }

    return (
        <section>
            <h1>Log in</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                />

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                />

                <button type="submit">Log in</button>
            </form>
        </section>
    );
}