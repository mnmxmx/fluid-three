precision highp float;
uniform sampler2D pressure;
uniform sampler2D velocity;
uniform float scale;
uniform vec2 px;
varying vec2 uv;

void main(){
    float x0_p = texture2D(pressure, uv-vec2(px.x, 0)).r;
    float x1_p = texture2D(pressure, uv+vec2(px.x, 0)).r;
    float y0_p = texture2D(pressure, uv-vec2(0, px.y)).r;
    float y1_p = texture2D(pressure, uv+vec2(0, px.y)).r;
    vec2 v = texture2D(velocity, uv).xy;
    gl_FragColor = vec4((v-vec2(x1_p - x0_p, y1_p - y0_p)*0.5)*scale, 1.0, 1.0);
}
