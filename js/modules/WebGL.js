// import * as THREE from "three";
import Common from "./Common";
import SceneMng from "./SceneMng";
import Reflect2 from "./Reflect2";
import Mouse from "./Mouse";

export default class Webgl{
    constructor(props){
        this.props = props;

        Common.init();
        Mouse.init();
        Reflect2.init();

        this.init();
        this.loop();

        window.addEventListener("resize", this.resize.bind(this));
    }

    init(){
        this.props.$wrapper.prepend(Common.renderer.domElement);

        const domStyle = Common.renderer.domElement.style;
        domStyle.position = "fixed";
        domStyle.top = "0";
        domStyle.left = "0";
        domStyle.width = "100%";

        this.sceneMng = new SceneMng();

        // debug
        this.sceneMng.addScene(Reflect2.getOutputMesh());
    }

    resize(){
        Common.resize();
        this.sceneMng.resize();
        Reflect2.resize();
    }

    render(){
        Common.update();
        Reflect2.update();
        this.sceneMng.update();
    }

    loop(){
        this.render();
        requestAnimationFrame(this.loop.bind(this));
    }
}