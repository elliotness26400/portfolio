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
    const diff = (toAngle - fromAngle) % 360;
    if (diff < -180) return diff + 360;
    if (diff > 180) return diff - 360;
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
    const diff = (a - b + 180) % 360 - 180;
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

function getBaseCenter(base: Base): Position {
    return { x: base.pos.x + 0.5, y: base.pos.y + 0.5 };
}

function moveAntOutsideBase(ant: Ant, base: Base, distanceFromBase: number) {
    const baseCenter = getBaseCenter(base);
    const offsetX = ant.pos.x - baseCenter.x;
    const offsetY = ant.pos.y - baseCenter.y;
    const distanceFromCenter = Math.hypot(offsetX, offsetY);
    const angle = distanceFromCenter > 0.001
        ? Math.atan2(offsetY, offsetX)
        : Math.random() * Math.PI * 2;

    ant.pos.x = baseCenter.x + Math.cos(angle) * distanceFromBase;
    ant.pos.y = baseCenter.y + Math.sin(angle) * distanceFromBase;
    ant.dir = (angle * 180 / Math.PI + 360) % 360;
}

export function World({setings}:{setings:Settings}) {

    const mapRef = useRef<Map>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const antsRef = useRef<Array<Ant>>([]);
    const deadAntsRef = useRef<Array<Position>>([]);
    const [bases,setBases] = useState<Array<Base>>(setings.bases.array);
    const initialBaseFoodRef = useRef(
        setings.bases.array.map((base) => ({ id: base.id, amount: base.storage.meat })),
    );
    const [foodInBase, setFoodInBase] = useState(
        () => setings.bases.array.reduce((total, base) => total + base.storage.meat, 0),
    );
    const [foodBroughtIn, setFoodBroughtIn] = useState(0);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [simulationStatus, setSimulationStatus] = useState<"ready" | "running" | "complete">("ready");
    const [eggsLaid, setEggsLaid] = useState(0);
    const [antsDead, setAntsDead] = useState(0);
    const [antsAlive, setAntsAlive] = useState(
        () => setings.bases.array.reduce((total, base) => total + setings.ants.defaultAmount, 0),
    );
    const [everAlive, setEverAlive] = useState(
        () => setings.bases.array.reduce((total, base) => total + setings.ants.defaultAmount, 0),
    );
    const [spawnCooldownMs, setSpawnCooldownMs] = useState(0);
    const simulationRunningRef = useRef(false);
    const simulationStartTimeRef = useRef(0);
    const elapsedMillisecondsRef = useRef(0);
    const initialized = useRef(false);
    const baseSpawnCooldownRef = useRef<Record<number, number>>({});

    const {canvasWidth,canvasHeight} = setings;
    const cellWidth = canvasWidth / setings.map.width;
    const cellHeight = canvasHeight / setings.map.height;
    const pheromoneDecayRef = useRef(setings.pheromone.decay);
    const [controlValues, setControlValues] = useState({
        speed: setings.ants.speed,
        pheromoneStrength: setings.ants.pheromoneStrength,
        steerStrength: setings.ants.STEER_STRENGTH,
        maxTurn: setings.ants.maxTurnPerTick,
        pheromoneFade: Math.round(setings.pheromone.decay * 100),
    });

    function updateControl(name: keyof typeof controlValues, value: number) {
        setControlValues((current) => ({ ...current, [name]: value }));

        if (name === "pheromoneFade") {
            const decay = value / 100;
            setings.pheromone.decay = decay;
            pheromoneDecayRef.current = decay;
        } else if (name === "steerStrength") {
            setings.ants.STEER_STRENGTH = value;
        } else if (name === "maxTurn") {
            setings.ants.maxTurnPerTick = value;
        } else if (name === "pheromoneStrength") {
            setings.ants.pheromoneStrength = value;
            const pheromoneLimit = Math.min(10, Math.max(0.1, value * 10));
            mapRef.current.forEach((row) => row.forEach((cell) => {
                cell.pheromones.food.strength = Math.min(cell.pheromones.food.strength, pheromoneLimit);
                cell.pheromones.home.strength = Math.min(cell.pheromones.home.strength, pheromoneLimit);
                cell.pheromones.danger.strength = Math.min(cell.pheromones.danger.strength, pheromoneLimit);
            }));
        } else {
            setings.ants.speed = value;
        }
    }

    function restartSimulation() {
        deadAntsRef.current = [];
        baseSpawnCooldownRef.current = {};
        setings.bases.array.forEach((base) => {
            const initialFood = initialBaseFoodRef.current.find((item) => item.id === base.id);
            if (initialFood) base.storage.meat = initialFood.amount;
        });
        setBases([...setings.bases.array]);
        setFoodInBase(initialBaseFoodRef.current.reduce((total, base) => total + base.amount, 0));
        setFoodBroughtIn(0);
        setAntsDead(0);
        setEggsLaid(0);
        setAntsAlive(setings.bases.array.reduce((total, base) => total + setings.ants.defaultAmount, 0));
        setEverAlive(setings.bases.array.reduce((total, base) => total + setings.ants.defaultAmount, 0));
        init();
        elapsedMillisecondsRef.current = 0;
        setElapsedSeconds(0);
        if (simulationRunningRef.current) {
            simulationStartTimeRef.current = performance.now();
        } else {
            startLoop();
        }
    }

    function createAntForBase(base: Base, index: number): Ant {
        const bodyWeight = getRandomArbitrary(
            setings.ants.bodyWeight.min,
            setings.ants.bodyWeight.max,
        );
        const weightRatio = bodyWeight / setings.ants.bodyWeight.reference;
        const maxEnergy = setings.ants.maxEnergy * Math.pow(weightRatio, 1.5);
        const capacity = Math.max(1, Math.round(setings.ants.capacity * weightRatio));
        const energyConsumedPerTick = setings.ants.energyConsumedPerTick * Math.pow(weightRatio, 0.75);
        const returnThreshold = maxEnergy * setings.ants.returnThreeshold;

        return {
            pos: { ...base.pos },
            bodyWeight,
            baseId: base.id,
            dir: Math.random() * 360,
            action: "gathering",
            load: { type: "none", amount: 0 },
            capacity,
            RenforcedPheromone: [],
            RenforcedPheromone2: [],
            distanceSinceLastChanged:0,
            energy:maxEnergy,
            maxEnergy,
            energyConsumedPerTick,
            returnThreshold,
            baseEscapeTicks:0,
            index,
        };
    }


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
            case "survive":
                return "home";
                break;
            default:
                return null;
                break;
        }
    }


    function pheromoneSensing(ant: Ant): boolean {
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

        if (pheromoneLooking === "home") {
            const localSearchRadius = 3;
            const currentCellX = Math.floor(ant.pos.x);
            const currentCellY = Math.floor(ant.pos.y);

            for (let offsetY = -localSearchRadius; offsetY <= localSearchRadius; offsetY++) {
                for (let offsetX = -localSearchRadius; offsetX <= localSearchRadius; offsetX++) {
                    if (offsetX === 0 && offsetY === 0) continue;

                    const cellX = (currentCellX + offsetX + setings.map.width) % setings.map.width;
                    const cellY = (currentCellY + offsetY + setings.map.height) % setings.map.height;
                    const square = mapRef.current[cellY]?.[cellX];
                    const strength = square?.pheromones.home.strength || 0;
                    if (!square || strength <= 0) continue;

                    const sampleX = currentCellX + offsetX + 0.5;
                    const sampleY = currentCellY + offsetY + 0.5;
                    const angle = Math.atan2(sampleY - ant.pos.y, sampleX - ant.pos.x);
                    pheromoneDensity.push({
                        type: "home",
                        strength,
                        pos: square.pos,
                        angle: (angle * 180 / Math.PI + 360) % 360,
                    });
                }
            }
        }

        // 3. Calculate Probabilities
        const detectedPheromones = pheromoneDensity.filter((pheromone) => pheromone.strength > 0);
        const sum = detectedPheromones.reduce((acc, pheromone) => {
            const steeringWeight = pheromoneLooking === "home"
                ? Math.sqrt(pheromone.strength)
                : pheromone.strength;
            return acc + steeringWeight;
        }, 0);

        detectedPheromones.forEach((pheromone) => {
            pheromone.prop = (pheromoneLooking === "home"
                ? Math.sqrt(pheromone.strength)
                : pheromone.strength) / sum;
        });

        const strongestPheromone = detectedPheromones.reduce(
            (strongest, current) => current.strength > strongest.strength ? current : strongest,
            detectedPheromones[0],
        );

        if (!strongestPheromone || strongestPheromone.strength <= 0) {
            return false;
        }

        const { tmpDir, strength } = chooseRandomItem(detectedPheromones);

        // 4. Smooth Steering Correction
        const normStrength = Math.min(1, strength / setings.ants.maxTurnPerTick);
        const maxTurn = 1 + normStrength * setings.ants.maxTurnPerTick;

        // Calculate signed shortest distance between ant.dir and target angle
        const delta = getShortestAngleDelta(ant.dir, tmpDir);

        // Apply clamp to prevent over-steering
        const pheromoneInfluence = pheromoneLooking === "food" ? 0.75 : 1;
        const turn = clamp(
            delta * setings.ants.STEER_STRENGTH * pheromoneInfluence,
            -maxTurn,
            maxTurn,
        );

        // Update ant direction normalized within [0, 360)
        ant.dir = (ant.dir + turn + 360) % 360;
        return true;
    }


    function directionRandomNClamping(ant:Ant, randomMove:number){
        ant.dir += getRandomArbitrary(-randomMove, randomMove);

        if (ant.dir < 0) ant.dir += 360;
        if (ant.dir >= 360) ant.dir -= 360;
    
        const rad = ant.dir * Math.PI / 180;
    
        const staminaRatio = clamp(ant.energy / ant.maxEnergy, 0, 1);
        const speedFactor = staminaRatio < 0.25 ? 0.5 + staminaRatio * 2 : 1;
        const speed = setings.ants.speed * speedFactor;
    
        ant.pos.x += Math.cos(rad) * speed;
        ant.pos.y += Math.sin(rad) * speed;
    
        // Wrap world
        if (ant.pos.x < 0) ant.pos.x = setings.map.width;
        if (ant.pos.x > setings.map.width) ant.pos.x = 0;
        if (ant.pos.y < 0) ant.pos.y = setings.map.height;
        if (ant.pos.y > setings.map.height) ant.pos.y = 0;
    }


    function dropPheromone(ant:Ant){
        if (ant.action === "survive") return;
        const type: PheromoneTypes = ant.action === "gathering" ? "home" : "food";

        const lastDrop = ant.lastPheromoneDrop;
        if (lastDrop) {
            const directX = Math.abs(ant.pos.x - lastDrop.x);
            const directY = Math.abs(ant.pos.y - lastDrop.y);
            const wrappedX = Math.min(directX, setings.map.width - directX);
            const wrappedY = Math.min(directY, setings.map.height - directY);
            if (Math.hypot(wrappedX, wrappedY) < setings.ants.dropDelay) return;
        }
        ant.lastPheromoneDrop = { ...ant.pos };

        const base = bases.find((candidate) => candidate.id === ant.baseId);
        const baseCenter = base ? getBaseCenter(base) : ant.pos;
        const baseDx = Math.abs(ant.pos.x - baseCenter.x);
        const baseDy = Math.abs(ant.pos.y - baseCenter.y);
        const wrappedBaseDx = Math.min(baseDx, setings.map.width - baseDx);
        const wrappedBaseDy = Math.min(baseDy, setings.map.height - baseDy);
        const distanceFromBase = Math.hypot(wrappedBaseDx, wrappedBaseDy);
        const distanceFactor = 1 / (1 + distanceFromBase * 0.02);

        const pheromonesCells = getNearbyCells(
            ant.pos.x,
            ant.pos.y,
            1, // RADIUS 0 = only the cell the ant is on
        );
        
        function addPheromone(cell:MapPos,amount:number){
            const amount2 = amount * setings.ants.pheromoneStrength * distanceFactor;
            const pheromoneLimit = Math.min(10, Math.max(0.1, setings.ants.pheromoneStrength * 10));
            cell.pheromones[type].strength = Math.min(
                pheromoneLimit,
                cell.pheromones[type].strength + amount2,
            );
            cell.pheromones[type].editedAt = Date.now();
        }

        const currentX = Math.floor(ant.pos.x);
        const currentY = Math.floor(ant.pos.y);

        for(const cell of pheromonesCells){
            const cellDistanceX = Math.abs(cell.pos.x - currentX);
            const cellDistanceY = Math.abs(cell.pos.y - currentY);
            const isCurrentCell = cellDistanceX === 0 && cellDistanceY === 0;
            const isSideCell = cellDistanceX + cellDistanceY === 1;
            const isIn = ant.RenforcedPheromone.findIndex(p=>p.x==cell.pos.x&&p.y==cell.pos.y);

            // Keep the trail narrow: only the current cell and its four sides.
            if(!isCurrentCell && !isSideCell) continue;

            if(isIn === -1){
                addPheromone(cell, isCurrentCell ? 2.3 : 0.15);
                ant.RenforcedPheromone.push(cell.pos);
                if(isCurrentCell) ant.RenforcedPheromone2.push(cell.pos);
            }else if(isCurrentCell){
                const isIn2 = ant.RenforcedPheromone2.findIndex(p=>p.x==cell.pos.x&&p.y==cell.pos.y);
                if(isIn2 !== -1){
                    addPheromone(cell,2.3);
                    ant.RenforcedPheromone2.push(cell.pos);
                }
            }
        }
    }

    function energyHandling(ant:Ant){
        const foodEnergyPerUnit = setings.ants.consume.meat.quantity > 0
            ? setings.ants.consume.meat.energy /
                (setings.ants.consume.meat.quantity * Math.max(0.01, setings.ants.foodForStaminaMultiplier))
            : 0;

        if (
            ant.action === "home"
            && ant.load.amount > 0
            && ant.energy < ant.returnThreshold
            && foodEnergyPerUnit > 0
        ) {
            const missingEnergy = Math.max(0, ant.maxEnergy - ant.energy);
            const foodNeeded = missingEnergy / foodEnergyPerUnit;
            const amountToConsume = Math.min(ant.load.amount, foodNeeded);

            if (amountToConsume > 0) {
                ant.load.amount = Math.max(0, ant.load.amount - amountToConsume);
                ant.energy = clamp(
                    ant.energy + amountToConsume * foodEnergyPerUnit,
                    0,
                    ant.maxEnergy,
                );

                if (ant.load.amount <= 0) {
                    ant.load.amount = 0;
                    ant.load.type = "none";
                    ant.action = ant.energy > ant.returnThreshold ? "home" : "survive";
                }
            }
        }

        ant.energy=Math.max(0,(ant.energy-ant.energyConsumedPerTick));


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
                foods: { amount: isFoodSpot ? getRandomArbitrary(setings.food.foodPerSportMin, setings.food.foodPerSportMax) : 0, type: isFoodSpot ? (getRandomArbitrary(0,1) > 0.5 ? "meat" : "leaf") : "none" },
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
        setings.bases.array.forEach((base) => {
        for (let i = 0; i < setings.ants.defaultAmount; i++) {
            antsTmp.push(createAntForBase(base, antsTmp.length));
        }
        });
        antsRef.current = antsTmp;

        return true
    }

    function sampleProbabilities(items: {type:PheromoneTypes;strength:number;pos:Position;angle:number;prop?:number;}[]):{tmpDir:number,strength:number}{
        const r = Math.random();
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
                        const homeAlpha = Math.min(home.strength / 10, 1);
                        const foodAlpha = Math.min(food.strength / 10, 1);
                        const dangerAlpha = Math.min(danger.strength / 10, 1);
                        if (home.strength > 0) {
                            ctx.fillStyle = `rgba(0, 170, 255, ${homeAlpha})`;
                            ctx.fillRect(pheromoneX, pheromoneY, pheromoneWidth, pheromoneHeight);
                        }
                        if (food.strength > 0) {
                            ctx.fillStyle = `rgba(255, 136, 0, ${foodAlpha})`;
                            ctx.fillRect(pheromoneX, pheromoneY, pheromoneWidth, pheromoneHeight);
                        }
                        if (danger.strength > 0) {
                            ctx.fillStyle = `rgba(204, 0, 255, ${dangerAlpha})`;
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

                    ctx.font = `${Math.max(18, cellWidth * 0.48)}px sans-serif`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                    ctx.fillText(Math.max(0, Math.round(cell.foods.amount)).toString(), px + cellWidth / 2, py + cellHeight / 2 + cellHeight * 0.08);
                }


            });
        });

        // draw ants
        antsRef.current.forEach(ant => {
            const px = ant.pos.x * cellWidth;
            const py = ant.pos.y * cellHeight;
            const antSize = setings.ants.size * (0.75 + (ant.bodyWeight / setings.ants.bodyWeight.reference) * 0.5);
            if (ant.action === "survive") {
                ctx.fillStyle = "#8b4513";
            } else if (ant.action === "home") {
                ctx.fillStyle = "red";
            } else if (setings.user.display.energyDebug) {
                const energyRatio = clamp(ant.energy / ant.maxEnergy, 0, 1);
                const pinkAmount = 1 - energyRatio;
                const red = Math.round(128 + 127 * pinkAmount);
                const green = Math.round(0 + 105 * pinkAmount);
                const blue = Math.round(255 - 75 * pinkAmount);
                ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
            } else if(ant.load.type=="meat"){
                ctx.fillStyle = "orange";
            }else if(ant.load.type=="leaf"){
                ctx.fillStyle = "green";
            }else{
                ctx.fillStyle = "black";
            }
            ctx.beginPath();
            ctx.arc(px + cellWidth / 2, py + cellHeight / 2, cellWidth*antSize/2, 0, Math.PI * 2);
            ctx.fill();

            if (ant.load.amount > 0) {
                const labelX = px + cellWidth / 2;
                const labelY = py + cellHeight / 2 - cellWidth * antSize / 2 - 6;
                ctx.font = `${Math.max(16, cellWidth * 0.56)}px sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                ctx.fillText(Math.round(ant.load.amount).toString(), labelX, labelY);
                ctx.fillStyle = ant.load.type === "meat" ? "#ffeb3b" : "#a5d6a7";
                ctx.fillText(Math.round(ant.load.amount).toString(), labelX, labelY - 1);
            }

            if (setings.user.display.energyDebug) {
                const energyRatio = clamp(ant.energy / ant.maxEnergy, 0, 1);
                const barWidth = cellWidth * antSize;
                const barHeight = 2;
                const antCenterX = px + cellWidth / 2;
                const antTop = py + cellHeight / 2 - cellWidth * antSize / 2;
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
        if (simulationRunningRef.current) return;

        simulationRunningRef.current = true;
        simulationStartTimeRef.current = performance.now() - elapsedMillisecondsRef.current;
        setSimulationStatus("running");

        function loop() {
            if (!simulationRunningRef.current) return;

            elapsedMillisecondsRef.current = performance.now() - simulationStartTimeRef.current;
            const currentElapsedSeconds = Math.floor(elapsedMillisecondsRef.current / 1000);
            setElapsedSeconds((previousSeconds) =>
                previousSeconds === currentElapsedSeconds ? previousSeconds : currentElapsedSeconds,
            );

            setings.bases.array.forEach((base) => {
                const now = performance.now();
                const lastSpawnAt = baseSpawnCooldownRef.current[base.id] ?? 0;
                if (
                    base.storage.meat > setings.bases.eggMinMult * setings.bases.eggPrice &&
                    base.storage.meat >= setings.bases.eggPrice &&
                    now - lastSpawnAt >= setings.bases.eggDelay
                ) {
                    base.storage.meat -= setings.bases.eggPrice;
                    baseSpawnCooldownRef.current[base.id] = now;
                    antsRef.current.push(createAntForBase(base, antsRef.current.length));
                    setEggsLaid((current) => current + 1);
                    setEverAlive((current) => current + 1);
                    setAntsAlive(antsRef.current.length);
                    setFoodInBase(
                        setings.bases.array.reduce((total, currentBase) => total + currentBase.storage.meat, 0),
                    );
                }
            });

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
                        const nearbyFood = nearbyCells.flat().filter(cell => {
                            const {dist,deg} = distanceAndAngleP1toP2(antCenter, {x:cell.pos.x+(cellWidth*(1-setings.food.size)/2),y:cell.pos.y+(cellWidth*(1-setings.food.size)/2)});
                            const angleFromHeading = Math.abs(getShortestAngleDelta(ant.dir, deg));
                            return cell.foods.amount > 0 && cell.foods.type !== "none" && ((compareSquaredDistances(dist,setings.ants.view.length)&& angleFromHeading <= setings.ants.view.width / 2)|| (compareSquaredDistances(dist,setings.ants.view.senseArea)));
                        }).map(cell => ({
                            ...cell.foods,pos:{x:cell.pos.x,y:cell.pos.y,dist:distanceAndAngleP1toP2(antCenter, {x:cell.pos.x+(cellWidth*(1-setings.food.size)/2),y:cell.pos.y+(cellWidth*(1-setings.food.size)/2)}).dist,deg:distanceAndAngleP1toP2(antCenter, {x:cell.pos.x+(cellWidth*(1-setings.food.size)/2),y:cell.pos.y+(cellWidth*(1-setings.food.size)/2)}).deg}
                        }));

                        const canLikelyReachFoodBeforeDying = nearbyFood.length > 0 && ant.energy > 0;

                        if(ant.energy < ant.returnThreshold && !canLikelyReachFoodBeforeDying){
                            // Missing energy and no nearby food in reach: going back to nest
                            ant.action="survive";
                            ant.distanceSinceLastChanged=0;
                        }else if(nearbyFood.length > 0){
                            const closest = nearbyFood.sort((a, b) => a.pos.dist - b.pos.dist);
            
                            if(closest[0]?.pos.deg!==undefined){
                                randomMove=1.5;
                                if(!compareSquaredDistances(closest[0]?.pos.dist,setings.touchDistance)){
                                    const angleToFood = closest[0].pos.deg;
                                    ant.dir=angleToFood;
                                }else{
                                    // Reach a food unit
                                    ant.action="home";
                                    ant.dir = (ant.dir + 180) % 360;
                                    ant.distanceSinceLastChanged=0;
                                    const closeCell = mapRef.current[closest[0].pos.y][closest[0].pos.x];
                                    const gatherAmount = Math.min(closest[0].amount, ant.capacity);
                                    const foodEnergyPerUnit = setings.ants.consume.meat.quantity > 0
                                        ? setings.ants.consume.meat.energy /
                                            (setings.ants.consume.meat.quantity * Math.max(0.01, setings.ants.foodForStaminaMultiplier))
                                        : 0;
                                    const staminaDeficit = Math.max(0, ant.maxEnergy - ant.energy);
                                    const foodNeeded = foodEnergyPerUnit > 0 ? staminaDeficit / foodEnergyPerUnit : 0;
                                    const staminaFromGrabbedFood = Math.min(gatherAmount, foodNeeded);
                                    const carriedAmount = Math.max(0, gatherAmount - staminaFromGrabbedFood);

                                    closeCell.foods.amount -= gatherAmount;
                                    ant.load.type = carriedAmount > 0 ? closest[0].type : "none";
                                    ant.load.amount = carriedAmount;
                                    ant.energy = clamp(
                                        ant.energy + staminaFromGrabbedFood * foodEnergyPerUnit,
                                        0,
                                        ant.maxEnergy,
                                    );
                                    if(closeCell.foods.amount<=0){
                                        closeCell.foods.amount=0;
                                        closeCell.foods.type="none";
                                    }
                                    ant.RenforcedPheromone=[];
                                    ant.RenforcedPheromone2=[];
                                    ant.lastPheromoneDrop = undefined;
                                    dropPheromone(ant);
                                }
                            }
                        }

                        break;
                    default: // Home || Surviving
                        if (ant.action === "survive") {
                            const visibleFood = nearbyCells.flat().filter(cell => {
                                const {dist,deg} = distanceAndAngleP1toP2(antCenter, {x:cell.pos.x+(cellWidth*(1-setings.food.size)/2),y:cell.pos.y+(cellHeight*(1-setings.food.size)/2)});
                                const angleFromHeading = Math.abs(getShortestAngleDelta(ant.dir, deg));
                                return cell.foods.amount > 0 && cell.foods.type !== "none" && ((compareSquaredDistances(dist,setings.ants.view.length)&& angleFromHeading <= setings.ants.view.width / 2)|| (compareSquaredDistances(dist,setings.ants.view.senseArea)));
                            }).map(cell => ({
                                ...cell.foods,pos:{x:cell.pos.x,y:cell.pos.y,dist:distanceAndAngleP1toP2(antCenter, {x:cell.pos.x+(cellWidth*(1-setings.food.size)/2),y:cell.pos.y+(cellHeight*(1-setings.food.size)/2)}).dist,deg:distanceAndAngleP1toP2(antCenter, {x:cell.pos.x+(cellWidth*(1-setings.food.size)/2),y:cell.pos.y+(cellHeight*(1-setings.food.size)/2)}).deg}
                            }));

                            if (visibleFood.length > 0) {
                                const closestFood = visibleFood.sort((a, b) => a.pos.dist - b.pos.dist)[0];
                                if (closestFood?.pos.deg !== undefined) {
                                    ant.action = "gathering";
                                    ant.dir = closestFood.pos.deg;
                                }
                            }
                        }

                        const base = bases.find(b => b.id === baseId);

                        if(base){
                            const baseCenter = getBaseCenter(base);
                            const baseContactHalfExtent = Math.max(0.5, setings.touchDistance) + setings.ants.size / 2;
                            const reachedBaseBounds =
                                Math.abs(ant.pos.x - baseCenter.x) <= baseContactHalfExtent &&
                                Math.abs(ant.pos.y - baseCenter.y) <= baseContactHalfExtent;
                            if(reachedBaseBounds){
                                reachedBase = true;
                                ant.baseEscapeTicks = 30;
                                const baseEscapeDistance =
                                    Math.SQRT2 * baseContactHalfExtent + setings.ants.speed * 2;
                                moveAntOutsideBase(
                                    ant,
                                    base,
                                    baseEscapeDistance,
                                );
                                ant.RenforcedPheromone=[];
                                ant.RenforcedPheromone2=[];
                                ant.lastPheromoneDrop = undefined;
                                ant.distanceSinceLastChanged=0;
                                const carriedAmount = ant.load.amount;
                                base.storage.meat += carriedAmount;
                                if (carriedAmount > 0) {
                                    setFoodBroughtIn((total) => total + carriedAmount);
                                }
                                ant.load.type="none";
                                ant.load.amount=0;
                                const foodEnergyPerUnit = setings.ants.consume.meat.quantity > 0
                                    ? setings.ants.consume.meat.energy /
                                        (setings.ants.consume.meat.quantity * Math.max(0.01, setings.ants.foodForStaminaMultiplier))
                                    : 0;
                                const staminaDeficit = Math.max(0, ant.maxEnergy - ant.energy);
                                const foodNeeded = foodEnergyPerUnit > 0
                                    ? staminaDeficit / foodEnergyPerUnit
                                    : 0;
                                const foodConsumed = Math.min(base.storage.meat, foodNeeded);
                                base.storage.meat -= foodConsumed;
                                ant.energy = clamp(
                                    ant.energy + foodConsumed * foodEnergyPerUnit,
                                    0,
                                    ant.maxEnergy,
                                );
                                setFoodInBase(
                                    bases.reduce((total, currentBase) => total + currentBase.storage.meat, 0),
                                );
                                ant.action=ant.energy > ant.returnThreshold ? "gathering" : "survive";
                            }
                        }

                        break;
                }





                // Ant modes select a pheromone type; all modes use the same
                // pheromone-weighted steering calculation.
                if (reachedBase) {
                    ant.energy = Math.min(ant.maxEnergy, ant.energy);
                    directionRandomNClamping(ant, 1.5);
                } else if (ant.baseEscapeTicks > 0) {
                    ant.baseEscapeTicks -= 1;
                    directionRandomNClamping(ant, 0.5);
                } else {
                    const isReturning = ant.action === "home" || ant.action === "survive";
                    const base = isReturning ? bases.find((candidate) => candidate.id === ant.baseId) : undefined;
                    const baseDirection = base
                        ? distanceAndAngleP1toP2(ant.pos, getBaseCenter(base))
                        : undefined;
                    const baseInView = baseDirection !== undefined && (
                        (compareSquaredDistances(baseDirection.dist, setings.ants.view.length) &&
                            Math.abs(getShortestAngleDelta(ant.dir, baseDirection.deg)) <= setings.ants.view.width / 2) ||
                        compareSquaredDistances(baseDirection.dist, setings.ants.view.senseArea)
                    );

                    if (ant.action === "survive") {
                        const visibleFood = nearbyCells.flat().filter(cell => {
                            const {dist,deg} = distanceAndAngleP1toP2(antCenter, {x:cell.pos.x+(cellWidth*(1-setings.food.size)/2),y:cell.pos.y+(cellHeight*(1-setings.food.size)/2)});
                            const angleFromHeading = Math.abs(getShortestAngleDelta(ant.dir, deg));
                            return cell.foods.amount > 0 && cell.foods.type !== "none" && ((compareSquaredDistances(dist,setings.ants.view.length)&& angleFromHeading <= setings.ants.view.width / 2)|| (compareSquaredDistances(dist,setings.ants.view.senseArea)));
                        }).map(cell => ({
                            ...cell.foods,pos:{x:cell.pos.x,y:cell.pos.y,dist:distanceAndAngleP1toP2(antCenter, {x:cell.pos.x+(cellWidth*(1-setings.food.size)/2),y:cell.pos.y+(cellHeight*(1-setings.food.size)/2)}).dist,deg:distanceAndAngleP1toP2(antCenter, {x:cell.pos.x+(cellWidth*(1-setings.food.size)/2),y:cell.pos.y+(cellHeight*(1-setings.food.size)/2)}).deg}
                        }));

                        const closestFood = visibleFood.sort((a, b) => a.pos.dist - b.pos.dist)[0];
                        if (closestFood?.pos.deg !== undefined) {
                            ant.action = "gathering";
                            ant.dir = closestFood.pos.deg;
                        } else if (baseInView && baseDirection) {
                            ant.dir = baseDirection.deg;
                        } else {
                            pheromoneSensing(ant);
                        }
                    } else if (baseInView && baseDirection) {
                        ant.dir = baseDirection.deg;
                    } else {
                        pheromoneSensing(ant);
                    }
                    directionRandomNClamping(ant, randomMove);
                }

                // Energy Systeme
                energyHandling(ant);
                if (ant.energy > 0) {
                    dropPheromone(ant);
                }

            });

            const deadThisTick = antsRef.current.length - antsRef.current.filter((ant) => ant.energy > 0).length;
            antsRef.current = antsRef.current.filter((ant) => ant.energy > 0);
            if (deadThisTick > 0) {
                setAntsDead((current) => current + deadThisTick);
                setAntsAlive(antsRef.current.length);
            }

            draw();
            if (antsRef.current.length === 0) {
                elapsedMillisecondsRef.current = performance.now() - simulationStartTimeRef.current;
                setElapsedSeconds(Math.floor(elapsedMillisecondsRef.current / 1000));
                simulationRunningRef.current = false;
                setSimulationStatus("complete");
                return;
            }
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
        let previousTime = performance.now();
        const id = setInterval(() => {
            const now = performance.now();
            const elapsedSeconds = (now - previousTime) / 1000;
            previousTime = now;
            const homeDecayRate = clamp(pheromoneDecayRef.current, 0, 1);
            const foodDecayRate = clamp(homeDecayRate * 2, 0, 1);
            const getDecayMultiplier = (rate: number) => rate === 1
                ? Math.max(0, 1 - elapsedSeconds)
                : Math.pow(1 - rate, elapsedSeconds);
            const foodDecayMultiplier = getDecayMultiplier(foodDecayRate);
            const homeDecayMultiplier = getDecayMultiplier(homeDecayRate);

            mapRef.current.forEach(row => {
                row.forEach(cell => {
                    cell.pheromones.food.strength *= foodDecayMultiplier;
                    cell.pheromones.home.strength *= homeDecayMultiplier;
                    cell.pheromones.danger.strength *= homeDecayMultiplier;
                });
            });
        }, 300);
    
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const updateSpawnCooldown = () => {
            const baseCooldowns = setings.bases.array.map((base) => {
                const lastSpawn = baseSpawnCooldownRef.current[base.id] ?? 0;
                return Math.max(0, setings.bases.eggDelay - (performance.now() - lastSpawn));
            });
            setSpawnCooldownMs(baseCooldowns.length > 0 ? Math.min(...baseCooldowns) : 0);
        };

        updateSpawnCooldown();
        const id = window.setInterval(updateSpawnCooldown, 100);
        return () => window.clearInterval(id);
    }, [setings.bases.eggDelay, setings.bases.array]);

    return (
        <div className="simulation-layout">
            <canvas className="simulation-canvas" ref={canvasRef} width={canvasWidth} height={canvasHeight} />
            <aside className="simulation-controls" aria-label="Simulation controls">
                <h2>Simulation</h2>
                <section className="simulation-stock" aria-label="Simulation run status">
                    <h3>Run</h3>
                    <dl>
                        <div>
                            <dt>Status</dt>
                            <dd><output>{simulationStatus === "complete" ? "All ants dead" : simulationStatus === "running" ? "Running" : "Ready"}</output></dd>
                        </div>
                        <div>
                            <dt>Elapsed</dt>
                            <dd><output>{`${Math.floor(elapsedSeconds / 60)}:${String(elapsedSeconds % 60).padStart(2, "0")}`}</output></dd>
                        </div>
                        <div>
                            <dt>Spawn cooldown</dt>
                            <dd><output>{(spawnCooldownMs / 1000).toFixed(1)}s</output></dd>
                        </div>
                        <div>
                            <dt>Ants alive</dt>
                            <dd><output>{antsAlive}</output></dd>
                        </div>
                        <div>
                            <dt>Eggs laid</dt>
                            <dd><output>{eggsLaid}</output></dd>
                        </div>
                        <div>
                            <dt>Ants dead</dt>
                            <dd><output>{antsDead}</output></dd>
                        </div>
                        <div>
                            <dt>Ever alive</dt>
                            <dd><output>{everAlive}</output></dd>
                        </div>
                    </dl>
                </section>
                <section className="simulation-stock" aria-label="Food stores">
                    <h3>Food stores</h3>
                    <dl>
                        <div>
                            <dt>In base</dt>
                            <dd><output>{foodInBase.toFixed(0)}</output></dd>
                        </div>
                        <div>
                            <dt>Brought in</dt>
                            <dd><output>{foodBroughtIn.toFixed(0)}</output></dd>
                        </div>
                    </dl>
                </section>
                <label>
                    Speed
                    <output>{controlValues.speed.toFixed(3)}</output>
                    <input type="range" min="0.01" max="0.2" step="0.01" value={controlValues.speed} onChange={(event) => updateControl("speed", Number(event.target.value))} />
                </label>
                <label>
                    Pheromone strength
                    <output>{controlValues.pheromoneStrength.toFixed(2)}</output>
                    <input type="range" min="0.05" max="2" step="0.05" value={controlValues.pheromoneStrength} onChange={(event) => updateControl("pheromoneStrength", Number(event.target.value))} />
                </label>
                <label>
                    Steering strength
                    <output>{controlValues.steerStrength.toFixed(2)}</output>
                    <input type="range" min="0.05" max="1" step="0.05" value={controlValues.steerStrength} onChange={(event) => updateControl("steerStrength", Number(event.target.value))} />
                </label>
                <label>
                    Max turn
                    <output>{controlValues.maxTurn.toFixed(0)}°</output>
                    <input type="range" min="5" max="90" step="1" value={controlValues.maxTurn} onChange={(event) => updateControl("maxTurn", Number(event.target.value))} />
                </label>
                <label>
                    Pheromone fade
                    <output>{controlValues.pheromoneFade.toFixed(0)}%</output>
                    <input type="range" min="0" max="100" step="1" value={controlValues.pheromoneFade} onChange={(event) => updateControl("pheromoneFade", Number(event.target.value))} />
                </label>
                <button type="button" onClick={restartSimulation}>Restart simulation</button>
            </aside>
        </div>
    );
}