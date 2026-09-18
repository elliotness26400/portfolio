'use client'

import Image from "next/image";
import React, { useEffect, useRef, useState,useMemo } from "react";
import './style.css'
import {Ant,Base,Food,Map,MapPos,Pheromone,PheromoneTypes,Position,Settings} from "@/app/types/ant2";
import { VisualAnt } from "./ant";
import { VisualBase } from "./base";
import { Cell } from "./cell";
import { pheromoneTypes } from "@/app/types/ant";

function getShortestAngleDelta(fromAngle: number, toAngle: number): number {
    let diff = (toAngle - fromAngle) % 360;
    if (diff < -180) diff += 360;
    if (diff > 180) diff -= 360;
    return diff;
}

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
    const deadAntsRef = useRef<Array<Position>>([]);
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
                return "food";
                break;
            case "home":
                return "home";
                break;
            default:
                return null;
                break;
        }
    }


    function pheromoneSensing(ant: Ant) {
        const pheromoneDensity: {
            type: PheromoneTypes;
            strength: number;
            pos: Position;
            angle: number;
            prop?: number;
        }[] = [];

        const pheromoneLooking = getPheromoneType(ant);

        // 1. Front Sensors
        const totalFrontAngle = 180;
        const anglePerFrontSensor =
            setings.ants.view.pheromoneDetect.frontNumber > 1
                ? totalFrontAngle / (setings.ants.view.pheromoneDetect.frontNumber - 1)
                : 0;

        for (let i = 0; i < setings.ants.view.pheromoneDetect.frontNumber; i++) {
            const offsetDeg = (anglePerFrontSensor * i) - totalFrontAngle / 2;
            const sensorAngleRad = ((ant.dir + offsetDeg) * Math.PI) / 180;

            const fx =
                (ant.pos.x +
                    setings.ants.view.pheromoneDetect.distance * Math.cos(sensorAngleRad) +
                    setings.map.width) %
                setings.map.width;
            const fy =
                (ant.pos.y +
                    setings.ants.view.pheromoneDetect.distance * Math.sin(sensorAngleRad) +
                    setings.map.height) %
                setings.map.height;

            const square = mapRef.current[Math.floor(fy)]?.[Math.floor(fx)];
            if (square) {
                const type = pheromoneLooking ? pheromoneLooking : "home";
                const strength = square.pheromones[type]?.strength || 0;
                pheromoneDensity.push({
                    type,
                    strength,
                    pos: { x: fx, y: fy },
                    angle: (ant.dir + offsetDeg + 360) % 360,
                });
            }
        }

        // 2. Back Sensors
        const totalBackAngle = 60;
        const anglePerBackSensor =
            setings.ants.view.pheromoneDetect.backNumber > 1
                ? totalBackAngle / (setings.ants.view.pheromoneDetect.backNumber - 1)
                : 0;

        for (let i = 0; i < setings.ants.view.pheromoneDetect.backNumber; i++) {
            const offsetDeg = (anglePerBackSensor * i) - totalBackAngle / 2 - 180;
            const sensorAngleRad = ((ant.dir + offsetDeg) * Math.PI) / 180;

            const fx =
                (ant.pos.x +
                    setings.ants.view.pheromoneDetect.backDistance * Math.cos(sensorAngleRad) +
                    setings.map.width) %
                setings.map.width;
            const fy =
                (ant.pos.y +
                    setings.ants.view.pheromoneDetect.backDistance * Math.sin(sensorAngleRad) +
                    setings.map.height) %
                setings.map.height;

            const square = mapRef.current[Math.floor(fy)]?.[Math.floor(fx)];
            if (square) {
                const type = pheromoneLooking ? pheromoneLooking : "home";
                const strength = square.pheromones[type]?.strength || 0;
                pheromoneDensity.push({
                    type,
                    strength,
                    pos: { x: fx, y: fy },
                    angle: (ant.dir + offsetDeg + 360) % 360,
                });
            }
        }

        // 3. Calculate Probabilities
        const detectedPheromones = pheromoneDensity.filter((pheromone) => pheromone.strength > 0);
        const sum = detectedPheromones.reduce((acc, curr) => acc + curr.strength, 0);

        detectedPheromones.forEach((pheromone) => {
            pheromone.prop = pheromone.strength / sum;
        });

        const strongestPheromone = detectedPheromones.reduce(
            (strongest, current) => current.strength > strongest.strength ? current : strongest,
            detectedPheromones[0],
        );

        if (!strongestPheromone || strongestPheromone.strength <= 0) {
            return;
        }

        const { tmpDir, strength } = chooseRandomItem(detectedPheromones);

        // 4. Smooth Steering Correction
        const normStrength = Math.min(1, strength / setings.ants.maxTurnPerTick);
        const maxTurn = 1 + normStrength * setings.ants.maxTurnPerTick;

        // Calculate signed shortest distance between ant.dir and target angle
        const delta = getShortestAngleDelta(ant.dir, tmpDir);

        // Apply clamp to prevent over-steering
        const turn = clamp(delta * setings.ants.STEER_STRENGTH, -maxTurn, maxTurn);

        // Update ant direction normalized within [0, 360)
        ant.dir = (ant.dir + turn + 360) % 360;
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
            1, // RADIUS 0 = only the cell the ant is on
        );
        
        function addPheromone(cell:MapPos,amount:number){
            const distanceMultiplier = 1 + Math.min(ant.distanceSinceLastChanged * 0.05, 0.5);
            const amount2 = amount * setings.ants.pheromoneStrength * distanceMultiplier;
            const type = ant.action=="gathering"?"home":(ant.action=="survive"?null:"food")
            // console.log(amount2,ant.action=="gathering"?"home":(ant.action=="survive"?null:"food"));
            if(type && cell.pheromones[type].strength+amount2<=10){
                cell.pheromones[type].strength+=amount2;
                cell.pheromones[type].editedAt = Date.now();
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
                ant.RenforcedPheromone.push(cell.pos);
            }else if(cell.pos.x==parseInt(ant.pos.x.toString())&&cell.pos.y==parseInt(ant.pos.y.toString())){
                const isIn2 = ant.RenforcedPheromone2.findIndex(p=>p.x==cell.pos.x&&p.y==cell.pos.y);
                if(isIn2!=-1){
                    addPheromone(cell,2.3);
                    ant.RenforcedPheromone2.push(cell.pos);
                }
            }
        }
    }

    function energyHandling(ant:Ant){
        ant.energy=Math.max(0,(ant.energy-setings.ants.energyConsumedPerTick));


        if(ant.energy <= 0){
            deadAntsRef.current.push({x: ant.pos.x, y: ant.pos.y});
            ant.energy = 0;
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
            baseEscapeTicks:0,
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
                    const pheromoneX = px + (cellWidth * (1 - setings.pheromone.size)) / 2;
                    const pheromoneY = py + (cellHeight * (1 - setings.pheromone.size)) / 2;
                    const pheromoneWidth = cellWidth * setings.pheromone.size;
                    const pheromoneHeight = cellHeight * setings.pheromone.size;

                    if (setings.user.display.pheromoneDebug) {
                        if (home.strength > 0) {
                            ctx.fillStyle = "#00aaff";
                            ctx.fillRect(pheromoneX, pheromoneY, pheromoneWidth, pheromoneHeight);
                        }
                        if (food.strength > 0) {
                            ctx.fillStyle = "#ff8800";
                            ctx.fillRect(pheromoneX, pheromoneY, pheromoneWidth, pheromoneHeight);
                        }
                        if (danger.strength > 0) {
                            ctx.fillStyle = "#cc00ff";
                            ctx.fillRect(pheromoneX, pheromoneY, pheromoneWidth, pheromoneHeight);
                        }
                    } else {
                        ctx.fillStyle = `rgba(${Math.min(food.strength * 25, 255)},${Math.min(danger.strength * 25, 255)},${Math.min(home.strength * 25, 255)},${Math.min((food.strength + danger.strength + home.strength) / 20, 1)})`;
                        ctx.fillRect(pheromoneX, pheromoneY, pheromoneWidth, pheromoneHeight);
                    }
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
            if (setings.user.display.energyDebug) {
                if (ant.action === "home" || ant.action === "survive") {
                    ctx.fillStyle = "#8b4513";
                } else {
                    const energyRatio = clamp(ant.energy / setings.ants.maxEnergy, 0, 1);
                    const pinkAmount = 1 - energyRatio;
                    const red = Math.round(128 + 127 * pinkAmount);
                    const green = Math.round(0 + 105 * pinkAmount);
                    const blue = Math.round(255 - 75 * pinkAmount);
                    ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
                }
            } else if(ant.load.type=="meat"){
                ctx.fillStyle = "orange";
            }else if(ant.load.type=="leaf"){
                ctx.fillStyle = "green";
            }else{
                ctx.fillStyle = "black";
            }
            ctx.beginPath();
            ctx.arc(px + (cellWidth*(1-setings.ants.size)/2) / 2, py + (cellHeight*(1-setings.ants.size)/2) / 2, cellWidth*setings.ants.size/2, 0, Math.PI * 2);
            ctx.fill();

            if (setings.user.display.energyDebug) {
                const energyRatio = clamp(ant.energy / setings.ants.maxEnergy, 0, 1);
                const barWidth = cellWidth * setings.ants.size;
                const barHeight = 2;
                const antCenterX = px + (cellWidth * (1 - setings.ants.size) / 2) / 2;
                const antTop = py + (cellHeight * (1 - setings.ants.size) / 2) / 2 - cellWidth * setings.ants.size / 2;
                const barX = antCenterX - barWidth / 2;
                const barY = antTop - 5;

                ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
                ctx.fillRect(barX, barY, barWidth, barHeight);
                ctx.fillStyle = energyRatio < 0.35 ? "#ff4d8d" : "#39ff88";
                ctx.fillRect(barX, barY, barWidth * energyRatio, barHeight);
                ctx.strokeStyle = "white";
                ctx.lineWidth = 0.5;
                ctx.strokeRect(barX, barY, barWidth, barHeight);
            }

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

        if (setings.user.display.energyDebug) {
            ctx.strokeStyle = "#ff1744";
            ctx.lineWidth = 2;
            deadAntsRef.current.forEach(deadAnt => {
                const deadX = deadAnt.x * cellWidth;
                const deadY = deadAnt.y * cellHeight;
                const crossSize = Math.max(4, cellWidth * 0.35);
                ctx.beginPath();
                ctx.moveTo(deadX - crossSize, deadY - crossSize);
                ctx.lineTo(deadX + crossSize, deadY + crossSize);
                ctx.moveTo(deadX + crossSize, deadY - crossSize);
                ctx.lineTo(deadX - crossSize, deadY + crossSize);
                ctx.stroke();
            });
        }

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
                let reachedBase = false;


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
                                const angleFromHeading = Math.abs(getShortestAngleDelta(ant.dir, deg));
                                return cell.foods.amount > 0 && cell.foods.type !== "none" && ((compareSquaredDistances(dist,setings.ants.view.length)&& angleFromHeading <= setings.ants.view.width / 2)|| (compareSquaredDistances(dist,setings.ants.view.senseArea)));
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
                                    if(closest[0].amount<=0){
                                        closeCell.foods.type="none";
                                    }
                                }
                            }
                        }

                        break;
                    default: // Home || Surviving
                        const base = bases.find(b => b.id === baseId);

                        if(base){
                            const {dist,deg} = distanceAndAngleP1toP2(ant.pos, base.pos);
                            ant.dir=deg;
                            if(compareSquaredDistances(dist, setings.touchDistance)){
                                reachedBase = true;
                                ant.baseEscapeTicks = 30;
                                const departureX = ant.pos.x - base.pos.x;
                                const departureY = ant.pos.y - base.pos.y;
                                const departureAngle = Math.hypot(departureX, departureY) > 0.001
                                    ? Math.atan2(departureY, departureX)
                                    : Math.random() * Math.PI * 2;
                                ant.dir = departureAngle * 180 / Math.PI;
                                ant.RenforcedPheromone=[];
                                ant.RenforcedPheromone2=[];
                                ant.distanceSinceLastChanged=0;
                                const carriedAmount = ant.load.amount;
                                const carriedEnergy = ant.load.amount * setings.ants.consume.meat.energy;
                                base.storage.meat += carriedAmount;
                                ant.load.type="none";
                                ant.load.amount=0;
                                if(carriedEnergy > 0) {
                                    ant.energy=clamp(ant.energy+carriedEnergy,0,setings.ants.maxEnergy);
                                } else if(base.storage.meat>0){
                                    base.storage.meat=clamp(base.storage.meat-setings.ants.consume.meat.quantity,0,Infinity);
                                    ant.energy=clamp(ant.energy+setings.ants.consume.meat.energy,0,setings.ants.maxEnergy);
                                } else {
                                    ant.energy = Math.max(
                                        ant.energy,
                                        setings.ants.returnThreeshold + setings.ants.energyConsumedPerTick * 2,
                                    );
                                }
                                ant.action=ant.energy > setings.ants.returnThreeshold ? "gathering" : "survive";
                            }
                        }

                        break;
                }





                // Pheromones guide searching ants; returning ants head directly
                // to their base so the food trail cannot pull them off course.
                if (reachedBase) {
                    ant.energy = Math.min(setings.ants.maxEnergy, ant.energy);
                    directionRandomNClamping(ant, 1.5);
                } else if (ant.baseEscapeTicks > 0) {
                    ant.baseEscapeTicks -= 1;
                    directionRandomNClamping(ant, 0.5);
                } else if (ant.action === "gathering") {
                    pheromoneSensing(ant);
                    directionRandomNClamping(ant, randomMove);
                } else {
                    directionRandomNClamping(ant, 0);
                }

                // Energy Systeme
                energyHandling(ant);
                if (ant.energy > 0) {
                    dropPheromone(ant);
                }

            });

            antsRef.current = antsRef.current.filter((ant) => ant.energy > 0);

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
                    
                    cell.pheromones.home.strength *= 0.99;
                    
                    cell.pheromones.danger.strength *= 0.99;
                });
            });
        }, 300);
    
        return () => clearInterval(id);
    }, []);
    
    return <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} style={{ border: "1px solid black" }} />;
}
