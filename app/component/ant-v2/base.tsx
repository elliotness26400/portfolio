'use client'

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import './style.css'
import { Ant,Base } from "@/app/types/ant2";


function getRandomArbitrary(min:number, max:number):number {
    return Math.random() * (max - min) + min;
}


export function VisualBase({item}:{item:Base}) {

    return (
        <div className="base" style={{left:`${item.pos.x}vw`,top:`${item.pos.y}vh`}}>
            
        </div>
    );
}
