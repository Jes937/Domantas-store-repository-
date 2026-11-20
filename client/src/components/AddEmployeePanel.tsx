import { useState } from "react";
import { Roles } from "../api/Api";
import type { UserSummary } from "../api/Api";
import { api } from "../api/client";

const DOMAIN = "@businessesbjerg.com";

type Props = {
    onClose: () => void;
    onCreated: (user: UserSummary) => void;
};

// Side panel where the system owner creates a new employee
export function AddEmployeePanel({ onClose, onCreated }: Props) {
    const [name, setName] = useState("");
    const [emailStart, setEmailStart] = useState("");
    const [role, setRole] = useState<Roles>(Roles.Employee);
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        // Quick checks in the browser before we call the API
        if (!name.trim()) {
            setError("Enter the full name.");
            return;
        }
        if (!/^[a-zA-Z0-9._-]+$/.test(emailStart.trim())) {
            setError(`Enter the part of the email before ${DOMAIN}.`);
            return;
        }
        if (password.length < 8) {
            setError("The first password must be at least 8 characters.");
            return;
        }

        setSaving(true);
        try {
            const res = await api.user.userCreate({
                userName: name.trim(),
                email: emailStart.trim().toLowerCase() + DOMAIN,
                password,
                role,
            });
            onCreated(res.data);
        } catch (err) {
            // The server sends the reason as plain text, e.g. "A user with this email already exists"
            let message = "";
            try {
                message = await (err as Response).text();
            } catch {
                // Not a response from the server, e.g. the API is not running
            }
            setError(message || "Could not create the employee.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="panel-backdrop" onClick={onClose}>
            <form
                className="side-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-title"
                onSubmit={handleSubmit}
                onClick={e => e.stopPropagation()}
            >
                <div className="side-panel-header">
                    <div>
                        <h2 id="add-title">Add employee</h2>
                        <p>They log in with their work email.</p>
                    </div>
                    <button type="button" className="btn" onClick={onClose} aria-label="Close">✕</button>
                </div>

                <div className="side-panel-body">
                    {error && <p className="alert" role="alert">{error}</p>}

                    <div className="field">
                        <label htmlFor="new-name">Full name</label>
                        <input id="new-name" autoComplete="off" value={name}
                               onChange={e => setName(e.target.value)} />
                    </div>

                    <div className="field">
                        <label htmlFor="new-email">Work email</label>
                        <div className="email-input">
                            <input id="new-email" autoComplete="off" placeholder="firstname" value={emailStart}
                                   onChange={e => setEmailStart(e.target.value)} />
                            <span>{DOMAIN}</span>
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="new-role">Role</label>
                        <select id="new-role" value={role}
                                onChange={e => setRole(Number(e.target.value) as Roles)}>
                            <option value={Roles.Employee}>Employee</option>
                            <option value={Roles.Accountant}>Accountant</option>
                            <option value={Roles.SystemOwner}>System owner</option>
                        </select>
                    </div>

                    <div className="field">
                        <label htmlFor="new-password">First password</label>
                        <input id="new-password" type="password" autoComplete="new-password" value={password}
                               onChange={e => setPassword(e.target.value)} />
                    </div>
                </div>

                <div className="side-panel-footer">
                    <button type="button" className="btn" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? "Creating..." : "Create employee"}
                    </button>
                </div>
            </form>
        </div>
    );
}