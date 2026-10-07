import Link from "next/link";
import { BlogHeader } from "@/app/component/blog/header";
import { BlogMain } from "@/app/component/blog/textField";
import { ScrollReveal } from "@/app/component/blog/scrollReveal/main";
import { blogsDatas } from "@/app/data/blog";
import style from "./page.module.scss";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

    const id = (await params).id;

    const data = blogsDatas[id];

    if (!data) return (
        <div className={style.notFound}>Projet introuvable</div>
    );

    return (
        <div className={style.project}>
            <div className={style.content}>
                <Link href="/projects" className={`cursor-light ${style.backLink}`}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M15 5l-7 7 7 7" />
                    </svg>
                    Tous les projets
                </Link>

                <BlogHeader data={data.header} date={data.createdAt} tags={data.tags} />
                <ScrollReveal>
                    <BlogMain data={data.main} />
                </ScrollReveal>
            </div>
        </div>
    );
}
