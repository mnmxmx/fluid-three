precision highp float;

attribute vec3 position;
attribute vec2 uv;
uniform vec2 center;
uniform vec2 scale;
uniform vec2 px;
varying vec2 vUv;

void main(){
    vec2 pos = position.xy * scale * 2.0 * px + center;
    // pos = clamp(
    //     pos,
    //     vec2(-1.0 + px * 2.0),
    //     vec2(1.0 - px * 2.0)
    // );
    vUv = uv;
    gl_Position = vec4(pos, 0.0, 1.0);
}
