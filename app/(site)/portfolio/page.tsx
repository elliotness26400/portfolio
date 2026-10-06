'use client'

import { InfoCard } from "../../component/portfolio/portfolio1/info_card/main";
import { SliderPart } from "../../component/portfolio/portfolio1/presentation/main";
import { Tools } from "../../component/portfolio/portfolio1/presentation/tools/main";
import { Projects } from "../../component/portfolio/portfolio1/presentation/projects/main";
import { Home } from "../../component/portfolio/portfolio1/presentation/home/main";
import { Experience } from "../../component/portfolio/portfolio1/presentation/experience/main";
import { Contact } from "../../component/portfolio/portfolio1/presentation/contact/main";
import style from "./page.module.scss";

export default function Portfolio() {
    return (
        <div className={style.portfolio}>
            <div className={style.presentation}>

                <div className={style.card_container}>
                    <InfoCard data={{ name: "Deconinck Elliot" }} />
                </div>

                <div className={style.slider_container}>
                    <SliderPart data={{}}>
                        <Home data={{}} />
                        <Projects />
                        <Experience data={{}} />
                        <Tools />
                    </SliderPart>
                </div>

            </div>

            <Contact />

        </div>
    );
}
