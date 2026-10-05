'use client';

import { useEffect, useRef } from "react";
import style from "./page.module.scss";

/* ------------------------------------------------------------------ */
/*  Animation d'un anneau, dessinée en canvas                          */
/*                                                                     */
/*  Chronologie (ms) :                                                 */
/*   0 – 540    A. désintégration : l'anneau se brise en points qui    */
/*                 s'éparpillent et s'effacent presque                 */
/*   540 – 1000 B. réapparition : les points se rassemblent, le trait  */
/*                 devient une onde radio circulaire                   */
/*   1000 – 1500 C. interférences : l'onde devient cassante            */
/*   1500 – 1900 D. retour au cercle final (plus grand, petit = tirets)*/
/*                                                                     */
/*  Tous les chiffres sont dans timeline() pour ajuster le rythme.     */
/* ------------------------------------------------------------------ */

type Params = {
    scale: number;  // multiplicateur du rayon
    seg: number;    // 1 = trait continu, 0 = points
    spread: number; // 0 = sur le cercle, 1 = éparpillé
    alpha: number;
    amp: number;    // amplitude de l'onde (fraction du rayon)
    mix: number;    // 0 = onde lisse, 1 = onde cassante
    lw: number;     // multiplicateur d'épaisseur
};

type RingConfig = {
    radius: number;
    lineWidth: number;
    waves: number;       // nombre d'ondulations autour du cercle
    finalScale: number;
    finalSeg: number;    // 1 = plein, < 1 = pointillé
    finalAlpha: number;
    delay: number;       // décalage de départ en ms
    instant: boolean;    // prefers-reduced-motion
};

const SMALL_CONFIG = { radius: 14, lineWidth: 1.5, waves: 10, finalScale: 1.4, finalSeg: 0.45, finalAlpha: 1, delay: 0 };
const LARGE_CONFIG = { radius: 21, lineWidth: 1.5, waves: 15, finalScale: 1.3, finalSeg: 1, finalAlpha: 0.7, delay: 70 };

const TAU = Math.PI * 2;
const SIZE = 128;
const HALF = SIZE / 2;
const SAMPLES = 160;
const NOISE_LEN = 96;
const DURATION = 1900;
const RETURN_MS = 320;

const REST: Params = { scale: 1, seg: 1, spread: 0, alpha: 1, amp: 0, mix: 0, lw: 1 };

const easeInOut = (u: number) => (u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2);
const easeOut = (u: number) => 1 - (1 - u) ** 3;
const tri = (x: number) => (2 / Math.PI) * Math.asin(Math.sin(x));

type Stop = [number, number];

const track = (t: number, stops: Stop[]) => {
    if (t <= stops[0][0]) return stops[0][1];
    for (let i = 1; i < stops.length; i++) {
        const [t1, v1] = stops[i];
        if (t <= t1) {
            const [t0, v0] = stops[i - 1];
            return v0 + (v1 - v0) * easeInOut((t - t0) / (t1 - t0));
        }
    }
    return stops[stops.length - 1][1];
};

const lerpParams = (a: Params, b: Params, u: number) => {
    const out = { ...a };
    for (const key of Object.keys(a) as (keyof Params)[]) {
        out[key] = a[key] + (b[key] - a[key]) * u;
    }
    return out;
};

const timeline = (t: number, f: Params, c: RingConfig): Params => ({
    scale: track(t, [[0, f.scale], [540, f.scale], [900, 1], [1300, 1], [1480, c.finalScale * 1.1], [1900, c.finalScale]]),
    seg: track(t, [[0, f.seg], [260, 0], [600, 0], [900, 1], [1560, 1], [1900, c.finalSeg]]),
    spread: track(t, [[0, f.spread], [220, f.spread], [460, 1], [540, 1], [860, 0]]),
    alpha: track(t, [[0, f.alpha], [220, f.alpha], [460, 0.12], [540, 0.12], [860, 1], [1500, 1], [1900, c.finalAlpha]]),
    amp: track(t, [[0, f.amp], [260, 0], [860, 0], [1050, 0.13], [1250, 0.15], [1480, 0.3], [1900, 0]]),
    mix: track(t, [[0, f.mix], [260, 0], [1000, 0], [1300, 1], [1500, 1], [1800, 0]]),
    lw: track(t, [[0, f.lw], [260, 1.5], [460, 0.8], [540, 0.8], [860, 1.3], [1000, 1]]),
});

