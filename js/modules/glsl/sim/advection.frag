precision highp float;
uniform sampler2D velocity;
uniform float dt;
uniform bool isBFECC;
// uniform float uvScale;
uniform vec2 fboSize;
uniform vec2 px;
varying vec2 uv;

void main(){
    vec2 ratio = max(fboSize.x, fboSize.y) / fboSize;

    if(isBFECC == false){
        vec2 vel = texture2D(velocity, uv).xy;
        vec2 uv2 = uv - vel * dt * ratio;
        vec2 newVel = texture2D(velocity, uv2).xy;
        gl_FragColor = vec4(newVel, 0.0, 0.0);
    } else {
        vec2 spot_new = uv;
        vec2 vel_old = texture2D(velocity, uv).xy;
        // back trace
        vec2 spot_old = spot_new - vel_old * dt * ratio;
        vec2 vel_new1 = texture2D(velocity, spot_old).xy;

        // forward trace
        vec2 spot_new2 = spot_old + vel_new1 * dt * ratio;
        
        vec2 error = spot_new2 - spot_new;

        vec2 spot_new3 = spot_new - error / 2.0;
        vec2 vel_2 = texture2D(velocity, spot_new3).xy;

        // back trace 2
        vec2 spot_old2 = spot_new3 - vel_2 * dt * ratio;
        // gl_FragColor = vec4(spot_old2, 0.0, 0.0);
        vec2 newVel2 = texture2D(velocity, spot_old2).xy; 
        gl_FragColor = vec4(newVel2, 0.0, 0.0);
    }
}
