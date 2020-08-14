precision highp float;
uniform sampler2D velocity;

uniform float hueRange;
varying vec2 uv;


void main(){

    vec2 vel = texture2D(velocity, uv).xy;
    vel = vel * 0.5 + 0.5;

    vec3 color = vec3(1.0, vel.xy * 0.5 + 0.5);

    gl_FragColor = vec4(color,  1.0);
}
