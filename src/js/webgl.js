import * as THREE from 'three';

export function initWebGL() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  // Very dark background
  scene.background = new THREE.Color(0x0a0a0a);

  // Camera setup
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Mouse tracking for interaction
  const mouse = new THREE.Vector2(0.5, 0.5);
  const targetMouse = new THREE.Vector2(0.5, 0.5);

  window.addEventListener('mousemove', (e) => {
    targetMouse.x = e.clientX / window.innerWidth;
    targetMouse.y = 1.0 - (e.clientY / window.innerHeight);
  });

  // GLSL Shaders for the dark liquid effect
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    
    varying vec2 vUv;

    // Simplex 2D noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      // Normalize UV
      vec2 uv = gl_FragCoord.xy / uResolution.xy;
      
      // Aspect ratio correction
      vec2 p = uv * 2.0 - 1.0;
      p.x *= uResolution.x / uResolution.y;

      // Mouse interaction vector
      vec2 m = uMouse * 2.0 - 1.0;
      m.x *= uResolution.x / uResolution.y;
      
      // Distance to mouse to create a warp effect
      float distToMouse = length(p - m);
      float warp = smoothstep(1.5, 0.0, distToMouse) * 0.5;

      // Noise layers for liquid
      vec2 noisePos = uv * 3.0;
      noisePos += warp * 0.5; // Mouse warps the noise space
      
      float n = snoise(vec2(noisePos.x + uTime * 0.1, noisePos.y - uTime * 0.15));
      float n2 = snoise(vec2(noisePos.x * 2.0 - uTime * 0.2, noisePos.y * 2.0 + uTime * 0.1));
      
      // Combine noise
      float finalNoise = n * 0.6 + n2 * 0.4;
      
      // Map noise to colors (Dark mode)
      // Base color: Dark Gray (Void Studio bg)
      vec3 colorBg = vec3(0.04, 0.04, 0.04);
      
      // Accent 1: Deep Violet (7c3aed but much darker for bg)
      vec3 colorViolet = vec3(0.15, 0.05, 0.3);
      
      // Accent 2: Lime Green (c8ff00 but dark/subtle)
      vec3 colorLime = vec3(0.1, 0.15, 0.0);

      vec3 color = colorBg;
      
      // Add fluid highlights
      float highlight1 = smoothstep(0.1, 0.8, finalNoise);
      float highlight2 = smoothstep(0.3, 0.9, -finalNoise);
      
      color = mix(color, colorViolet, highlight1 * 0.6);
      color = mix(color, colorLime, highlight2 * 0.4);

      // Add a subtle vignette
      float vignette = smoothstep(1.5, 0.2, length(p));
      color *= vignette;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // Create full screen plane
  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uMouse: { value: mouse }
    }
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    // Smoothly interpolate mouse position
    mouse.x += (targetMouse.x - mouse.x) * 0.05;
    mouse.y += (targetMouse.y - mouse.y) * 0.05;

    // Update uniforms
    material.uniforms.uTime.value = clock.getElapsedTime();
    material.uniforms.uMouse.value.copy(mouse);

    renderer.render(scene, camera);
  }

  animate();

  // Handle Resize
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  });
}
