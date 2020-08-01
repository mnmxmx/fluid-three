import {GPUComputationRenderer} from "../libs/GPUComputationRenderer";
import Mouse from "./Mouse";
import Common from "./Common";
import * as THREE from "three";
import ShaderPass from "./ShaderPass";

export default class Simulation{
    constructor(props){
        this.props = props;

        this.advection = null;
        this.advection_boundary = null;
        this.externalForce = null;
        this.divergence = null;
        this.poisson = null;
        this.poisson_boundary = null;
        this.pressure = null;
        this.pressure_boundary = null;
        this.output = null;

        this.options = {
            iterations: 64,
            mouse_force: 5,
            resolution: 0.25,
            cursor_size: 20,
            step: 1/60
        };

        this.time = 0;
    }

    init(){
        this.width = this.options.resolution * Common.width;
        this.height = this.options.resolution * Common.height;

        this.currentM = new THREE.Vector2();
        this.oldM = new THREE.Vector2();
        this.diffM = new THREE.Vector2();
        
        this.createGeometries();
        this.createFBO();
        this.createShaderPass();
    }

    createFBO(){
        const type = ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) ? THREE.HalfFloatType : THREE.FloatType;
        const commonOption = {
            // minFilter: THREE.NearestFilter,
            // magFilter: THREE.NearestFilter,
            type: type
        }
        
        this.vel_fbo_0 = new THREE.WebGLRenderTarget(
            this.width,
            this.height,
            {
                format: THREE.RGBAFormat,
                ...commonOption
            }
        );

        this.vel_fbo_1 = new THREE.WebGLRenderTarget(
            this.width,
            this.height,
            {
                format: THREE.RGBAFormat,
                ...commonOption
            }
        );

        this.div_fbo = new THREE.WebGLRenderTarget(
            this.width,
            this.height,
            {
                ...commonOption

                // format: THREE.LuminanceFormat
            }
        );

        this.pressure_fbo_0 = new THREE.WebGLRenderTarget(
            this.width,
            this.height,
            {
                ...commonOption

                // format: THREE.LuminanceFormat
            }
        );

        this.pressure_fbo_1 = new THREE.WebGLRenderTarget(
            this.width,
            this.height,
            {
                ...commonOption

                // format: THREE.LuminanceFormat
            }
        );

