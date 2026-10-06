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
 *
 * `?nav=1` n'est qu'un signal d'arrivée. On le consomme une fois puis on
 * mémorise `hasLoadedFromNav` pour que la nav ne rejoue jamais l'intro.
 */
export type TransitionPhase = "idle" | "leaving" | "entering";

type TransitionContextValue = {
    phase: TransitionPhase;
    /** Vrai pendant que le contenu s'efface, juste avant la navigation. */
    isLeaving: boolean;
    /** Vrai pendant que le contenu de la nouvelle page apparaît. */
    isEntering: boolean;
    /** Vrai dès qu'on a navigué via la nav (reste vrai après le strip de `?nav=1`). */
    hasLoadedFromNav: boolean;
    /** Efface la page courante puis navigue. */
    navigate: (href: string) => void;
    /** Consomme `?nav=1` : latch + entrée + URL propre. */
    consumeNavParam: () => void;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

/** Doit rester synchronisé avec la transition CSS de `.page`. */
const LEAVE_MS = 420;
/** Durée de l'animation d'entrée (`pageEnter`). */
const ENTER_MS = 900;

/** Survit aux re-renders du layout ; un refresh complet le remet à false. */
let fromNavSession = false;

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const [phase, setPhase] = useState<TransitionPhase>("idle");
    const [hasLoadedFromNav, setHasLoadedFromNav] = useState(fromNavSession);
    const [seenPath, setSeenPath] = useState(pathname);

    const leaveTimer = useRef<number | null>(null);
    const enterTimer = useRef<number | null>(null);

    const markLoadedFromNav = useCallback(() => {
        fromNavSession = true;
        setHasLoadedFromNav(true);
    }, []);

    /* Premier paint de la nouvelle route : entering, jamais leaving. */
    if (pathname !== seenPath) {
        setSeenPath(pathname);
        if (fromNavSession) {
            setPhase("entering");
        }
    }

    const consumeNavParam = useCallback(() => {
        markLoadedFromNav();
        setPhase("entering");
        window.history.replaceState(null, "", pathname);
    }, [markLoadedFromNav, pathname]);

    useEffect(() => {
        if (phase !== "entering") return;

        if (enterTimer.current) window.clearTimeout(enterTimer.current);
        enterTimer.current = window.setTimeout(() => setPhase("idle"), ENTER_MS);
        return () => {
            if (enterTimer.current) window.clearTimeout(enterTimer.current);
        };
    }, [phase, pathname]);

    const navigate = useCallback(
        (href: string) => {
            if (href === pathname) return;

            if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
            if (enterTimer.current) window.clearTimeout(enterTimer.current);

            markLoadedFromNav();
            setPhase("leaving");
            leaveTimer.current = window.setTimeout(() => {
                const separator = href.includes("?") ? "&" : "?";
                router.push(`${href}${separator}nav=1`);
            }, LEAVE_MS);
        },
        [pathname, router, markLoadedFromNav],
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
                hasLoadedFromNav,
                navigate,
                consumeNavParam,
            }}
        >
            {children}
        </TransitionContext.Provider>
    );
}

/**
 * Isolé derrière un `<Suspense>` : `useSearchParams` ne doit pas
 * démonter la nav. Consomme `?nav=1` puis le retire de l'URL.
 */
export function NavParamSync() {
    const searchParams = useSearchParams();
    const { consumeNavParam } = usePageTransition();
    const arrivedFromNav = searchParams.get("nav") === "1";

    useEffect(() => {
        if (!arrivedFromNav) return;
        consumeNavParam();
    }, [arrivedFromNav, consumeNavParam]);

    return null;
}

export function usePageTransition() {
    const ctx = useContext(TransitionContext);
    if (!ctx) throw new Error("usePageTransition must be used within PageTransitionProvider");
    return ctx;
}
