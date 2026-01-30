'use client'

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import './style.css'
import { ant, base, envirementItem, food, pheromone, position, settings } from "@/app/types/ant";


function getRandomArbitrary(min:number, max:number):number {
    return Math.random() * (max - min) + min;
}


export function Base({item}:{item:base}) {

    return (
        <div className="base" style={{left:`${item.pos.x}vw`,top:`${item.pos.y}vh`}}>
            
        </div>
    );
}
