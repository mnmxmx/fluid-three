import kernel_vert from "./glsl/sim/kernel.vert";
import boundary_vert from "./glsl/sim/boundary.vert";
import cursor_vert from "./glsl/sim/cursor.vert";

import advect_frag from "./glsl/sim/advect.frag";
import addForce_frag from "./glsl/sim/addForce.frag";
import divergence_frag from "./glsl/sim/divergence.frag";
import jacobi_frag from "./glsl/sim/jacobi.frag";
import subtractPressureGradient_frag from "./glsl/sim/subtractPressureGradient.frag";
import visualize_frag from "./glsl/sim/visualize.frag";



import Common from "./Common";

import * as THREE from "three";


export default class ComputeKernel{
    constructor(props){
        this.props = props;

        // this.outputFBO = this.props.output;
        this.uniforms = this.props.uniforms;

        this.shaders = {
            kernel: kernel_vert,
            boundary: boundary_vert,
            cursor: cursor_vert,
            advect: advect_frag,
            addForce: addForce_frag,
            divergence: divergence_frag,
            jacobi: jacobi_frag,
            subtractPressureGradient: subtractPressureGradient_frag,
            visualize: visualize_frag,

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