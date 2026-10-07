'use client';

import { Suspense, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { CursorFollower } from "../component/portfolio/portfolio1/cursor_follower/main";
import { PortfolioNav, type PortfolioNavItem } from "../component/portfolio/portfolio1/navigation/main";
import { NavParamSync, PageTransitionProvider, usePageTransition } from "./transition-context";
import style from "./layout.module.scss";

const navItems: PortfolioNavItem[] = [
    { id: "home", label: "Home", href: "/portfolio#home", icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V20h14V9.5" />
            <path d="M10 20v-6h4v6" />
        </svg>
    ) },
    { id: "projects", label: "All Projects", href: "/projects", icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3.5" y="4.5" width="7" height="7" rx="1.5" />
            <rect x="13.5" y="4.5" width="7" height="4.5" rx="1.5" />
            <rect x="13.5" y="13.5" width="7" height="6" rx="1.5" />
            <rect x="3.5" y="13.5" width="7" height="6" rx="1.5" />
        </svg>
    ) },
    { id: "portfolio", label: "Portfolio", href: "/portfolio", icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5v7A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5v-7Z" />
            <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" />
            <path d="M8 12h8" />
        </svg>
    ) },
    { id: "about", label: "About me", href: "/about", icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 19.5c.9-2.9 3.2-4.5 7-4.5s6.1 1.6 7 4.5" />
        </svg>
    ) },
];

const NAV_LOAD_DELAY: Record<string, string> = {
    home: "5500ms",
    portfolio: "5500ms",
    projects: "2200ms",
    about: "2000ms",
    default: "2200ms",
};

/**
 * Id de l'icône correspondant à la route courante, ou `null` si aucune
 * icône ne correspond (toutes restent alors sombres).
 *
 * `home` (`/portfolio#home`) et `portfolio` (`/portfolio`) pointent vers la
 * même route : on privilégie le libellé le plus spécifique (celui dont le
 * href ne porte pas d'ancre) pour éviter que `home` ne l'emporte au hasard.
 */
function resolveActiveNavId(pathname: string): string | null {
    const normalized = pathname.replace(/\/+$/, "") || "/";

    const candidates = navItems.filter(({ href }) => {
        const path = href.split("#")[0].replace(/\/+$/, "") || "/";
        return path === normalized;
    });

    const exact = candidates.find(({ href }) => !href.includes("#"));
    return (exact ?? candidates[0])?.id ?? null;
}

function ShellChrome({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isLeaving, isEntering, hasLoadedFromNav, phase, navigate } = usePageTransition();

    const [isLoaded, setIsLoaded] = useState(false);
    const [isNavVisible, setIsNavVisible] = useState(true);
    const [language, setLanguage] = useState("en");
    const lastScrollY = useRef(0);

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => setIsLoaded(true));
        return () => window.cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const shouldHide = currentScrollY > 24 && currentScrollY > lastScrollY.current;
            setIsNavVisible(!shouldHide);
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    const activeNavId = resolveActiveNavId(pathname);
    const chromeReady = isLoaded || hasLoadedFromNav;

    const navDelay = NAV_LOAD_DELAY[activeNavId ?? "default"] ?? NAV_LOAD_DELAY.default;

    const handleNavigate = (href: string) => {
        const target = href.split("#")[0] || pathname;
        if (target === pathname) return false;
        navigate(target);
        return true;
    };

    return (
        <div className={style.shell} style={{ "--nav-load-delay": navDelay } as CSSProperties}>
            <CursorFollower />

            <div className={`${style.navShell} ${chromeReady ? style.loaded : ""} ${hasLoadedFromNav ? style.instant : ""}`}>
                <PortfolioNav
                    items={navItems}
                    currentPage={activeNavId ?? undefined}
                    isVisible={isNavVisible}
                    onNavigate={handleNavigate}
                />
            </div>

            <div className={`${style.languageShell} ${chromeReady ? style.loaded : ""} ${hasLoadedFromNav ? style.instant : ""}`}>
                <label className={`${style.languageControl} cursor-light`}>
                    <span className={style.visuallyHidden}>Choose language</span>
                    <select
                        aria-label="Choose language"
                        value={language}
                        onChange={(event) => setLanguage(event.target.value)}
                    >
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                    </select>
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                        <path d="m4 6 4 4 4-4" />
                    </svg>
                </label>
            </div>

            <div className={style.background}></div>

            <Suspense fallback={null}>
                <NavParamSync />
            </Suspense>

            <div
                className={`${style.page}${isLeaving ? ` ${style.pageLeaving}` : ""}${isEntering ? ` ${style.pageEntering}` : ""}`}
                data-transition={phase}
            >
                {children}
            </div>
        </div>
    );
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <PageTransitionProvider>
            <ShellChrome>{children}</ShellChrome>
        </PageTransitionProvider>
    );
}
