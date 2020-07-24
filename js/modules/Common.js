import * as THREE from "three";

class Common{
    constructor(){
        this.width = null;
        this.height = null;
        this.aspect = this.width / this.height;
        this.isMobile = false;
        this.breakpoint = 768;

        this.fboWidth = null;
        this.fboHeight = null;

        this.resizeFunc = this.resize.bind(this);

        this.time = 0;
        this.delta = 0;

    }

    init(){
        EventBus.on("RESIZE", this.resizeFunc);
        
        this.pixelRatio = window.devicePixelRatio;

        this.fboRatio = Math.min(2, this.pixelRatio); //fboのスケール
        

        this.resize();

        this.renderer = new THREE.WebGLRenderer( {
            antialias: true,
            alpha: true,
        });

        this.renderer.autoClear = false;

        this.renderer.setSize( this.width, this.height );

        this.renderer.setClearColor( 0xffffff );

        this.renderer.setPixelRatio(this.pixelRatio);

        this.clock = new THREE.Clock();
        this.clock.start();
     }

    resize(){
        this.width = window.innerWidth; // document.body.clientWidth;
        this.height = window.innerHeight;
        this.aspect = this.width / this.height;

        this.fboWidth = this.width * this.fboRatio;
        this.fboHeight = this.height * this.fboRatio;

        this.isMobile = (this.width <= this.breakpoint);

        if(this.renderer) this.renderer.setSize(this.width, this.height);
    }

    update(){
        this.delta = this.clock.getDelta(); // Math.min(0.01, this.clock.getDelta());
        this.time += this.delta;
    }
}

export default new Common();