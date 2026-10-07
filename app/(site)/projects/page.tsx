"use client";

import { ChangeEvent, CSSProperties, useMemo, useState } from "react";
import { blogsDatas } from "../../data/blog";
import style from "./page.module.scss";

type SortOrder = "newest" | "oldest";

const projects = Object.entries(blogsDatas).map(([id, project]) => ({ id, ...project }));

const TITLE_LINES = ["JOURNAL", "DE PROJETS"];

function renderTitleLines() {
    let offset = 0;

    return TITLE_LINES.map((line, lineIndex) => {
        const startIndex = offset;
        offset += line.length;

        return (
            <span className={`cursor-light ${style.titleLine}`} aria-hidden="true" key={`line-${lineIndex}`}>
                {Array.from(line).map((letter, index) => (
                    <span
                        className={style.titleLetter}
                        style={{ "--letter-index": startIndex + index } as CSSProperties}
                        key={`${lineIndex}-${index}`}
                    >
                        {letter === " " ? "\u00A0" : letter}
                    </span>
                ))}
            </span>
        );
    });
}

export default function BlogIndexPage() {
    const [query, setQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState("all");
    const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

    const tags = useMemo(
        () => Array.from(new Set(projects.flatMap((project) => project.tags))).sort(),
        [],
    );

    const filteredProjects = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return projects
            .filter((project) => {
                const searchableText = `${project.header.title} ${project.header.description} ${project.tags.join(" ")}`.toLowerCase();
                const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
                const matchesTag = selectedTag === "all" || project.tags.includes(selectedTag);
                return matchesQuery && matchesTag;
            })
            .sort((first, second) => {
                const difference = new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime();
                return sortOrder === "newest" ? -difference : difference;
            });
    }, [query, selectedTag, sortOrder]);

    function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
        setQuery(event.target.value);
    }

    return (
        <div className={style.about}>
            <div className={style.content}>
                <header className={style.intro}>
                    <h1 aria-label="Journal de projets">{renderTitleLines()}</h1>

                    <p className={`cursor-light ${style.lead}`}>
                        Construire, tester, recommencer. Une collection de projets électroniques,
                        logiciels et objets fabriqués à la main.
                    </p>
                </header>

                <div className={style.listing}>
                    <div className={style.toolbar} role="search" aria-label="Filtrer les projets">
                        <label className={style.searchLabel}>
                            <span className={`cursor-light ${style.controlLabel}`}>Rechercher</span>
                            <input
                                type="search"
                                value={query}
                                onChange={handleQueryChange}
                                placeholder="Un projet, une technologie..."
                            />
                        </label>
                        <label>
                            <span className={`cursor-light ${style.controlLabel}`}>Trier par</span>
                            <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)}>
                                <option value="newest">Plus récent</option>
                                <option value="oldest">Plus ancien</option>
                            </select>
                        </label>
                    </div>

                    <div className={style.tags} aria-label="Filtrer par catégorie">
                        <button
                            type="button"
                            className={`cursor-reactive cursor-light ${selectedTag === "all" ? style.activeTag : ""}`.trim()}
                            aria-pressed={selectedTag === "all"}
                            onClick={() => setSelectedTag("all")}
                        >
                            Tous les projets
                        </button>
                        {tags.map((tag) => (
                            <button
                                type="button"
                                key={tag}
                                className={`cursor-reactive cursor-light ${selectedTag === tag ? style.activeTag : ""}`.trim()}
                                aria-pressed={selectedTag === tag}
                                onClick={() => setSelectedTag(tag)}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    <p className={`cursor-light ${style.resultCount}`}>
                        {filteredProjects.length} projet{filteredProjects.length > 1 ? "s" : ""}
                    </p>

                    <div className={style.projectGrid}>
                        {filteredProjects.map((project) => (
                            <article className={style.projectCard} key={project.id}>
                                <a href={`/projects/${project.id}`} className={style.imageLink} tabIndex={-1} aria-hidden="true">
                                    <img src={project.coverImage} alt="" />
                                </a>
                                <div className={style.cardBody}>
                                    <time className="cursor-light" dateTime={project.createdAt}>
                                        {new Date(project.createdAt).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
                                    </time>
                                    <h2 className="cursor-light">
                                        <a href={`/blog/${project.id}`}>{project.header.title}</a>
                                    </h2>
                                    <p className="cursor-light">{project.header.description}</p>
                                    <div className={style.cardTags}>
                                        {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {filteredProjects.length === 0 && (
                        <p className={`cursor-light ${style.emptyState}`}>
                            Aucun projet ne correspond à cette recherche. Essayez un autre mot-clé ou une autre catégorie.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
