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
}

export type Settings = {
    canvasWidth:number;
    canvasHeight:number;
    pheromone:{
        size:number;
    }
    food:{
        foodPerSportMin:number;
        foodPerSportMax:number;
        size:number;
        defaultAmount:number;
    };
    bases:{
        array:Array<Base>;
    }
    ants:{
        defaultAmount:number;
        speed:number;
        dropDelay:number;
        size:number;
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
    pos:Position;
    baseId:number;
    dir:number;
    action:"gathering"|"home";
    load:{
        type:resourceType;
        amount:number,
    }
    capacity:number;
    RenforcedPheromone:Position[];
    RenforcedPheromone2:Position[];
    distanceSinceLastChanged:number;
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