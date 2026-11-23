type Props = {
    title: string;
    description: string;
};

// Placeholder for screens that are planned but not built yet.
// Swap it for the real page in App.tsx when the task is picked up.
export function ComingSoonPage({ title, description }: Props) {
    return (
        <section>
            <div className="page-header">
                <h1>{title}</h1>
                <p>{description}</p>
            </div>

            <div className="card" style={{ maxWidth: 560 }}>
                <span className="badge badge-neutral">Coming soon</span>
                <p style={{ color: "var(--text-muted)", marginBottom: 0 }}>
                    This page is planned and will be filled in when the feature is built.
                </p>
            </div>
        </section>
    );
}