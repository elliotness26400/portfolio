'use client'

import Image from "next/image";
import React, { useEffect, useRef, useState,useMemo } from "react";
import style from './style.module.scss'
import { absoluteValue, doCircleCollide, doCollide, getRandomArbitrary, SimulationObject } from "@/app/utils/genericTypeAndFunction";
import { Position } from "@/app/types/ant2";
import useMousePosition from "@/app/hook/mousePos";

const setings = {
    map:{
        width:1000,
        height:1000,
    },
    canvasWidth:500,
    canvasHeight:500,
    simSpeed:2,
    tickTime:200,
    clickSpeedRef:2,
}


export default function Simu1DN1() {

    const mousePos:Position = useMousePosition();
    const mousePosRef = useRef<Position>({ x: 0, y: 0 });
    const clickSpeedRef = useRef<number>(setings.clickSpeedRef);

    useEffect(() => {
        mousePosRef.current = mousePos;
    }, [mousePos]);


    const initialized = useRef(false);
    let defaultObjects:Array<SimulationObject> = [
        {
            mass:10,
            movement:{
                // x:1,y:-1,
                x:0,y:0,
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
            color:"black",
            id:getRandomArbitrary(0,100000000),
            isCircle:true,
            collided:false,
        }
    ]
    const objectsRef = useRef<Array<SimulationObject>>([...defaultObjects]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const selectedElIdRef = useRef<number>(0);

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

        // Cursor
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(mousePosRef.current.x,mousePosRef.current.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    function startLoop() {
        
        function loop() {
            const htmlel = canvasRef.current;
            if (!htmlel) return;    

            // Reseting collisions
            objectsRef.current.forEach((o)=>{
                o.collided=false;
            })

            objectsRef.current.forEach((o)=>{
                const {mass,movement,pos,size} = o;
                const newPos = {
                    x:pos.x+(movement.x*setings.simSpeed),
                    y:pos.y+(movement.y*setings.simSpeed),
                }

                if(newPos.x<=0 || newPos.x + o.size.x >=setings.canvasWidth) return o.movement.x = -o.movement.x
                if(newPos.y<=0 || newPos.y + o.size.y >=setings.canvasWidth) return o.movement.y = -o.movement.y

                o.pos = newPos;
            })

            for (let i = 0; i < objectsRef.current.length; i++) {
                for (let j = i + 1; j < objectsRef.current.length; j++) {
                    const o = objectsRef.current[i];
                    const b = objectsRef.current[j];
                    
                    if (!o.isCircle && !b.isCircle && (doCollide(o, b))) {

                        o.collided=true;
                        b.collided=true;

                        const dx = (b.pos.x + b.size.x / 2) - (o.pos.x + o.size.x / 2);
                        const dy = (b.pos.y + b.size.y / 2) - (o.pos.y + o.size.y / 2);
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        const nx = dx / dist;
                        const ny = dy / dist;
                        const tx = -ny;
                        const ty = nx;

                        const v1n = o.movement.x * nx + o.movement.y * ny;
                        const v1t = o.movement.x * tx + o.movement.y * ty;

                        const v2n = b.movement.x * nx + b.movement.y * ny;
                        const v2t = b.movement.x * tx + b.movement.y * ty;

                        const m1 = o.mass;
                        const m2 = b.mass;

                        const v1nAfter =
                        (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);

                        const v2nAfter =
                        (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);

                        o.movement.x = v1nAfter * nx + v1t * tx;
                        o.movement.y = v1nAfter * ny + v1t * ty;

                        b.movement.x = v2nAfter * nx + v2t * tx;
                        b.movement.y = v2nAfter * ny + v2t * ty;

                        const overlapX =
                        o.size.x / 2 + b.size.x / 2 - Math.abs(dx);

                        const overlapY =
                        o.size.y / 2 + b.size.y / 2 - Math.abs(dy);

                        if (overlapX > 0 && overlapY > 0) {
                        if (overlapX < overlapY) {
                            // Separate along X axis
                            const correction = overlapX / 2;
                            o.pos.x += dx > 0 ? correction : -correction;
                            b.pos.x -= dx > 0 ? correction : -correction;

                            o.movement.x *= -1;
                            b.movement.x *= -1;
                        } else {
                            // Separate along Y axis
                            const correction = overlapY / 2;
                            o.pos.y += dy > 0 ? correction : -correction;
                            b.pos.y -= dy > 0 ? correction : -correction;

                            o.movement.y *= -1;
                            b.movement.y *= -1;
                        }
                        }

                    }else if(o.isCircle && b.isCircle && doCircleCollide(o,b)){
                        o.collided=true;
                        b.collided=true;
                        const dx = b.pos.x - o.pos.x;
                        const dy = b.pos.y - o.pos.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        const nx = dx / dist;
                        const ny = dy / dist;
                        const tx = -ny;
                        const ty = nx;

                        const v1n = o.movement.x * nx + o.movement.y * ny;
                        const v1t = o.movement.x * tx + o.movement.y * ty;

                        const v2n = b.movement.x * nx + b.movement.y * ny;
                        const v2t = b.movement.x * tx + b.movement.y * ty;

                        const m1 = o.mass;
                        const m2 = b.mass;

                        const v1nAfter =
                        (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);

                        const v2nAfter =
                        (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);

                        o.movement.x = v1nAfter * nx + v1t * tx;
                        o.movement.y = v1nAfter * ny + v1t * ty;

                        b.movement.x = v2nAfter * nx + v2t * tx;
                        b.movement.y = v2nAfter * ny + v2t * ty;

                        const r1 = o.size.x / 2;
                        const r2 = b.size.x / 2;

                        // IMPORTANT: use centers, not top-left
                        const c1x = o.pos.x + r1;
                        const c1y = o.pos.y + r1;
                        const c2x = b.pos.x + r2;
                        const c2y = b.pos.y + r2;

                        const dx2 = c2x - c1x;
                        const dy2 = c2y - c1y;
                        const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                        const overlap = r1 + r2 - dist2;
                        if (overlap > 0) {
                            const correction = overlap / 2;

                            o.pos.x -= (dx2 / dist2) * correction;
                            o.pos.y -= (dy2 / dist2) * correction;

                            b.pos.x += (dx2 / dist2) * correction;
                            b.pos.y += (dy2 / dist2) * correction;
                        }
                    }
                }
            }
            
            objectsRef.current.forEach((o, i) => {
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
        <canvas onClick={()=>{
            const selected = objectsRef.current[selectedElIdRef.current];

            const centerX = selected.pos.x + selected.size.x / 2;
            const centerY = selected.pos.y + selected.size.y / 2;

            const dx = mousePos.x - centerX;
            const dy = mousePos.y - centerY;

            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance === 0) return;

            const speed = clickSpeedRef.current;

            selected.movement.x = (dx / distance) * speed;
            selected.movement.y = (dy / distance) * speed;
        }} ref={canvasRef} width={canvasWidth} height={canvasHeight} style={{ border: "1px solid black" }} />
        <button onClick={()=>{
            objectsRef.current = [...defaultObjects];
        }}>RESET</button>
        <p>{JSON.stringify(mousePos)}</p>
    </div>;
}
