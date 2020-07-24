precision highp float;
uniform sampler2D velocity;
uniform sampler2D pressure;
uniform sampler2D div;
uniform vec2 px;

uniform float hueRange;
varying vec2 uv;

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main(){
    // float x0_p = texture2D(pressure, uv-vec2(px.x, 0)).r;
    // float x1_p = texture2D(pressure, uv+vec2(px.x, 0)).r;
    // float y0_p = texture2D(pressure, uv-vec2(0, px.y)).r;
    // float y1_p = texture2D(pressure, uv+vec2(0, px.y)).r;

    // vec2 gradP = (vec2(x1_p - x0_p, y1_p - y0_p)*0.5;

    // float x0 = texture2D(velocity, uv-vec2(px.x, 0)).x;
    // float x1 = texture2D(velocity, uv+vec2(px.x, 0)).x;
    // float y0 = texture2D(velocity, uv-vec2(0, px.y)).y;
    // float y1 = texture2D(velocity, uv+vec2(0, px.y)).y;

    // float divergence = texture2D(div, uv).r;// (x1-x0 + y1-y0)*0.5;

    float p = texture2D(pressure, uv).r;
    vec2 vel = texture2D(velocity, uv).xy;



    gl_FragColor = vec4(vel *0.5 + 0.5, 0.0,1.0);
}
