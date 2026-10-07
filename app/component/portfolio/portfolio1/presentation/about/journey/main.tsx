import style from "./main.module.scss";

type JourneyEntry = {
    title: string;
    place: string;
    description: string;
    period: string;
};

const entries: JourneyEntry[] = [
    {
        title: "ESISAR",
        place: "School of Advanced Industrial & Embedded Systems",
        description: "Studying Embedded Systems and Industrial Computing, with a focus on software development, electronics, and computer architecture.",
        period: "2025 — NOW",
    },
    {
        title: "Samsoe Skole",
        place: "Denmark",
        description: "Exchange student in Denmark, where I became fluent in Danish and absorbed the culture and the way of learning.",
        period: "2021 — 2023",
    },
    {
        title: "UI / UX Design",
        place: "Coursework",
        description: "Wireframing, prototyping and usability testing — learning to design before writing a single line of code.",
        period: "2023 — 2024",
    },
    {
        title: "Web Development",
        place: "Coursework",
        description: "The fundamentals: HTML, CSS and JavaScript, then algorithms and data structures. The reason I fell in love with building.",
        period: "2019 — 2023",
    },
];

export function AboutJourney() {
    return (
        <section className={style.journey} data-scroll-reveal>
            <header className={style.header} data-scroll-reveal>
                <h2>
                    <span className="cursor-light">MY</span>
                    <span className="cursor-light">JOURNEY</span>
                </h2>
            </header>

            <div className={style.list}>
                {entries.map((entry) => (
                    <article className={`${style.card} cursor-reactive`} key={`${entry.title}-${entry.period}`} data-scroll-reveal>
                        <div className={style.content}>
                            <div className={style.meta}>
                                <h3 className="cursor-light">{entry.title}</h3>
                                <span className={style.place}>{entry.place}</span>
                            </div>
                            <p className="cursor-light">{entry.description}</p>
                            <time className={style.period}>{entry.period}</time>
                        </div>

                        <div className={style.arrow} aria-hidden="true">
                            <svg viewBox="0 0 24 24" className={style.arrowIcon}>
                                <path d="M5 12h12" />
                                <path d="M13 5l7 7-7 7" />
                            </svg>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
