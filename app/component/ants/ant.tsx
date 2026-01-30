'use client'

import React, { forwardRef } from "react";
import './style.css'
import { ant } from "@/app/types/ant";

export const Ant = forwardRef<HTMLDivElement, { item: ant,size:number }>(
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

Ant.displayName = "Ant";
