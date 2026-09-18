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
                        dropDelay:1,
                        defaultAmount:50,
                        size:.75,
                        maxEnergy:200,
                        pheromoneStrength:0.5,
                        emptyPathTurnProp:0.5,
                        maxTurnPerTick:40,
                        STEER_STRENGTH:0.3,
                        energyConsumedPerTick:0.2,
                        returnThreeshold:600/6,
                        consume:{
                            meat:{
                                energy:600,
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
                        array:[{color:"brown",id:0,pos:{x:50,y:50,height:2,width:2},storage:{eggs:0,leave:0,meat:10}}]
                    },
                    food:{
                        defaultAmount:30,
                        foodPerSportMin:250,
                        foodPerSportMax:600,
                        size:.8,
                    },
                    map:{
                        width:100,
                        height:100,
                    },
                    pheromone:{
                        size:0.5,
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
