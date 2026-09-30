import { PageType } from "../types/blog";

export const blogsDatas:Record<string,PageType> = {
    "keypad1-4keys":{
        createdAt:"2026-02-19",
        tags:["electronique", "programmation", "impression 3D"],
        coverImage:"https://cdn.discordapp.com/attachments/1239688734212100096/1474847604897485024/IMG_2367.jpg?ex=699b565e&is=699a04de&hm=a522a0ea5dfdb3fa75860a47cebe1597a6298a35e978dbf60bb7f04a84fa59b8&",
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
    },

    "split-keyboard-1":{
        createdAt:"2026-03-08",
        tags:["electronique", "programmation", "clavier", "impression 3D"],
        coverImage:"https://cdn.discordapp.com/attachments/1239688734212100096/1474847604897485024/IMG_2367.jpg?ex=699b565e&is=699a04de&hm=a522a0ea5dfdb3fa75860a47cebe1597a6298a35e978dbf60bb7f04a84fa59b8&",
        header:{
            title:"Split keyboard V1",
            description:"This is my first ever split keyboard build, it's a 4*6*2 matrix and i used a raspberry pi pico",
        },
        main:{
            content:[
                {type:"img",alt:"final product",url:"https://cdn.discordapp.com/attachments/1239688734212100096/1474847604897485024/IMG_2367.jpg?ex=699b565e&is=699a04de&hm=a522a0ea5dfdb3fa75860a47cebe1597a6298a35e978dbf60bb7f04a84fa59b8&"},
                {type:"list",title:"resources",content:[
                    "Raspberry pi pico (usb-c)",
                    "3D printed case (Pla)",
                    "Switches",
                    "Copper wire",
                    "Cable 12+pin (HDMI)",
                ]},
                {type:"linkList",title:"Usefull links",content:[
                    {title:"Base moddel",url:"https://makerworld.com/en/models/2057480-baikal-split-keyboard-handwired-corne-zmk-ergo#profileId-2221061"},
                    {title:"QMK (keyboard firmware)",url:"https://docs.qmk.fm"},
                    {title:"My final model :....",url:"???"}
                ]},
                {type:"str",text:"For this project i used a pico for the mcu but you can actually use anything (arduino pro micro ect...)"},

                {type:"str",text:"First step was to modify the 3d model acording to what i needed, my goal being to use only one raspberry, and be able to add a button and a potentiometer i had to make some modification"},
                {type:"str",text:"I removed the mcu 'cased' because i wanted the raspberry to be apparent but it do not really matter, but i had to lengthen the slot for the mcu because the design was intended to be used with an arduino pro micro which have a lot less pins"},
                {type:"str",text:"I replaced the slot on the right hand with one for my slider, and added two holes for the cable as well as one for the button. Also made some holes on the bottom in order to use less filament."},
                {type:"img",alt:"Case Bottom",url:"https://cdn.discordapp.com/attachments/1239688734212100096/1484981542689443943/image.png?ex=69c03455&is=69bee2d5&hm=93d61191bf4771f19d52d1b734529a65bb1af0116e7ab0c607991059778d4b23&"},
                {type:"img",alt:"Case Top",url:"https://cdn.discordapp.com/attachments/1239688734212100096/1484981543041761410/image.png?ex=69c03455&is=69bee2d5&hm=b21a5b0293aba46c199758f2b58e4954228a01198896e019b3d8dbd2df0a8a57&"},
                {type:"str",text:"After printing i found out i mesured something wrong and the left top part didnt fit well in the case. It was easyly fixed by filing away a bit of the top to make it fit better."},
                {type:"str",text:"For this build i tried not to coil the diodes but only to bend them a litle bit (it saved a lot of time) and i think it will hold up just as well"},
                {type:"img",alt:"Top with diode soldered",url:"https://cdn.discordapp.com/attachments/1239688734212100096/1483892091296813219/IMG_2468.jpg?ex=69c03233&is=69bee0b3&hm=e614205f35098675fccf3df1aa716af9e8432eb685cf52edd224c8783b44e7e4&"},
                {type:"str",text:"I then soldered the cables as a matrix on each hand"},
                {type:"img",alt:"wired top case",url:"https://cdn.discordapp.com/attachments/1239688734212100096/1483892090294370436/IMG_2473.jpg?ex=69c03233&is=69bee0b3&hm=2d57fa7d0e6c057780e219b697f89841499d57506d155d76ad99fc25d72a20b8&"},
                {type:"str",text:"Before starting to solder the top case to the bottom part i took the cable to connect both of my case together and wire the button on the right case"},
                {type:"img",alt:"bottom case with cable",url:"https://cdn.discordapp.com/attachments/1239688734212100096/1483892089052856501/IMG_2476.jpg?ex=69c03233&is=69bee0b3&hm=17b2643ccfbd60458b6470dc5fd529f6b12f6eed367a67d9f3fe1e8d3c6d30b6&"},
                {type:"str",text:"Next step was to solder the matrix + slider of the right case to the cables, so that i could close it and only work on the part with the mcu."},
                {type:"str",text:"This sted completed i could start by soldering the pico to the pins so that it will not move when i will solder the rest"},

            ]
        }
    }
}