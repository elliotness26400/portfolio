import style from "./main.module.scss";

const stats = [
    { value: "8+", label: "Years of experience" },
    { value: "15+", label: "Projects completed" },
    { value: "3", label: "Languages spoken" },
];

export function AboutIntro() {
    return (
        <section className={style.intro} data-scroll-reveal>
            <header className={style.header} data-scroll-reveal>
                <h2>
                    <span className="cursor-light">WHO I AM</span>
                    <span className="cursor-light">&amp; WHAT I BUILD</span>
                </h2>
            </header>

            <div className={style.body}>
                <div className={style.text} data-scroll-reveal>
                    <p className="cursor-light">
                        I&apos;m Elliot Deconinck, a software engineer based in France, currently
                        studying Embedded Systems and Industrial Computing. I like the space where
                        hardware stubbornness meets software elegance — where a few hundred bytes
                        have to behave as well as a modern web app.
                    </p>
                    <p className="cursor-light">
                        My work moves between two worlds: product-facing interfaces built with
                        React, Next.js and TypeScript, and closer-to-the-metal work in C and
                        Python. I care about the details most people never notice — easing curves,
                        focus states, the millisecond it takes a page to feel alive.
                    </p>
                </div>

                <div className={style.stats} data-scroll-reveal>
                    {stats.map((stat) => (
                        <div className={style.stat} key={stat.label}>
                            <h3 className="cursor-reactive cursor-light">{stat.value}</h3>
                            <p className="cursor-light">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
