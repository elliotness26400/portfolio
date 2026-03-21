'use client'

import React, { forwardRef } from "react";
import { ContentItem, HeaderType, MainType } from "@/app/types/blog";
import style from "./main.module.scss";

export function BlogMain({data}:{data:MainType}){

    const {content} = data;

    function returnHtml(item:ContentItem){
        switch (item.type) {
            case "str":
                return (
                    <p className={style.blogtext}>{item.text}</p>
                )
            case "img":
                return (
                    <img src={item.url} alt={item.alt} className={style.blogimg}/>
                )
            case "list":
                return (
                    <div>
                        <h3 className={style.blogtitle}>{item.title}</h3>
                        <ul className={style.bloglist}>
                            {item.content.map((item2,j)=>(
                                <li key={j}>{item2}</li>
                            ))}
                        </ul>
                    </div>
                )
            case "linkList":
                return (
                    <div>
                        <h3 className={style.blogtitle}>{item.title}</h3>
                        <ul className={`${style.bloglist} ${style.linklist}`}>
                            {item.content.map((item2,j)=>(
                                <li key={j}><a href={item2.url} target="_blank">{item2.title}</a></li>
                            ))}
                        </ul>
                    </div>
                )
            default:
                return (
                    <div>
                        <h3 className={style.blogtitle}>{item.title}</h3>
                        <h4 className={style.blogdescription}>{item.description}</h4>
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