'use client'

import type { ReactNode } from "react";

export function SliderPart({ children }: { data: Record<string, unknown>; children: ReactNode }) {
    return (
        <div>
            <h1>Main</h1>
            {children}
        </div>
    );
}