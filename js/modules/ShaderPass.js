import face_vert from "./glsl/sim/face.vert";
import line_vert from "./glsl/sim/line.vert";
import mouse_vert from "./glsl/sim/mouse.vert";

import advection_frag from "./glsl/sim/advection.frag";
import externalForce_frag from "./glsl/sim/externalForce.frag";
import divergence_frag from "./glsl/sim/divergence.frag";
import poisson_frag from "./glsl/sim/poisson.frag";
import pressure_frag from "./glsl/sim/pressure.frag";
import color_frag from "./glsl/sim/color.frag";



import Common from "./Common";

import * as THREE from "three";


export default class ShaderPass{
    constructor(props){
        this.props = props;

        // this.outputFBO = this.props.output;
        this.uniforms = this.props.uniforms;

        this.shaders = {
            face: face_vert,
            line: line_vert,
            mouse: mouse_vert,
            advection: advection_frag,
            externalForce: externalForce_frag,
            divergence: divergence_frag,
            poisson: poisson_frag,
            pressure: pressure_frag,
            color: color_frag,
        };
        this.init();
    }

    init(){
        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera(); // てきとう
        this.material = new THREE.RawShaderMaterial({
            vertexShader: this.shaders[this.props.vertex],
            fragmentShader: this.shaders[this.props.fragment],
            uniforms: this.props.uniforms,
            blending: (this.props.blend == "add") ? THREE.AdditiveBlending : THREE.NormalBlending
        });

        // console.log(this.material);
        this.geometry = this.props.geometry;

        if(this.props.isLine){
            this.mesh = new THREE.LineSegments(this.geometry, this.material);
        } else {
            this.mesh = new THREE.Mesh(this.geometry, this.material);
        }

        this.scene.add(this.mesh);

    }

    update(){

        // if(this.props.output && !this.props.nobind){
            // console.log("no");
            Common.renderer.setRenderTarget(this.props.output);
        // }

        Common.renderer.render(this.scene, this.camera);

        // if(this.props.output && !this.props.nounbind){
            Common.renderer.setRenderTarget(null);
        // }
    }
}