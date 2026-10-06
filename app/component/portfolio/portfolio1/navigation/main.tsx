import type { MouseEvent, ReactNode } from "react";
import style from "./page.module.scss";

export type PortfolioNavItem = {
    id: string;
    label: string;
    href: string;
    icon: ReactNode;
};

type PortfolioNavProps = {
    items: PortfolioNavItem[];
    currentPage?: string;
    isVisible?: boolean;
    className?: string;
    /**
     * Intercept a cross-page link so the shell can fade the page out
     * before navigating. Return true if the click was handled.
     */
    onNavigate?: (href: string, event: MouseEvent<HTMLAnchorElement>) => boolean;
};

export function PortfolioNav({ items, currentPage, isVisible = true, className, onNavigate }: PortfolioNavProps) {
    const activePage = currentPage?.trim().toLowerCase();

    return (
        <nav
            className={`${style.nav} ${isVisible ? style.visible : style.hidden} ${className ?? ""}`.trim()}
            aria-label="Main navigation"
        >
            <ul className={style.navList}>
                {items.map(({ id, label, href, icon }) => {
                    const isActive = activePage === id.trim().toLowerCase();

                    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
                        if (!onNavigate) return;
                        /* Les ancres internes (#…) gardent un scroll natif. */
                        if (href.startsWith("#")) return;
                        if (onNavigate(href, event)) event.preventDefault();
                    };

                    return (
                        <li key={id} className={style.navItem}>
                            <a
                                href={href}
                                className={`${style.navLink} cursor-light ${isActive ? style.active : ""}`.trim()}
                                aria-label={label}
                                title={label}
                                onClick={handleClick}
                            >
                                <span className={`${style.icon} ${isActive ? style.activeIcon : ""}`.trim()}>{icon}</span>
                                <span className={style.label}>{label}</span>
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
