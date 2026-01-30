'use client'

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Ants } from "../component/ants/world";


export default function SIMU() {

    return (
        <div className="map">
            <Ants setings={{defaultAntNumber:10,defaultFoodSpot:20,defaultTrees:25,food:{foodPerSportMin:15,foodPerSportMax:75},bases
        :[{color:"brown",id:0,pos:{x:50,y:50}}],ants:{
            speed:0.04,dropDelay:2.5, view:{
                senseArea:20,
                length:30,
                width:90,
            }
        },user:{
            displayView:true,
        },
        antSize:.8,foodSize:1,pheromonSize:.5,treeSize:1.5}}></Ants>
        </div>
    );
}
