'use client'

import React, { forwardRef } from "react";
import './style.css'
import { Ant } from "@/app/types/ant2";

export const VisualAnt = forwardRef<HTMLDivElement, { item: Ant,size:number }>(
({ item,size }, ref) => {

    return (
        <div
            ref={ref}
            className="ant"
            style={{
                left: `${item.pos.x}vw`,
                top: `${item.pos.y}vh`,
                width:`${size}vw`,
                height:`${size}vw`,
                backgroundColor:"black",
            }}
        />
    );
});