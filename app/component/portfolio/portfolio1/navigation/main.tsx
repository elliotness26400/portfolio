import type { ReactNode } from "react";
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
};

export function PortfolioNav({ items, currentPage, isVisible = true, className }: PortfolioNavProps) {
    const activePage = currentPage?.trim().toLowerCase();

    return (
        <nav
            className={`${style.nav} ${isVisible ? style.visible : style.hidden} ${className ?? ""}`.trim()}
            aria-label="Main navigation"
        >
            <ul className={style.navList}>
                {items.map(({ id, label, href, icon }) => {
                    const isActive = activePage === id.trim().toLowerCase();

                    return (
                        <li key={id} className={style.navItem}>
                            <a
                                href={href}
                                className={`${style.navLink} ${isActive ? style.active : ""}`.trim()}
                                aria-label={label}
                                title={label}
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
