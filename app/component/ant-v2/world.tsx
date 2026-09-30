'use client'

import Image from "next/image";
import React, { useEffect, useRef, useState,useMemo } from "react";
import './style.css'
import {Ant,Base,Food,Map,MapPos,Pheromone,PheromoneTypes,Position,Settings} from "@/app/types/ant2";
import { VisualAnt } from "./ant";
import { VisualBase } from "./base";
import { Cell } from "./cell";


function getRandomArbitrary(min:number, max:number):number {
    return Math.random() * (max - min) + min;
}

export function distance(p1: Position, p2: Position): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function absoluteValue(x:number){
    if(x<0) return -x;
    return x
}

function angleDifference(a: number, b: number) {
    let diff = (a - b + 180) % 360 - 180;
    return Math.abs(diff);
}

function distanceAndAngleP1toP2(p1:Position,p2:Position):{dist:number,deg:number;}{
    const {x,y} = p2;
    const xDif = x - p1.x;
    const yDif = y - p1.y;
    const angle = Math.atan2(yDif, xDif);
    const degA = (angle * 180 / Math.PI+360)%360;
    const hDiff2 = xDif*xDif +yDif*yDif;
    // const dist = Math.sqrt(hDiff2);
    const dist = hDiff2;
    return {dist,deg:degA};
}


function compareSquaredDistances(dist:number,maxDist:number){
    return dist<=maxDist*maxDist
}

