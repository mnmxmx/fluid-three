import face_vert from "./glsl/sim/face.vert";
import viscous_frag from "./glsl/sim/viscous.frag";

import ShaderPass from "./ShaderPass";
import * as THREE from "three";

export default class Viscous extends ShaderPass{
    constructor(simProps){
        super({
            material: {
                vertexShader: face_vert,
                fragmentShader: viscous_frag,
                uniforms: {
                    boundarySpace: {
                        value: simProps.boundarySpace
                    },
                    velocity: {
                        value: simProps.src.texture
                    },
                    velocity_new: {
                        value: simProps.dst_.texture
                    },
                    v: {
                        value: simProps.viscous,
                    },
                    px: {
                        value: simProps.cellScale
                    }
                }
            },

            output: simProps.dst,

            output0: simProps.dst_,
            output1: simProps.dst
        })

        this.init();
    }

    update({ viscous, iterations }){
        let v_in, v_out;
        this.uniforms.v.value = viscous;
        for(var i = 0; i < iterations; i++){
            if(i % 2 == 0){
                v_in = this.props.output0;
                v_out = this.props.output1;
            } else {
                v_in = this.props.output1;
                v_out = this.props.output0;
            }

            this.uniforms.velocity_new.value = v_in.texture;
            this.props.output = v_out;

            super.update();
        }

        return v_out;
    }
}
