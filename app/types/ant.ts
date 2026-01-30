export type position = {
    x:number;
    y:number;
}

export type envirementItem = {
    x:number,
    y:number,
}
export type pheromoneTypes = "home"|"food"|"danger";

export type pheromone = {
    pos:position;
    type:pheromoneTypes;
    strength:number;
    createdAt:number;
    trayId:number;
    index:number;
}

export type base = {
    id:number;
    color:string;
    pos:position;
}

export type settings = {
    defaultAntNumber:number;
    defaultFoodSpot:number;
    defaultTrees:number;
    treeSize:number;
    foodSize:number;
    antSize:number;
    pheromonSize:number;
    food:{
        foodPerSportMin:number;
        foodPerSportMax:number;
    };
    bases:Array<base>
    ants:{
        speed:number;
        dropDelay:number;
        view:{
            width:number;
            length:number;
            senseArea:number;
        };
    };
    user:{
        displayView:boolean;
    }
}

type resourceType = "meat"|"leaf"|"none"

export type ant = {
    pos:position;
    baseId:number;
    lastPheromone:position;
    dir:number;
    action:"gathering"|"home";
    load:{
        type:resourceType;
        amount:number,
    }
    following:null|number;
    ignore : Array<number>;
    pheromoneId:number;
    trayIndex:number;
    aimingPheromone:number|null;
    capacity:number;
    lastReinforcedIndex:number|null;
}

export type food = {
    amount:number;
    type:resourceType;
    pos:position;
}