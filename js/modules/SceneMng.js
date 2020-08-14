import Common from "./Common";
import * as THREE from "three";

import Simulation from "./Simulation";
import face_vert from "./glsl/sim/face.vert";


export default class SceneMng{
    constructor(){
        this.init();
    }

    init(){
        this.simulation = new Simulation();

        this.scene = new THREE.Scene();

        this.fov = 20;

        this.camera = new THREE.PerspectiveCamera(this.fov, Common.width / Common.height, 0.1, 4000);

        this.camera.position.set(0, 0, 1800);
        this.camera.lookAt(this.scene.position);

        // this.fbo = this.simulation.output_fbo;

        this.output = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(2, 2),
            new THREE.RawShaderMaterial({
                vertexShader: face_vert,
                fragmentShader: `
                precision highp float;
                uniform sampler2D map;
                varying vec2 uv;

                void main(){
                    vec3 rgb = texture2D(map, uv).rgb;
                    gl_FragColor = vec4(rgb, 1.0);
                }
                `,
                uniforms: {
                    map: {
                        value: this.simulation.fbos.output.texture
                    }
                },
                depthWrite: false
            })
        );

        this.scene.add(this.output);

    }
    addScene(mesh){
        this.scene.add(mesh);
    }

    resize(){
        this.simulation.resize();

        this.camera.aspect = Common.width / Common.height;
        this.camera.updateProjectionMatrix();
    }

    render(){
        // Common.renderer.setClearColor( 0xffffff, 1.0 );
        Common.renderer.setRenderTarget(null);
        Common.renderer.render(this.scene, this.camera);
    }

    update(){
        this.simulation.update();
        this.render();
    }
}