import style from "./page.module.scss";

type ExperienceEntry = {
    title: string;
    description: string;
    period: string;
};

type ExperienceData = {
    years?: string;
    entries?: ExperienceEntry[];
};

const sampleEntries: ExperienceEntry[] = [
    {
        title: "ESISAR",
        description: "School of Advanced Industrial & embedded Systems. Studying Embedded Systems and Industrial Computing, with a focus on software development, electronics, and computer architecture.",
        period: "2025 — NOW",
    },
    {
        title: "Samsoe Skole",
        description: "Exchange student at Samsoe Skole, Denmark, where I learned danish (Currently fluent), Danish culture and education.",
        period: "2021 — 2023",
    },
    {
        title: "UI / UX Design Course",
        description: "Learning the principles of user interface and user experience design, including wireframing, prototyping, and usability testing.",
        period: "2023 - 2024",
    },
    {
        title: "Web Development Course",
        description: "Learning the fundamentals of web development, including HTML, CSS, JavaScript, and bases of algorithms and data structures.",
        period: "2019 — 2023",
    },
];

export function Experience({ data }: { data: ExperienceData }) {
    const years = data.years ?? "8+";
    const entries = data.entries ?? sampleEntries;

    return (
        <section className={style.experience} data-scroll-reveal>
            <div className={style.header} data-scroll-reveal>
                <h2>
                    <span className="cursor-light">{years} YEARS OF</span>
                    <span className="cursor-light">EXPERIENCE</span>
                </h2>
            </div>

            <div className={style.list}>
                {entries.slice(0, 4).map((entry) => (
                    <article className={`${style.card} cursor-reactive`} key={`${entry.title}-${entry.period}`} data-scroll-reveal>
                        <div className={style.content}>
                            <h3 className="cursor-light">{entry.title}</h3>
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