export function World({setings}:{setings:Settings}) {

    const mapRef = useRef<Map>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const antsRef = useRef<Array<Ant>>([]);
    const [bases,setBases] = useState<Array<Base>>(setings.bases.array);
    const initialized = useRef(false);

    const {canvasWidth,canvasHeight} = setings;
    const cellWidth = canvasWidth / setings.map.width;
    const cellHeight = canvasHeight / setings.map.height;
    


    function getNearbyCells(x: number, y: number, radius: number) {
        const cells = []
        const r = Math.ceil(radius)

        for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
                const nx = Math.floor(x + dx)
                const ny = Math.floor(y + dy)
                if (
                    nx >= 0 &&
                    ny >= 0 &&
                    nx < setings.map.width &&
                    ny < setings.map.height
                ) {
                    cells.push(mapRef.current[ny][nx])
                }
            }
        }
        return cells
    }




    function init() {

        const foodPossitions: Array<Position> = [];
        for (let i = 0; i < setings.food.defaultAmount; i++) {
            foodPossitions.push({
                x: parseInt(getRandomArbitrary(0, setings.map.width).toString()),
                y: parseInt(getRandomArbitrary(0, setings.map.height).toString()),
            });
        }

        // console.log(foodPossitions)

        // Map
        const mapRes: Map = [];
        for (let y = 0; y < setings.map.height; y++) {
        const row: MapPos[] = [];
        for (let x = 0; x < setings.map.width; x++) {
            let isFoodSpot = false;
            foodPossitions.forEach(pos => {
                if(x==pos.x&&y==pos.y){
                    isFoodSpot = true;
                }
            });
            row.push({
                foods: { amount: isFoodSpot ? getRandomArbitrary(5,20) : 0, type: isFoodSpot ? (getRandomArbitrary(0,1) > 0.5 ? "meat" : "leaf") : "none" },
                pheromones: {
                    danger: { type: "danger", strength: 0, editedAt: 0 },
                    food: { type: "food", strength: 0, editedAt: 0 },
                    home: { type: "home", strength: 0, editedAt: 0 },
                },
                pos:{x,y},
            });
        }
        mapRes.push(row);
        }
        mapRef.current = mapRes;

        // ants
        const antsTmp: Ant[] = [];
        setings.bases.array.forEach(base => {
        for (let i = 0; i < setings.ants.defaultAmount; i++) {
            antsTmp.push({
            index:i,
            bodyWeight:1,
            pos: { ...base.pos },
            baseId: base.id,
            dir: Math.random() * 360,
            action: "gathering",
            load: { type: "none", amount: 0 },
            capacity: 3,
            RenforcedPheromone: [],
            RenforcedPheromone2: [],
            distanceSinceLastChanged:0,
            energy:100,
            maxEnergy:100,
            energyConsumedPerTick:0,
            returnThreshold:0,
            baseEscapeTicks:0,
            });
        }
        });
        antsRef.current = antsTmp;

        return true
    }

    function sampleProbabilities(items: {type:PheromoneTypes;strength:number;pos:Position;angle:number;prop?:number;}[]):{tmpDir:number,strength:number}{
        let tmpDir = -1;
        let k:number = 0;
        let st:number = 0;

        while (tmpDir==-1){
            const rand = Math.random();
            k=(k+1)%(setings.ants.view.pheromoneDetect.frontNumber+setings.ants.view.pheromoneDetect.backNumber);
            let e = items[k];
            if(e.prop!==undefined&&rand<e.prop){
                tmpDir = e.angle;
                st = e.strength;
            }
        }
        return {tmpDir,strength:st}
    }

    function draw() {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        // clear canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // draw map (pheromones)
        mapRef.current.forEach((row, y) => {
            row.forEach((cell, x) => {
                const px = x * cellWidth;
                const py = y * cellHeight;

                // draw pheromones as colored squares
                const { food, home, danger } = cell.pheromones;

                if(setings.user.display.grid) {
                    ctx.lineWidth = 0.2;
                    ctx.strokeStyle = 'black';
                    ctx.strokeRect(px, py, cellWidth, cellHeight);
                }

                if(setings.user.display.pheromones==true) {
                    // food pheromones
                    if (food.strength > 0.01) {
                        ctx.fillStyle = `rgba(255,0,0,${Math.sqrt(food.strength / (food.strength + 0.5))})`;
                        ctx.fillRect(px+(cellWidth*(1-setings.pheromone.size)/2), py+(cellHeight*(1-setings.pheromone.size)/2), cellWidth*setings.pheromone.size, cellHeight*setings.pheromone.size);
                    }
    
                    // home pheromones
                    if (home.strength > 0.01) {
                        ctx.fillStyle = `rgba(0,0,255,${Math.sqrt(home.strength / (home.strength + 0.5))})`;
                        ctx.fillRect(px+(cellWidth*(1-setings.pheromone.size)/2), py+(cellHeight*(1-setings.pheromone.size)/2), cellWidth*setings.pheromone.size, cellHeight*setings.pheromone.size);
                    }
    
                    // danger pheromones
                    if (danger.strength > 0.01) {
                        ctx.fillStyle = `rgba(128,0,128,${Math.sqrt(danger.strength / (danger.strength + 0.5))})`;
                        ctx.fillRect(px+(cellWidth*(1-setings.pheromone.size)/2), py+(cellHeight*(1-setings.pheromone.size)/2), cellWidth*setings.pheromone.size, cellHeight*setings.pheromone.size);
                    }   
                }
                
                // foods
                if (cell.foods.amount > 0.5 && cell.foods.type !== "none") {
                    ctx.fillStyle = (cell.foods.type === "meat" ? "red" : "green");
                    ctx.fillRect(px+(cellWidth*(1-setings.food.size)/2), py+(cellHeight*(1-setings.food.size)/2), cellWidth*setings.food.size, cellHeight*setings.food.size);
                }

                ctx.fillStyle = `rgba(${food.strength},${danger.strength},${home.strength},${Math.min((food.strength+danger.strength+home.strength) / 30, 1)})`;

            });
        });

        // draw ants
        antsRef.current.forEach(ant => {
            const px = ant.pos.x * cellWidth;
            const py = ant.pos.y * cellHeight;
            if(ant.load.type=="meat"){
                ctx.fillStyle = "orange";
            }else if(ant.load.type=="leaf"){
                ctx.fillStyle = "green";
            }else{
                ctx.fillStyle = "black";
            }
            ctx.beginPath();
            ctx.arc(px + (cellWidth*(1-setings.ants.size)/2) / 2, py + (cellHeight*(1-setings.ants.size)/2) / 2, cellWidth*setings.ants.size/2, 0, Math.PI * 2);
            ctx.fill();

            if(setings.user.display.view){
                ctx.fillStyle = "rgba(0, 0, 255, 0.25)"
                ctx.strokeStyle = "blue"
                ctx.lineWidth = 1

                ctx.beginPath();
                ctx.arc(px + (cellWidth*(1-setings.ants.size)/2) / 2, py + (cellHeight*(1-setings.ants.size)/2) / 2, cellWidth*setings.ants.view.senseArea/2, 0, Math.PI * 2);
                ctx.fill()
                ctx.stroke()


                const radius = cellWidth * setings.ants.view.length
                const viewAngleRad = (setings.ants.view.width * Math.PI) / 180

                // if ant has a direction (recommended)
                const heading = (ant.dir * Math.PI / 180) // radians

                const startAngle = heading - viewAngleRad / 2
                const endAngle = heading + viewAngleRad / 2


                ctx.beginPath()
                ctx.moveTo(px, py)
                ctx.arc(px, py, radius, startAngle, endAngle)
                ctx.closePath()
                ctx.fill()
                ctx.stroke()

                const totalFrontAngle = 180;
                const anglePerFrontSensor = totalFrontAngle / (setings.ants.view.pheromoneDetect.frontNumber - 1);
                
                for (let i = 0; i < setings.ants.view.pheromoneDetect.frontNumber; i++) {
                    const angle = ((anglePerFrontSensor * i) - totalFrontAngle/2) * Math.PI / 180
                    const fx = ant.pos.x + setings.ants.view.pheromoneDetect.distance * Math.cos(ant.dir * Math.PI / 180 + angle)
                    const fy = ant.pos.y + setings.ants.view.pheromoneDetect.distance * Math.sin(ant.dir * Math.PI / 180 + angle)
                    ctx.beginPath()
                    ctx.arc(fx * cellWidth, fy * cellHeight, cellWidth*setings.ants.view.pheromoneDetect.range/2, 0, Math.PI * 2);
                    ctx.stroke()
                }

                const totalBackAngle = 60;
                const anglePerBackSensor = totalBackAngle / (setings.ants.view.pheromoneDetect.backNumber - 1);
                
                for (let i = 0; i < setings.ants.view.pheromoneDetect.backNumber; i++) {
                    const angle = ((anglePerBackSensor * i) - totalBackAngle/2 - 180) * Math.PI / 180
                    const fx = ant.pos.x + setings.ants.view.pheromoneDetect.backDistance * Math.cos(ant.dir * Math.PI / 180 + angle)
                    const fy = ant.pos.y + setings.ants.view.pheromoneDetect.backDistance * Math.sin(ant.dir * Math.PI / 180 + angle)
                    ctx.beginPath()
                    ctx.arc(fx * cellWidth, fy * cellHeight, cellWidth*setings.ants.view.pheromoneDetect.range/2, 0, Math.PI * 2);
                    ctx.stroke()
                }

                // const pos1 = {x:ant.pos.x+setings.ants.view.pheromoneDetect.range*Math.cos(ant.dir * Math.PI / 180),y:ant.pos.y+setings.ants.view.pheromoneDetect.range*Math.sin(ant.dir * Math.PI / 180)};
                // const pos2 = {x:ant.pos.x+setings.ants.view.pheromoneDetect.range*Math.cos((ant.dir+setings.ants.view.width/2) * Math.PI / 180),y:ant.pos.y+setings.ants.view.pheromoneDetect.range*Math.sin((ant.dir+setings.ants.view.width/2) * Math.PI / 180)};
                // const pos3 = {x:ant.pos.x+setings.ants.view.pheromoneDetect.range*Math.cos((ant.dir-setings.ants.view.width/2) * Math.PI / 180),y:ant.pos.y+setings.ants.view.pheromoneDetect.range*Math.sin((ant.dir-setings.ants.view.width/2) * Math.PI / 180)};

                // ctx.beginPath();
                // ctx.arc(pos1.x * cellWidth, pos1.y * cellHeight, cellWidth*.5, 0, Math.PI * 2);
                // ctx.fill()
                // ctx.stroke()

                // ctx.beginPath();
                // ctx.arc(pos2.x * cellWidth, pos2.y * cellHeight, cellWidth*.5, 0, Math.PI * 2);
                // ctx.fill()
                // ctx.stroke()

                // ctx.beginPath();
                // ctx.arc(pos3.x * cellWidth, pos3.y * cellHeight, cellWidth*.5, 0, Math.PI * 2);
                // ctx.fill()
                // ctx.stroke()
            }
            
        });

        // draw bases
        setings.bases.array.forEach(base => {
            const px = base.pos.x * cellWidth;
            const py = base.pos.y * cellHeight;
            ctx.fillStyle = base.color;
            ctx.fillRect(px, py, cellWidth, cellHeight);
        });
    }

    function startLoop() {
        
        function loop() {


            antsRef.current.forEach((ant, i) => {
                const htmlel = canvasRef.current;
                if (!htmlel) return;    
                const {action,baseId,dir,load,pos} = ant;

                const nearbyCells = getNearbyCells(
                    ant.pos.x,
                    ant.pos.y,
                    setings.ants.view.length
                );

                let randomMove:number = 3;
                
                if(action=="gathering"){

                    const antCenter = {x:ant.pos.x+(cellWidth*(1-setings.ants.size)/2),y:ant.pos.y+(cellWidth*(1-setings.ants.size)/2)};

                    const nearbyFood = nearbyCells.flat().filter(cell => {
                        const {dist,deg} = distanceAndAngleP1toP2(antCenter, {x:cell.pos.x+(cellWidth*(1-setings.food.size)/2),y:cell.pos.y+(cellWidth*(1-setings.food.size)/2)});
                        return cell.foods.amount > 0 && cell.foods.type !== "none" && ((compareSquaredDistances(dist,setings.ants.view.length)&& deg <= setings.ants.view.width / 2)|| (compareSquaredDistances(dist,setings.ants.view.senseArea)));
                    }).map(cell => ({
                        ...cell.foods,pos:{x:cell.pos.x,y:cell.pos.y,dist:distanceAndAngleP1toP2(antCenter, {x:cell.pos.x+(cellWidth*(1-setings.food.size)/2),y:cell.pos.y+(cellWidth*(1-setings.food.size)/2)}).dist,deg:distanceAndAngleP1toP2(antCenter, {x:cell.pos.x+(cellWidth*(1-setings.food.size)/2),y:cell.pos.y+(cellWidth*(1-setings.food.size)/2)}).deg}
                    }));

                    const closest = nearbyFood.sort((a, b) => a.pos.dist - b.pos.dist);
    
                    if(closest[0]?.pos.deg!==undefined){
                        randomMove=3
                        if(!compareSquaredDistances(closest[0]?.pos.dist,setings.touchDistance)){
                            const angleToFood = closest[0].pos.deg;
                            ant.dir=angleToFood;
                        }else{
                            ant.action="home";
                            ant.load.type=closest[0].type;
                            const closeCell = mapRef.current[closest[0].pos.y][closest[0].pos.x];
                            const gatherAmount = Math.min(closest[0].amount, ant.capacity);
                            closeCell.foods.amount -= gatherAmount;
                            ant.load.amount=gatherAmount;
                            console.log(closest[0].amount);
                            if(closest[0].amount<=0){
                                closeCell.foods.type="none";
                            }
                        }
                    }
                }
                if(action == "home"){
                    const base = bases.find(b => b.id === baseId);
                    const antCenter = {x:ant.pos.x+(cellWidth*(1-setings.ants.size)/2),y:ant.pos.y+(cellWidth*(1-setings.ants.size)/2)};
                    if(base){
                        const {dist,deg} = distanceAndAngleP1toP2(antCenter, {x:base.pos.x+(cellWidth*(1-setings.ants.size)/2),y:base.pos.y+(cellWidth*(1-setings.ants.size)/2)});
                        if(dist<=setings.ants.view.length*setings.ants.view.length){
                            ant.dir=deg;
                        }
                        if(dist<=setings.touchDistance){
                            ant.RenforcedPheromone=[];
                            ant.RenforcedPheromone2=[];
                            ant.action="gathering";
                            ant.load.type="none";
                            ant.load.amount=0;
                            
                        }
                    }
                }

                // Pheromone handling
                
                const pheromoneDensity: {type:PheromoneTypes;strength:number;pos:Position;angle:number;prop?:number;}[] = [];

                const totalFrontAngle = 180;
                const anglePerFrontSensor = totalFrontAngle / (setings.ants.view.pheromoneDetect.frontNumber - 1);
                
                for (let i = 0; i < setings.ants.view.pheromoneDetect.frontNumber; i++) {
                    const angle = ((anglePerFrontSensor * i) - totalFrontAngle/2) * Math.PI / 180
                    const fx = (ant.pos.x + setings.ants.view.pheromoneDetect.distance * Math.cos(ant.dir * Math.PI / 180 + angle) + 100)%setings.map.width
                    const fy = (ant.pos.y + setings.ants.view.pheromoneDetect.distance * Math.sin(ant.dir * Math.PI / 180 + angle) + 100)%setings.map.height
                    const square = mapRef.current[parseInt(fy.toString())]?.[parseInt(fx.toString())];
                    if(square){
                        pheromoneDensity.push({type:ant.action=="gathering"?"food":"home",strength:square.pheromones[ant.action=="gathering"?"food":"home"].strength,pos:{x:fx,y:fy},angle:(ant.dir + (angle * 180 / Math.PI)+360)%360});
                    }
                }

                const totalBackAngle = 60;
                const anglePerBackSensor = totalBackAngle / (setings.ants.view.pheromoneDetect.backNumber - 1);
                
                for (let i = 0; i < setings.ants.view.pheromoneDetect.backNumber; i++) {
                    const angle = ((anglePerBackSensor * i) - totalBackAngle/2 - 180) * Math.PI / 180
                    const fx = (ant.pos.x + setings.ants.view.pheromoneDetect.backDistance * Math.cos(ant.dir * Math.PI / 180 + angle) + 100)%setings.map.width
                    const fy = (ant.pos.y + setings.ants.view.pheromoneDetect.backDistance * Math.sin(ant.dir * Math.PI / 180 + angle) + 100)%setings.map.height
                    const square = mapRef.current[parseInt(fy.toString())]?.[parseInt(fx.toString())];
                    if(square){
                        pheromoneDensity.push({type:ant.action=="gathering"?"food":"home",strength:square.pheromones[ant.action=="gathering"?"food":"home"].strength,pos:{x:fx,y:fy},angle:(ant.dir + (angle * 180 / Math.PI)+360)%360});
                    }
                }

                const sum = pheromoneDensity.reduce((acc, curr) => acc + curr.strength, 0);

                const gama = setings.ants.view.pheromoneDetect.gama;

                pheromoneDensity.map(p=>{
                    const pobability = (setings.ants.view.pheromoneDetect.gama+p.strength)/ (sum + pheromoneDensity.length * setings.ants.view.pheromoneDetect.gama);
                    p.prop = pobability;
                });


                const {tmpDir,strength} = sampleProbabilities(pheromoneDensity);

                const normStrength = Math.min(1, strength / 8);
                const STEER_STRENGTH = 0.15;
                const maxTurn = 1 + normStrength * 8; // 1 → 6 degrees

                const delta = ((tmpDir - ant.dir + 540) % 360) - 180;
                ant.dir += Math.max(
                    -maxTurn,
                    Math.min(maxTurn, delta * STEER_STRENGTH)
                );
                


                if (ant.dir < 0) ant.dir += 360;
                if (ant.dir >= 360) ant.dir -= 360;
    
                const rad = ant.dir * Math.PI / 180;
    
                const speed = setings.ants.speed;
    
                ant.pos.x += Math.cos(rad) * speed;
                ant.pos.y += Math.sin(rad) * speed;
    
                // Wrap world
                if (ant.pos.x < 0) ant.pos.x = 100;
                if (ant.pos.x > 100) ant.pos.x = 0;
                if (ant.pos.y < 0) ant.pos.y = 100;
                if (ant.pos.y > 100) ant.pos.y = 0;

                const pheromonesCells = getNearbyCells(
                    ant.pos.x,
                    ant.pos.y,
                    1,
                );
                
                function addPheromone(cell:MapPos,amount:number){
                    if(cell.pheromones[ant.action=="gathering"?"home":"food"].strength+amount<=10){
                        cell.pheromones[ant.action=="gathering"?"home":"food"].strength+=amount;
                    }
                }

                for(const cell of pheromonesCells){
                    const isIn = ant.RenforcedPheromone.findIndex(p=>p.x==cell.pos.x&&p.y==cell.pos.y);
                    if(isIn==-1){
                        let toAdd = 1.6;
                        if(cell.pos.x==parseInt(ant.pos.x.toString())&&cell.pos.y==parseInt(ant.pos.y.toString())){
                            toAdd=2.3;
                            ant.RenforcedPheromone2.push(cell.pos);
                        }
                        addPheromone(cell,toAdd);
                        cell.pheromones[ant.action=="gathering"?"home":"food"].editedAt = Date.now();
                        ant.RenforcedPheromone.push(cell.pos);
                    }else if(cell.pos.x==parseInt(ant.pos.x.toString())&&cell.pos.y==parseInt(ant.pos.y.toString())){
                        const isIn2 = ant.RenforcedPheromone2.findIndex(p=>p.x==cell.pos.x&&p.y==cell.pos.y);
                        if(isIn2!=-1){
                            addPheromone(cell,2.3);
                            cell.pheromones[ant.action=="gathering"?"home":"food"].editedAt = Date.now();
                            ant.RenforcedPheromone2.push(cell.pos);
                        }
                    }
                }

            });

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


    useEffect(() => {
        // Decay pheromones
        const id = setInterval(() => {
            const now = performance.now();

            mapRef.current.forEach(row => {
                row.forEach(cell => {
                    // const age = (now - cell.pheromones.food.editedAt) / 9999999999;
                    cell.pheromones.food.strength *= 0.99;
                    // cell.pheromones.food.strength = Math.max(0, cell.pheromones.food.strength - 1/(age + 1));
                    
                    // const age2 = (now - cell.pheromones.home.editedAt) / 9999999999;
                    // cell.pheromones.home.strength = Math.max(0, cell.pheromones.home.strength - 1/(age2 + 1));
                    cell.pheromones.home.strength *= 0.99;
                    
                    // const age3 = (now - cell.pheromones.danger.editedAt) / 9999999999;
                    // cell.pheromones.danger.strength = Math.max(0, cell.pheromones.danger.strength - 1/(age3 + 1));
                    cell.pheromones.danger.strength *= 0.99;
                });
            });
        }, 300);
    
        return () => clearInterval(id);
    }, []);
    
    return <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} style={{ border: "1px solid black" }} />;

    // return (
    //     <div className="map">

    //         <div className="grid">
    //             {mapRef.current.length > 0 ? (
    //                 mapRef.current.map((row, y) => (
    //                 <div className="row" key={y}>
    //                     {row.map((cell, x) => (
    //                     <Cell
    //                         key={`${y}-${x}`}
    //                         item={cell}
    //                         x={x}
    //                         y={y}
    //                     />
    //                     ))}
    //                 </div>
    //                 ))
    //             ) : (
    //                 <p>Loading...</p>
    //             )}
    //         </div>
            
    //         <div className="environement">

    //             <div className="ants env_cont">
    //             {antsRef.current.map((item, i) => (
    //                 <VisualAnt
    //                     key={i}
    //                     item={item}
    //                     size={setings.ants.size}
    //                     ref={el => {
    //                         if (el) antsHTMLREF.current[i] = el;
    //                     }}
    //                 />
    //             ))}

    //             </div>

    //             {/* <div className="pheromones env_cont">
    //                 {pheromonesMap.map((item,i)=>(
    //                     <div className="pheromone" key={i} style={{backgroundColor:`${item.type=="food"?"red":(item.type=="home"?"blue:":"purple")}`,width:`${Math.min((setings.pheromone.size)*(item.strength/5),2)+.5}vw`,aspectRatio:1,'left':`${item.pos.x}vw`,'top':`${item.pos.y}vh`,opacity:`${Math.max(0, Math.min(1, item.strength))/2}`}}></div>
    //                 ))}
    //             </div>

    //             <div className="foods env_cont">
    //                 {foods.map((item,i)=>(
    //                     <div className="food" key={i} style={{width:`${(item.amount*setings.food.size)/20}vw`,aspectRatio:1,'left':`${item.pos.x}vw`,'top':`${item.pos.y}vh`}}></div>
    //                 ))}
    //             </div>

    //             <div className="bases env_cont">
    //                 {bases.map((item,i)=>(
    //                     <Base item={item} key={i}></Base>
    //                 ))}
    //             </div> */}

    //         </div>
    //     </div>
    // );
}
