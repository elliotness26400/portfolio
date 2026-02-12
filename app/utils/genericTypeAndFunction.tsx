// TYPES 

import { useEffect, useState } from "react";

export type Position = {
    x:number;
    y:number;
    z?:number;
}

export type Vector = Position;

export type SimulationObject = {
    pos:Vector;
    mass:number;
    movement:Vector;
    size:Position;
    color:string;
    id?:number;
    isCircle:boolean;
    collided:boolean;
}

//FUNCTIONS :

export function getRandomArbitrary(min:number, max:number):number {
    return Math.random() * (max - min) + min;
}

export function getDistance(p1: Position, p2: Position): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function distance2(p1: Position, p2: Position): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return dx * dx + dy * dy;
}

export function absoluteValue(x:number){
    if(x<0) return -x;
    return x
}

export function angleDifference(a: number, b: number) {
    let diff = (a - b + 180) % 360 - 180;
    return Math.abs(diff);
}

export function clamp(x:number,min:number,max:number){
    return Math.max(min, Math.min(max, x));
}

export function doCollide(o1: SimulationObject, o2: SimulationObject): boolean {
    const min1 = o1.pos;
    const max1 = { x: o1.pos.x + o1.size.x, y: o1.pos.y + o1.size.y };

    const min2 = o2.pos;
    const max2 = { x: o2.pos.x + o2.size.x, y: o2.pos.y + o2.size.y };

    return !(
        max1.x <= min2.x ||  
        min1.x >= max2.x ||  
        max1.y <= min2.y || 
        min1.y >= max2.y    
    );
}

export function doCircleCollide(o1: SimulationObject, o2: SimulationObject): boolean {
    const c1 = {x:o1.pos.x+(o1.size.x/2),y:o1.pos.y+(o1.size.y/2)}
    const c2 = {x:o2.pos.x+(o2.size.x/2),y:o2.pos.y+(o2.size.y/2)}
    const distX = o1.pos.x-o2.pos.x;
    const distY = o1.pos.y-o2.pos.y;
    const distMax = (o1.size.x+o2.size.x)/2
    const p1 = distX*distX + distY*distY;
    const p2 = distMax*distMax;
    const res = p1 <= p2;
    // console.log(p1,p2,res);
    return res;
}