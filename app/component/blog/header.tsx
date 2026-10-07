'use client'

import React from "react";
import { HeaderType } from "@/app/types/blog";
import style from "./main.module.scss";

export function BlogHeader({ data, date, tags }: { data: HeaderType; date?: string; tags?: string[] }) {

    const { description, title } = data;

    return (
        <header className={style.blogHeader}>
            {(date || tags?.length) && (
                <div className={style.blogMeta}>
                    {date && (
                        <time className="cursor-light" dateTime={date}>
                            {new Date(date).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
                        </time>
                    )}
                    {tags?.length ? (
                        <div className={style.blogTags}>
                            {tags.map((tag) => <span key={tag}>{tag}</span>)}
                        </div>
                    ) : null}
                </div>
            )}
            <h1 className={`cursor-light ${style.bigblogtitle}`}>{title}</h1>
            <h2 className={`cursor-light ${style.blogdescription}`}>{description}</h2>
        </header>
    );

};