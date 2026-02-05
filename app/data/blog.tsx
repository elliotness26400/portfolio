import { PageType } from "../types/blog";

export const blogsDatas:Record<string,PageType> = {
    "blog-1":{
        header:{
            title:"BLOG N°1",
            description:"OUI",
        },
        main:{
            content:[
                {type:"str",text:"TEXT 1"},
                {type:"img",alt:"IMAGE 1",url:"https://images.unsplash.com/photo-1761839259488-2bdeeae794f5?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"},
                {type:"str",text:"Non do laborum in ullamco eu proident do elit nostrud. Exercitation aliquip labore in labore mollit ea pariatur laborum enim minim veniam do tempor. Voluptate nisi cupidatat ea magna tempor nulla laboris ullamco sint ad quis. Exercitation qui exercitation Lorem dolore nostrud Lorem mollit amet nulla ad qui cupidatat et qui. Nostrud amet aliqua anim enim incididunt ipsum aliqua sit anim ex ad eiusmod pariatur culpa."},
                {type:"str",text:"Adipisicing nostrud eiusmod voluptate labore excepteur quis irure commodo."},
                {type:"img",alt:"aa",url:"https://picsum.photos/id/1020/600/400"},
            ]
        }
    }
}