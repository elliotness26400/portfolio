'use client'

import Image from "next/image";
import React, { useEffect, useRef, useState,useMemo } from "react";
import style from './style.module.scss'
import { absoluteValue, doCircleCollide, doCollide, getRandomArbitrary, SimulationObject } from "@/app/utils/genericTypeAndFunction";
import { Position } from "@/app/types/ant2";
import useMousePosition from "@/app/hook/mousePos";

const setings = {
    map:{
        width:1700,
        height:1200,
    },
    canvasWidth:1600,
    canvasHeight:1000,
    simSpeed:5,
    tickTime:20,
    clickSpeedRef:2,
    friction:0.995,
}

const colors = ["red","green","blue","yellow","purple","cyan","magenta"]

const generatePositions:(nb:number,size:number,ofset:number)=>Array<{p:Position,c:string}> = (nb:number,size:number,ofset:number) => {
    const startPos = {x:setings.canvasWidth/2,y:setings.canvasHeight/2}

    let res:Array<{p:Position,c:string}> = []

    console.log(nb)

    for (let i = 1; i < nb+1; i++) {
        let n = i;
        let col;
        let row;
        let j = 1;
        let k = 0;
        while(col==null || row==null){
            if(n>j){
                n-=j;
                j++;
                k++;
            }else{
                col = k;
                row = n;
            }
        }
        console.log(row,col);

        if(col==null || row==null) break;
        
        let centerX = startPos.x + col*(size+ofset)
        let centerY = startPos.y - col*(size+ofset) + row*(size+ofset) + ((size+ofset)*col/2)
        res.push({p:{x:centerX-size/2,y:centerY-size/2},c:colors[col%colors.length]})
        console.log(res);
    }

    console.log(res)

    return res;
}

export default function Simu1DN1() {

    const mousePos:Position = useMousePosition();
    const mousePosRef = useRef<Position>({ x: 0, y: 0 });
    const clickSpeedRef = useRef<number>(setings.clickSpeedRef);

    useEffect(() => {
        mousePosRef.current = mousePos;
    }, [mousePos]);


    const initialized = useRef(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const selectedElIdRef = useRef<number>(0);

    const {canvasWidth,canvasHeight} = setings;

    const mapCenter:Position = {x:canvasWidth/2,y:canvasHeight/2}

    const ballSize=50;
    const defaultsPoses = generatePositions(6,25,80);
    let defaultObjects:Array<SimulationObject> = [
        {
            mass:10,
            movement:{
                x:0,y:0,
            },
            pos:{
                x:100,y:setings.canvasHeight/2,
            },
            size:{
                x:100,
                y:100,
            },
            color:"red",
            id:getRandomArbitrary(0,100000000),
            isCircle:true,
            collided:false,
        }
    ]

    for(let p of defaultsPoses){
        defaultObjects.push({
            mass:10,
            movement:{
                x:0,y:0,
            },
            pos:p.p,
            size:{
                x:100,
                y:100,
            },
            color:p.c,
            id:getRandomArbitrary(0,100000000),
            isCircle:true,
            collided:false,
        })
    }
    const objectsRef = useRef<Array<SimulationObject>>([...defaultObjects]);

    

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

            // Aplying friction
            objectsRef.current.forEach((o)=>{
                if(o.movement.x!==0) o.movement.x*=setings.friction;
                if(o.movement.y!==0) o.movement.y*=setings.friction;

                if(o.movement.x<0.1&&o.movement.x>-0.1) o.movement.x=0;
                if(o.movement.y<0.1&&o.movement.y>-0.1) o.movement.y=0;
            })
            
            objectsRef.current.forEach((o)=>{
                const {mass,movement,pos,size} = o;
                const newPos = {
                    x:pos.x+(movement.x*setings.simSpeed),
                    y:pos.y+(movement.y*setings.simSpeed),
                }

                if(newPos.x<=0 || newPos.x + o.size.x >=setings.canvasWidth) return o.movement.x = -o.movement.x
                if(newPos.y<=0 || newPos.y + o.size.y >=setings.canvasHeight) return o.movement.y = -o.movement.y

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
            setTimeout(() => {
               requestAnimationFrame(loop); 
            }, setings.tickTime);
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
