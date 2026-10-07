"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { blogsDatas } from "../data/blog";
import style from "./page.module.scss";

type SortOrder = "newest" | "oldest";

const projects = Object.entries(blogsDatas).map(([id, project]) => ({ id, ...project }));

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
        <section className={style.page}>
            <header className={style.intro}>
                <p className={style.eyebrow}>Journal de projets</p>
                <h1>Construire, tester, recommencer.</h1>
                <p className={style.lede}>
                    Une collection de projets électroniques, logiciels et objets fabriqués à la main.
                </p>
            </header>

            <div className={style.toolbar} aria-label="Filtrer les projets">
                <label className={style.searchLabel}>
                    <span>Rechercher</span>
                    <input
                        type="search"
                        value={query}
                        onChange={handleQueryChange}
                        placeholder="Un projet, une technologie..."
                    />
                </label>
                <label>
                    <span className={style.controlLabel}>Trier par</span>
                    <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)}>
                        <option value="newest">Plus récent</option>
                        <option value="oldest">Plus ancien</option>
                    </select>
                </label>
            </div>

            <div className={style.tags} aria-label="Filtrer par catégorie">
                <button className={selectedTag === "all" ? style.activeTag : ""} onClick={() => setSelectedTag("all")}>
                    Tous les projets
                </button>
                {tags.map((tag) => (
                    <button key={tag} className={selectedTag === tag ? style.activeTag : ""} onClick={() => setSelectedTag(tag)}>
                        {tag}
                    </button>
                ))}
            </div>

            <p className={style.resultCount}>{filteredProjects.length} projet{filteredProjects.length > 1 ? "s" : ""}</p>

            <div className={style.projectGrid}>
                {filteredProjects.map((project) => (
                    <article className={style.projectCard} key={project.id}>
                        <a href={`/blog/${project.id}`} className={style.imageLink}>
                            <img src={project.coverImage} alt={project.header.title} />
                        </a>
                        <div className={style.cardBody}>
                            <time dateTime={project.createdAt}>
                                {new Date(project.createdAt).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
                            </time>
                            <h2><a href={`/blog/${project.id}`}>{project.header.title}</a></h2>
                            <p>{project.header.description}</p>
                            <div className={style.cardTags}>
                                {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {filteredProjects.length === 0 && <p className={style.emptyState}>Aucun projet ne correspond à cette recherche.</p>}
        </section>
    );
}