'use client'

import React, { forwardRef } from "react";
import { HeaderType } from "@/app/types/blog";
import style from "./main.module.scss";

export function BlogHeader({data}:{data:HeaderType}){

    const {description,title} = data;

    return (
        <div>
            <h1 className={style.bigblogtitle}>{title}</h1>
            <h2 className={style.blogdescription}>{description}</h2>
        </div>
    );

};