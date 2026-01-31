'use client'

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import './style.css'
import { Ant,Base, MapPos } from "@/app/types/ant2";


function getRandomArbitrary(min:number, max:number):number {
    return Math.random() * (max - min) + min;
}


export function Cell({item,x,y}:{item:MapPos,x:number,y:number}) {

    return (
        <div className="cell" style={{left:`${x}vw`,top:`${y}vh`,width:`1vw`,height:`1vh`,backgroundColor:`black`}}>
            
        </div>
    );
}
