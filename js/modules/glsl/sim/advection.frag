precision highp float;
uniform sampler2D source;
uniform sampler2D velocity;
uniform float dt;
uniform float scale;
uniform vec2 ratio;
uniform vec2 px;
varying vec2 uv;

void main(){
    vec2 vel = texture2D(velocity, uv).xy;
    vec2 uv2 = uv - vel * dt * ratio;
    gl_FragColor = texture2D(velocity, uv2)*scale;

    // float step = 1.0;
    // vec2 vel0 = texture2D(velocity, uv).xy;
    // vec2 vel1 = texture2D(velocity, uv + vec2(px.x, 0.0)).xy;
    // vec2 vel2 = texture2D(velocity, uv - vec2(px.x, 0.0)).xy;
    // vec2 vel3 = texture2D(velocity, uv + vec2(0.0, px.y)).xy;
    // vec2 vel4 = texture2D(velocity, uv - vec2(0.0, px.y)).xy;

    // vec2 diff = vec2(
    //     vel0.x * (vel1.x - vel2.x) / (2.0 * step) + vel0.y * (vel3.x - vel4.x) / (2.0 * step),
    //     vel0.x * (vel1.y - vel2.y) / (2.0 * step) + vel0.y * (vel3.y - vel4.y) / (2.0 * step)
    // );

    // vec2 vel = vel0 + diff;

    // gl_FragColor = vec4(vel, 0.0, 0.0 )*scale;




}
