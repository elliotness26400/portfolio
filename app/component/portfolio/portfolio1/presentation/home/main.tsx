'use client'

import React, { forwardRef } from "react";
import style from "./page.module.scss";

export function Home({data}:{data:{}}){

    const {} = data;

    return (
        <div className={style.main}>
            <div className={style.presentation}>
                
                <h1>
                    <span>
                        SOFTWARE
                    </span>
                    <span>
                        ENGINEER
                    </span>
                </h1>

                <h3>Passionate about creating intuitive and engaging user experiences. Specialize in transforming ideas into beautifully crafted products.</h3>
            </div>

            <div className={style.badges}>
                <div>
                    <h2>+8</h2>
                    <h4>Years of experience</h4>
                </div>

                <div>
                    <h2>+15</h2>
                    <h4>Projects completed</h4>
                </div>
            </div>
        </div>
    );

};