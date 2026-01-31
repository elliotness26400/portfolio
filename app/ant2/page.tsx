'use client'

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Ants } from "../component/ants/world";
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
                        array:[{color:"brown",id:0,pos:{x:50,y:50,height:2,width:2}}]
                    },
                    food:{
                        defaultAmount:20,
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
