'use client'

import Image from "next/image";
import React, { useEffect, useRef, useState,useMemo } from "react";
import './style.css'
import { ant, base, envirementItem, food, pheromone, pheromoneTypes, position, settings } from "@/app/types/ant";
import { Ant } from "./ant";
import { Base } from "./base";


function getRandomArbitrary(min:number, max:number):number {
    return Math.random() * (max - min) + min;
}

export function distance(p1: position, p2: position): number {
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

function isTooClose(ant: ant, obstacles: position[], minDist: number, size: number) {
    return obstacles.some(obs => {
        const closestX = Math.max(obs.x, Math.min(ant.pos.x, obs.x + size));
        const closestY = Math.max(obs.y, Math.min(ant.pos.y, obs.y + size));
        const dist = distance(ant.pos, { x: closestX, y: closestY });
        return dist < minDist;
    });
}

function distanceAndAngleP1toP2(p1:position,p2:position):{dist:number,deg:number;}{
    const {x,y} = p2;
    const xDif = x - p1.x;
    const yDif = y - p1.y;
    const angle = Math.atan2(yDif, xDif);
    const degA = angle * 180 / Math.PI;
    const hDiff2 = xDif*xDif +yDif*yDif;
    return {dist:hDiff2,deg:degA};
}


export function Ants({setings}:{setings:settings}) {

    const [treesMap,setTreesMap] = useState<Array<envirementItem>>([]);
    const [pheromonesMap,setPheromonesMap] = useState<Array<pheromone>>([]);
    const pheromonesRef = useRef<pheromone[]>([]);
    const antsRef = useRef<Array<ant>>([]);
    const antsHTMLREF = useRef<Array<HTMLDivElement>>([])
    const [bases,setBases] = useState<Array<base>>(setings.bases);
    const [foods,setFood] = useState<Array<food>>([]);
    const foodRef = useRef<Array<food>>([])

    const colliderPositionArray = useMemo<Array<position>>(()=>{
        let res:Array<position> = [];
        treesMap.forEach(element => {
            res.push(element);
        });
        return res;
    },[treesMap])

    const initialized = useRef(false);

    function startLoop() {
        let frameId: number;
    
        const loop = () => {
            antsRef.current.forEach((ant, i) => {
                const htmlel = antsHTMLREF.current[i];
                if (!htmlel) return;

                const {action,baseId,dir,following,ignore,lastPheromone,load,pheromoneId,pos} = ant
                
                // COLLISIONS
                // if (isTooClose(ant, colliderPositionArray, 2, setings.treeSize)) { // 2 = minimum safe distance
                //     const turnAngle = getRandomArbitrary(20, 60); // how much to turn
                //     // randomly turn left or right
                //     if (Math.random() < 0.5) ant.dir += turnAngle;
                //     else ant.dir -= turnAngle;
                
                //     // normalize
                //     if (ant.dir < 0) ant.dir += 360;
                //     if (ant.dir >= 360) ant.dir -= 360;
                // }
                
                let overwride=false;
                if(following!==null){
                    const pheromones = pheromonesRef.current.filter((e)=>{
                        const {trayId} = e;

                        const {deg,dist} = distanceAndAngleP1toP2(ant.pos,e.pos);

                        return trayId==following && ((dist<=setings.ants.view.senseArea)||(dist<=setings.ants.view.length&&angleDifference(ant.dir,deg)<setings.ants.view.width));
                    })
                    if(!pheromones[0]) return overwride=true;
                    if(!ant.aimingPheromone){ // Never reached any pheromone of this tray
                        let closestOne:pheromone=pheromones[0];
                        let closestDist:number=Infinity;
                        pheromones.forEach(ph => {
                            const {dist} = distanceAndAngleP1toP2(ant.pos,ph.pos);
                            if(dist <= closestDist){
                                closestDist=dist;
                                closestOne=ph;
                            }
                        });
                        ant.aimingPheromone=closestOne.index;
                    }
                    // Go to the targeted pheromone

                    // Find it
                    const aimedPheromone = (pheromones.filter((e)=>{
                        return e.index==ant.aimingPheromone;
                    }))[0]

                    if(aimedPheromone==undefined||aimedPheromone==null||!aimedPheromone){
                        overwride=true;
                    }else if (!overwride) {
                        const { deg, dist } = distanceAndAngleP1toP2(ant.pos, aimedPheromone.pos);
                    
                        ant.dir = (deg + 360) % 360;
                    
                        if (dist < setings.ants.view.senseArea) {
                    
                            if (ant.lastReinforcedIndex !== aimedPheromone.index) {
                                aimedPheromone.strength += 1;
                                ant.lastReinforcedIndex = aimedPheromone.index;
                            }
                    
                            const nextIndex =
                                ant.aimingPheromone - 1
                    
                            const nextPheromone = pheromonesRef.current.find(e =>
                                e.trayId === ant.following &&
                                e.index === nextIndex
                            );
                    
                            if (!nextPheromone) {
                                ant.ignore.push(ant.following!);
                                ant.following = null;
                                ant.aimingPheromone = null;
                                ant.lastReinforcedIndex = null;
                    
                                ant.dir += getRandomArbitrary(-40, 40);
                            } else {
                                ant.aimingPheromone = nextIndex;
                            }
                        }
                    }
                    

                }
    
                if(ant.action=="gathering"){
                    // Check for a food tray to follow 
                    if(ant.following==null) {

                        const visibleFoodPheromones = pheromonesRef.current.filter((e)=>{
                            const {createdAt,index,strength,trayId,type} = e;
                            if(e.type!=="food") return false;
    
                            const {deg,dist} = distanceAndAngleP1toP2(ant.pos,e.pos);
    
                            return ((dist<=setings.ants.view.senseArea)||(dist<=setings.ants.view.length&&angleDifference(ant.dir,deg)<setings.ants.view.width));
                        })
    
                        const randomFoodPheromone = visibleFoodPheromones[0];
    
                        console.log(randomFoodPheromone);
    
                        if(randomFoodPheromone&&randomFoodPheromone.strength){
                            ant.following = randomFoodPheromone.trayId;
                            ant.aimingPheromone = randomFoodPheromone.index;
                        }
                        
                    }

                    let found = false;
                    let shortestDist = Infinity;
                    let shortestFoodAngle=Infinity;

                    foodRef.current.forEach(e => {
                        const {dist,deg} = distanceAndAngleP1toP2(ant.pos,e.pos);

                        // Pick up food
                        if(dist<1.5){
                            ant.action="home";
                            ant.pheromoneId = getRandomArbitrary(0,99999999);
                            ant.load={
                                type:e.type,
                                amount:ant.capacity,
                            }
                            e.amount-=ant.capacity;
                        }

                        if(
                            ((dist<=setings.ants.view.senseArea)||(dist<=setings.ants.view.length&&angleDifference(ant.dir,deg)<setings.ants.view.width))
                        ){
                            if(dist<shortestDist) {
                                shortestFoodAngle=deg;
                                found=true;
                            }
                        }
                        
                    });

                    if(shortestFoodAngle!==Infinity&&found){
                        ant.dir = (shortestFoodAngle + 360) % 360; // normalise
                    }

                    if(!found){
                        // Random turn
                        ant.dir += getRandomArbitrary(-5,5);
                    }
                }else if(ant.action=="home"){
                    const base = bases.filter((base)=>{
                        return base.id==ant.baseId && distanceAndAngleP1toP2(ant.pos,base.pos).dist<setings.ants.view.length
                    })[0]

                    if(base){
                        if(ant.following){
                            ant.following=null;
                        }
                        
                        const {deg,dist} = distanceAndAngleP1toP2(ant.pos,base.pos);
                        
                        ant.dir = (deg+360)%360;
                        
                        if(dist<1){
                            ant.pheromoneId=getRandomArbitrary(0,99999);
                            ant.action="gathering";
                            ant.load={amount:0,type:"none"};
                        }
                    }

                    if(!following&&!base){
                        // Look for a home path to follow
                        const visiblePheromones = pheromonesRef.current.filter((e)=>{
                            const {createdAt,index,strength,trayId,type} = e;
    
                            const {deg,dist} = distanceAndAngleP1toP2(ant.pos,e.pos);
    
                            return ((dist<=setings.ants.view.senseArea)||(dist<=setings.ants.view.length&&angleDifference(ant.dir,deg)<setings.ants.view.width)) && e.type=="home"
                        })
    
    
                        if(visiblePheromones[0]&&visiblePheromones[0].trayId!==undefined){
                            // Start following this tray
                            ant.following=visiblePheromones[0].trayId;
                            ant.aimingPheromone=visiblePheromones[0].index;
                        }
                    }

                }
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
    
                // Apply to DOM
                htmlel.style.left = `${ant.pos.x}vw`;
                htmlel.style.top = `${ant.pos.y}vh`;


                if (distance(ant.pos, ant.lastPheromone) > setings.ants.dropDelay) {
                    let t:pheromoneTypes = "home";
                    if(ant.action=="home"){
                        t="food";
                    }
                    pheromonesRef.current.push({
                        pos: { ...ant.pos },
                        strength: 1,
                        createdAt: performance.now(),
                        type: t,
                        trayId:ant.pheromoneId,
                        index:ant.trayIndex,
                    });

                    ant.trayIndex++;
                
                    ant.lastPheromone = { ...ant.pos };
                }


                
            });
    
            frameId = requestAnimationFrame(loop);
        };
    
        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    }
    

    function init(){
        //Trees
        setTreesMap(
            Array.from({ length: setings.defaultTrees }, () => ({
                x: getRandomArbitrary(0, 100),
                y: getRandomArbitrary(0, 100)
            }))
        );

        // Food
        const tmpFoods:Array<food> = Array.from({ length: setings.defaultFoodSpot }, () => ({
            pos: {
                x: getRandomArbitrary(0, 80),
                y: getRandomArbitrary(0, 80)
            },
            amount: getRandomArbitrary(
                setings.food.foodPerSportMin,
                setings.food.foodPerSportMax
            ),
            type: "meat"
        }))
        setFood(tmpFoods);
        foodRef.current=tmpFoods;


        // Ants
        const antsTmp: ant[] = [];
        bases.forEach(base => {
            for (let i = 0; i < setings.defaultAntNumber; i++) {
                antsTmp.push({
                    pos: {...base.pos},
                    baseId: base.id,
                    lastPheromone:{...base.pos},
                    dir:getRandomArbitrary(0,360),
                    action:"gathering",
                    load:{type:"none",amount:0},
                    following:null,
                    ignore:[],
                    aimingPheromone:null,
                    pheromoneId:i,
                    trayIndex:0,
                    capacity:3,
                    lastReinforcedIndex:null,
                });
            }
        });

        antsRef.current = antsTmp;

        return true
    }

    useEffect(()=>{
        if(initialized.current) return;
        initialized.current=true;
        const inited = init();
        if(inited) startLoop();
        
    },[])

    useEffect(() => {
        const id = setInterval(() => {
            const now = performance.now();

            pheromonesRef.current = pheromonesRef.current.filter(p => {
                const age = (now - p.createdAt) / 1000;
                p.strength *= 0.985; // or 0.99, tune as needed
                return p.strength > 0.1;
            });

            setPheromonesMap([...pheromonesRef.current]);
        }, 300);
    
        return () => clearInterval(id);
    }, []);
    

    return (
        <div className="map">
            <div className="environement">
                <div className="trees env_cont">
                    {treesMap.map((item,i)=>(
                        <div className="tree" key={i} style={{width:`${setings.treeSize}vw`,aspectRatio:1,'left':`${item.x}vw`,'top':`${item.y}vh`}}></div>
                    ))}
                </div>
                <div className="ants env_cont">
                {antsRef.current.map((item, i) => (
                    <Ant
                        key={i}
                        item={item}
                        size={setings.antSize}
                        ref={el => {
                            if (el) antsHTMLREF.current[i] = el;
                        }}
                    />
                ))}

                </div>
                <div className="pheromones env_cont">
                    {pheromonesMap.map((item,i)=>(
                        <div className="pheromone" key={i} style={{backgroundColor:`${item.type=="food"?"red":(item.type=="home"?"blue:":"purple")}`,width:`${Math.min((setings.pheromonSize)*(item.strength/5),2)+.5}vw`,aspectRatio:1,'left':`${item.pos.x}vw`,'top':`${item.pos.y}vh`,opacity:`${Math.max(0, Math.min(1, item.strength))/2}`}}></div>
                    ))}
                </div>
                <div className="foods env_cont">
                    {foods.map((item,i)=>(
                        <div className="food" key={i} style={{width:`${(item.amount*setings.foodSize)/20}vw`,aspectRatio:1,'left':`${item.pos.x}vw`,'top':`${item.pos.y}vh`}}></div>
                    ))}
                </div>
                <div className="bases env_cont">
                    {bases.map((item,i)=>(
                        <Base item={item} key={i}></Base>
                    ))}
                </div>
            </div>
        </div>
    );
}
