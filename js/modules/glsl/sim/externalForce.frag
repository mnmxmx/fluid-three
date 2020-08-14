precision highp float;

uniform vec2 force;
uniform vec2 center;
uniform vec2 scale;
uniform vec2 px;
varying vec2 vUv;

void main(){
    float d = 1.0-min(length((vUv - 0.5) * 2.0), 1.0);
    gl_FragColor = vec4(force * d, 0, 1);
}
