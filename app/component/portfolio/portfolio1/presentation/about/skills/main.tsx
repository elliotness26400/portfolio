import style from "./main.module.scss";

type Skill = {
    name: string;
    mark: string;
    detail: string;
    tone: "lime" | "blue" | "coral" | "violet" | "neutral";
};

const skills: Skill[] = [
    { name: "React.js", mark: "Re", detail: "UI library", tone: "blue" },
    { name: "Next.js", mark: "N", detail: "Web framework", tone: "neutral" },
    { name: "Node.js", mark: "No", detail: "JavaScript runtime", tone: "lime" },
    { name: "TypeScript", mark: "TS", detail: "Typed JavaScript", tone: "blue" },
    { name: "JavaScript", mark: "JS", detail: "Programming", tone: "coral" },
    { name: "C", mark: "C", detail: "Programming", tone: "blue" },
    { name: "Python", mark: "Py", detail: "Programming", tone: "blue" },
    { name: "PHP", mark: "php", detail: "Server-side", tone: "violet" },
    { name: "HTML", mark: "5", detail: "Markup", tone: "coral" },
    { name: "SCSS", mark: "Sc", detail: "Stylesheets", tone: "violet" },
    { name: "Figma", mark: "Fg", detail: "Interface design", tone: "violet" },
    { name: "Git", mark: "Git", detail: "Version control", tone: "coral" },
];

export function AboutSkills() {
    return (
        <section className={style.skills} data-scroll-reveal>
            <header className={style.header} data-scroll-reveal>
                <h2>
                    <span className="cursor-light">WHAT I</span>
                    <span className="cursor-light">WORK WITH</span>
                </h2>
            </header>

            <div className={style.grid}>
                {skills.map((skill) => (
                    <article className={`${style.card} cursor-reactive`} key={skill.name} data-scroll-reveal>
                        <div className={`${style.mark} ${style[skill.tone]}`} aria-hidden="true">
                            <span>{skill.mark}</span>
                        </div>
                        <h3 className="cursor-light">{skill.name}</h3>
                        <p>{skill.detail}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
