import style from "./main.module.scss";

type Tool = {
    name: string;
    mark: string;
    detail: string;
    tone: "lime" | "blue" | "coral" | "violet" | "neutral";
};

const tools: Tool[] = [
    { name: "React.js", mark: "Re", detail: "UI library", tone: "blue" },
    { name: "Next.js", mark: "N", detail: "Web framework", tone: "neutral" },
    { name: "Node.js", mark: "No", detail: "JavaScript runtime", tone: "lime" },
    { name: "JavaScript", mark: "JS", detail: "Programming", tone: "coral" },
    { name: "TypeScript", mark: "TS", detail: "Typed JavaScript", tone: "blue" },
    { name: "PHP", mark: "php", detail: "Server-side", tone: "violet" },
    { name: "HTML", mark: "5", detail: "Markup", tone: "coral" },
    { name: "SCSS", mark: "Sc", detail: "Stylesheets", tone: "violet" },
    { name: "Sass", mark: "Sa", detail: "CSS preprocessor", tone: "coral" },
    { name: "C", mark: "C", detail: "Programming", tone: "blue" },
    { name: "Python", mark: "Py", detail: "Programming", tone: "blue" },
    { name: "Figma", mark: "Fg", detail: "Interface design", tone: "violet" },
    { name: "Canva", mark: "Cv", detail: "Visual design", tone: "blue" },
    { name: "Vercel", mark: "V", detail: "Deployment", tone: "neutral" },
    { name: "Visual Studio", mark: "VS", detail: "Code editor", tone: "blue" },
    { name: "Git", mark: "Git", detail: "Version control", tone: "coral" },
];

export function Tools() {
    return (
        <section className={style.tools} data-scroll-reveal>
            <header className={style.header} data-scroll-reveal>
                <h2>
                    <span className="cursor-light">PREMIUM</span>
                    <span className="cursor-light">TOOLS</span>
                </h2>
            </header>

            <div className={style.grid}>
                {tools.map((tool) => (
                    <article className={`${style.card} cursor-reactive`} key={tool.name} data-scroll-reveal>
                        <div className={`${style.mark} ${style[tool.tone]}`} aria-hidden="true">
                            <span>{tool.mark}</span>
                        </div>
                        <h3 className="cursor-light">{tool.name}</h3>
                        <p>{tool.detail}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}