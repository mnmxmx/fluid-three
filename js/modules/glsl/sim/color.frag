precision highp float;
uniform sampler2D velocity;
varying vec2 uv;

void main(){
    vec2 vel = texture2D(velocity, uv).xy;
    vel = vel * 0.5 + 0.5;
    vec3 color = vec3(vel.x, vel.y, 1.0) * 0.6 + 0.4;

    gl_FragColor = vec4(color,  1.0);
}
