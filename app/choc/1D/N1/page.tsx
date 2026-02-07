'use client'

import Image from "next/image";
import React, { useEffect, useRef, useState,useMemo } from "react";
import style from './style.module.scss'
import { doCollide, getRandomArbitrary, SimulationObject } from "@/app/utils/genericTypeAndFunction";

const setings = {
    map:{
        width:1000,
        height:1000,
    },
    canvasWidth:400,
    canvasHeight:100,
    simSpeed:2,
    tickTime:10,
}

export default function Simu1DN1() {

    const initialized = useRef(false);
    let defaultObjects:Array<SimulationObject> = [
        {
            mass:50,
            movement:{
                x:1,y:0,
            },
            pos:{
                x:0,y:0,
            },
            size:{
                x:100,
                y:100,
            },
            color:"green",
            id:getRandomArbitrary(0,100000000),
            isCircle:false,
            collided:false,
        },
        {
            mass:10,
            movement:{
                x:0,y:0,
            },
            pos:{
                x:setings.canvasWidth/2,y:0,
            },
            size:{
                x:100,
                y:100,
            },
            color:"black",
            id:getRandomArbitrary(0,100000000),
            isCircle:false,
            collided:false,
        }
    ]
    const objectsRef = useRef<Array<SimulationObject>>([...defaultObjects]);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const {canvasWidth,canvasHeight} = setings;
    const cellWidth = canvasWidth / setings.map.width;
    const cellHeight = canvasHeight / setings.map.height;

    function init() {

        return true
    }

    function draw() {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        // clear canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // draw map (pheromones)
        objectsRef.current.forEach((obj, y) => {
            
            const {mass,movement,pos,size} = obj;

            const px = pos.x;
            const py = pos.y;
            const sx = size.x;
            const sy = size.y;
            ctx.fillStyle = obj.color;
            ctx.fillRect(px, py, sx, sy);

            ctx.font = "48px serif";
            ctx.fillText(`${mass}`, sx, sy, size.x);

            
        })
    }

    function startLoop() {
        
        function loop() {
            const htmlel = canvasRef.current;
            if (!htmlel) return;    

            
            objectsRef.current.forEach((o, i) => {
                const {mass,movement,pos,size} = o;
                let collided = false;
                const newPos = {
                    x:pos.x+(movement.x*setings.simSpeed),
                    y:pos.y+(movement.y*setings.simSpeed),
                }

                if(newPos.x<=0 || newPos.x + o.size.x >=setings.canvasWidth) o.movement.x = -o.movement.x

                objectsRef.current.forEach(o2 => {
                if (o2.id !== o.id) {
                    if (doCollide({...o,pos:newPos}, o2)) {
                    collided = true;

                    const m1 = o.mass;
                    const m2 = o2.mass;
                    const v1 = o.movement.x;
                    const v2 = o2.movement.x;

                    o.movement.x =
                        (v1 * (m1 - m2)) / (m1 + m2) +
                        (v2 * (2 * m2)) / (m1 + m2);

                    o2.movement.x =
                        (v1 * (2 * m1)) / (m1 + m2) +
                        (v2 * (m2 - m1)) / (m1 + m2);
                    }
                }
                });

                if (!collided) {
                    
                    o.pos = newPos;
                }


            });

            setTimeout(() => {
                
            }, setings.tickTime);

            draw();
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    }

    useEffect(() => {
        if (!initialized.current) {
            init();
            initialized.current = true;
            startLoop();
        }
    }, []);


    return <div>
        <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} style={{ border: "1px solid black" }} />
        <button onClick={()=>{
            objectsRef.current = [...defaultObjects];
        }}>RESET</button>
    </div>;
}
