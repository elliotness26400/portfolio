'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Une transition de page est une machine à états — jamais deux à la fois :
 *
 *   idle ──navigate()──▶ leaving ──(route change)──▶ entering ──▶ idle
 *
 *  - leaving  : le contenu de la page courante s'efface (la nav reste).
 *  - entering : le contenu de la nouvelle page apparaît en douceur.
 */
export type TransitionPhase = "idle" | "leaving" | "entering";

type TransitionContextValue = {
    phase: TransitionPhase;
    /** Vrai pendant que le contenu s'efface, juste avant la navigation. */
    isLeaving: boolean;
    /** Vrai pendant que le contenu de la nouvelle page apparaît. */
    isEntering: boolean;
    /** Vrai quand on a atterri via un lien de la nav (et non un refresh). */
    arrivedFromNav: boolean;
    /** Efface la page courante puis navigue. */
    navigate: (href: string) => void;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

/** Doit rester synchronisé avec la transition CSS de `.page`. */
const LEAVE_MS = 420;
/** Durée de l'animation d'entrée (`pageEnter`). */
const ENTER_MS = 900;

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const searchParams = useSearchParams();
    /* Derive the signal at render time: the URL carries ?nav=1 when the
       user arrived through an in-app nav link (not a plain refresh). */
    const arrivedFromNav = searchParams.get("nav") === "1";

    const [phase, setPhase] = useState<TransitionPhase>("idle");
    const leaveTimer = useRef<number | null>(null);
    const enterTimer = useRef<number | null>(null);

    /* On arrival: play the soft enter, then strip the param so a plain
       refresh of the same URL behaves normally. */
    useEffect(() => {
        if (!arrivedFromNav) return;

        setPhase("entering");
        window.history.replaceState(null, "", pathname);

        enterTimer.current = window.setTimeout(() => setPhase("idle"), ENTER_MS);
        return () => {
            if (enterTimer.current) window.clearTimeout(enterTimer.current);
        };
    }, [arrivedFromNav, pathname]);

    const navigate = useCallback(
        (href: string) => {
            if (href === pathname) return;

            /* Annule une transition en cours avant d'en démarrer une nouvelle. */
            if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
            if (enterTimer.current) window.clearTimeout(enterTimer.current);

            setPhase("leaving");
            leaveTimer.current = window.setTimeout(() => {
                const separator = href.includes("?") ? "&" : "?";
                router.push(`${href}${separator}nav=1`);
            }, LEAVE_MS);
        },
        [pathname, router],
    );

    useEffect(() => () => {
        if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
        if (enterTimer.current) window.clearTimeout(enterTimer.current);
    }, []);

    return (
        <TransitionContext.Provider
            value={{
                phase,
                isLeaving: phase === "leaving",
                isEntering: phase === "entering",
                arrivedFromNav,
                navigate,
            }}
        >
            {children}
        </TransitionContext.Provider>
    );
}

export function usePageTransition() {
    const ctx = useContext(TransitionContext);
    if (!ctx) throw new Error("usePageTransition must be used within PageTransitionProvider");
    return ctx;
}
