precision highp float;
uniform sampler2D source;
uniform sampler2D velocity;
uniform float dt;
uniform float scale;
uniform vec2 px1;
varying vec2 uv;

void main(){
    vec2 vel = texture2D(velocity, uv).xy;
    // material derivative
    vec2 uv2 = uv - vel * dt * px1;
    gl_FragColor = texture2D(source, uv2)*scale;
}
