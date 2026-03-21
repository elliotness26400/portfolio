import { PageType } from "../types/blog";

export const blogsDatas:Record<string,PageType> = {
    "keypad1-4keys":{
        header:{
            title:"First keypad (4 keys)",
            description:"I just finished up my first keypad build with 4keys and a raspberry pi pico. I used a 3D printed case and some mechanical switches. It was a fun project and I'm happy with how it turned out!",
        },
        main:{
            content:[
                {type:"img",alt:"final product",url:"https://cdn.discordapp.com/attachments/1239688734212100096/1474847604897485024/IMG_2367.jpg?ex=699b565e&is=699a04de&hm=a522a0ea5dfdb3fa75860a47cebe1597a6298a35e978dbf60bb7f04a84fa59b8&"},
                {type:"list",title:"resources",content:[
                    "raspberry pi pico",
                    "3D printed case",
                    "mechanical switches",
                    "wires",
                    "soldering iron"
                ]},
                {type:"linkList",title:"Usefull links",content:[
                    {title:"The 3d model i based my case on",url:"https://www.printables.com/model/347828-4x1-macro-keypad/files"},
                    {title:"Circuit python library for the raspberry pi pico",url:"https://circuitpython.org/board/raspberry_pi_pico/"},
                ]},
                {type:"str",text:"I used a raspberry pi pico RP2040 for the mcu, the case is 3d printed, and i used red switches."},

                {type:"str",text:"I started by 3d printing the case. I used a model that i found online and modified it to fit my needs. I printed the case in two separate parts, the actual case and a cover for the bottom."},
                {type:"str",text:"I then used som screw to attach the raspberry to the bottom part"},
                {type:"img",alt:"aa",url:"https://cdn.discordapp.com/attachments/1239688734212100096/1474847301263560734/IMG_2346.jpg?ex=699b5615&is=699a0495&hm=e4d42c107d649f31c2bec7b7408da93295ddf1a04428d8a295d83f17da8e4d47&"},
                {type:"str",text:"Next step was to pass the keys in the upper part of the case and solder them together. On the picture shown below the wiring is wrong, i had to do it again, diodes were in the wrong direction and i had to redo the soldering. I then simply wired all five of my cables to gpios on the raspberry."},
                {type:"img",alt:"aa",url:"https://media.discordapp.net/attachments/1239688734212100096/1474847300105928857/IMG_2348.jpg?ex=699bfed5&is=699aad55&hm=9d3dc865307aa163190c397630e2e7cbcd613e4b632914241955edb491c81135&=&format=webp&width=913&height=1218"},
                {type:"str",text:"I just had to put the screw that are holding the two parts together and it was done! I then flashed the raspberry with circuit python and wrote a simple code to make it work. I'm really happy with the final result and i will definitely try to upgrade this project in the future"},
            ]
        }
    }
}