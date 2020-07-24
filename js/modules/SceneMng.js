import Common from "./Common";
import * as THREE from "three";


export default class SceneMng{
    constructor(){
        this.scene = null;
        this.camera = null;

        this.init();
    }

    init(){
        this.scene = new THREE.Scene();

        this.fov = 20;

        this.camera = new THREE.PerspectiveCamera(this.fov, Common.width / Common.height, 0.1, 4000);

        this.camera.position.set(0, 0, 1800);
        this.camera.lookAt(this.scene.position);

    }
    addScene(mesh){
        this.scene.add(mesh);
    }

    resize(){
        this.camera.aspect = Common.width / Common.height;
        this.camera.updateProjectionMatrix();
    }

    render(){
        Common.renderer.setClearColor( 0xffffff, 1.0 );
        Common.renderer.setRenderTarget(null);
        Common.renderer.render(this.scene, this.camera);
    }

    update(){
        this.render();
    }
}