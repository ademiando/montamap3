precision highp float;

varying vec2 vUv;
varying vec3 vNormal;

uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;

void main(){
  float light = dot(vNormal, normalize(vec3(mouse.xy, 1.0)));
  vec3 base = 0.5 + 0.5 * cos( time + vUv.xyx * 6.0 + vec3(0.0, 2.0, 4.0));
  vec3 glow = vec3(1.0, 0.8, 0.6) * smoothstep(0.0, 1.0, light);
  
  float depth = gl_FragCoord.z / gl_FragCoord.w;
  vec3 color = mix(base, glow, 0.4) * (1.0 - depth * 0.2);
  
  gl_FragColor = vec4(color, 1.0);
}
