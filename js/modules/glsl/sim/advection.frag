precision highp float;
uniform sampler2D source;
uniform sampler2D velocity;
uniform float dt;
// uniform float uvScale;
uniform vec2 fboSize;
uniform vec2 px;
varying vec2 uv;

void main(){
    vec2 vel = texture2D(velocity, uv).xy;
    vec2 ratio = max(fboSize.x, fboSize.y) / fboSize;
    vec2 uv2 = uv - vel * dt * ratio;

    vec2 edge = step(fract(uv), vec2(0.0));  // get 1 if fract uv is 0 or 1, else 0
    // bounce if edge is 1;
    vec2 scale = -edge * 2.0 + 1.0;

    vec2 newVel = texture2D(velocity, uv2).xy * scale;
    
    gl_FragColor = vec4(newVel, 0.0, 0.0);

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

    // vec2 vel = vel0 - diff * dt;

    // gl_FragColor = vec4(vel, 0.0, 0.0 );
}
