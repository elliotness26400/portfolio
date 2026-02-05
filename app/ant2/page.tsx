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
                        speed:0.01,
                        dropDelay:2,
                        defaultAmount:1,
                        size:.75,
                        maxEnergy:600,
                        emptyPathTurnProp:0.5,
                        maxTurnPerTick:8,
                        STEER_STRENGTH:0.15,
                        energyConsumedPerTick:0.1,
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
                                range:2,
                                distance:4,
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
                        defaultAmount:10,
                        foodPerSportMin:20,
                        foodPerSportMax:150,
                        size:.8,
                    },
                    map:{
                        width:100,
                        height:100,
                    },
                    pheromone:{
                        size:0.3,
                    },
                    user:{
                        display:{
                            grid:false,
                            pheromones:true,
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
