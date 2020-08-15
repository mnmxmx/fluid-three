import Mouse from "./Mouse";
import Common from "./Common";
import * as THREE from "three";
import ShaderPass from "./ShaderPass";
import Controls from "./Controls";

export default class Simulation{
    constructor(props){
        this.props = props;

        this.advection = null;
        this.externalForce = null;
        this.viscous = null;
        this.divergence = null;
        this.poisson = null;
        this.pressure = null;
        this.output = null;

        this.fbos = {
            vel_0: null,
            vel_1: null,

            // for calc next velocity with viscous
            vel_viscous0: null,
            vel_viscous1: null,

            // for calc pressure
            div: null,

            // for calc poisson equation 
            pressure_0: null,
            pressure_1: null,

            output: null
        };

        this.options = {
            iterations_poisson: 32,
            iterations_viscous: 32,
            mouse_force: 100,
            resolution: 0.25,
            cursor_size: 20,
            viscous: 0.1,
            dt: 1/60,
            isViscous: true
        };

        this.controls = new Controls(this.options);

        this.time = 0;

        this.width = null;
        this.height = null;

        this.px = new THREE.Vector2();
        this.ratio = new THREE.Vector2();

        this.init();
    }

    
    init(){
        this.calcSize();
        this.currentM = new THREE.Vector2();
        this.oldM = new THREE.Vector2();
        this.diffM = new THREE.Vector2();
        
        this.createGeometries();
        this.createAllFBO();
        this.createShaderPass();
    }

    createAllFBO(){
        const type = ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) ? THREE.HalfFloatType : THREE.FloatType;
        this.commonOption_fbo = {
            // minFilter: THREE.NearestFilter,
            // magFilter: THREE.NearestFilter,
            type: type
        };

