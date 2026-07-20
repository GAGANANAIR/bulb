(function(){
  const canvas = document.getElementById('gl');
  const errBox = document.getElementById('err');

  function showError(msg){
    errBox.style.display = 'block';
    errBox.textContent = msg;
    document.getElementById('boot').classList.add('hidden');
  }
  window.addEventListener('error', (e) => showError('Runtime error: ' + e.message));

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl){
    showError('WebGL is not available in this browser/context, so the fractal renderer cannot run. Try a desktop browser with hardware acceleration enabled.');
    return;
  }

  function compile(type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
      const log = gl.getShaderInfoLog(s);
      gl.deleteShader(s);
      throw new Error('Shader compile failed: ' + log);
    }
    return s;
  }

  let program;
  try {
    const vsSrc = document.getElementById('vs').textContent;
    const fsSrc = document.getElementById('fs').textContent;
    const vs = compile(gl.VERTEX_SHADER, vsSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)){
      throw new Error('Program link failed: ' + gl.getProgramInfoLog(program));
    }
  } catch(e){
    showError(e.message);
    return;
  }

  gl.useProgram(program);

  const quad = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(program, 'a_pos');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(program, 'u_resolution');
  const uCamPos = gl.getUniformLocation(program, 'u_camPos');
  const uCamRight = gl.getUniformLocation(program, 'u_camRight');
  const uCamUp = gl.getUniformLocation(program, 'u_camUp');
  const uCamFwd = gl.getUniformLocation(program, 'u_camFwd');
  const uPower = gl.getUniformLocation(program, 'u_power');
  const uIter = gl.getUniformLocation(program, 'u_iter');
  const uHue = gl.getUniformLocation(program, 'u_hue');
  const uTime = gl.getUniformLocation(program, 'u_time');

  // ---- orbit camera state ----
  let azimuth = 0.9, elevation = 0.35, radius = 3.1;
  let dragging = false, lastX = 0, lastY = 0;
  let autoDrift = true;

  function resize(){
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h){
      canvas.width = w; canvas.height = h;
    }
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  canvas.addEventListener('pointerdown', e => {
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointerup', () => dragging = false);
  canvas.addEventListener('pointercancel', () => dragging = false);
  canvas.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    azimuth -= dx * 0.006;
    elevation = Math.max(-1.4, Math.min(1.4, elevation + dy * 0.006));
  });
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    radius = Math.max(1.3, Math.min(7.0, radius + e.deltaY * 0.0022));
  }, { passive:false });

  // touch pinch zoom
  let pinchDist = null;
  canvas.addEventListener('touchmove', e => {
    if (e.touches.length === 2){
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const d = Math.hypot(dx,dy);
      if (pinchDist !== null){
        radius = Math.max(1.3, Math.min(7.0, radius - (d - pinchDist) * 0.01));
      }
      pinchDist = d;
    }
  }, { passive:true });
  canvas.addEventListener('touchend', () => pinchDist = null);

  // ---- UI wiring ----
  const powerEl = document.getElementById('power');
  const iterEl = document.getElementById('iter');
  const hueEl = document.getElementById('hue');
  const vPower = document.getElementById('vPower');
  const vIter = document.getElementById('vIter');
  const vHue = document.getElementById('vHue');
  const spinBtn = document.getElementById('spinBtn');
  const resetBtn = document.getElementById('resetBtn');
  const saveBtn = document.getElementById('saveBtn');

  let power = 8.0, iter = 9, hue = 0.62;
  powerEl.addEventListener('input', () => { power = parseFloat(powerEl.value); vPower.textContent = power.toFixed(1); });
  iterEl.addEventListener('input', () => { iter = parseInt(iterEl.value,10); vIter.textContent = iter; });
  hueEl.addEventListener('input', () => { hue = parseFloat(hueEl.value); vHue.textContent = hue.toFixed(2); });

  spinBtn.addEventListener('click', () => {
    autoDrift = !autoDrift;
    spinBtn.classList.toggle('active', autoDrift);
  });
  resetBtn.addEventListener('click', () => {
    azimuth = 0.9; elevation = 0.35; radius = 3.1;
    power = 8.0; iter = 9; hue = 0.62;
    powerEl.value = 8; iterEl.value = 9; hueEl.value = 0.62;
    vPower.textContent = '8.0'; vIter.textContent = '9'; vHue.textContent = '0.62';
  });

  // Save / download canvas as PNG
  function downloadCanvasPNG(){
    // prefer toBlob for async handling; fallback to toDataURL
    if (canvas.toBlob){
      canvas.toBlob(function(blob){
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bulb.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, 'image/png');
    } else {
      const data = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = data;
      a.download = 'bulb.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }
  saveBtn.addEventListener('click', downloadCanvasPNG);

  // keyboard shortcuts: Space toggles drift, R resets
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space'){
      e.preventDefault();
      autoDrift = !autoDrift;
      spinBtn.classList.toggle('active', autoDrift);
    } else if (e.key === 'r' || e.key === 'R'){
      resetBtn.click();
    }
  });

  const tRays = document.getElementById('tRays');
  const tSteps = document.getElementById('tSteps');
  const tFps = document.getElementById('tFps');

  let frameCount = 0;
  let lastFpsUpdate = performance.now();
  let lastFrameTime = performance.now();

  function render(now){
    if (autoDrift && !dragging) azimuth += 0.0016;

    const camPos = [
      radius * Math.cos(elevation) * Math.sin(azimuth),
      radius * Math.sin(elevation),
      radius * Math.cos(elevation) * Math.cos(azimuth)
    ];
    const target = [0,0,0];
    let fwd = [target[0]-camPos[0], target[1]-camPos[1], target[2]-camPos[2]];
    const fl = Math.hypot(fwd[0],fwd[1],fwd[2]);
    fwd = [fwd[0]/fl, fwd[1]/fl, fwd[2]/fl];
    const worldUp = [0,1,0];
    let right = [
      fwd[1]*worldUp[2]-fwd[2]*worldUp[1],
      fwd[2]*worldUp[0]-fwd[0]*worldUp[2],
      fwd[0]*worldUp[1]-fwd[1]*worldUp[0]
    ];
    const rl = Math.hypot(right[0],right[1],right[2]) || 1;
    right = [right[0]/rl, right[1]/rl, right[2]/rl];
    const up = [
      right[1]*fwd[2]-right[2]*fwd[1],
      right[2]*fwd[0]-right[0]*fwd[2],
      right[0]*fwd[1]-right[1]*fwd[0]
    ];

    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform3f(uCamPos, camPos[0], camPos[1], camPos[2]);
    gl.uniform3f(uCamRight, right[0], right[1], right[2]);
    gl.uniform3f(uCamUp, up[0], up[1], up[2]);
    gl.uniform3f(uCamFwd, fwd[0], fwd[1], fwd[2]);
    gl.uniform1f(uPower, power);
    gl.uniform1i(uIter, iter);
    gl.uniform1f(uHue, hue);
    gl.uniform1f(uTime, now * 0.001);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    frameCount++;
    const dt = now - lastFrameTime;
    lastFrameTime = now;
    if (now - lastFpsUpdate > 400){
      tFps.textContent = dt.toFixed(1);
      tRays.textContent = (canvas.width * canvas.height).toLocaleString();
      tSteps.textContent = Math.round(20 + iter * 6);
      lastFpsUpdate = now;
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame((t) => {
    resize();
    document.getElementById('boot').classList.add('hidden');
    render(t);
  });
})();
