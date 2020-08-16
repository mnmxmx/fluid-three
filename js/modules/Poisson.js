import face_vert from "./glsl/sim/face.vert";
import poisson_frag from "./glsl/sim/poisson.frag";

import ShaderPass from "./ShaderPass";

export default class Divergence extends ShaderPass{
    constructor(simProps){
        super({
            material: {
                vertexShader: face_vert,
                fragmentShader: poisson_frag,
                uniforms: {
                    boundarySpace: {
                        value: simProps.boundarySpace
                    },
                    pressure: {
                        value: simProps.dst_.texture
                    },
                    divergence: {
                        value: simProps.src.texture
                    },
                    px: {
                        value: simProps.cellScale
                    }
                },
            },
            output: simProps.dst,

            output0: simProps.dst_,
            output1: simProps.dst
        });

        this.init();
    }

    update({iterations}){
        let p_in, p_out;

        for(var i = 0; i < iterations; i++) {
            if(i % 2 == 0){
                p_in = this.props.output0;
                p_out = this.props.output1;
            } else {
                p_in = this.props.output1;
                p_out = this.props.output0;
            }

            this.uniforms.pressure.value = p_in.texture;
            this.props.output = p_out;
            super.update();
        }

        return p_out;
    }
}