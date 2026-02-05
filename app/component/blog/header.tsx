'use client'

import React, { forwardRef } from "react";
import { HeaderType } from "@/app/types/blog";

export function BlogHeader({data}:{data:HeaderType}){

    const {description,title} = data;

    return (
        <div>
            <h1>{title}</h1>
            <h3>{description}</h3>
        </div>
    );

};