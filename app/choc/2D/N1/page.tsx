'use client'

import Image from "next/image";
import React, { useEffect, useRef, useState,useMemo } from "react";
import style from './style.module.scss'
import { doCircleCollide, doCollide, getRandomArbitrary, SimulationObject } from "@/app/utils/genericTypeAndFunction";

const setings = {
    map:{
        width:1000,
        height:1000,
    },
    canvasWidth:500,
    canvasHeight:500,
    simSpeed:.5,
    tickTime:200,
}

export default function Simu1DN1() {

    const initialized = useRef(false);
    let defaultObjects:Array<SimulationObject> = [
        {
            mass:10,
            movement:{
                x:1,y:-1,
                // x:0,y:0,
            },
            pos:{
                x:0,y:setings.canvasHeight-100,
            },
            size:{
                x:100,
                y:100,
            },
            color:"green",
            id:getRandomArbitrary(0,100000000),
            isCircle:true,
            collided:false,
        },
        {
            mass:10,
            movement:{
                x:0,y:0,
            },
            pos:{
                x:(setings.canvasWidth-100)/2,y:setings.canvasHeight/2,
                // x:0,y:0
            },
            size:{
                x:100,
                y:100,
            },
            color:"green",
            id:getRandomArbitrary(0,100000000),
            isCircle:true,
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
            if(!obj.isCircle){
                ctx.fillStyle = obj.color;
                ctx.fillRect(px, py, sx, sy);
            }else{
                const c = {x:px+sx/2,y:py+sy/2}
                ctx.fillStyle = obj.color;
                ctx.beginPath();
                ctx.arc(c.x,c.y, obj.size.x/2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.font = "48px serif";
            ctx.fillStyle = "red";
            ctx.fillText(`${mass}`, px, py+sy/2, size.x);

            
        })
    }

    function startLoop() {
        
        function loop() {
            const htmlel = canvasRef.current;
            if (!htmlel) return;    

            objectsRef.current.forEach((o)=>{
                o.collided=false;
            })

            console.log(objectsRef.current[0].movement.x+objectsRef.current[1].movement.x+objectsRef.current[0].movement.y+objectsRef.current[1].movement.y,objectsRef.current[0].movement.x+objectsRef.current[1].movement.x,objectsRef.current[0].movement.y+objectsRef.current[1].movement.y);
            
            objectsRef.current.forEach((o, i) => {
                // let collided = false;
                const {mass,movement,pos,size} = o;
                const newPos = {
                    x:pos.x+(movement.x*setings.simSpeed),
                    y:pos.y+(movement.y*setings.simSpeed),
                }

                if(newPos.x<=0 || newPos.x + o.size.x >=setings.canvasWidth) return o.movement.x = -o.movement.x
                if(newPos.y<=0 || newPos.y + o.size.y >=setings.canvasWidth) return o.movement.y = -o.movement.y

                o.pos = newPos;

                objectsRef.current.forEach(o2 => {
                    if (o2.id !== o.id) {
                        if (!o.isCircle && !o2.isCircle && (doCollide({...o,pos:newPos}, o2))) {
                            o.collided=true;
                            o2.collided=true;

                            const m1 = o.mass;
                            const m2 = o2.mass;

                            const v1x = o.movement.x;
                            const v2x = o2.movement.x;
                            const v1y = o.movement.y;
                            const v2y = o2.movement.y;

                            o.movement.x =
                                (v1x * (m1 - m2)) / (m1 + m2) +
                                (v2x * (2 * m2)) / (m1 + m2);

                            o2.movement.x =
                                (v1x * (2 * m1)) / (m1 + m2) +
                                (v2x * (m2 - m1)) / (m1 + m2);
                            
                            o.movement.y =
                                (v1y * (m1 - m2)) / (m1 + m2) +
                                (v2y * (2 * m2)) / (m1 + m2);
                            
                            o2.movement.y =
                                (v1y * (2 * m1)) / (m1 + m2) +
                                (v2y * (m2 - m1)) / (m1 + m2);
                        }else if(o.isCircle && o2.isCircle && doCircleCollide({...o,pos:newPos},o2)){
                            o.collided=true;
                            o2.collided=true;
                            const dx = o2.pos.x - o.pos.x;
                            const dy = o2.pos.y - o.pos.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            const nx = dx / dist;
                            const ny = dy / dist;
                            const tx = -ny;
                            const ty = nx;

                            const v1n = o.movement.x * nx + o.movement.y * ny;
                            const v1t = o.movement.x * tx + o.movement.y * ty;

                            const v2n = o2.movement.x * nx + o2.movement.y * ny;
                            const v2t = o2.movement.x * tx + o2.movement.y * ty;

                            const m1 = o.mass;
                            const m2 = o2.mass;

                            const v1nAfter =
                            (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);

                            const v2nAfter =
                            (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);

                            o.movement.x = v1nAfter * nx + v1t * tx;
                            o.movement.y = v1nAfter * ny + v1t * ty;

                            o2.movement.x = v2nAfter * nx + v2t * tx;
                            o2.movement.y = v2nAfter * ny + v2t * ty;

                            const r1 = o.size.x / 2;
                            const r2 = o2.size.x / 2;

                            // IMPORTANT: use centers, not top-left
                            const c1x = o.pos.x + r1;
                            const c1y = o.pos.y + r1;
                            const c2x = o2.pos.x + r2;
                            const c2y = o2.pos.y + r2;

                            const dx2 = c2x - c1x;
                            const dy2 = c2y - c1y;
                            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                            const overlap = r1 + r2 - dist2;
                            if (overlap > 0) {
                                const correction = overlap / 2;

                                o.pos.x -= (dx2 / dist2) * correction;
                                o.pos.y -= (dy2 / dist2) * correction;

                                o2.pos.x += (dx2 / dist2) * correction;
                                o2.pos.y += (dy2 / dist2) * correction;
                            }


                            // o.color = "yellow";
                        }
                    }
                });

            });

            // setTimeout(() => {
                
            // }, setings.tickTime);

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