        for(let key in this.fbos){
            this.fbos[key] = new THREE.WebGLRenderTarget(
                this.width,
                this.height,
                this.commonOption_fbo
            )
        }
    }

    createGeometries(){
        this.faceG = new THREE.PlaneBufferGeometry(2.0, 2.0);

        this.mouseG = new THREE.PlaneBufferGeometry(
            1, 1
        );
    }

    createShaderPass(){
        this.advection = new ShaderPass({
            vertex: "face",
            fragment: "advection",
            geometry: this.faceG,
            uniforms: {
                boundarySpace: {
                    value: this.px
                },
                px: {
                    value: this.px
                },
                ratio: {
                    value: this.ratio
                },
                scale: {
                    value: 1.0
                },
                velocity: {
                    value: this.fbos.vel_0.texture
                },
                dt: {
                    value: this.options.dt
                }
            },
            output: this.fbos.vel_1
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
                    value: new THREE.Vector2(this.options.cursor_size, this.options.cursor_size)
                }
            },
            output: this.fbos.vel_1
        });

        this.viscous = new ShaderPass({
            vertex: "face",
            fragment: "viscous",
            geometry: this.faceG,
            uniforms: {
                boundarySpace: {
                    value: this.px
                },
                velocity: {
                    value: this.fbos.vel_1.texture
                },
                velocity_new: {
                    value: this.fbos.vel_viscous0.texture
                },
                v: {
                    value: this.options.viscous,
                },
                px: {
                    value: this.px
                }
            },
            output: this.fbos.vel_viscous1
        });

        this.divergence = new ShaderPass({
            vertex: "face",
            fragment: "divergence",
            geometry: this.faceG,
            uniforms: {
                boundarySpace: {
                    value: this.px
                },
                velocity: {
                    value: this.fbos.vel_viscous0.texture
                },
                px: {
                    value: this.px
                }
            },
            output: this.fbos.div
        });

        this.poisson = new ShaderPass({
            vertex: "face",
            fragment: "poisson",
            geometry: this.faceG,
            nounbind: true,
            uniforms: {
                boundarySpace: {
                    value: this.px
                },
                pressure: {
                    value: this.fbos.pressure_0.texture
                },
                divergence: {
                    value: this.fbos.div.texture
                },
                px: {
                    value: this.px
                }
            },
            output: this.fbos.pressure_1
        });

        this.pressure = new ShaderPass({
            vertex: "face",
            fragment: "pressure",
            geometry: this.faceG,
            uniforms: {
                boundarySpace: {
                    value: this.px
                },
                pressure: {
                    value: this.fbos.pressure_0.texture
                },
                velocity: {
                    value: this.fbos.vel_viscous0.texture
                },
                px: {
                    value: this.px
                }
            },
            output: this.fbos.vel_0
        });

        this.output = new ShaderPass({
            vertex: "face",
            fragment: "color",
            geometry: this.faceG,
            uniforms: {
                boundarySpace: {
                    value: new THREE.Vector2()
                },
                velocity: {
                    value: this.fbos.vel_1.texture,
                },
                pressure: {
                    value: this.fbos.pressure_0.texture
                },
                div: {
                    value: this.fbos.div.texture
                },
                px: {
                    value: this.px
                },
            },
            output: this.fbos.output
        });
    }

    calcSize(){
        this.width = Math.floor(this.options.resolution * Common.width / 2) * 2;
        this.height = Math.floor(this.options.resolution * Common.height / 2) * 2;

        const px_x = 1.0 / this.width;
        const px_y = 1.0 / this.height;

        this.px.set(px_x, px_y);
        this.ratio.set(1, this.width/this.height);
    }

    resize(){
        this.calcSize();

        for(let key in this.fbos){
            this.fbos[key].setSize(this.width, this.height);
        }
    }

    updateMouse(){
        this.currentM.copy(Mouse.coords);
        this.diffM.subVectors(this.currentM, this.oldM);
        this.oldM.copy(this.currentM);

        if(this.oldM.x === 0 && this.oldM.y === 0) this.diffM.set(0, 0);

        this.externalForce.uniforms.force.value.set(
            this.diffM.x / 2 * this.options.mouse_force,
            this.diffM.y / 2 * this.options.mouse_force
        );

        const cursorSizeX = this.options.cursor_size * this.px.x;
        const cursorSizeY = this.options.cursor_size * this.px.y;

        this.externalForce.uniforms.center.value.set(
            Math.min(Math.max(this.currentM.x, -1 + cursorSizeX + this.px.x * 2), 1 - cursorSizeX - this.px.x * 2),
            Math.min(Math.max(this.currentM.y, -1 + cursorSizeY + this.px.y * 2), 1 - cursorSizeY - this.px.y * 2),
        );
        this.externalForce.uniforms.scale.value.set(
            this.options.cursor_size, this.options.cursor_size
        );

        this.externalForce.update();
    }

    update(){
        this.advection.uniforms.dt.value = this.options.dt;
        this.advection.update();

        this.updateMouse();

        if(this.options.isViscous){
            let v_in, v_out;
            this.viscous.uniforms.v.value = this.options.viscous;
            for(var i = 0; i < this.options.iterations_viscous; i++){
                if(i % 2 == 0){
                    v_in = this.fbos.vel_viscous0;
                    v_out = this.fbos.vel_viscous1;
                } else {
                    v_in = this.fbos.vel_viscous1;
                    v_out = this.fbos.vel_viscous0;
                }

                this.viscous.uniforms.velocity_new.value = v_in.texture;
                this.viscous.props.output = v_out;

                this.viscous.update();
            }

            this.divergence.uniforms.velocity.value = v_out.texture;
            this.pressure.uniforms.velocity.value = v_out.texture;

        } else {
            this.divergence.uniforms.velocity.value = this.fbos.vel_1.texture;
            this.pressure.uniforms.velocity.value = this.fbos.vel_1.texture;

        }


        this.divergence.update();

        let p_in, p_out;

        for(var i = 0; i < this.options.iterations_poisson; i++) {
            if(i % 2 == 0){
                p_in = this.fbos.pressure_0;
                p_out = this.fbos.pressure_1;
            } else {
                p_in = this.fbos.pressure_1;
                p_out = this.fbos.pressure_0;
            }

            this.poisson.uniforms.pressure.value = p_in.texture;
            this.poisson.props.output = p_out;

            this.poisson.update();
        }

        this.pressure.uniforms.pressure.value = p_out.texture;
        

        this.pressure.update();
        this.output.update();
    }
}