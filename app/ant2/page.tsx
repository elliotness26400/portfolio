'use client'

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { World } from "../component/ant-v2/v2.5";


export default function SIMU() {

    return (
        <div className="map">
            <World setings={
                {
                    ants:{
                        speed:0.05,
                        dropDelay:0.25,
                        defaultAmount:50,
                        capacity:25,
                        bodyWeight:{
                            min:0.60,
                            max:1.4,
                            reference:1,
                        },
                        size:.75,
                        maxEnergy:200,
                        pheromoneStrength:0.9,
                        emptyPathTurnProp:0.5,
                        maxTurnPerTick:40,
                        STEER_STRENGTH:0.3,
                        energyConsumedPerTick:0.2,
                        foodForStaminaMultiplier:20,
                        returnThreeshold:0.7,
                        consume:{
                            meat:{
                                energy:100,
                                quantity:1,
                            }
                        },
                        view:{
                            length:5,
                            senseArea:4,
                            width:90,
                            pheromoneDetect:{
                                range:5,
                                distance:6,
                                backDistance:2.5,
                                frontNumber:5,
                                backNumber:3,
                                gama:99999999999,
                            }
                        }
                    },
                    bases:{
                        array:[{color:"brown",id:0,pos:{x:50,y:50,height:2,width:2},storage:{eggs:0,leave:0,meat:10}}],
                        eggPrice:25,
                        eggMinMult:4,
                        eggDelay:2000,
                    },
                    food:{
                        defaultAmount:25,
                        foodPerSportMin:100,
                        foodPerSportMax:1000,
                        size:.8,
                    },
                    map:{
                        width:100,
                        height:100,
                    },
                    pheromone:{
                        size:0.8,
                        decay:0.05,
                    },
                    user:{
                        display:{
                            grid:false,
                            pheromones:true,
                            pheromoneDebug:true,
                            energyDebug:true,
                            view:false,
                        }
                    },
                    canvasWidth:950,
                    canvasHeight:950,
                    touchDistance:0.3,
                }
            }></World>
        </div>
    );
}
