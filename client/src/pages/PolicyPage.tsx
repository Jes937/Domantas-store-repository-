// Holiday policy: the rules from the supervisor's clarifications (16 Nov), in hours
type Section = {
    id: string;
    title: string;
    paragraphs: string[];
    rows?: [string, string][];
    note?: string;
};

const keyNumbers = [
    { value: "185.00 h", label: "A year at 37 h a week (5 weeks)" },
    { value: "15.42 h", label: "Earned each month at 37 h a week" },
    { value: "−37.00 h", label: "Most holiday debt (1 week)" },
    { value: "31 Aug", label: "Balance must be 0 or more" },
];

const sections: Section[] = [
    {
        id: "earning",
        title: "Earning holiday",
        paragraphs: [
            "You earn holiday every month you work, from your first day. The holiday year runs from 1 September to 31 August, and you can use the hours as soon as they are added.",
            "The amount follows your work schedule. A full year gives 5 weeks of your normal working hours.",
        ],
        rows: [
            ["37.00 h a week", "15.42 h a month"],
            ["30.00 h a week", "12.50 h a month"],
            ["Full year at 37.00 h", "185.00 h"],
        ],
    },
    {
        id: "debt",
        title: "Holiday debt and 31 August",
        paragraphs: [
            "You may take holiday before you have earned it, down to 1 week of your own working hours below zero. At 37 hours a week that is −37.00 h.",
            "Your Weeks 1–5 balance must be 0 or more on 31 August, so any debt has to be earned back before then.",
        ],
    },
    {
        id: "sixth-week",
        title: "The 6th holiday week",
        paragraphs: [
            "The 6th week is a separate account of 1 week a year. You cannot go into debt on it, and its hours do not mix with Weeks 1–5.",
        ],
    },
    {
        id: "schedule",
        title: "When your work schedule changes",
        paragraphs: [
            "Your schedule is set by the accountant or the system owner and is kept as history, so past balances always use the schedule that applied then.",
            "When a new schedule starts, your balance is converted so you keep the same number of holiday days. The hours follow the length of your new average day.",
        ],
        rows: [
            ["Before: 37.00 h over 5 days", "7.40 h a day"],
            ["After: 30.00 h over 4 days", "7.50 h a day"],
            ["64.84 h = 8.76 days becomes", "65.72 h"],
        ],
    },
    {
        id: "requests",
        title: "Requests and cancellations",
        paragraphs: [
            "Apply for holiday in the app. You see the hours before you send, and the accountant approves or rejects. There are no emails, so check the app for the answer.",
            "Approved holiday you have not used yet can only be cancelled by sending a cancellation request to the accountant.",
        ],
    },
    {
        id: "transfer",
        title: "Transferring holiday",
        paragraphs: [
            "Up to 1 week (5 days) of unused Weeks 1–5 holiday can move to the next holiday year, through a request the accountant approves.",
        ],
        note: "Business Esbjerg does not allow transfers right now. The system owner can switch it on in Global rules.",
    },
];

const statuses = [
    { name: "Pending", className: "badge badge-pending", text: "Sent and waiting for the accountant." },
    { name: "Approved", className: "badge badge-approved", text: "Confirmed. The hours come off your balance." },
    { name: "Rejected", className: "badge badge-rejected", text: "Not approved. The hours stay in your balance." },
    { name: "Canceled", className: "badge badge-neutral", text: "Cancelled after a cancellation request. The hours come back." },
];

export function PolicyPage() {
    return (
        <div className="policy">
            <article className="policy-main">
                <header className="policy-hero">
                    <span className="policy-tag">Applies to all employees</span>
                    <h1>Holiday policy</h1>
                    <p>
                        How you earn holiday, how much you can use and how requests work at Business Esbjerg.
                        All amounts are in hours with two decimals, worked out from your own work schedule.
                    </p>
                    <div className="policy-stats">
                        {keyNumbers.map(k => (
                            <div className="policy-stat" key={k.value}>
                                <span className="policy-stat-value">{k.value}</span>
                                <span>{k.label}</span>
                            </div>
                        ))}
                    </div>
                </header>

                {sections.map((s, i) => (
                    <section className="card policy-section" id={s.id} key={s.id}>
                        <span className="policy-num">{String(i + 1).padStart(2, "0")}</span>
                        <div>
                            <h2>{s.title}</h2>
                            {s.paragraphs.map(text => <p key={text}>{text}</p>)}

                            {s.rows && (
                                <div className="policy-rows">
                                    {s.rows.map(([left, right]) => (
                                        <div key={left}>
                                            <span>{left}</span>
                                            <strong>{right}</strong>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {s.note && <p className="policy-note">{s.note}</p>}
                        </div>
                    </section>
                ))}

                <section className="card">
                    <h2>What the statuses mean</h2>
                    <div className="policy-statuses">
                        {statuses.map(st => (
                            <div key={st.name}>
                                <span className={st.className}>{st.name}</span>
                                <p>{st.text}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </article>

            <nav className="policy-toc" aria-label="On this page">
                <span className="sidebar-label" style={{ color: "var(--text-muted)", padding: "0 8px 6px" }}>On this page</span>
                {sections.map((s, i) => (
                    <a href={`#${s.id}`} key={s.id}>
                        <span>{String(i + 1).padStart(2, "0")}</span>
                        {s.title}
                    </a>
                ))}
            </nav>
        </div>
    );
}