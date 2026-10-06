import style from "./page.module.scss";

type ProjectItem = {
    title: string;
    description: string;
    image: string;
    href: string;
};

const projects: ProjectItem[] = [
    {
        title: "Framework Picture",
        description: "Front end page to present the work of a photographer, built with Next.js, featuring a responsive design and smooth animations.",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
        href: "#"
    },
    {
            title: "Socket.IO Chess App",
            description: "A real-time multiplayer chess application built with Socket.IO & Next.js, allowing players to compete against each other online.",
        image: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=900&q=80",
        href: "#"
    },
    {
        title: "3D Engine 2023",
        description: "A 3D engine built in PURE native web HTML JS PHP with no lib, and only divs perspective using CSS 3D transforms. Also my first big project",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
        href: "http://localhost:3000/3d/engine2023"
    }
];

export function Projects() {
    return (
        <section className={style.projects} data-scroll-reveal>
            <div className={style.header} data-scroll-reveal>
                <h2>
                    <span className="cursor-light">RECENT</span>
                    <span className="cursor-light">PROJECTS</span>
                </h2>
            </div>

            <div className={style.list}>
                {projects.map((project) => (
                    <a key={project.title} href={project.href} className={`${style.card} cursor-reactive`} data-scroll-reveal>
                        <div className={style.imageWrap}>
                            <img src={project.image} alt={project.title} />
                        </div>

                        <div className={style.content}>
                            <h3 className="cursor-light">{project.title}</h3>
                            <p className="cursor-light">{project.description}</p>
                        </div>

                        <div className={style.arrow} aria-hidden="true">
                            <svg viewBox="0 0 24 24" className={style.arrowIcon}>
                                <path d="M5 12h12" />
                                <path d="M13 5l7 7-7 7" />
                            </svg>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}