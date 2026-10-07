'use client';

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import style from "./reveal.module.scss";

/**
 * Même mécanique que `SliderPart` (about / portfolio) : observe les éléments
 * marqués `data-scroll-reveal`, pose un décalage en cascade par groupe de
 * frères, puis révèle à l'entrée dans le viewport. Utilisé hors du slider.
 */
export function ScrollReveal({ children }: { children: ReactNode }) {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const revealItems = root.querySelectorAll<HTMLElement>("[data-scroll-reveal]");
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
            revealItems.forEach((item) => item.dataset.revealed = "true");
            return;
        }

        const groups = new Map<Element, number>();
        revealItems.forEach((item) => {
            const group = item.parentElement;
            const index = group ? groups.get(group) ?? 0 : 0;
            if (group) groups.set(group, index + 1);
            item.style.setProperty("--reveal-delay", `${Math.min(index * 90, 360)}ms`);
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                (entry.target as HTMLElement).dataset.revealed = "true";
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.12,
            rootMargin: "0px 0px -6% 0px",
        });

        revealItems.forEach((item) => observer.observe(item));
        return () => observer.disconnect();
    }, []);

    return (
        <div className={style.revealRoot} ref={rootRef}>
            {children}
        </div>
    );
}
