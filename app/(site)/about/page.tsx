'use client'

import type { CSSProperties } from "react";
import { SliderPart } from "../../component/portfolio/portfolio1/presentation/main";
import { AboutIntro } from "../../component/portfolio/portfolio1/presentation/about/intro/main";
import { AboutJourney } from "../../component/portfolio/portfolio1/presentation/about/journey/main";
import { AboutSkills } from "../../component/portfolio/portfolio1/presentation/about/skills/main";
import { AboutContact } from "../../component/portfolio/portfolio1/presentation/about/contact/main";
import style from "./page.module.scss";

export default function About() {
    return (
        <div className={style.about}>
            <div className={style.content}>
                
                <div style={{'height':'100vh'}}>
                    <h1 aria-label="About me">
                        <span className={`cursor-light ${style.titleLine}`} aria-hidden="true">
                            {Array.from("ABOUT").map((letter, index) => (
                                <span
                                    className={style.titleLetter}
                                    style={{ "--letter-index": index } as CSSProperties}
                                    key={`about-${index}`}
                                >
                                    {letter}
                                </span>
                            ))}
                        </span>
                        <span className={`cursor-light ${style.titleLine}`} aria-hidden="true">
                            {Array.from("ME").map((letter, index) => (
                                <span
                                    className={style.titleLetter}
                                    style={{ "--letter-index": index + 5 } as CSSProperties}
                                    key={`me-${index}`}
                                >
                                    {letter}
                                </span>
                            ))}
                        </span>
                    </h1>

                    <p className={`cursor-light ${style.lead}`}>
                        A developer who cares about the details — building interfaces that feel
                        effortless, and software that lasts.
                    </p>
                </div>

                <div className={style.slider_container}>
                    <SliderPart data={{}}>
                        <AboutIntro />
                        <AboutJourney />
                        <AboutSkills />
                        <AboutContact />
                    </SliderPart>
                </div>
            </div>
        </div>
    );
}
