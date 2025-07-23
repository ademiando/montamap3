varying vec2 vUv;
varying vec3 vNormal;
uniform float time;

void main(){
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  
  vec3 pos = position + normal * 0.15 * sin( time * 2.0 + position.y * 10.0 );
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
}