        this.output_fbo = new THREE.WebGLRenderTarget(
            this.width,
            this.height,
            {
                ...commonOption
            }
        );
    }

    createGeometries(){
        this.px_x = 1.0/this.width;
        this.px_y = 1.0/this.height;

        this.insideG = new THREE.BufferGeometry();
        const vertices_inside = this.screenQuad(1.0-this.px_x*2.0, 1.0-this.px_y*2.0);
        this.insideG.setAttribute( 'position', new THREE.BufferAttribute( vertices_inside, 3 ) );

        this.allG = new THREE.BufferGeometry();
        const vertices_all = this.screenQuad(1, 1);
        this.allG.setAttribute( 'position', new THREE.BufferAttribute( vertices_all, 3 ) );

        this.boundaryG = new THREE.BufferGeometry();
        const vertices_boundary = new Float32Array([
            // bottom
            -1+this.px_x*0.0, -1+this.px_y*0.0, 0.0,
            -1+this.px_x*0.0, -1+this.px_y*2.0, 0.0,

            // top
            -1+this.px_x*0.0,  1-this.px_y*0.0, 0.0,
            -1+this.px_x*0.0,  1-this.px_y*2.0, 0.0,

            // left
            -1+this.px_x*0.0,  1-this.px_y*0.0, 0.0,
            -1+this.px_x*2.0,  1-this.px_y*0.0, 0.0,

            // right
             1-this.px_x*0.0,  1-this.px_y*0.0, 0.0,
             1-this.px_x*2.0,  1-this.px_y*0.0, 0.0,
        ]);

        const offset_boundary = new Float32Array([
            // bottom
             1-this.px_x*0.0, -1+this.px_y*0.0, 0.0,
             1-this.px_x*0.0, -1+this.px_y*2.0, 0.0,

            // top
             1-this.px_x*0.0,  1-this.px_y*0.0, 0.0,
             1-this.px_x*0.0,  1-this.px_y*2.0, 0.0,

            // left
            -1+this.px_x*0.0, -1+this.px_y*0.0, 0.0,
            -1+this.px_x*2.0, -1+this.px_y*0.0, 0.0,

            // right
             1-this.px_x*0.0, -1+this.px_y*0.0, 0.0,
             1-this.px_x*2.0, -1+this.px_y*0.0, 0.0
        ]);
        this.boundaryG.setAttribute( 'position', new THREE.BufferAttribute( vertices_boundary, 3 ) );
        this.boundaryG.setAttribute( 'offset', new THREE.BufferAttribute( offset_boundary, 3 ) );


        this.mouseG = new THREE.BufferGeometry();
        const vertices_cursor = this.screenQuad(this.px_x * this.options.cursor_size * 2, this.px_y * this.options.cursor_size * 2);
        this.mouseG.setAttribute( 'position', new THREE.BufferAttribute( vertices_cursor, 3 ) );
    }

    screenQuad(xscale, yscale) {
        xscale = xscale||1;
        yscale = yscale||xscale;
        return new Float32Array([
                -xscale, yscale, 0,
                -xscale, -yscale, 0,
                xscale, -yscale, 0,
                
                -xscale, yscale, 0,
                xscale, -yscale, 0,
                xscale, yscale, 0
        ]);
    };

    createShaderPass(){
        this.px = new THREE.Vector2(this.px_x, this.px_y);
        this.px1 = new THREE.Vector2(1, this.width/this.height);

        this.advection = new ShaderPass({
            vertex: "face",
            fragment: "advection",
            geometry: this.insideG,
            uniforms: {
                px: {
                    value: this.px
                },
                px1: {
                    value: this.px1
                },
                scale: {
                    value: 1.0
                },
                velocity: {
                    value: this.vel_fbo_0.texture
                },
                source: {
                    value: this.vel_fbo_0.texture
                },
                dt: {
                    value: this.options.step
                }
            },
            output: this.vel_fbo_1
        });

        this.advection_boundary = new ShaderPass({
            vertex: "line",
            fragment: "advection",
            geometry: this.boundaryG,
            isLine: true,
            uniforms: {
                px: {
                    value: this.px
                },
                scale: {
                    value: -1.0
                },
                velocity: {
                    value: this.vel_fbo_0.texture
                },
                source: {
                    value: this.vel_fbo_0.texture
                },
                dt: {
                    value: this.options.step
                }
            },
            output: this.vel_fbo_1
        });

        this.externalForce = new ShaderPass({
            vertex: "mouse",
            fragment: "externalForce",
            geometry: this.mouseG,
            blend: 'add',
            uniforms: {
                px: {
                    value: this.px
                },
                force: {
                    value: new THREE.Vector2(0.0, 0.0)
                },
                center: {
                    value: new THREE.Vector2(0.0, 0.0)
                },
                scale: {
                    value: new THREE.Vector2(this.options.cursor_size * this.px_x, this.options.cursor_size * this.px_y)
                }
            },
            output: this.vel_fbo_1
        });
        

        this.divergence = new ShaderPass({
            vertex: "face",
            fragment: "divergence",
            geometry: this.allG,
            uniforms: {
                velocity: {
                    value: this.vel_fbo_1.texture
                },
                px: {
                    value: this.px
                }
            },
            output: this.div_fbo
        });

        this.poisson = new ShaderPass({
            vertex: "face",
            fragment: "poisson",
            geometry: this.allG,
            nounbind: true,
            uniforms: {
                pressure: {
                    value: this.pressure_fbo_0.texture
                },
                divergence: {
                    value: this.div_fbo.texture
                },
                px: {
                    value: this.px
                }
            },
            output: this.pressure_fbo_1
        });

        this.poisson_boundary = new ShaderPass({
            vertex: "line",
            fragment: "poisson",
            geometry: this.boundaryG,
            isLine: true,
            nounbind: true,
            nobind: true,
            uniforms: {
                pressure: {
                    value: this.pressure_fbo_0.texture
                },
                divergence: {
                    value: this.div_fbo.texture
                },
                px: {
                    value: this.px
                }
            },
            output: this.pressure_fbo_1

        });
        this.pressure = new ShaderPass({
            vertex: "face",
            fragment: "pressure",
            geometry: this.allG,
            uniforms: {
                pressure: {
                    value: this.pressure_fbo_0.texture
                },
                velocity: {
                    value: this.vel_fbo_1.texture
                },
                px: {
                    value: this.px
                }
            },
            output: this.vel_fbo_0
        });

        this.pressure_boundary = new ShaderPass({
            vertex: "line",
            fragment: "pressure",
            geometry: this.boundaryG,
            isLine: true,
            uniforms: {
                scale: {
                    value: 1.0
                },
                pressure: {
                    value: this.pressure_fbo_0.texture
                },
                velocity: {
                    value: this.vel_fbo_1.texture
                },
                px: {
                    value: this.px
                }
            },
            output: this.vel_fbo_0
        });

        this.output = new ShaderPass({
            vertex: "face",
            fragment: "color",
            geometry: this.allG,
            uniforms: {
                velocity: {
                    value: this.vel_fbo_0.texture,
                },
                pressure: {
                    value: this.pressure_fbo_0.texture
                },
                div: {
                    value: this.div_fbo.texture
                },
                px: {
                    value: this.px
                },
                hueRange: {
                    value: 0.1
                }
            },
            output: this.output_fbo
        });
    }

    resize(){
        this.width = this.options.resolution * Common.width;
        this.height = this.options.resolution * Common.height;

        this.px_x = 1.0/this.width;
        this.px_y = 1.0/this.height;

        this.px.set(this.px_x, this.px_y);
        this.px1.set(1, this.width/this.height);
    }

    update(){
        this.currentM.set( 
            Mouse.mouseOriginal.x * this.options.resolution,
            Mouse.mouseOriginal.y * this.options.resolution
        );

        this.diffM.subVectors(this.currentM, this.oldM);

        this.oldM.copy(this.currentM);

        if(this.oldM.x === 0 && this.oldM.y === 0) this.diffM.set(0, 0);

        this.advection.update();

        this.externalForce.uniforms.force.value.set(
            this.diffM.x * this.px_x * this.options.cursor_size * this.options.mouse_force,
            -this.diffM.y * this.px_y * this.options.cursor_size * this.options.mouse_force
        );

        this.externalForce.uniforms.center.value.set(
            this.currentM.x * this.px_x * 2-1.0,
            (this.currentM.y * this.px_y * 2-1.0)*-1
        );

        this.externalForce.update();


        // this.advection_boundary.update();

        this.divergence.update();

        let p_in, p_out;

        for(var i = 0; i < this.options.iterations; i++) {
            if(i % 2 == 0){
                p_in = this.pressure_fbo_0;
                p_out = this.pressure_fbo_1;
            } else {
                p_in = this.pressure_fbo_1;
                p_out = this.pressure_fbo_0;
            }

            this.poisson.uniforms.pressure.value = p_in.texture;
            this.poisson_boundary.uniforms.pressure.value = p_in.texture;
            this.poisson.props.output = p_out;
            this.poisson_boundary.props.output = p_out;

            this.poisson.update();
            // this.poisson_boundary.update();
        }

        this.pressure.uniforms.pressure.value = p_out;
        this.pressure.update();
        // this.pressure_boundary.update();

        this.output.update();
    }
}