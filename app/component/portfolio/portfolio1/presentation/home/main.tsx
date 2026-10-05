'use client'

import type { CSSProperties } from "react";
import style from "./page.module.scss";

export function Home({data}:{data:Record<string, unknown>}){

    const {} = data;

    return (
        <div className={style.main}>
            <div className={style.presentation}>
                
                <h1 aria-label="Software Engineer">
                    <span className={`cursor-light ${style.titleLine}`} aria-hidden="true">
                        {Array.from("SOFTWARE").map((letter, index) => (
                            <span
                                className={style.titleLetter}
                                style={{ "--letter-index": index } as CSSProperties}
                                key={`software-${index}`}
                            >
                                {letter}
                            </span>
                        ))}
                    </span>
                    <span className={`cursor-light ${style.titleLine}`} aria-hidden="true">
                        {Array.from("ENGINEER").map((letter, index) => (
                            <span
                                className={style.titleLetter}
                                style={{ "--letter-index": index + 8 } as CSSProperties}
                                key={`engineer-${index}`}
                            >
                                {letter}
                            </span>
                        ))}
                    </span>
                </h1>

                <h3 className="cursor-light">Passionate about creating intuitive and engaging user experiences. Specialize in transforming ideas into beautifully crafted products.</h3>
            </div>

            <div className={style.badges}>
                <div>
                    <h2 className="cursor-reactive cursor-light">+8</h2>
                    <h4 className="cursor-light">Years of experience</h4>
                </div>

                <div>
                    <h2 className="cursor-reactive cursor-light">+15</h2>
                    <h4 className="cursor-light">Projects completed</h4>
                </div>
            </div>
        </div>
    );

};