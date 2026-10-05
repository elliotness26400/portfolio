<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Projet 3d</title>
    <link rel="stylesheet" href="css/design.css">
    <link rel="shortcut icon" href="#" type="image/x-icon">
</head>
<body class="">

    <div id="ecran">
        <div id="map">
            <div id="heros">
                <div id="chapeau"></div>
                <div id="panneau"></div>
                <div id="plateau"></div>
            </div>
        </div>
    </div>


    <script>
    // CONFIGURATIONS
    let bCameraImmobile = false
    let bQuatrePointCardineaux = false // TODO
    let bDirFixe = false
    let bModePapier = false
    let bConfigAnimeArret = false
    let bConfigAnimeDeplacement = true
    let bConfigBloquerCommande = false


    // VARIABLES
    let tmp
    let idHtmlUniq = 1
    let eloignementZ = -375

    let oSprite = {
        rpgmkxp03 : {
            name: `rpgmkxp03`,
            bgi : `003-Fighter03-hitbox.png`,
            fq : 150,
            w : 128,
            h : 192,
            etapeX : 4,
            etapeY : 4,

            // padding
            pt : 2,
            pr : 4,
            pb : 2,
            pl : 5,
            pbNiveaux : {
                tete       : 30,
                epaules    : 27,
                nombril    : 19,
                genoux     : 7,
                pieds      : 1,
            },
            pxEchelleSpriteVue : 5.7,
            ligneDir : {
                haut       : 3,
                hautdroite : 3,
                droite     : 2,
                basdroite  : 2,
                bas        : 0,
                basgauche  : 1,
                gauche     : 1,
                hautgauche : 3,
            },
        },
        stella : {
            name: `stella`,
            bgi : `stella_walk_1.png`,
            fq : 300,
            w : 256,
            h : 512,
            etapeX : 4,
            etapeY : 8,

            // padding
            pt : 2,
            pr : 16,
            pb : 3,
            pl : 16,
            pbNiveaux : {
                tete       : 34,
                epaules    : 29,
                nombril    : 22,
                genoux     : 15,
                pieds      : 5,
            },
            pxEchelleSpriteVue : 4,
            ligneDir : {
                haut       : 3,
                hautdroite : 7,
                droite     : 2,
                basdroite  : 4,
                bas        : 0,
                basgauche  : 5,
                gauche     : 1,
                hautgauche : 6,
            },
        },
    }

    let oDecor = {
        sapinNoel : {
            name: `sapinNoel`,
            bgi : `sapin-noel.png`,
            w : 481,
            h : 737,
        },
        bananier : {
            name: `bananier`,
            bgi: `bananier.png`,
            w : 704,
            h : 1272,
        },
        bouleau : {
            name: `bouleau`,
            bgi: `bouleau.png`,
            w : 834,
            h : 925,
        },
        buisson : {
            name: `buisson`,
            bgi: `buisson.png`,
            w : 640,
            h : 456,
        },
        buissonFleursJaunes : {
            name: `buissonFleursJaunes`,
            bgi: `buisson-fleurs-jaunes.png`,
            w : 1600,
            h : 1126,
        },
        grandPalmier : {
            name: `grandPalmier`,
            bgi: `grand-palmier.png`,
            w : 1100,
            h : 1304,
        },
        noyer : {
            name: `noyer`,
            bgi: `noyer.png`,
            w : 2000,
            h : 1082,
        },
        palmier : {
            name: `palmier`,
            bgi: `palmier.png`,
            w : 400,
            h : 721,
        },
        peuplier : {
            name: `peuplier`,
            bgi: `peuplier.png`,
            w : 430,
            h : 1023,
        },
        platane : {
            name: `platane`,
            bgi: `platane.png`,
            w : 1288,
            h : 1600,
        },
        rpgmk : {
            name: `rpgmk`,
            bgi: `rpgmk.png`,
            w : 192,
            h : 142,
        },
        sapin : {
            name: `sapin`,
            bgi: `sapin.png`,
            w : 700,
            h : 920,
        },
        saulePleureur : {
            name: `saulePleureur`,
            bgi: `saule-pleureur.png`,
            w : 512,
            h : 512,
        },
    }

    let aoRectangle = [
        // {w:400,p:500,bgc:'blue',  x:300,y:-700,z:0},
        // {w:400,p:500,bgc:'white',  x:300,y:-800,z:0},
        //
        //
        {w:600,p:750,bgc:'cyan',  x:500,y:0,z:0, id:"glace", type:1},
        // {w:600,p:750,bgc:'brown',  x:2000,y:0,z:0, id:"boue", type:2},

        {w:600,p:750,bgc:'grey',  x:500,y:1200,z:0, id:"tapie-roulant", type:3, vitesse:4, angle:90},
        // {w:600,p:750,bgc:'purple',  x:2000,y:1200,z:0, id:"metamorphose", type:4},
        //
        {w:600,p:750,bgc:'cornflowerblue',  x:500,y:2400,z:0, id:"eau", type:5},
        {w:600,p:750,bgc:'blue',  x:2000,y:2400,z:0, id:"eau-courant", type:6, vitesse:4, angle:90},
        //
        // {w:600,p:750,bgc:'red',  x:500,y:3600,z:0, id:"lave", type:7},
        //
        // {w:600,p:750,bgc:'blue',  x:-1400,y:800,z:0, id:"tests", type:0},

        // {w:400,p:500,bgc:'indianred',  x:300,y:-1500,z:0, id:"testtt"},
    ]

    let aoEllipse = [
        {w:400,p:700,bgc:'indianred',  x:300,y:-1600,z:0, id:"ABC"},
        {w:400,p:700,bgc:'red',  x:300,y:-2400,z:0},
    ]

    let oTapis = {
        vitesse:0,
        angle:-90,
    }


    let defaut_oSpriteH
    defaut_oSpriteH = oSprite.rpgmkxp03
    defaut_oSpriteH = oSprite.stella

    let default_spriteName = defaut_oSpriteH.name

    let niveau_oSpriteH = 'pieds'
    let nom_oSpriteH = defaut_oSpriteH.name

    let pxSpriteX
    let pxSpriteY
    let etapeSpriteX = 0
    let etapeSpriteY = 0

    let largeurHitboxH = (defaut_oSpriteH.w/defaut_oSpriteH.etapeX - defaut_oSpriteH.pl - defaut_oSpriteH.pr)*defaut_oSpriteH.pxEchelleSpriteVue
    let profondeurHitboxH = largeurHitboxH
    let hauteurHitboxH = (defaut_oSpriteH.h/defaut_oSpriteH.etapeY - defaut_oSpriteH.pt - defaut_oSpriteH.pbNiveaux[niveau_oSpriteH])*defaut_oSpriteH.pxEchelleSpriteVue
    let largeurHitboxH2 = largeurHitboxH / 2
    let profondeurHitboxH2 = profondeurHitboxH / 2
    let hauteurHitboxH2 = hauteurHitboxH / 2

    let frequenceTap
    frequenceTap = 10 // ms
    let bAnimeSpriteH
    let chronoAnimeH
    let bAnimeSpriteHExecute
    // frequenceTap = 1000 // ms
    // frequenceTap = 100 // ms
    let chronoTap = setInterval(function() {tap()}, frequenceTap)

    let sModeCam = "poursuite" // poursuite / longueVue
    let bAutorisationSwitchLongueVue = true
    let fScaleZoomLongueVue = 1 // pour zoomer et dezoomer


    // ELEMENTS JS
    let eMap      = $i('map')
    let eH        = $i('heros')
    let eChapeau        = $i('chapeau')
    let ePanneau        = $i('panneau')
    let ePlateau        = $i('plateau')
    let eEcran = $i('ecran')

    // OBJETS JS
    let oMap = {}
    let oMapAvantLongueVue = {}
    let oH = {}


    // FONCTIONS
    function $i(x){return document.getElementById(x)}
    function $q(x){return document.querySelector(x)}
    function $t(x){return document.getElementsByTagName(x)}
    function $c(x){return document.getElementsByClassName(x)}
    function $qa(x){return document.querySelectorAll(x)}

    function deg2rad(a){
        return  a*0.01745 // 0.017453292519943295
        // return  a * (Math.PI/180)
    }
    function rad2deg(a){
        return  a/0.01745 // 0.017453292519943295
        // return  a / (Math.PI/180)
    }
    function _clone(o){
        return JSON.parse(JSON.stringify(o))
    }

    // renvoie les textes uniques :  uniqid1  uniqid2 uniqid3 ...
    function setIdHtmlUniq(){
        return "uniqid" + idHtmlUniq++
    }

    function ini(){
        eMap.setAttribute('style',`
        height: 200vh;
        transform-style: preserve-3d;
        position: relative;

        background-color: #8f88;
        width: 300px; /* NOTE : la largeur De la map est symbolique */
        border : solid 1px black ;
        box-shadow: 0 0 0 1px black inset;
        `)

        setMap({ x:0, y:185, z:eloignementZ, rx:70, ry:0, rz:0, ox:largeurHitboxH2, oy:profondeurHitboxH2, oz:0 })


        setH({ x:0, y:0, z:0, rx:0, ry:0, rz:0, ox:0, oy:0, oz:0 })


        ePlateau.style.width = largeurHitboxH + 'px'
        ePlateau.style.height = profondeurHitboxH + 'px'

        ePanneau.style.width = largeurHitboxH + 'px'
        ePanneau.style.height = hauteurHitboxH + 'px'
        ePanneau.style.transform = `rotateX(-90deg) translateY(-${hauteurHitboxH2}px) translateZ(${-hauteurHitboxH2 + largeurHitboxH2}px)`

        eChapeau.style.width = largeurHitboxH + 'px'
        eChapeau.style.height = profondeurHitboxH + 'px'
        eChapeau.style.transform = `translateZ(${hauteurHitboxH}px)`

        if(bConfigAnimeArret){
            startAnimeSpriteH()
        }
        changerSpriteH()
        setHSpriteY(defaut_oSpriteH.ligneDir.haut)
    }


    // met à jour l'objet oMap r=rotation, o=origine
    function setMap({ajouter=false, x=false, y=false, z=false, rx=false, ry=false, rz=false, ox=false, oy=false, oz=false}={}){
        if(ajouter){
            if(x!==false) oMap.x+=x
            if(y!==false) oMap.y+=y
            if(z!==false) oMap.z+=z
            if(rx!==false) oMap.rx+=rx + 360 // pour éviter les pièges du modlo dans les nombres négatifs
            if(ry!==false) oMap.ry+=ry + 360
            if(rz!==false) oMap.rz+=rz + 360
            if(ox!==false) oMap.ox+=ox
            if(oy!==false) oMap.oy+=oy
            if(oz!==false) oMap.oz+=oz
            // console.log(ox,oy,oz);
        }
        else{
            if(x!==false) oMap.x=x
            if(y!==false) oMap.y=y
            if(z!==false) oMap.z=z
            if(rx!==false) oMap.rx=rx + 360
            if(ry!==false) oMap.ry=ry + 360
            if(rz!==false) oMap.rz=rz + 360
            if(ox!==false) oMap.ox=ox
            if(oy!==false) oMap.oy=oy
            if(oz!==false) oMap.oz=oz
        }
        oMap.rx %= 360
        oMap.ry %= 360
        oMap.rz %= 360

        majMap()
    }


    // modifie l'élément map (le css)
    function majMap(){
        eMap.style.transform = ` translateX(calc(50vw + ${oMap.x}px)) translateY(calc(40vh + ${oMap.y}px)) translateZ(${oMap.z}px) rotateX(${oMap.rx}deg) rotateY(${oMap.ry}deg) rotateZ(${oMap.rz}deg)`
        // eMap.style.transform = `rotateX(${oMap.rx}deg) rotateY(${oMap.ry}deg) rotateZ(${oMap.rz}deg) translateX(calc(50vw + ${oMap.x}px)) translateY(calc(40vh + ${oMap.y}px)) translateZ(${oMap.z}px)`
        eMap.style.transformOrigin = `${oMap.ox}px ${oMap.oy}px ${oMap.oz}px` // en css transform-origin : 30px 50px 45 px ;
        // console.log(`${oMap.ox}px ${oMap.oy}px ${oMap.oz}px`);
        if(!bModePapier) ePanneau.style.transform = `rotateX(-90deg) translateY(-${hauteurHitboxH2}px) translateZ(${-hauteurHitboxH2 + largeurHitboxH2}px) rotateY(${oMap.rz+oH.rz}deg)`
        for (let decor of document.getElementsByClassName('decor-verrouillee')) {
            decor.style.transform = `rotateZ(${-oMap.rz}deg)`
        }



    }

    function setH({ajouter=false, x=false, y=false, z=false, rx=false, ry=false, rz=false, ox=false, oy=false, oz=false}={}){
        if(ajouter){
            if(x!==false) oH.x+=x
            if(y!==false) oH.y+=y
            if(z!==false) oH.z+=z
            if(rx!==false) oH.rx+=rx + 360 // pour éviter les pièges du modlo dans les nombres négatifs
            if(ry!==false) oH.ry+=ry + 360
            if(rz!==false) oH.rz+=rz + 360
            if(ox!==false) oH.ox+=ox
            if(oy!==false) oH.oy+=oy
            if(oz!==false) oH.oz+=oz
        }
        else{
            if(x!==false) oH.x=x
            if(y!==false) oH.y=y
            if(z!==false) oH.z=z
            if(rx!==false) oH.rx=rx + 360
            if(ry!==false) oH.ry=ry + 360
            if(rz!==false) oH.rz=rz + 360
            if(ox!==false) oH.ox=ox
            if(oy!==false) oH.oy=oy
            if(oz!==false) oH.oz=oz
        }
        oH.rx %= 360
        oH.ry %= 360
        oH.rz %= 360

        majH()
    }


    // modifie l'élément h (le css)
    function majH(){
        eH.style.transformOrigin = `${oH.ox}px ${oH.oy}px ${oH.oz}px` // en w transform-origin : 30px 50px 45 px ;
        eH.style.transform = `translateX(${oH.x}px) translateY(${oH.y}px) translateZ(${oH.z}px) rotateX(${oH.rx}deg) rotateY(${oH.ry}deg) rotateZ(${oH.rz}deg)`
    }


    // majH();


    // ARTICULATION
    ini()
    setH({ajouter:false,ox:largeurHitboxH2,oy:largeurHitboxH2})
    // console.log(oH);








    // function toto({a=1 ,b=10 ,c=23}={}) {
    //
    // }
    //
    // toto({c:888})



    function cube({w=120,p=240,h=50,  x=0,y=0,z=0, id=false}={}){
        if(id===false) id=setIdHtmlUniq()
        let w2=w/2
        let p2=p/2
        let h2=h/2


        let newele = document.createElement('div')
        newele.id=id
        newele.classList.add('fondation-cube')
        eMap.appendChild(newele)
        newele.setAttribute('style',`
        width: ${w}px;
        height: ${p}px;
        /*background-color: white;*/
        position: absolute;
        transform-style: preserve-3d;
        left : ${x}px;
        top : ${y}px;
        transform: translateZ(${z}px);
        `)


        let bas = document.createElement('div')
        bas.classList.add('bas')
        newele.appendChild(bas)
        bas.setAttribute('style',`
        position: absolute;
        background-color: green;
        width: ${w}px;
        height: ${p}px;
        transform: translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) ;
        `)

        let haut = document.createElement('div')
        haut.classList.add('haut')
        newele.appendChild(haut)
        haut.setAttribute('style',`
        position: absolute;
        background-color: blue;
        width: ${w}px;
        height: ${p}px;
        transform: translateX(0px) translateY(0px) translateZ(${h}px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) ;
        `)

        let droite = document.createElement('div')
        droite.classList.add('droite')
        newele.appendChild(droite)
        droite.setAttribute('style',`
        position: absolute;
        background-color: gray;
        width: ${p}px;
        height: ${h}px;
        transform: translateX(${w-p2}px) translateY(${-h2+p2}px) translateZ(${h2}px) rotateX(90deg) rotateY(90deg) rotateZ(0deg) ;
        `)

        let gauche = document.createElement('div')
        gauche.classList.add('gauche')
        newele.appendChild(gauche)
        gauche.setAttribute('style',`
        position: absolute;
        background-color: red;
        width: ${p}px;
        height: ${h}px;
        transform: translateX(${-p2}px) translateY(${-h2+p2}px) translateZ(${h2}px) rotateX(90deg) rotateY(90deg) rotateZ(0deg) ;
        `)
        // transform: translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) ;
        // transform: translateX(${-w2}px) translateY(${w2}px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(90deg) ;

        let arriere = document.createElement('div')
        arriere.classList.add('arriere')
        newele.appendChild(arriere)
        arriere.setAttribute('style',`
        position: absolute;
        background-color: purple;
        width: ${w}px;
        height: ${h}px;
        transform: translateX(0px) translateY(${-h2}px) translateZ(${h2}px) rotateX(90deg) rotateY(0deg) rotateZ(0deg) ;
        `)
        // transform: translateX(0px) translateY(0px) translateZ(${h2}px) rotateX(90deg) rotateY(0deg) rotateZ(0deg) ;

        let avant = document.createElement('div')
        avant.classList.add('avant')
        newele.appendChild(avant)
        avant.setAttribute('style',`
        position: absolute;
        background-color: yellow;
        width: ${w}px;
        height: ${h}px;
        transform: translateX(0px) translateY(${p-h2}px) translateZ(${h2}px) rotateX(90deg) rotateY(0deg) rotateZ(0deg) ;

        `)


        // FONDATION CUBE : c'est une div parent qui contiendra les 6 faces et qui possède l'id

        // RAJOUTS DES 6 FACES
        /*
        mettre le heros (avec plateau chapeau et panneau)  en commentaire (pour dépolluer)
        créer les div :
        haut : bleu
        bas : vert
        gauche : rouge
        droite : gris
        avant : jaune
        arrière : violet


        let arriere = document.createElement('div')
        arriere.classList.add('arriere')
        newele.appendChild(arriere)

        arriere.setAttribute('style',`
        background-color: black;
        width: ${w}px;
        height: ${h}px;
        transform: rotate3d(1,0,0,90deg) translate3d(0,${h2}px,${h2}px);
        `)


        */



    }

    function rectangle({w=400,p=500,bgc='indianred',  x=300,y=-700,z=0, id=false, type=0 }={}){
        if(id===false) id=setIdHtmlUniq()
        let w2=w/2
        let p2=p/2

        let eFondation = document.createElement('div')
        eFondation.id=id
        eFondation.classList.add('rectangle')
        eMap.appendChild(eFondation)
        eFondation.setAttribute('style',`
        height: ${w}px;
        width: ${p}px;
        background-color: ${bgc};
        position: absolute;
        transform-style: preserve-3d;
        left : ${x}px;
        top : ${y}px;
        transform: translateZ(${z}px);
        opacity:.5;
        `)
        eFondation.setAttribute('data-type',type)
    }

    function ellipse({w=400,p=500,bgc='indianred',  x=300,y=-1600,z=0, id=false, type=0 }={}){
        if(id===false) id=setIdHtmlUniq()
        let w2=w/2
        let p2=p/2

        let eFondation = document.createElement('div')
        eFondation.id=id
        eFondation.classList.add('ellipse')
        eMap.appendChild(eFondation)
        eFondation.setAttribute('style',`
        height: ${w}px;
        width: ${p}px;
        background-color: ${bgc};
        position: absolute;
        transform-style: preserve-3d;
        left : ${x}px;
        top : ${y}px;
        transform: translateZ(${z}px);
        border-radius: 50%;
        opacity:.5;
        `)
        eFondation.setAttribute('data-type',type)
    }

    // rectangle({id:"test"})
    // ellipse({id:"test2"})

    for(let k in aoRectangle){
        let x = aoRectangle[k]
        if(!x.id) x.id=setIdHtmlUniq()
        if(!x.type) x.type=0
        rectangle(x)
    }

    for(let k in aoEllipse){
        let x = aoEllipse[k]
        if(!x.id) x.id=setIdHtmlUniq()
        if(!x.type) x.type=0
        ellipse(x)
    }

    // animations
    function changerSpriteH( _sNomSprite=false, _sNiveauSprite=false){ // niveaux = tete/epaules...
        if(_sNomSprite == nom_oSpriteH && _sNiveauSprite == niveau_oSpriteH) return // WARNING si SA BUG
        if (_sNomSprite === false) _sNomSprite = nom_oSpriteH
        if (_sNiveauSprite === false) _sNiveauSprite = niveau_oSpriteH

        // mise à jour des variable du spriteH
        nom_oSpriteH    = _sNomSprite
        niveau_oSpriteH = _sNiveauSprite
        defaut_oSpriteH = oSprite[nom_oSpriteH]

        ePanneau.style.backgroundImage = `url('images/sprite/${defaut_oSpriteH.bgi}')`
        ePanneau.style.backgroundSize  = defaut_oSpriteH.pxEchelleSpriteVue*defaut_oSpriteH.w+'px'
        pxSpriteX = defaut_oSpriteH.pxEchelleSpriteVue*defaut_oSpriteH.pl
        pxSpriteY = defaut_oSpriteH.pxEchelleSpriteVue*defaut_oSpriteH.pt-defaut_oSpriteH.pbNiveaux[niveau_oSpriteH]
        hauteurHitboxH = (defaut_oSpriteH.h/defaut_oSpriteH.etapeY - defaut_oSpriteH.pt - defaut_oSpriteH.pbNiveaux[niveau_oSpriteH])*defaut_oSpriteH.pxEchelleSpriteVue
        hauteurHitboxH2 = hauteurHitboxH/2
        largeurHitboxH = (defaut_oSpriteH.w/defaut_oSpriteH.etapeX - defaut_oSpriteH.pl - defaut_oSpriteH.pr)*defaut_oSpriteH.pxEchelleSpriteVue
        largeurHitboxH2 = largeurHitboxH/2
        // pxSpriteX = (defaut_oSpriteH.w/defaut_oSpriteH.etapeX - defaut_oSpriteH.pl - defaut_oSpriteH.pr)*defaut_oSpriteH.pxEchelleSpriteVue
        // pxSpriteY = (defaut_oSpriteH.h/defaut_oSpriteH.etapeY - defaut_oSpriteH.pt - )*defaut_oSpriteH.pxEchelleSpriteVue
        // // console.log(ePanneau.style.backgroundPosition);
        //
        // console.log(pxSpriteX,pxSpriteY,pxSpriteX2,pxSpriteY2);

        ePanneau.style.transform = `rotateX(-90deg) translateY(-${hauteurHitboxH2}px) translateZ(${-hauteurHitboxH2 + largeurHitboxH2}px)`
        ePanneau.style.height = hauteurHitboxH + 'px'
        ePanneau.style.width = largeurHitboxH + 'px'
        eChapeau.style.transform = `translateZ(${hauteurHitboxH}px)`
        eChapeau.style.width = largeurHitboxH+"px"
        eChapeau.style.height = largeurHitboxH+"px"

        ePlateau.style.width = largeurHitboxH+"px"
        ePlateau.style.height = largeurHitboxH+"px"


    }

    function setHSpriteX(iX){
        etapeSpriteX = iX
        majSprite()
    }

    function setHSpriteY(iY){
        etapeSpriteY = iY
        majSprite()
        // console.log(iY);

    }

    function nextHSpriteX(){
        etapeSpriteX++
        etapeSpriteX%=defaut_oSpriteH.etapeX
        majSpriteX()
    }

    function majSpriteX(){
        let tmp = defaut_oSpriteH.pxEchelleSpriteVue*defaut_oSpriteH.pl + etapeSpriteX*(defaut_oSpriteH.w/defaut_oSpriteH.etapeX*defaut_oSpriteH.pxEchelleSpriteVue)
        ePanneau.style.backgroundPositionX = -tmp+'px'
    }

    function majSpriteY(){
        // let tmp = defaut_oSpriteH.pxEchelleSpriteVue*defaut_oSpriteH.pt + etapeSpriteY*(defaut_oSpriteH.h/defaut_oSpriteH.etapeY*defaut_oSpriteH.pxEchelleSpriteVue)
        let tmp = defaut_oSpriteH.pxEchelleSpriteVue*defaut_oSpriteH.pt + etapeSpriteY*(defaut_oSpriteH.h/defaut_oSpriteH.etapeY*defaut_oSpriteH.pxEchelleSpriteVue)
        hauteurHitboxH = (defaut_oSpriteH.h/defaut_oSpriteH.etapeY - defaut_oSpriteH.pt - defaut_oSpriteH.pbNiveaux[niveau_oSpriteH])*defaut_oSpriteH.pxEchelleSpriteVue

        ePanneau.style.height = hauteurHitboxH + 'px'
        ePanneau.style.backgroundPositionY = -tmp+'px'
    }

    function majSprite(){
        majSpriteX()
        majSpriteY()
    }



    // setHSpriteX(0)
    // setHSpriteY(0)


    // cube({id:"minecraft"})
    // cube({id:"minecraft",w:367,p:453,h:57})

    // cube({id:"minecraft",w:100,p:100,h:100})
    // cube({id:"minecraft",w:100,p:200,h:300 , x:10,y:30,z:58})
    cube({id:"horizon",w:5000,p:10,h:10 , x:-2500,y:-20000,z:0})

    cube({id:"petitSol",w:100,p:100,h:100 , x:200,y:0,z:0})
    cube({id:"mur",w:100,p:100,h:300 , x:400,y:0,z:0})
    cube({id:"petitVentre",w:100,p:100,h:100 , x:600,y:0,z:100})
    cube({id:"petitTete",w:100,p:100,h:100 , x:800,y:0,z:200})
    cube({id:"lustre",w:100,p:100,h:100 , x:1000,y:0,z:350})
    cube({id:"lampadaire",w:100,p:100,h:100 , x:1000,y:0,z:700})

    //
    // cube({id:"test",w:100,p:200,h:300 , x:60,y:53,z:14})
    // 68.5
    // 3.5   55   178



    // ECOUTES TOUCHE CLAVIER
    /*
    z : avant
    q : gauche
    s : arrière
    d : droite

    // CAMÉRA
    haut
    droite
    bas
    gauche

    EXEMPLE : appuyer sur espace pour faire sauter le héros.
    on appuie sur la touche espace
    la fonction "tap" surgit avec une certaine fréquence
    la fonction tap vérifie si la touche espace est appuyée
    elle active un booleen "bEspace"
    plus tard, on se dit que bEspace est vrai, alors on apelle la fonction "sauter()"
    */

    // var commandes hardware
    let bEspace = false
    let bE = false
    let bZ      = false
    let bQ      = false
    let bS      = false
    let bD      = false
    let bArrowUp     = false
    let bArrowLeft   = false
    let bArrowDown   = false
    let bArrowRight  = false
    let bAccelere = false
    let bRalentir = false
    let bA  = false


    // var commande software
    let bSauter
    let bAlternerLongueVue
    let degStickGo
    let degStickCamera

    function majCmd(){


        bSauter = bEspace
        bAlternerLongueVue = bA

        // DEGSTICKGO
        // par defaut
        degStickGo=false // le stick est au milieu

        // une touche
        if(bZ) degStickGo=0
        if(bD) degStickGo=90
        if(bS) degStickGo=180
        if(bQ) degStickGo=270

        // diagonales
        if(bZ && bD) degStickGo=45
        if(bD && bS) degStickGo=135
        if(bS && bQ) degStickGo=225
        if(bQ && bZ) degStickGo=315

        // conflit
        if(bZ && bS) degStickGo=false
        if(bD && bQ) degStickGo=false

        // trois touches
        if(bQ && bD && bZ) degStickGo=0
        if(bZ && bS && bD) degStickGo=90
        if(bQ && bD && bS) degStickGo=180
        if(bZ && bS && bQ) degStickGo=270

        //conflit
        if(bZ && bD && bS && bQ) degStickGo=false


        // DEGSTICKCAMERA

        // par defaut
        degStickCamera=false // le stick est au milieu

        // une touche
        if(bArrowUp) degStickCamera=0
        if(bArrowRight) degStickCamera=90
        if(bArrowDown) degStickCamera=180
        if(bArrowLeft) degStickCamera=270

        // diagonales
        if(bArrowUp && bArrowRight) degStickCamera=45
        if(bArrowRight && bArrowDown) degStickCamera=135
        if(bArrowDown && bArrowLeft) degStickCamera=225
        if(bArrowLeft && bArrowUp) degStickCamera=315

        // conflit
        if(bArrowUp && bArrowDown) degStickCamera=false
        if(bArrowRight && bArrowLeft) degStickCamera=false

        // trois touches
        if(bArrowLeft && bArrowRight && bArrowUp) degStickCamera=0
        if(bArrowUp && bArrowDown && bArrowRight) degStickCamera=90
        if(bArrowLeft && bArrowRight && bArrowDown) degStickCamera=180
        if(bArrowUp && bArrowDown && bArrowLeft) degStickCamera=270

        //conflit
        if(bArrowUp && bArrowRight && bArrowDown && bArrowLeft) degStickCamera=false
    }


    // VOCABULAIRE
    //      ->   petite flèche
    //      =>   double flèche / "grosse flèche"   fat arrow
    //      <=> vaisseau spatial / spaceship

    document.body.onkeydown=e=>{
        // e.preventDefault()

        switch (e.key) {
            case ' '         : bEspace     = true ; break ;
            case 'e':case 'E'         : bE          = true ; break ;
            case 'z':case 'Z'         : bZ          = true ; break ;
            case 'q':case 'Q'         : bQ          = true ; break ;
            case 's':case 'S'         : bS          = true ; break ;
            case 'd':case 'D'         : bD          = true ; break ;
            case 'ArrowUp'   : bArrowUp    = true ; break ;
            case 'ArrowLeft' : bArrowLeft  = true ; break ;
            case 'ArrowDown' : bArrowDown  = true ; break ;
            case 'ArrowRight': bArrowRight = true ; break ;
            case 'Shift': bAccelere = true ; break ;
            case 'Control': bRalentir = true ; break ;
            case 'a':case 'A': bA = true ; break ;
        }
        majCmd()
    }

    document.body.onkeyup=e=>{
        // e.preventDefault()
        switch (e.key) {
            case ' '         : bEspace     = false ; break ;
            case 'e':case 'E'         : bE          = false ; break ;
            case 'z':case 'Z'         : bZ          = false ; break ;
            case 'q':case 'Q'         : bQ          = false ; break ;
            case 's':case 'S'         : bS          = false ; break ;
            case 'd':case 'D'         : bD          = false ; break ;
            case 'ArrowUp'   : bArrowUp    = false ; break ;
            case 'ArrowLeft' : bArrowLeft  = false ; break ;
            case 'ArrowDown' : bArrowDown  = false ; break ;
            case 'ArrowRight': bArrowRight = false ; break ;
            case 'Shift': bAccelere = false ; break ;
            case 'Control': bRalentir = false ; break ;
            case 'a':case 'A': bA = false ; bAutorisationSwitchLongueVue = true ; break ;
        }
        majCmd()
    }


    // function deplacerEnHautH(dist){
    //     setH({ajouter:true,y:-dist})
    //     // setH({ajouter:true,y:-dist})
    // }
    // function deplacerADroiteH(dist){
    //     setH({ajouter:true,x:dist})
    // }
    // function deplacerEnBasH(dist){
    //     setH({ajouter:true,y:dist})
    // }
    // function deplacerAGaucheH(dist){
    //     setH({ajouter:true,x:-dist})
    // }


    function deplacerHCooPolaire(angle,dist){
        angle-=oMap.rz
        setH({ajouter:true, x:Math.sin(deg2rad(angle))*dist , y:-Math.cos(deg2rad(angle))*dist})
    }

    function deplacerMapCooPolaire(angle,dist){
        angle-=oMap.rz
        setMap({ajouter:true, x:-Math.sin(deg2rad(angle))*dist , y:Math.cos(deg2rad(angle))*dist , oy:-Math.cos(deg2rad(angle))*dist , ox:Math.sin(deg2rad(angle))*dist})
    }



    function definirRotationHeros(angle){
        if(bDirFixe) return
        setH({ajouter:false,rz:angle})
        setH({ajouter:true,rz:-oMap.rz})
    }



    function deplacerEnHautMap(dist){
        if(bCameraImmobile) return
        setMap({ajouter:true,y:-dist, oy:dist})
    }
    function deplacerADroiteMap(dist){
        if(bCameraImmobile) return
        setMap({ajouter:true,x:dist,ox:-dist})
    }
    function deplacerEnBasMap(dist){
        if(bCameraImmobile) return
        setMap({ajouter:true,y:dist, oy:-dist})
    }
    function deplacerAGaucheMap(dist){
        if(bCameraImmobile) return
        setMap({ajouter:true,x:-dist,ox:dist})
    }


    function tourneCameraADroite(angle){
        setMap({ajouter:true,rz:angle})
    }
    function tourneCameraAGauche(angle){
        setMap({ajouter:true,rz:-angle})
    }

    function tourneCameraEnHaut(angle){
        if(oMap.rx <= 60 && sModeCam == 'poursuite') return
        setMap({ajouter:true,rx:-angle})
    }
    function tourneCameraEnBas(angle){
        if(oMap.rx >= 90 && sModeCam == 'poursuite') return
        setMap({ajouter:true,rx:angle})
    }
    function remettreCamDerriereH(){
        setMap({ajouter:false,rz:-oH.rz})
    }

    function sauter(x=false){ // il faudrait avoir       sauter(quel personnage ?)
        if(x===false) console.log("le héros saute");
        else console.log("le personnage " + x + " saute");
    }

    function memoMapAvantLongueVue(){
        oMapAvantLongueVue = _clone(oMap)
    }

    function retablirMapApresLongueVue(){
        oMap = _clone(oMapAvantLongueVue)
        majMap()
    }

    function activerLongueVue(){
        document.body.classList.add('longue-vue')
        fScaleZoomLongueVue=1.2
        memoMapAvantLongueVue()
        eEcran.style.transform = `scale(1.2)`
        sModeCam = 'longueVue'
        setMap({z:1825,rx:90})
        setMap({ajouter:true,y:-35})
    }

    function desactiverLongueVue(){
        document.body.classList.remove('longue-vue')
        fScaleZoomLongueVue=1
        setH({rz:-oMap.rz}) // WARNING il y a un moins
        retablirMapApresLongueVue()
        eEcran.style.transform = `scale(1)`
        sModeCam = 'poursuite'
    }

    function switchLongueVue(){

        if(sModeCam == 'poursuite') activerLongueVue()
        else if(sModeCam == 'longueVue') desactiverLongueVue()

    }

    function zoomerLongueVue(){
        if(fScaleZoomLongueVue >= 4) return
        fScaleZoomLongueVue+=0.02
        eEcran.style.transform = `scale(${fScaleZoomLongueVue})`
    }

    function dezoomerLongueVue(){
        if(fScaleZoomLongueVue < 1.2) return
        fScaleZoomLongueVue-=0.02
        eEcran.style.transform = `scale(${fScaleZoomLongueVue})`
    }

    function startAnimeSpriteH(){
        if(!bAnimeSpriteHExecute){
            setHSpriteX(1)
            chronoAnimeH = setInterval(x =>{
                nextHSpriteX()
            },defaut_oSpriteH.fq)
            bAnimeSpriteHExecute = true
        }
    }

    function stopAnimeSpriteH(){
        if(bAnimeSpriteHExecute){
            setHSpriteX(0)
            clearInterval(chronoAnimeH)
            bAnimeSpriteHExecute = false
        }
    }

    function tourneSpriteH(deg){
        switch (deg) {
            case 0         : setHSpriteY(defaut_oSpriteH.ligneDir.haut) ; break ;
            case 45         : setHSpriteY(defaut_oSpriteH.ligneDir.hautdroite) ; break ;
            case 90         : setHSpriteY(defaut_oSpriteH.ligneDir.droite) ; break ;
            case 135         : setHSpriteY(defaut_oSpriteH.ligneDir.basdroite) ; break ;
            case 180         : setHSpriteY(defaut_oSpriteH.ligneDir.bas) ; break ;
            case 225         : setHSpriteY(defaut_oSpriteH.ligneDir.basgauche) ; break ;
            case 270         : setHSpriteY(defaut_oSpriteH.ligneDir.gauche) ; break ;
            case 315         : setHSpriteY(defaut_oSpriteH.ligneDir.hautgauche) ; break ;
        }
    }

    function majRotateSpriteH(){
        let rotate = (oMap.rz+oH.rz)%360

        // console.log(rotate);


        switch (true) {
            default : setHSpriteY(defaut_oSpriteH.ligneDir.hautgauche) ; break ;
            case rotate<=22&&rotate<67 : setHSpriteY(defaut_oSpriteH.ligneDir.haut) ; break ;
            case rotate<=67&&rotate<112 : setHSpriteY(defaut_oSpriteH.ligneDir.hautdroite) ; break ;
            case rotate<=112&&rotate<157 : setHSpriteY(defaut_oSpriteH.ligneDir.droite) ; break ;
            case rotate<=157&&rotate<202 : setHSpriteY(defaut_oSpriteH.ligneDir.basdroite) ; break ;
            case rotate<=202&&rotate<247 : setHSpriteY(defaut_oSpriteH.ligneDir.bas) ; break ;
            case rotate<=247&&rotate<292 : setHSpriteY(defaut_oSpriteH.ligneDir.basgauche) ; break ;
            case rotate<=292&&rotate<337 : setHSpriteY(defaut_oSpriteH.ligneDir.gauche) ; break ;
        }

        // switch (true) {
        //     default : setHSpriteY(defaut_oSpriteH.ligneDir.haut) ; break ;
        //     case rotate<=22&&rotate<67 : setHSpriteY(defaut_oSpriteH.ligneDir.hautdroite) ; break ;
        //     case rotate<=67&&rotate<112 : setHSpriteY(defaut_oSpriteH.ligneDir.droite) ; break ;
        //     case rotate<=112&&rotate<157 : setHSpriteY(defaut_oSpriteH.ligneDir.basdroite) ; break ;
        //     case rotate<=157&&rotate<202 : setHSpriteY(defaut_oSpriteH.ligneDir.bas) ; break ;
        //     case rotate<=202&&rotate<247 : setHSpriteY(defaut_oSpriteH.ligneDir.basgauche) ; break ;
        //     case rotate<=247&&rotate<292 : setHSpriteY(defaut_oSpriteH.ligneDir.gauche) ; break ;
        //     case rotate<=292&&rotate<337 : setHSpriteY(defaut_oSpriteH.ligneDir.hautgauche) ; break ;
        // }
    }

    function decor({h=500,   x=0,y=0,z=0,   id=false,   name="sapinNoel",   petale=2,   bVerrouiller=true}={}){
        if(id===false) id=setIdHtmlUniq()
        petale = parseInt(petale)|0
        if(petale<1) petale=1
        if(petale>100) petale=100

        const oDecorCourant = oDecor[name]

        let w = parseInt((h*oDecorCourant.w)/oDecorCourant.h)|0 // le |0 permet d'avoir 0 si il y a problème (comme intval en PHP)

        let angle = 180/petale

        let w2 = parseInt(w/2)
        let h2 = parseInt(h/2)|0

        let eFondation = document.createElement('div')
        eFondation.id=id
        eFondation.classList.add('fondation-decor')
        if(bVerrouiller) eFondation.classList.add('decor-verrouillee')
        eMap.appendChild(eFondation)
        eFondation.setAttribute('style',`
        height: ${w}px;
        width: ${w}px;
        background-color: green;
        position: absolute;
        transform-style: preserve-3d;
        left : ${x-w2}px;
        top : ${y-w2}px;
        transform: translateZ(${z}px);
        `)

        for (let i = 0; i < petale; i++) {
            console.log(1);

            let ePetale = document.createElement('div')
            ePetale.id=`petale${i+1}`
            ePetale.classList.add('petale-decor')
            eFondation.appendChild(ePetale)
            ePetale.setAttribute('style',`
            height: ${h}px;
            width: ${w}px;
            /*background-color: blue;*/
            /*opacity:.3;*/
            position: absolute;
            transform-style: preserve-3d;
            left : 0px;
            top : 0px;
            transform: translateZ(${z+h2}px) translateY(${-(h-w)/2}px) rotateX(-90deg) rotateY(${i*angle}deg);
            background-image : url("images/decor/${oDecorCourant.bgi}");
            background-size : contain;
            background-repeat : no-repeat;
            background-position : center bottom;
            `)
        }


    }
    decor({petale:3,h:500,id:'id',x:-1000,bVerrouiller:true,name:"palmier"})


    // DEBUG
    let eCentreH = document.createElement('div')
    eCentreH.setAttribute('style',`
    width: 50px;
    height: 50px;
    background-color: red;
    position: absolute;
    left : 0px;
    top : 0px;
    `)
    eMap.appendChild(eCentreH)

    function tap(){

        bAnimeSpriteH = false

        if(bEspace) sauter()

        if(bE) remettreCamDerriereH()

        if(bAlternerLongueVue) {
            if(bAutorisationSwitchLongueVue){
                switchLongueVue()
                bAutorisationSwitchLongueVue = false
            }
        }

        let camcote = 1
        if(sModeCam == 'poursuite'){
            if(!bCameraImmobile) switch (degStickCamera) {
                case 0         : tourneCameraEnHaut(1) ; break ;
                case 45         : tourneCameraEnHaut(1) ; tourneCameraADroite(camcote) ; break ;
                case 90         : tourneCameraADroite(camcote) ; break ;
                case 135         : tourneCameraADroite(camcote) ; tourneCameraEnBas(1) ; break ;
                case 180         : tourneCameraEnBas(1) ; break ;
                case 225         : tourneCameraEnBas(1) ; tourneCameraAGauche(camcote) ; break ;
                case 270         : tourneCameraAGauche(camcote) ; break ;
                case 315         : tourneCameraEnHaut(1) ; tourneCameraAGauche(camcote) ; break ;
            }
        }else if(sModeCam == 'longueVue'){
            if(!bCameraImmobile) switch (degStickCamera) {
                case 0         : tourneCameraEnBas(1) ; break ;
                case 45         : tourneCameraEnBas(1) ; tourneCameraADroite(3) ; break ;
                case 90         : tourneCameraADroite(camcote) ; break ;
                case 135         : tourneCameraADroite(camcote) ; tourneCameraEnHaut(1) ; break ;
                case 180         : tourneCameraEnHaut(1) ; break ;
                case 225         : tourneCameraEnHaut(1) ; tourneCameraAGauche(camcote) ; break ;
                case 270         : tourneCameraAGauche(camcote) ; break ;
                case 315         : tourneCameraEnBas(1) ; tourneCameraAGauche(camcote) ; break ;
            }
        }

        let pasDroit = 6
        if(bRalentir && !bAccelere) pasDroit/=10
        else if(bAccelere && !bRalentir) pasDroit*=10
        // let pasDiagonal = Math.sin(45)*pasDroit

        if(sModeCam == 'poursuite'){
            if(degStickGo!==false&&degStickGo!==undefined){

                let bDeplacementXCourant = true
                let bDeplacementYCourant = true

                // console.log(degStickGo,oMap.rz,pasDroit);

                let deplacementXH
                let deplacementYH

                for (let x of aoRectangle) {

                    let deplacementXH2 = 0
                    let deplacementYH2 = 0

                    if(!bConfigBloquerCommande){
                        deplacementXH2 = Math.sin(deg2rad(degStickGo-oMap.rz))*pasDroit
                        deplacementYH2 = Math.cos(deg2rad(degStickGo-oMap.rz))*pasDroit
                    }

                    const carre = document.getElementById(x.id)

                    let bPassageXBefore = (true
                        && oH.x+largeurHitboxH>(parseInt(carre.style.left)|0)
                        && oH.x<(parseInt(carre.style.left)|0)+(parseInt(carre.style.width)|0)
                    )
                    let bPassageYBefore = (true
                        && oH.y+profondeurHitboxH>(parseInt(carre.style.top)|0)
                        && oH.y<(parseInt(carre.style.height)|0)+(parseInt(carre.style.top)|0)
                    )
                    let bCollisionXBefore = bPassageXBefore // DEBUG pour l'instant, après on gèrera l'altitude avec les sauts etc.
                    let bCollisionYBefore = bPassageYBefore // DEBUG pour l'instant, après on gèrera l'altitude avec les sauts etc.

                    let bPassageXAfter = (true
                        && oH.x+Math.sin(deg2rad(degStickGo-oMap.rz))*pasDroit+largeurHitboxH>(parseInt(carre.style.left)|0)
                        && oH.x+Math.sin(deg2rad(degStickGo-oMap.rz))*pasDroit<(parseInt(carre.style.left)|0)+(parseInt(carre.style.width)|0)
                    )
                    let bPassageYAfter = (true
                        && oH.y-Math.cos(deg2rad(degStickGo-oMap.rz))*pasDroit+profondeurHitboxH>(parseInt(carre.style.top)|0)
                        && oH.y-Math.cos(deg2rad(degStickGo-oMap.rz))*pasDroit<(parseInt(carre.style.height)|0)+(parseInt(carre.style.top)|0)
                    )


                    // TAPIS ROULANT

                    let vitesseTapis = oTapis.vitesse
                    let angleTapis = oTapis.angle

                    let deplacementXTapis = Math.sin(deg2rad(angleTapis))*vitesseTapis
                    let deplacementYTapis = Math.cos(deg2rad(angleTapis))*vitesseTapis


                    let tmp = deplacementXH2
                    deplacementXH2 += deplacementXTapis
                    deplacementYH2 += deplacementYTapis

                    deplacementXH = deplacementXH2
                    deplacementYH = deplacementYH2

                    bPassageXAfter = (true
                        && oH.x+deplacementXH2+largeurHitboxH>(parseInt(carre.style.left)|0)
                        && oH.x+deplacementXH2<(parseInt(carre.style.left)|0)+(parseInt(carre.style.width)|0)
                    )
                    bPassageYAfter = (true
                        && oH.y-deplacementYH2+profondeurHitboxH>(parseInt(carre.style.top)|0)
                        && oH.y-deplacementYH2<(parseInt(carre.style.height)|0)+(parseInt(carre.style.top)|0)
                    )



                    let bCollisionXAfter = bPassageXAfter // DEBUG pour l'instant, après on gèrera l'altitude avec les sauts etc.
                    let bCollisionYAfter = bPassageYAfter // DEBUG pour l'instant, après on gèrera l'altitude avec les sauts etc.

                    switch (x.type) {
                        case 0:
                            if(bCollisionXBefore&&!bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                bDeplacementYCourant = false
                            }else if(!bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                bDeplacementXCourant = false
                            }
                            break;
                        case 1:
                            if(bCollisionXAfter&&bCollisionYAfter&&((bCollisionXBefore&&!bCollisionYBefore)||(!bCollisionXBefore&&bCollisionYBefore))){
                                oTapis.vitesse = pasDroit
                                oTapis.angle = oH.rz
                                bDirFixe = true
                                bConfigBloquerCommande = true
                                bCameraImmobile = true
                            }
                            if(bCollisionXBefore&&bCollisionYBefore&&!bCollisionXAfter&&bCollisionYAfter){
                                oTapis.vitesse = 0
                                bConfigBloquerCommande = false
                                bCameraImmobile = false
                                bDirFixe = false
                            }else if(bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&!bCollisionYAfter){
                                oTapis.vitesse = 0
                                bConfigBloquerCommande = false
                                bCameraImmobile = false
                                bDirFixe = false
                            }
                            break;
                        case 2: //BOUE
                            if(bCollisionXBefore&&!bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH(false,"genoux")

                            }else if(!bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH(false,"genoux")
                            }

                            if(bCollisionXBefore&&bCollisionYBefore&&!bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH(false,"pieds")

                            }else if(bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&!bCollisionYAfter){
                                changerSpriteH(false,"pieds")
                            }
                            if(bCollisionXBefore && bCollisionYBefore){
                                pasDroit=pasDroit/3
                            }
                            break;
                        case 3:
                            if(bCollisionXBefore&&!bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                oTapis.vitesse = x.vitesse
                                oTapis.angle = x.angle
                            }else if(!bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                oTapis.vitesse = x.vitesse
                                oTapis.angle = x.angle
                            }

                            if(bCollisionXBefore&&bCollisionYBefore&&!bCollisionXAfter&&bCollisionYAfter){
                                oTapis.vitesse = 0

                            }else if(bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&!bCollisionYAfter){
                                oTapis.vitesse = 0
                            }

                            break;
                        case 4: //METAMORPHOSE
                            if(bCollisionXBefore&&!bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH("rpgmkxp03","genoux")

                            }else if(!bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH("rpgmkxp03","genoux")
                            }

                            if(bCollisionXBefore&&bCollisionYBefore&&!bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH("stella","pieds")

                            }else if(bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&!bCollisionYAfter){
                                changerSpriteH("stella","pieds")
                            }
                            break;
                        case 5: //eau
                            if(bCollisionXBefore&&!bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH(false,"epaules")

                            }else if(!bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH(false,"epaules")
                            }

                            if(bCollisionXBefore&&bCollisionYBefore&&!bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH(false,"pieds")

                            }else if(bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&!bCollisionYAfter){
                                changerSpriteH(false,"pieds")
                            }
                            if(bCollisionXBefore && bCollisionYBefore){
                                pasDroit=pasDroit/3
                            }
                            break;
                        case 6: //eau-courant
                            if(bCollisionXBefore&&!bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH(false,"epaules")
                                oTapis.vitesse = x.vitesse
                                oTapis.angle = x.angle

                            }else if(!bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH(false,"epaules")
                                oTapis.vitesse = x.vitesse
                                oTapis.angle = x.angle
                            }

                            if(bCollisionXBefore&&bCollisionYBefore&&!bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH(false,"pieds")
                                oTapis.vitesse = 0

                            }else if(bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&!bCollisionYAfter){
                                changerSpriteH(false,"pieds")
                                oTapis.vitesse = 0
                            }
                            if(bCollisionXBefore && bCollisionYBefore){
                                pasDroit=pasDroit/3
                            }
                            break;
                        case 7: //LAVE
                            if(bCollisionXAfter && bCollisionYAfter){
                                console.log("GAME OVER");
                            }
                            break;
                    }
                }


                // for (let x of aoEllipse) {

                    // {id,diametreX,diametreY,x,y,bgc,_iTypeTerrain}={}
                    //
                    //
                    // /// MANU DEBUT
                    // let diametreXvue
                    // let diametreYvue
                    // let diametreXcalcul
                    // let diametreYcalcul
                    // let left
                    // let top
                    // let centreX
                    // let centreY
                    // let rayonX
                    // let rayonY
                    // //
                    // //css
                    // left = x
                    // top = y
                    // diametreXvue = diametreX
                    // diametreYvue = diametreY
                    //
                    // //js
                    // diametreXcalcul = diametreXvue + wPourCollisions
                    // diametreYcalcul = diametreYvue + pHHitbox
                    // rayonX = diametreXcalcul/2
                    // rayonY = diametreYcalcul/2
                    // centreX = left + rayonX
                    // centreY = top + rayonY
                    //
                    // let bPassageZoneXcourant = ((((oH.x-pasX+wPourCollisions-centreX)**2)/rayonX**2)+(((oH.y-centreY+pHHitbox)**2)/rayonY**2)) <=1
                    // let bPassageZoneYcourant = ((((oH.x+wPourCollisions-centreX)**2)/rayonX**2)+(((oH.y-centreY-pasY+pHHitbox)**2)/rayonY**2)) <=1
                    //
                    // let bCollisionXcourant = altPlateau==0 && bPassageZoneXcourant
                    // let bCollisionYcourant = altPlateau==0 && bPassageZoneYcourant
                    // //
                    // if(bCollisionXcourant || bCollisionYcourant) iTypeTerrain = _iTypeTerrain
                    /// MANU FIN

                    // const carre = document.getElementById("test")

                    for (let x of aoEllipse) {

                        // const carre = document.getElementById("test")
                        const ellipse = document.getElementById(x.id)

                        // const ellipseImaginaire = document.getElementById("calculVue")

                        // let bPassageXBefore = (true
                        //     && oH.x+largeurHitboxH>(parseInt(ellipse.style.left)|0)
                        //     && oH.x<(parseInt(ellipse.style.left)|0)+(parseInt(ellipse.style.width)|0)
                        // )

                        let pasX = Math.sin(deg2rad(degStickGo-oMap.rz))*pasDroit
                        let pasY = Math.cos(deg2rad(degStickGo-oMap.rz))*pasDroit

                        let left = parseInt(ellipse.style.left)|0
                        let top =  parseInt(ellipse.style.top)|0

                        let diametreXVue = parseInt(ellipse.style.width)|0 // petite élipse
                        let diametreYVue = parseInt(ellipse.style.height)|0 // petite élipse
                        let rayonXVue = diametreXVue/2
                        let rayonYVue = diametreYVue/2
                        let centreXElipsseVue = left + rayonXVue
                        let centreYElipsseVue = top + rayonYVue
                        let diametreXCalcul = diametreXVue+profondeurHitboxH //grande élipse
                        let diametreYCalcul = diametreYVue+largeurHitboxH //grande élipse
                        let rayonXCalcul = diametreXCalcul/2
                        let rayonYCalcul = diametreYCalcul/2
                        let centreXH = oH.x+largeurHitboxH2
                        let centreYH = oH.y+profondeurHitboxH2

                        // ellipseImaginaire.setAttribute('style',`
                        //     background-color:purple;
                        //     top:${top}px;
                        //     left:${left}px;
                        //     width:${diametreXCalcul}px;
                        //     height:${diametreYCalcul}px;
                        // `)

                        // ellipseImaginaire.setAttribute('style',`
                        // width: ${diametreXCalcul}px;
                        // height: ${diametreYCalcul}px;
                        // background-color: purple;
                        // position: absolute;
                        // left : ${left-((diametreXCalcul-diametreXVue)/2)}px;
                        // top : ${top-((diametreYCalcul-diametreYVue)/2)}px;
                        // border-radius: 50%;
                        // opacity:.5;
                        // `)

                        eCentreH.setAttribute('style',`
                        width: 50px;
                        height: 50px;
                        background-color: red;
                        position: absolute;
                        left : ${centreXH}px;
                        top : ${centreYH}px;
                        `)

                        // let bPassageZoneCourantX = (((centreXH+pasX)-centreXElipsseVue)**2/rayonXCalcul**2)
                        // let bPassageZoneCourantY = (((centreYH+pasY)-centreYElipsseVue)**2/rayonYCalcul**2)
                        // let bPassageZoneCourant = bPassageZoneCourantX + bPassageZoneCourantY <=1

                        let bPassageZoneCourantXAfter = (((centreXH+pasX)-centreXElipsseVue)**2/rayonXCalcul**2) + (((centreYH)-centreYElipsseVue)**2/rayonYCalcul**2) <= 1
                        let bPassageZoneCourantYAfter = (((centreXH)-centreXElipsseVue)**2/rayonXCalcul**2) + (((centreYH+pasY)-centreYElipsseVue)**2/rayonYCalcul**2) <= 1

                        let bPassageZoneCourantAfter = (((centreXH+pasX)-centreXElipsseVue)**2/rayonXCalcul**2) + (((centreYH-pasY)-centreYElipsseVue)**2/rayonYCalcul**2) <= 1 // WARNING: - de manu


                        let bPassageZoneCourantXBefore = (((centreXH)-centreXElipsseVue)**2/rayonXCalcul**2) + (((centreYH)-centreYElipsseVue)**2/rayonYCalcul**2) <= 1
                        let bPassageZoneCourantYBefore = (((centreXH)-centreXElipsseVue)**2/rayonXCalcul**2) + (((centreYH)-centreYElipsseVue)**2/rayonYCalcul**2) <= 1

                        if(!bPassageZoneCourantXBefore&&!bPassageZoneCourantYBefore&&bPassageZoneCourantXAfter){
                            // console.log('a');
                            bDeplacementXCourant = false
                        }

                        if(bPassageZoneCourantXBefore&&bPassageZoneCourantYBefore&&!bPassageZoneCourantYAfter){
                            // console.log('b');
                            bDeplacementYCourant = false
                        }

                        if(bPassageZoneCourantYAfter&&bPassageZoneCourantXAfter){
                            bDeplacementXCourant = false
                            bDeplacementYCourant = false
                        }

                        if(bPassageZoneCourantAfter){
                            bDeplacementXCourant = false
                            bDeplacementYCourant = false
                        }

                    }








                    // if(bPassageZoneCourantXBefore&&bPassageZoneCourantYBefore&&(bPassageZoneCourantXAfter||bPassageZoneCourantYAfter)){
                    //     bDeplacementXCourant = true
                    //     bDeplacementYCourant = true
                    // }

                    // console.log('left = '+left, 'top = '+top, 'diametreX = '+diametreX, 'diametreY = '+diametreY, 'rayonX = '+rayonX, 'rayonY = '+rayonY, 'centreX = '+centreX, 'centreY = '+centreY, 'centreXH = ' + oH.x, 'centreYH = ' + oH.y)

                    // let bPassageZoneXcourant = ((((oH.x-pasX+diametreX-centreX)**2)/rayonX**2)+(((oH.y-centreY+profondeurHitboxH)**2)/rayonY**2)) <=1
                    // let bPassageZoneYcourant = ((((oH.x+diametreX-centreX)**2)/rayonX**2)+(((oH.y-centreY-pasY+profondeurHitboxH)**2)/rayonY**2)) <=1

                    // let bPassageZoneXcourant = (oH.x-centreX)**2/rayonX**2  +  (oH.y-centreY)**2/rayonY**2
                    // let bPassageZoneYcourant = ((((oH.x+diametreX-centreX)**2)/rayonX**2)+(((oH.y-centreY-pasY+profondeurHitboxH)**2)/rayonY**2)) <=1

                    // console.log(bPassageZoneXcourant,bPassageZoneYcourant);
                    // console.log(bPassageZoneCourant);
                    // (x-centreX)²/Rx²  +  (y-centreY)²/Ry² = 1



                    // let bPassageYBefore = (true
                    //     && oH.y+profondeurHitboxH>(parseInt(ellipse.style.top)|0)
                    //     && oH.y<(parseInt(ellipse.style.height)|0)+(parseInt(ellipse.style.top)|0)
                    // )
                    // let bCollisionXBefore = bPassageXBefore // DEBUG pour l'instant, après on gèrera l'altitude avec les sautes etc.
                    // let bCollisionYBefore = bPassageYBefore // DEBUG pour l'instant, après on gèrera l'altitude avec les sautes etc.
                    //
                    // let bPassageXAfter = (true
                    //     && oH.x+Math.sin(deg2rad(degStickGo-oMap.rz))*pasDroit+largeurHitboxH>(parseInt(ellipse.style.left)|0)
                    //     && oH.x+Math.sin(deg2rad(degStickGo-oMap.rz))*pasDroit<(parseInt(ellipse.style.left)|0)+(parseInt(ellipse.style.width)|0)
                    // )
                    // let bPassageYAfter = (true
                    //     && oH.y-Math.cos(deg2rad(degStickGo-oMap.rz))*pasDroit+profondeurHitboxH>(parseInt(ellipse.style.top)|0)
                    //     && oH.y-Math.cos(deg2rad(degStickGo-oMap.rz))*pasDroit<(parseInt(ellipse.style.height)|0)+(parseInt(ellipse.style.top)|0)
                    // )
                    // let bCollisionXAfter = bPassageXAfter // DEBUG pour l'instant, après on gèrera l'altitude avec les sautes etc.
                    // let bCollisionYAfter = bPassageYAfter // DEBUG pour l'instant, après on gèrera l'altitude avec les sautes etc.


                // }

                ////// ELLIPSE : (x-centreX)²/Rx²  +  (y-centreY)²/Ry² = 1
                ////// pour mémoire ((((oH.x-centreX)**2)/rayonX**2)+(((oH.y-centreY)**2)/rayonY**2)) <=1

                // deplacementXH2
                // deplacementYH2

                // if(!bConfigBloquerCommande){
                    if(bDeplacementXCourant){
                        setH({ajouter:true, x:deplacementXH});
                        setMap({ajouter:true, x:-deplacementXH, ox:deplacementXH})
                    }
                    if(bDeplacementYCourant){
                        setH({ajouter:true, y:-deplacementYH});
                        setMap({ajouter:true, y:deplacementYH , oy:-deplacementYH})
                    }
                // }








                // deplacerHCooPolaire(degStickGo,pasDroit)
                // deplacerMapCooPolaire(degStickGo,pasDroit)
                definirRotationHeros(degStickGo)
            }else{

                // let vitesseTapis = oTapis.vitesse
                // let angleTapis = oTapis.angle
                //
                // let bDeplacementXCourant = true
                // let bDeplacementYCourant = true
                //
                // let deplacementXH = Math.sin(deg2rad(angleTapis))*vitesseTapis
                // let deplacementYH = Math.cos(deg2rad(angleTapis))*vitesseTapis
                //
                // for (let x of aoRectangle) {
                //
                //         // const x = {w:600,p:750,bgc:'blue',  x:-1400,y:800,z:0, id:"tests", type:0}
                //
                //         const carre = document.getElementById(x.id)
                //
                //
                //         let bPassageXBefore = (true
                //             && oH.x+largeurHitboxH>(parseInt(carre.style.left)|0)
                //             && oH.x<(parseInt(carre.style.left)|0)+(parseInt(carre.style.width)|0)
                //         )
                //         let bPassageYBefore = (true
                //             && oH.y+profondeurHitboxH>(parseInt(carre.style.top)|0)
                //             && oH.y<(parseInt(carre.style.height)|0)+(parseInt(carre.style.top)|0)
                //         )
                //         let bCollisionXBefore = bPassageXBefore // DEBUG pour l'instant, après on gèrera l'altitude avec les sauts etc.
                //         let bCollisionYBefore = bPassageYBefore // DEBUG pour l'instant, après on gèrera l'altitude avec les sauts etc.
                //
                //         let bPassageXAfter = (true
                //             && oH.x+deplacementXH+largeurHitboxH>(parseInt(carre.style.left)|0)
                //             && oH.x+deplacementXH<(parseInt(carre.style.left)|0)+(parseInt(carre.style.width)|0)
                //         )
                //         let bPassageYAfter = (true
                //             && oH.y-deplacementYH+profondeurHitboxH>(parseInt(carre.style.top)|0)
                //             && oH.y-deplacementYH<(parseInt(carre.style.height)|0)+(parseInt(carre.style.top)|0)
                //         )
                //
                //         let bCollisionXAfter = bPassageXAfter // DEBUG pour l'instant, après on gèrera l'altitude avec les sauts etc.
                //         let bCollisionYAfter = bPassageYAfter // DEBUG pour l'instant, après on gèrera l'altitude avec les sauts etc.
                //
                //         // console.log(bCollisionXBefore,bCollisionYBefore,bCollisionXAfter,bCollisionYAfter);
                //
                //         switch (x.type) {
                //             case 0:
                //                 if(bCollisionXBefore&&!bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                //                     bDeplacementYCourant = false
                //                 }else if(!bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                //                     bDeplacementXCourant = false
                //                 }
                //                 break;
                //             case 2: //BOUE
                //                 if(bCollisionXBefore&&!bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                //                     changerSpriteH(false,"genoux")
                //
                //                 }else if(!bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                //                     changerSpriteH(false,"genoux")
                //                 }
                //
                //                 if(bCollisionXBefore&&bCollisionYBefore&&!bCollisionXAfter&&bCollisionYAfter){
                //                     changerSpriteH(false,"pieds")
                //
                //                 }else if(bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&!bCollisionYAfter){
                //                     changerSpriteH(false,"pieds")
                //                 }
                //                 if(bCollisionXBefore && bCollisionYBefore){
                //                     pasDroit=pasDroit/3
                //                 }
                //                 break;
                //             case 3:
                //                 console.log(bCollisionXBefore,bCollisionYBefore,bCollisionXAfter,bCollisionYAfter);
                //
                //                 if(bCollisionXBefore&&!bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                //                     oTapis.vitesse = x.vitesse
                //                     oTapis.angle = x.angle
                //
                //                 }else if(!bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                //                     oTapis.vitesse = x.vitesse
                //                     oTapis.angle = x.angle
                //                 }
                //
                //                 if(bCollisionXBefore&&bCollisionYBefore&&!bCollisionXAfter&&bCollisionYAfter){
                //                     oTapis.vitesse = 0
                //
                //                 }else if(bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&!bCollisionYAfter){
                //                     oTapis.vitesse = 0
                //                 }
                //
                //                 break;
                //             case 4: //METAMORPHOSE
                //                 if(bCollisionXBefore&&!bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                //                     changerSpriteH("rpgmkxp03","genoux")
                //
                //                 }else if(!bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                //                     changerSpriteH("rpgmkxp03","genoux")
                //                 }
                //
                //                 if(bCollisionXBefore&&bCollisionYBefore&&!bCollisionXAfter&&bCollisionYAfter){
                //                     changerSpriteH("stella","pieds")
                //
                //                 }else if(bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&!bCollisionYAfter){
                //                     changerSpriteH("stella","pieds")
                //                 }
                //                 break;
                //             case 7: //LAVE
                //                 if(bCollisionXAfter && bCollisionYAfter){
                //                     console.log("GAME OVER");
                //                 }
                //                 break;
                //
                //         }
                //
                //
                //
                // }
                //
                // let deplacementXTapis = Math.sin(deg2rad(angleTapis))*vitesseTapis
                // let deplacementYTapis = Math.cos(deg2rad(angleTapis))*vitesseTapis
                //
                // deplacementXH += deplacementXTapis
                // deplacementYH += deplacementYTapis


                let bDeplacementXCourant = true
                let bDeplacementYCourant = true

                var deplacementXH
                var deplacementYH


                for (let x of aoRectangle) {

                    var deplacementXH2 = 0
                    var deplacementYH2 = 0

                    const carre = document.getElementById(x.id)

                    let bPassageXBefore = (true
                        && oH.x+largeurHitboxH>(parseInt(carre.style.left)|0)
                        && oH.x<(parseInt(carre.style.left)|0)+(parseInt(carre.style.width)|0)
                    )
                    let bPassageYBefore = (true
                        && oH.y+profondeurHitboxH>(parseInt(carre.style.top)|0)
                        && oH.y<(parseInt(carre.style.height)|0)+(parseInt(carre.style.top)|0)
                    )
                    let bCollisionXBefore = bPassageXBefore // DEBUG pour l'instant, après on gèrera l'altitude avec les sauts etc.
                    let bCollisionYBefore = bPassageYBefore // DEBUG pour l'instant, après on gèrera l'altitude avec les sauts etc.

                    // TAPIS ROULANT

                    let vitesseTapis = oTapis.vitesse
                    let angleTapis = oTapis.angle

                    let deplacementXTapis = Math.sin(deg2rad(angleTapis))*vitesseTapis
                    let deplacementYTapis = Math.cos(deg2rad(angleTapis))*vitesseTapis


                    let tmp = deplacementXH2
                    deplacementXH2 += deplacementXTapis
                    deplacementYH2 += deplacementYTapis

                    deplacementXH = deplacementXH2
                    deplacementYH = deplacementYH2

                    bPassageXAfter = (true
                        && oH.x+deplacementXH2+largeurHitboxH>(parseInt(carre.style.left)|0)
                        && oH.x+deplacementXH2<(parseInt(carre.style.left)|0)+(parseInt(carre.style.width)|0)
                    )
                    bPassageYAfter = (true
                        && oH.y-deplacementYH2+profondeurHitboxH>(parseInt(carre.style.top)|0)
                        && oH.y-deplacementYH2<(parseInt(carre.style.height)|0)+(parseInt(carre.style.top)|0)
                    )

                    let bCollisionXAfter = bPassageXAfter // DEBUG pour l'instant, après on gèrera l'altitude avec les sauts etc.
                    let bCollisionYAfter = bPassageYAfter // DEBUG pour l'instant, après on gèrera l'altitude avec les sauts etc.

                    var tmpX = false
                    var tmpY = false

                    switch (x.type) {
                        case 0:
                            if(bCollisionXBefore&&!bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                bDeplacementYCourant = false
                            }else if(!bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                bDeplacementXCourant = false
                            }
                            break;
                        case 1:
                            if(bCollisionXBefore&&!bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                bDirFixe = true
                                bConfigBloquerCommande = true
                                bCameraImmobile = true
                                oTapis.vitesse = pasDroit
                                oTapis.angle = oH.rz

                            }else if(!bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                bDirFixe = true
                                bConfigBloquerCommande = true
                                bCameraImmobile = true
                                oTapis.vitesse = pasDroit
                                oTapis.angle = oH.rz
                            }
                            if(bCollisionXBefore&&bCollisionYBefore&&!bCollisionXAfter&&bCollisionYAfter){
                                oTapis.vitesse = 0
                                bConfigBloquerCommande = false
                                bCameraImmobile = false
                                bDirFixe = false
                            }else if(bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&!bCollisionYAfter){
                                oTapis.vitesse = 0
                                bConfigBloquerCommande = false
                                bCameraImmobile = false
                                bDirFixe = false
                            }
                            break;
                        case 2: //BOUE
                            if(bCollisionXBefore&&!bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH(false,"genoux")

                            }else if(!bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH(false,"genoux")
                            }

                            if(bCollisionXBefore&&bCollisionYBefore&&!bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH(false,"pieds")

                            }else if(bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&!bCollisionYAfter){
                                changerSpriteH(false,"pieds")
                            }
                            if(bCollisionXBefore && bCollisionYBefore){
                                pasDroit=pasDroit/3
                            }
                            break;
                        case 3:
                            if(bCollisionXBefore&&!bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                oTapis.vitesse = x.vitesse
                                oTapis.angle = x.angle

                            }else if(!bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                oTapis.vitesse = x.vitesse
                                oTapis.angle = x.angle
                            }

                            if(bCollisionXBefore&&bCollisionYBefore&&!bCollisionXAfter&&bCollisionYAfter){
                                oTapis.vitesse = 0
                                tmpX = true
                            }else if(bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&!bCollisionYAfter){
                                oTapis.vitesse = 0
                                tmpY = true
                            }

                            break;
                        case 4: //METAMORPHOSE
                            if(bCollisionXBefore&&!bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH("rpgmkxp03","genoux")

                            }else if(!bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH("rpgmkxp03","genoux")
                            }

                            if(bCollisionXBefore&&bCollisionYBefore&&!bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH("stella","pieds")

                            }else if(bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&!bCollisionYAfter){
                                changerSpriteH("stella","pieds")
                            }
                            break;
                        case 5: //eau
                            if(bCollisionXBefore&&!bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH(false,"epaules")

                            }else if(!bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH(false,"epaules")
                            }

                            if(bCollisionXBefore&&bCollisionYBefore&&!bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH(false,"pieds")

                            }else if(bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&!bCollisionYAfter){
                                changerSpriteH(false,"pieds")
                            }
                            if(bCollisionXBefore && bCollisionYBefore){
                                pasDroit=pasDroit/3
                            }
                            break;
                        case 6: //eau-courant
                            if(bCollisionXBefore&&!bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH(false,"epaules")
                                oTapis.vitesse = x.vitesse
                                oTapis.angle = x.angle

                            }else if(!bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH(false,"epaules")
                                oTapis.vitesse = x.vitesse
                                oTapis.angle = x.angle
                            }

                            if(bCollisionXBefore&&bCollisionYBefore&&!bCollisionXAfter&&bCollisionYAfter){
                                changerSpriteH(false,"pieds")
                                oTapis.vitesse = 0

                            }else if(bCollisionXBefore&&bCollisionYBefore&&bCollisionXAfter&&!bCollisionYAfter){
                                changerSpriteH(false,"pieds")
                                oTapis.vitesse = 0
                            }
                            if(bCollisionXBefore && bCollisionYBefore){
                                pasDroit=pasDroit/3
                            }
                            break;
                        case 7: //LAVE
                            if(bCollisionXAfter && bCollisionYAfter){
                                console.log("GAME OVER");
                            }
                            break;

                    }
                    // console.log(tmpX);

                    if(tmpX) deplacementXH+=vitesseTapis
                    if(tmpY) deplacementYH+=vitesseTapis

                    // deplacementXH += tmpX
                    // deplacementYH += tmpY
                    // console.log(deplacementXH);

                }

                // console.log(deplacementXH);


                if(bDeplacementXCourant){
                    setH({ajouter:true, x:deplacementXH});
                    setMap({ajouter:true, x:-deplacementXH, ox:deplacementXH})
                }
                if(bDeplacementYCourant){
                    setH({ajouter:true, y:-deplacementYH});
                    setMap({ajouter:true, y:deplacementYH , oy:-deplacementYH})
                }

            }














            tourneSpriteH(degStickGo)
            majRotateSpriteH()
            bAnimeSpriteH = degStickGo!==false&&degStickGo!==undefined

        }else if(sModeCam == 'longueVue'){
            if(bZ && bS) return
            if(bZ) zoomerLongueVue()
            if(bS) dezoomerLongueVue()
        }
        // switch (degStickGo) {deplacerMapCooPolaire
        //     case 0         : deplacerEnHautH(pasDroit) ; deplacerEnBasMap(pasDroit) ; definirRotationHeros(degStickGo) ; break ;
        //     case 45         : deplacerEnHautH(pasDiagonal); deplacerADroiteH(pasDiagonal) ; deplacerEnBasMap(pasDiagonal); deplacerAGaucheMap(pasDiagonal) ; definirRotationHeros(degStickGo) ; break ;
        //     case 90         : deplacerADroiteH(pasDroit) ; deplacerAGaucheMap(pasDroit) ; definirRotationHeros(degStickGo) ; break ;
        //     case 135         : deplacerADroiteH(pasDiagonal); deplacerEnBasH(pasDiagonal) ; deplacerEnHautMap(pasDiagonal); deplacerAGaucheMap(pasDiagonal) ; definirRotationHeros(degStickGo) ; break ;
        //     case 180         : deplacerEnBasH(pasDroit) ; deplacerEnHautMap(pasDroit) ; definirRotationHeros(degStickGo) ; break ;
        //     case 225         : deplacerEnBasH(pasDiagonal); deplacerAGaucheH(pasDiagonal) ; deplacerEnHautMap(pasDiagonal); deplacerADroiteMap(pasDiagonal) ; definirRotationHeros(degStickGo) ; break ;
        //     case 270         : deplacerAGaucheH(pasDroit) ; deplacerADroiteMap(pasDroit) ; definirRotationHeros(degStickGo) ; break ;
        //     case 315         : deplacerAGaucheH(pasDiagonal); deplacerEnHautH(pasDiagonal) ; deplacerEnBasMap(pasDiagonal); deplacerADroiteMap(pasDiagonal) ; definirRotationHeros(degStickGo) ; break ;
        // }


        // if(bZ && bD) degStickGo=45
        // if(bD && bS) degStickGo=135
        // if(bS && bQ) degStickGo=225
        // if(bQ && bZ) degStickGo=315


        if(!bConfigAnimeArret){
            if(bConfigAnimeDeplacement){
                if(bAnimeSpriteH){
                    startAnimeSpriteH()
                }else{
                    stopAnimeSpriteH()
                }
            }
        }



    }

// setTimeout(function(){
//     oTapis.vitesse = 6
// }, 2000)


</script>
