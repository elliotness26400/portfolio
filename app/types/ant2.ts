import { position } from "./ant";

export type Position = {
    x:number;
    y:number;
    width?:number;
    height?:number;
}

export type PheromoneTypes = "home"|"food"|"danger";

export type Pheromone = {
    type:PheromoneTypes;
    strength:number;
    editedAt:number;
}

export type Base = {
    id:number;
    color:string;
    pos:Position;
    storage:{
        eggs:number;
        leave:number;
        meat:number;
    };
}

export type Settings = {
    canvasWidth:number;
    canvasHeight:number;
    pheromone:{
        size:number;
        decay:number;
    }
    food:{
        foodPerSportMin:number;
        foodPerSportMax:number;
        size:number;
        defaultAmount:number;
    };
    bases:{
        array:Array<Base>;
        eggPrice:number;
        eggMinMult:number;
        eggDelay:number;
    }
    ants:{
        returnThreeshold:number;
        defaultAmount:number;
        capacity:number;
        bodyWeight:{
            min:number;
            max:number;
            reference:number;
        };
        speed:number;
        dropDelay:number;
        size:number;
        maxEnergy:number;
        pheromoneStrength:number;
        emptyPathTurnProp:number;
        maxTurnPerTick:number;
        STEER_STRENGTH:number;
        energyConsumedPerTick:number;
        foodForStaminaMultiplier:number;
        consume : {
            meat:{
                quantity:number;
                energy:number;
            }   
        }
        view:{
            width:number;
            length:number;
            senseArea:number;
            pheromoneDetect:{
                range:number;
                distance:number;
                backDistance:number;
                frontNumber:number;
                backNumber:number;
                gama:number;
            }
        };
    };
    user:{
        display:{
            view:boolean;
            grid:boolean;
            pheromones:boolean;
            pheromoneDebug:boolean;
            energyDebug:boolean;
        }
    }
    map:{
        width:number;
        height:number;
    };
    touchDistance:number;
}

type resourceType = "meat"|"leaf"|"none"

export type Ant = {
    index:number;
    bodyWeight:number;
    pos:Position;
    baseId:number;
    dir:number;
    action:"gathering"|"home"|"survive";
    load:{
        type:resourceType;
        amount:number,
    }
    capacity:number;
    RenforcedPheromone:Position[];
    RenforcedPheromone2:Position[];
    lastPheromoneDrop?:Position;
    distanceSinceLastChanged:number;
    energy:number;
    maxEnergy:number;
    energyConsumedPerTick:number;
    returnThreshold:number;
    baseEscapeTicks:number;
}

export type Food = {
    amount:number;
    type:resourceType;
}

export type MapPos = {
    contain?:"rock"|"tree";
    foods:Food;
    pheromones:{
        food:Pheromone;
        home:Pheromone;
        danger:Pheromone;
    }
    pos:Position;
}

export type Map = Array<Array<MapPos>>