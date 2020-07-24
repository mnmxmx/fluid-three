import Simulation from "./Simulation";
import kernel_vert from "./glsl/sim/kernel.vert";
// import visualize_frag from "./glsl/sim/visualize.frag";
import * as THREE from "three";


class Reflect2{
    constructor(){
        this.simulation = new Simulation();
    }

    init(){
        this.simulation.init();

        // console.log(this.simulation.px);

        this.fbo = this.simulation.output_fbo;

        this.output = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(2, 2),
            new THREE.RawShaderMaterial({
                vertexShader: kernel_vert,
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
                        value: this.simulation.output_fbo.texture
                    }
                },
                depthWrite: false
            })
        );

        // console.log(this.output);
    }

    getOutputMesh(){
        return this.output;
    }

    resize(){
        this.simulation.resize();
    }

    update(){
        this.simulation.update();
    }
}

export default new Reflect2();