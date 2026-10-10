export const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uDetail;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorld;

  vec3 surface(vec3 p) {
    vec3 fluid = sign(p) * pow(abs(p), vec3(0.45,0.65,0.45)) * vec3(1.63, 0.42, 1.40);
    vec3 die = sign(p) * pow(abs(p), vec3(0.27)) * vec3(1.70, 0.22, 1.42);
    vec3 shaped = mix(fluid, die, uMorph);
    float broad = sin(p.x * 3.0 + p.z * 2.3 + uTime * .24) * cos(p.z * 3.3 - uTime * .13);
    float fine = sin(p.x * 8.0 - p.z * 6.0 + uTime * .18) * .026 * uDetail;
    shaped.y += (broad * .12 + fine) * (1.0 - uMorph * .9) * (0.45 + abs(p.y));
    shaped.x += sin(p.z * 2.5 + uTime * .12) * .035 * (1.0-uMorph);
    return shaped;
  }

  void main() {
    vec3 p = normalize(position);
    vec3 q = surface(p);
    // Sample two surface tangents to keep highlights smooth after deformation.
    vec3 reference = abs(p.y) > .95 ? vec3(1.,0.,0.) : vec3(0.,1.,0.);
    vec3 tangent = normalize(cross(reference,p));
    vec3 bitangent = normalize(cross(p,tangent));
    vec3 tx = surface(normalize(p+tangent*.003))-q;
    vec3 ty = surface(normalize(p+bitangent*.003))-q;
    vec3 n = normalize(cross(tx,ty));
    vNormal = normalize(mat3(modelMatrix)*n);
    vPosition = q;
    vWorld = (modelMatrix*vec4(q,1.)).xyz;
    gl_Position = projectionMatrix*modelViewMatrix*vec4(q,1.);
  }
`;

export const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorld;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 view = normalize(cameraPosition-vWorld);
    vec3 key = normalize(vec3(-.6,.9,.8));
    float diffuse = max(dot(n,key),0.);
    float fresnel = pow(1.-abs(dot(n,view)),2.4);
    float flow = vPosition.x*.85 + vPosition.z*.65
      + sin(vPosition.z*2.6+uTime*.12)*.44
      + sin(vPosition.x*2.2-uTime*.17)*.26;
    float ribbon = pow(.5+.5*sin(flow*4.3+uTime*.12),6.);
    float soft = .5+.5*sin(flow*2.1+1.8);
    vec3 cyan = vec3(.10,.66,.80);
    vec3 violet = vec3(.26,.15,.57);
    vec3 energy = mix(violet,cyan,soft);
    vec3 base = vec3(.007,.011,.024);
    vec3 color = base*(.6+diffuse*.6) + energy*ribbon*(.18+diffuse*.25);
    vec3 halfVector = normalize(key+view);
    float spec = pow(max(dot(n,halfVector),0.),64.);
    float secondSpec = pow(max(dot(n,normalize(vec3(.8,.5,-.6)+view)),0.),65.);
    color += vec3(.35,.80,.95)*spec*.5;
    color += vec3(.55,.20,.50)*secondSpec*.18;
    color += energy*fresnel*.22;
    // Anti-aliased rectilinear routing resolves gradually on the upper surface.
    vec2 grid = abs(fract(vPosition.xz*3.0-.5)-.5)/max(fwidth(vPosition.xz*3.0),vec2(.001));
    float trace = 1.-min(min(grid.x,grid.y),1.);
    float top = smoothstep(.0,.14,vPosition.y);
    color += cyan*trace*top*uMorph*.20;
    float corner = smoothstep(1.25,1.70,abs(vPosition.x));
    color += vec3(.18,.38,.5)*corner*uMorph*.12;
    gl_FragColor = vec4(color,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
