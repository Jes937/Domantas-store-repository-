import { Link } from "react-router";

// Shown for URLs that don't exist
export function NotFoundPage() {
    return (
        <section className="card" style={{ maxWidth: 480, margin: "40px auto", textAlign: "center" }}>
            <p style={{ fontSize: 48, fontWeight: 600, margin: 0, color: "var(--accent)" }}>404</p>
            <h1 style={{ marginTop: 8 }}>Page not found</h1>
            <p style={{ color: "var(--text-muted)" }}>
                The page you are looking for does not exist or has moved.
            </p>
            <Link to="/" className="btn btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
                Back to Overview
            </Link>
        </section>
    );
}