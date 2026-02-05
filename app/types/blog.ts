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
}

export type MainType = {
    content:Array<ContentItem>;
}

export type PageType = {
    header:HeaderType;
    main:MainType;
}