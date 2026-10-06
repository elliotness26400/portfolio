'use client'

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import style from "./slider.module.scss";

export function SliderPart({ children }: { data: Record<string, unknown>; children: ReactNode }) {
    const sliderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const slider = sliderRef.current;
        if (!slider) return;

        const revealItems = slider.querySelectorAll<HTMLElement>("[data-scroll-reveal]");
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
        <div className={style.revealRoot} ref={sliderRef}>
            {children}
        </div>
    );
}