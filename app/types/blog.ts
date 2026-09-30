export type HeaderType = {
    title:string;
    description:string;
}

export type ContentItem = {
    type : "str";
    text:string;
    style?:Array<"big"|"small"|"bold"|"thin">
} | {
    type : "img";
    url:string;
    alt:string;
} | {
    type:"subCategorie";
    title:string;
    description?:string;
    content:Array<ContentItem>;
} |
{
    type:"list";
    title:string;
    content:Array<string>;
} | {
    type:"linkList";
    title:string;
    content:Array<{url:string;title:string}>;
}

export type MainType = {
    content:Array<ContentItem>;
}

export type PageType = {
    createdAt:string;
    tags:string[];
    coverImage:string;
    header:HeaderType;
    main:MainType;
}