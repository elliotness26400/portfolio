'use client'

import React from "react";
import style from "./page.module.scss";

type ProjectItem = {
    title: string;
    description: string;
    image: string;
    href: string;
};

const projects: ProjectItem[] = [
    {
        title: "Aster Studio",
        description: "A polished brand experience for a creative studio, focused on storytelling and product clarity.",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
        href: "#"
    },
    {
        title: "Northstar App",
        description: "A SaaS dashboard redesign that simplified complex workflows and improved conversion paths.",
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

export function Projects({ data }: { data: {} }) {
    const {} = data;

    return (
        <section className={style.projects}>
            <div className={style.header}>
                <h2>
                    <span className="cursor-light">RECENT</span>
                    <span className="cursor-light">PROJECTS</span>
                </h2>
            </div>

            <div className={style.list}>
                {projects.map((project) => (
                    <a key={project.title} href={project.href} className={`${style.card} cursor-reactive`}>
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