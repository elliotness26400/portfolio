'use client'

import React, { forwardRef } from "react";
import { ContentItem, HeaderType, MainType } from "@/app/types/blog";

export function BlogMain({data}:{data:MainType}){

    const {content} = data;

    function returnHtml(item:ContentItem){
        switch (item.type) {
            case "str":
                return (
                    <p>{item.text}</p>
                )
            case "img":
                return (
                    <img src={item.url} alt={item.alt}/>
                )
            default:
                return (
                    <div>
                        <h3>{item.title}</h3>
                        <h4>{item.description}</h4>
                        <div>
                            {item.content.map((item2,j)=>(
                                <div key={j}>
                                    {returnHtml(item2)}
                                </div>
                            ))}
                        </div>
                    </div>
                )
        }
    }

    return (
        <div>
            {content.map((item,i)=>(
                <div key={i}>
                    {returnHtml(item)}
                </div>
            ))}
        </div>
    );

};