'use client'

import { useEffect, useRef, useState } from "react";
import { InfoCard } from "../component/portfolio/portfolio1/info_card/main";
import { SliderPart } from "../component/portfolio/portfolio1/presentation/main";
import { Tools } from "../component/portfolio/portfolio1/presentation/tools/main";
import { Projects } from "../component/portfolio/portfolio1/presentation/projects/main";
import { Home } from "../component/portfolio/portfolio1/presentation/home/main";
import { Experience } from "../component/portfolio/portfolio1/presentation/experience/main";
import { Contact } from "../component/portfolio/portfolio1/presentation/contact/main";
import { PortfolioNav, type PortfolioNavItem } from "../component/portfolio/portfolio1/navigation/main";
import style from "./page.module.scss";

const navItems: PortfolioNavItem[] = [
    { id: "home", label: "Home", href: "#home", icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V20h14V9.5" />
            <path d="M10 20v-6h4v6" />
        </svg>
    ) },
    { id: "projects", label: "All Projects", href: "#projects", icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3.5" y="4.5" width="7" height="7" rx="1.5" />
            <rect x="13.5" y="4.5" width="7" height="4.5" rx="1.5" />
            <rect x="13.5" y="13.5" width="7" height="6" rx="1.5" />
            <rect x="3.5" y="13.5" width="7" height="6" rx="1.5" />
        </svg>
    ) },
    { id: "portfolio", label: "Portfolio", href: "#portfolio", icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5v7A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5v-7Z" />
            <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" />
            <path d="M8 12h8" />
        </svg>
    ) },
    { id: "about", label: "About me", href: "#about", icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 19.5c.9-2.9 3.2-4.5 7-4.5s6.1 1.6 7 4.5" />
        </svg>
    ) },
];

export default function Portfolio() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isNavVisible, setIsNavVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => setIsLoaded(true));

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const shouldHide = currentScrollY > 24 && currentScrollY > lastScrollY.current;

            setIsNavVisible(!shouldHide);
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.cancelAnimationFrame(frame);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div className={style.portfolio}>
            <div className={`${style.navShell} ${isLoaded ? style.loaded : ""}`}>
                <PortfolioNav
                    items={navItems}
                    currentPage="portfolio"
                    isVisible={isNavVisible}
                />
            </div>

            <div className={style.background}></div>

            <div className={style.presentation}>
                <div className={`${style.card_container} ${isLoaded ? style.loaded : ""}`}>
                    <InfoCard data={{ name: "Deconinck Elliot" }} />
                </div>

                <div className={style.slider_container}>
                    <SliderPart data={{}}>
                        <Home data={{}} />
                        <Projects data={{}} />
                        <Experience data={{}} />
                        <Tools data={{}} />
                        <Contact data={{}} />
                    </SliderPart>
                </div>
            </div>
        </div>
    );
}
