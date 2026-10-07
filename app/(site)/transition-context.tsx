'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type TransitionPhase = "idle" | "leaving" | "entering";

type TransitionContextValue = {
    phase: TransitionPhase;
    isLeaving: boolean;
    isEntering: boolean;
    hasLoadedFromNav: boolean;
    navigate: (href: string) => void;
    consumeNavParam: () => void;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

const LEAVE_MS = 420;
const ENTER_MS = 900;

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

    if (pathname !== seenPath) {
        setSeenPath(pathname);
        if (fromNavSession) {
            setPhase("entering");
        }
    }

    const consumeNavParam = useCallback(() => {
        markLoadedFromNav();
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
