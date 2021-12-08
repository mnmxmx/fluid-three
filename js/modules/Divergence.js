import face_vert from "./glsl/sim/face.vert";
import divergence_frag from "./glsl/sim/divergence.frag";

import ShaderPass from "./ShaderPass";

export default class Divergence extends ShaderPass{
    constructor(simProps){
        super({
            material: {
                vertexShader: face_vert,
                fragmentShader: divergence_frag,
                uniforms: {
                    boundarySpace: {
                        value: simProps.boundarySpace
                    },
                    velocity: {
                        value: simProps.src.texture
                    },
                    px: {
                        value: simProps.cellScale
                    },
                    dt: {
                        value: simProps.dt
                    }
                }
            },
            output: simProps.dst
        })

        this.init();
    }

    update({ vel }){
        this.uniforms.velocity.value = vel.texture;
        super.update();
    }
}