'use client'

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import './style.css'


function getRandomArbitrary(min:number, max:number):number {
    return Math.random() * (max - min) + min;
}

type envirementItem = {
    x:number,
    y:number,
}

export default function SIMU() {

    const defaultTrees = 10;
    const defaultBushes = 15;
    const defaultCarrots = 25;

    const [treesMap,setTreesMap] = useState<Array<envirementItem>>([]);
    const [bushesMap,setBushesMap] = useState<Array<envirementItem>>([]);
    const [carrotsMap,setCarrotsMap] = useState<Array<envirementItem>>([]);

    const initialized = useRef(false);

    function loop(){

    }

    function init(){
        // Trees init
        let treesTmp:Array<envirementItem> = [];
        for (let i = 0; i < defaultTrees; i++) {
            treesTmp.push({x:getRandomArbitrary(0,100),y:getRandomArbitrary(0,100)});
        }
        setTreesMap(treesTmp);

        // Trees init
        let bushesTmp:Array<envirementItem> = [];
        for (let i = 0; i < defaultBushes; i++) {
            bushesMap.push({x:getRandomArbitrary(0,100),y:getRandomArbitrary(0,100)});
        }
        setBushesMap(bushesMap);

        // Trees init
        let carrotsTmp:Array<envirementItem> = [];
        for (let i = 0; i < defaultCarrots; i++) {
            carrotsMap.push({x:getRandomArbitrary(0,100),y:getRandomArbitrary(0,100)});
        }
        setCarrotsMap(carrotsMap);
    }

    useEffect(()=>{
        if(initialized.current) return;
        initialized.current=true;
        init();
        
        console.log(treesMap);
        loop();
    },[treesMap,carrotsMap,bushesMap])

    return (
        <div className="map">
            <div className="environement">
                <div className="carrots env_cont">
                    {carrotsMap.map((item,i)=>(
                        <div className="carrot" key={i} style={{'left':`${(95/100)*item.x}vw`,'top':`${(95/100)*item.y}vh`}}></div>
                    ))}
                </div>

                <div className="bushes env_cont">
                    {bushesMap.map((item,i)=>(
                        <div className="bush" key={i} style={{'left':`${(95/100)*item.x}vw`,'top':`${(95/100)*item.y}vh`}}></div>
                    ))}
                </div>

                <div className="trees env_cont">
                    {treesMap.map((item,i)=>(
                        <div className="tree" key={i} style={{'left':`${(95/100)*item.x}vw`,'top':`${(95/100)*item.y}vh`}}></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
