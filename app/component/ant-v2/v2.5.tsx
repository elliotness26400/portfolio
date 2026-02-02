'use client'

import Image from "next/image";
import React, { useEffect, useRef, useState,useMemo } from "react";
import './style.css'
import {Ant,Base,Food,Map,MapPos,Pheromone,PheromoneTypes,Position,Settings} from "@/app/types/ant2";
import { VisualAnt } from "./ant";
import { VisualBase } from "./base";
import { Cell } from "./cell";
import { pheromoneTypes } from "@/app/types/ant";


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

function clamp(x:number,min:number,max:number){
    return Math.max(min, Math.min(max, x));
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

    function getPheromoneType(ant:Ant):pheromoneTypes|null{
        switch (ant.action) {
            case "gathering":
                return "home";
                break;
            case "home":
                return "food";
                break;
            default:
                return null;
                break;
        }
    }


    function pheromoneSensing(ant:Ant){
        const pheromoneDensity: {type:PheromoneTypes;strength:number;pos:Position;angle:number;prop?:number;}[] = [];

        const totalFrontAngle = 180;
        const anglePerFrontSensor = totalFrontAngle / (setings.ants.view.pheromoneDetect.frontNumber - 1);

        const pheromoneLooking = getPheromoneType(ant);

        
        
        for (let i = 0; i < setings.ants.view.pheromoneDetect.frontNumber; i++) {
            const angle = ((anglePerFrontSensor * i) - totalFrontAngle/2) * Math.PI / 180
            const fx = (ant.pos.x + setings.ants.view.pheromoneDetect.distance * Math.cos(ant.dir * Math.PI / 180 + angle) + setings.map.width)%setings.map.width
            const fy = (ant.pos.y + setings.ants.view.pheromoneDetect.distance * Math.sin(ant.dir * Math.PI / 180 + angle) + setings.map.height)%setings.map.height
            const square = mapRef.current[Math.floor(fy)]?.[Math.floor(fx)];
            if(square){
                pheromoneDensity.push({type:pheromoneLooking?pheromoneLooking:"home",strength:pheromoneLooking?square.pheromones[pheromoneLooking].strength:0,pos:{x:fx,y:fy},angle:(ant.dir + (angle * 180 / Math.PI)+360)%360});
            }
        }

        const totalBackAngle = 60;
        const anglePerBackSensor = totalBackAngle / (setings.ants.view.pheromoneDetect.backNumber - 1);
        
        for (let i = 0; i < setings.ants.view.pheromoneDetect.backNumber; i++) {
            const angle = ((anglePerBackSensor * i) - totalBackAngle/2 - 180) * Math.PI / 180
            const fx = (ant.pos.x + setings.ants.view.pheromoneDetect.backDistance * Math.cos(ant.dir * Math.PI / 180 + angle) + setings.map.width)%setings.map.width
            const fy = (ant.pos.y + setings.ants.view.pheromoneDetect.backDistance * Math.sin(ant.dir * Math.PI / 180 + angle) + setings.map.height)%setings.map.height
            const square = mapRef.current[Math.floor(fy)]?.[Math.floor(fx)];
            if(square){
                pheromoneDensity.push({type:pheromoneLooking?pheromoneLooking:"home",strength:pheromoneLooking?square.pheromones[pheromoneLooking].strength:0,pos:{x:fx,y:fy},angle:(ant.dir + (angle * 180 / Math.PI)+360)%360});
            }
        }

        const sum = pheromoneDensity.reduce((acc, curr) => acc + curr.strength, 0);

        pheromoneDensity.map(p=>{
            const probability = (setings.ants.view.pheromoneDetect.gama+p.strength)/ (sum + pheromoneDensity.length * setings.ants.view.pheromoneDetect.gama);
            p.prop = probability;
        });

        const {tmpDir,strength} = chooseRandomItem(pheromoneDensity.length ? pheromoneDensity : [{angle: Math.random()*360, strength: 0, pos:{x:ant.pos.x,y:ant.pos.y}, type:pheromoneLooking?pheromoneLooking:"home", prop:1}]);

        if(strength > 0 || (Math.random()<setings.ants.emptyPathTurnProp)){
            const normStrength = Math.min(1, strength / setings.ants.maxTurnPerTick);
            const maxTurn = 1 + normStrength * setings.ants.maxTurnPerTick; // cap from 1 to maxTurnPerTick

            
            const delta = ((tmpDir - ant.dir + 540) % 360) - 180;
            console.log(delta);
            ant.dir += clamp(delta * setings.ants.STEER_STRENGTH, -maxTurn, maxTurn);
        }       
    }


    function directionRandomNClamping(ant:Ant, randomMove:number){
        ant.dir += getRandomArbitrary(-randomMove, randomMove);

        if (ant.dir < 0) ant.dir += 360;
        if (ant.dir >= 360) ant.dir -= 360;
    
        const rad = ant.dir * Math.PI / 180;
    
        const speed = setings.ants.speed;
    
        ant.pos.x += Math.cos(rad) * speed;
        ant.pos.y += Math.sin(rad) * speed;
    
        // Wrap world
        if (ant.pos.x < 0) ant.pos.x = setings.map.width;
        if (ant.pos.x > setings.map.width) ant.pos.x = 0;
        if (ant.pos.y < 0) ant.pos.y = setings.map.height;
        if (ant.pos.y > setings.map.height) ant.pos.y = 0;
    }


    function dropPheromone(ant:Ant){
        const pheromonesCells = getNearbyCells(
            ant.pos.x,
            ant.pos.y,
            0, // RADIUS 0 = only the cell the ant is on
        );
        
        function addPheromone(cell:MapPos,amount:number){
            const amount2 = amount*(0.9*ant.distanceSinceLastChanged);
            if(cell.pheromones[ant.action=="gathering"?"home":"food"].strength+amount2<=10){
                cell.pheromones[ant.action=="gathering"?"home":"food"].strength+=amount2;
            }
            ant.distanceSinceLastChanged+=1;
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
    }

    function energyHandling(ant:Ant){
        ant.energy-=setings.ants.energyConsumedPerTick;

        if(ant.energy < (setings.ants.energyConsumedPerTick * 2)){
            // Die
            const index = ant.index; 
            antsRef.current.splice(index,1);
        }
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
            pos: { ...base.pos },
            baseId: base.id,
            dir: Math.random() * 360,
            action: "gathering",
            load: { type: "none", amount: 0 },
            capacity: 3,
            RenforcedPheromone: [],
            RenforcedPheromone2: [],
            distanceSinceLastChanged:0,
            energy:setings.ants.maxEnergy,
            index:i,
            });
        }
        });
        antsRef.current = antsTmp;

        return true
    }

    function sampleProbabilities(items: {type:PheromoneTypes;strength:number;pos:Position;angle:number;prop?:number;}[]):{tmpDir:number,strength:number}{
        let r = Math.random();
        let acc = 0;
        for (const e of items) {
            acc += e.prop!;
            if (r <= acc) return { tmpDir: e.angle, strength: e.strength };
        }
        // fallback
        return { tmpDir: items[items.length-1].angle, strength: items[items.length-1].strength };
    }

    function chooseRandomItem(items: {type:PheromoneTypes;strength:number;pos:Position;angle:number;prop?:number;}[]):{tmpDir:number,strength:number} {
        // Calculate total probability (in case they don't sum to 1)
        const totalProbability = items.reduce((sum, item) => sum + item.prop!, 0);
        
        // Pick a random number between 0 and totalProbability
        const rand = Math.random() * totalProbability;

        let cumulative = 0;
        for (const item of items) {
            cumulative += item.prop!;
            if (rand <= cumulative) {
                return { tmpDir: item.angle, strength: item.strength };
            }
        }

        // Fallback (shouldn't happen if probabilities are positive)
        return { tmpDir: items[items.length - 1].angle, strength: items[items.length - 1].strength };
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
                    // if (food.strength > 0.1) {
                    //     ctx.fillStyle = `rgba(255,0,0,${Math.min(food.strength / 10, 1)})`;
                    //     ctx.fillRect(px+(cellWidth*(1-setings.pheromone.size)/2), py+(cellHeight*(1-setings.pheromone.size)/2), cellWidth*setings.pheromone.size, cellHeight*setings.pheromone.size);
                    // }
    
                    // // home pheromones
                    // if (home.strength > 0.1) {
                    //     ctx.fillStyle = `rgba(0,0,255,${Math.min(home.strength / 10, 1)})`;
                    //     ctx.fillRect(px+(cellWidth*(1-setings.pheromone.size)/2), py+(cellHeight*(1-setings.pheromone.size)/2), cellWidth*setings.pheromone.size, cellHeight*setings.pheromone.size);
                    // }
    
                    // // danger pheromones
                    // if (danger.strength > 0.1) {
                    //     ctx.fillStyle = `rgba(128,0,128,${Math.min(danger.strength / 10, 1)})`;
                    // }   
                    ctx.fillStyle = `rgba(${Math.min(food.strength*25,255)},${Math.min(danger.strength*25,255)},${Math.min(home.strength*25,255)},${Math.min((food.strength+danger.strength+home.strength) / 20, 1)})`;
                    ctx.fillRect(px+(cellWidth*(1-setings.pheromone.size)/2), py+(cellHeight*(1-setings.pheromone.size)/2), cellWidth*setings.pheromone.size, cellHeight*setings.pheromone.size);
                }
                
                // foods
                if (cell.foods.amount > 0.5 && cell.foods.type !== "none") {
                    ctx.fillStyle = (cell.foods.type === "meat" ? "red" : "green");
                    ctx.fillRect(px+(cellWidth*(1-setings.food.size)/2), py+(cellHeight*(1-setings.food.size)/2), cellWidth*setings.food.size, cellHeight*setings.food.size);
                }


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



                let randomMove:number = 1.5;


                const antCenter = {x:ant.pos.x+(cellWidth*(1-setings.ants.size)/2),y:ant.pos.y+(cellWidth*(1-setings.ants.size)/2)};
                switch (action) {
                    case "gathering":

                        if(ant.energy<setings.ants.returnThreeshold){
                            // Missing energy, going back to nest
                            ant.action="survive";
                            ant.distanceSinceLastChanged=0;
                        }else{
                            const nearbyFood = nearbyCells.flat().filter(cell => {
                                const {dist,deg} = distanceAndAngleP1toP2(antCenter, {x:cell.pos.x+(cellWidth*(1-setings.food.size)/2),y:cell.pos.y+(cellWidth*(1-setings.food.size)/2)});
                                return cell.foods.amount > 0 && cell.foods.type !== "none" && ((compareSquaredDistances(dist,setings.ants.view.length)&& deg <= setings.ants.view.width / 2)|| (compareSquaredDistances(dist,setings.ants.view.senseArea)));
                            }).map(cell => ({
                                ...cell.foods,pos:{x:cell.pos.x,y:cell.pos.y,dist:distanceAndAngleP1toP2(antCenter, {x:cell.pos.x+(cellWidth*(1-setings.food.size)/2),y:cell.pos.y+(cellWidth*(1-setings.food.size)/2)}).dist,deg:distanceAndAngleP1toP2(antCenter, {x:cell.pos.x+(cellWidth*(1-setings.food.size)/2),y:cell.pos.y+(cellWidth*(1-setings.food.size)/2)}).deg}
                            }));
    
                            const closest = nearbyFood.sort((a, b) => a.pos.dist - b.pos.dist);
            
                            if(closest[0]?.pos.deg!==undefined){
                                randomMove=1.5;
                                if(!compareSquaredDistances(closest[0]?.pos.dist,setings.touchDistance)){
                                    const angleToFood = closest[0].pos.deg;
                                    ant.dir=angleToFood;
                                }else{
                                    // Reach a food unit
                                    ant.action="home";
                                    ant.distanceSinceLastChanged=0;
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

                        break;
                    case "home" || "survive":
                        const base = bases.find(b => b.id === baseId);

                        if(base){
                            const {dist,deg} = distanceAndAngleP1toP2(antCenter, {x:base.pos.x+(cellWidth*(1-setings.ants.size)/2),y:base.pos.y+(cellWidth*(1-setings.ants.size)/2)});
                            if(dist<=setings.ants.view.length*setings.ants.view.length){
                                ant.dir=deg;
                            }
                            if(dist<=setings.touchDistance){
                                ant.RenforcedPheromone=[];
                                ant.RenforcedPheromone2=[];
                                ant.action="gathering";
                                ant.distanceSinceLastChanged=0;
                                ant.load.type="none";
                                ant.load.amount=0;
                            }
                        }

                        break;
                    default:
                        break;
                }





                // Pheromone handling
                pheromoneSensing(ant);

                // Ant direction handling
                directionRandomNClamping(ant,randomMove);

                // Drop pheromone
                dropPheromone(ant);

                // Energy Systeme
                energyHandling(ant);

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