function createRing(canvas: HTMLCanvasElement, c: RingConfig) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.style.width = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;
    canvas.style.marginLeft = `${-HALF}px`;
    canvas.style.marginTop = `${-HALF}px`;
    ctx.scale(dpr, dpr);

    const color = getComputedStyle(canvas).getPropertyValue("--color-main").trim() || "rgb(212 255 88)";
    const count = Math.max(8, Math.round((TAU * c.radius) / 5));
    const seeds = Array.from({ length: count }, () => ({
        dr: -0.3 + Math.random() * 1.2,
        dth: (Math.random() - 0.5) * 0.6,
    }));

    const noise = new Float32Array(NOISE_LEN);
    let noiseTime = -1e9;
    const refreshNoise = (now: number) => {
        if (now - noiseTime < 70) return;
        noiseTime = now;
        for (let i = 0; i < NOISE_LEN; i++) noise[i] = Math.random() * 2 - 1;
    };

    const finalParams: Params = { scale: c.finalScale, seg: c.finalSeg, spread: 0, alpha: c.finalAlpha, amp: 0, mix: 0, lw: 1 };

    let mode: "rest" | "play" | "settled" | "return" = "rest";
    let current: Params = { ...REST };
    let from: Params = { ...REST };
    let t0 = 0;

    const pass = (ctx: CanvasRenderingContext2D, p: Params, now: number, ghost: number, alpha: number) => {
        const R = c.radius * p.scale;
        const step = TAU / count;
        const span = Math.max(step * p.seg, 0.03);
        const pts = Math.max(2, Math.ceil((SAMPLES / count) * p.seg) + 1);
        const t = now / 1000;
        const k = c.waves;

        ctx.globalAlpha = alpha;
        ctx.lineWidth = c.lineWidth * p.lw;
        ctx.beginPath();

        for (let i = 0; i < count; i++) {
            const start = (i + 0.5) * step - span / 2;
            const { dr, dth } = seeds[i];

            for (let j = 0; j < pts; j++) {
                const th = start + (span * j) / (pts - 1);
                let w = 0;

                if (p.amp > 0.001) {
                    // onde lisse : deux sinus proches -> battements, comme une onde radio
                    const smooth = 0.5 * (Math.sin(k * th + t * 3.4 + ghost * 1.3) + Math.sin((k + 2) * th - t * 2.3));
                    // onde cassante : triangle + bruit en escalier
                    const idx = Math.floor((((th % TAU) + TAU) % TAU / TAU) * NOISE_LEN) % NOISE_LEN;
                    const jagged = 0.65 * tri((k + 4) * th + t * 9 + ghost * 2.1) + 0.35 * noise[(idx + ghost * 7) % NOISE_LEN];
                    w = smooth + (jagged - smooth) * p.mix;
                }

                const r = R + dr * p.spread * R + R * p.amp * w;
                const a = th + dth * p.spread;
                const x = HALF + Math.cos(a) * r;
                const y = HALF + Math.sin(a) * r;
                if (j === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    };

    const draw = (now: number) => {
        ctx.clearRect(0, 0, SIZE, SIZE);
        if (current.alpha < 0.01) return;
        ctx.strokeStyle = color;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        pass(ctx, current, now, 0, current.alpha);
        if (current.mix > 0.05) pass(ctx, current, now, 1, current.alpha * 0.35 * current.mix);
    };

    return {
        play(now: number) {
            if (c.instant) {
                current = { ...finalParams };
                mode = "settled";
                draw(now);
                return;
            }
            from = { ...current };
            t0 = now + c.delay;
            mode = "play";
        },
        reset(now: number) {
            if (mode === "rest") return;
            if (c.instant) {
                current = { ...REST };
                mode = "rest";
                draw(now);
                return;
            }
            from = { ...current };
            t0 = now;
            mode = "return";
        },
        /** Retourne true tant que l'animation continue. */
        tick(now: number) {
            if (mode === "play") {
                const t = now - t0;
                if (t < 0) return true;
                if (t >= DURATION) {
                    current = { ...finalParams };
                    mode = "settled";
                } else {
                    refreshNoise(now);
                    current = timeline(t, from, c);
                }
            } else if (mode === "return") {
                const u = (now - t0) / RETURN_MS;
                if (u >= 1) {
                    current = { ...REST };
                    mode = "rest";
                } else {
                    current = lerpParams(from, REST, easeOut(Math.max(0, u)));
                }
            }
            draw(now);
            return mode === "play" || mode === "return";
        },
    };
}

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function CursorFollower() {
    const layerRef = useRef<HTMLDivElement>(null);
    const smallCircleRef = useRef<HTMLSpanElement>(null);
    const largeCircleRef = useRef<HTMLSpanElement>(null);
    const smallCanvasRef = useRef<HTMLCanvasElement>(null);
    const largeCanvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

        const smallCircle = smallCircleRef.current;
        const largeCircle = largeCircleRef.current;
        const layer = layerRef.current;
        const smallCanvas = smallCanvasRef.current;
        const largeCanvas = largeCanvasRef.current;
        if (!layer || !smallCircle || !largeCircle || !smallCanvas || !largeCanvas) return;

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const smallRing = createRing(smallCanvas, { ...SMALL_CONFIG, instant: reduceMotion });
        const largeRing = createRing(largeCanvas, { ...LARGE_CONFIG, instant: reduceMotion });
        if (!smallRing || !largeRing) return;

        let hasPointerPosition = false;
        let targetX = 0;
        let targetY = 0;
        let smallX = 0;
        let smallY = 0;
        let largeX = 0;
        let largeY = 0;
        let lastFrameTime = 0;
        let animationFrame = 0;
        let ringFrame = 0;
        let activeReactiveItem: Element | null = null;
        let activeLightItem: Element | null = null;

        /* ---------- boucle des anneaux ---------- */

        const ringLoop = (time: number) => {
            ringFrame = 0;
            const largeMoving = largeRing.tick(time);
            const smallMoving = smallRing.tick(time);
            if (largeMoving || smallMoving) ringFrame = window.requestAnimationFrame(ringLoop);
        };

        const startRings = () => {
            if (!ringFrame) ringFrame = window.requestAnimationFrame(ringLoop);
        };

        // dessin initial (cercle au repos)
        largeRing.tick(performance.now());
        smallRing.tick(performance.now());

        /* ---------- suivi du curseur ---------- */

        const setPosition = (element: HTMLSpanElement, x: number, y: number) => {
            element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        };

        const animate = (time: number) => {
            animationFrame = 0;
            if (!hasPointerPosition) return;

            const elapsed = lastFrameTime === 0 ? 16 : Math.min(time - lastFrameTime, 50);
            lastFrameTime = time;

            const smallFollow = reduceMotion ? 1 : 1 - Math.exp(-elapsed / 125);
            const largeFollow = reduceMotion ? 1 : 1 - Math.exp(-elapsed / 160);
            smallX += (targetX - smallX) * smallFollow;
            smallY += (targetY - smallY) * smallFollow;
            largeX += (targetX - largeX) * largeFollow;
            largeY += (targetY - largeY) * largeFollow;

            setPosition(smallCircle, smallX, smallY);
            setPosition(largeCircle, largeX, largeY);
            updateContrastAtRings();

            const smallDistance = Math.hypot(targetX - smallX, targetY - smallY);
            const largeDistance = Math.hypot(targetX - largeX, targetY - largeY);
            if (smallDistance > 0.15 || largeDistance > 0.15) {
                animationFrame = window.requestAnimationFrame(animate);
            } else {
                lastFrameTime = 0;
            }
        };

        const handlePointerMove = (event: PointerEvent) => {
            if (event.pointerType !== "mouse") return;

            targetX = event.clientX;
            targetY = event.clientY;

            if (!hasPointerPosition) {
                smallX = targetX;
                smallY = targetY;
                largeX = targetX;
                largeY = targetY;
                setPosition(smallCircle, smallX, smallY);
                setPosition(largeCircle, largeX, largeY);
                hasPointerPosition = true;
                smallCircle.style.opacity = "1";
                largeCircle.style.opacity = "1";
                updateContrastAtRings();
            } else if (!animationFrame) {
                animationFrame = window.requestAnimationFrame(animate);
            }
        };

        /* ---------- éléments réactifs ---------- */

        const resetReactiveAnimation = () => {
            activeReactiveItem = null;
            const now = performance.now();
            largeRing.reset(now);
            smallRing.reset(now);
            startRings();
        };

        const setLightContrast = (item: Element | null) => {
            activeLightItem = item;
            layer.dataset.contrast = item ? "light" : "normal";
        };

        const getLightItem = (target: EventTarget | null) => {
            if (!(target instanceof Element) || target.closest(".cursor-dark")) return null;
            return target.closest(".cursor-light");
        };

        const updateContrastAtRings = () => {
            const rings = [
                { x: smallX, y: smallY, radius: SMALL_CONFIG.radius * SMALL_CONFIG.finalScale },
                { x: largeX, y: largeY, radius: LARGE_CONFIG.radius * LARGE_CONFIG.finalScale },
            ];
            let lightItem: Element | null = null;

            for (const ring of rings) {
                for (let sample = 0; sample < 24; sample++) {
                    const angle = (sample / 24) * TAU;
                    const x = Math.round(ring.x + Math.cos(angle) * ring.radius);
                    const y = Math.round(ring.y + Math.sin(angle) * ring.radius);
                    lightItem = getLightItem(document.elementFromPoint(x, y));
                    if (lightItem) break;
                }
                if (lightItem) break;
            }

            if (lightItem !== activeLightItem) setLightContrast(lightItem);
        };

        const getReactiveItem = (target: EventTarget | null) =>
            target instanceof Element ? target.closest(".cursor-reactive") : null;

        const handlePointerLeave = () => {
            hasPointerPosition = false;
            smallCircle.style.opacity = "0";
            largeCircle.style.opacity = "0";
            setLightContrast(null);
            resetReactiveAnimation();
            lastFrameTime = 0;
            if (animationFrame) {
                window.cancelAnimationFrame(animationFrame);
                animationFrame = 0;
            }
        };

        const handlePointerOver = (event: PointerEvent) => {
            const reactiveItem = getReactiveItem(event.target);
            if (!reactiveItem || reactiveItem === activeReactiveItem) return;

            activeReactiveItem = reactiveItem;
            const now = performance.now();
            largeRing.play(now);
            smallRing.play(now);
            startRings();
        };

        const handlePointerOut = (event: PointerEvent) => {
            const leavingItem = getReactiveItem(event.target);
            if (!leavingItem || leavingItem !== activeReactiveItem) return;

            const enteringItem = getReactiveItem(event.relatedTarget);
            if (enteringItem === leavingItem) return;
            resetReactiveAnimation();
        };

        document.addEventListener("pointermove", handlePointerMove, { passive: true });
        document.addEventListener("pointerover", handlePointerOver);
        document.addEventListener("pointerout", handlePointerOut);
        document.documentElement.addEventListener("pointerleave", handlePointerLeave);

        return () => {
            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerover", handlePointerOver);
            document.removeEventListener("pointerout", handlePointerOut);
            document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
            if (animationFrame) window.cancelAnimationFrame(animationFrame);
            if (ringFrame) window.cancelAnimationFrame(ringFrame);
        };
    }, []);

    return (
        <div ref={layerRef} className={style.layer} aria-hidden="true">
            <span ref={largeCircleRef} className={style.circle} data-cursor-circle="large">
                <canvas ref={largeCanvasRef} className={style.canvas} />
            </span>
            <span ref={smallCircleRef} className={style.circle} data-cursor-circle="small">
                <canvas ref={smallCanvasRef} className={style.canvas} />
            </span>
        </div>
    );
}
