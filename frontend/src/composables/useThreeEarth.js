/**
 * useThreeEarth.js
 * HomePage 3D 地球交互场景 — Three.js 全部逻辑集中于此
 *
 * 包含:
 *   - NASA 地球 3D 模型加载 + 黑金 ShaderMaterial
 *   - 四旋翼无人机模型 + 激光扫描
 *   - 悬浮粒子特效（Jellyfish Shader）
 *   - 全球节点飞线 + 波纹动效
 *   - 鼠标拖拽旋转 / 滚轮缩放
 *   - 地表裂缝动态绘制
 */

import { onMounted, onUnmounted } from "vue"
import * as THREE from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"

// ─── 工具函数 ────────────────────────────────────────────────

function disposeThreeObj(obj) {
  if (!obj) return
  if (obj.geometry) obj.geometry.dispose()
  if (obj.material) {
    if (Array.isArray(obj.material)) {
      obj.material.forEach(m => {
        if (m.map) m.map.dispose()
        m.dispose()
      })
    } else {
      if (obj.material.map) obj.material.map.dispose()
      obj.material.dispose()
    }
  }
  if (obj.children) {
    obj.children.forEach(child => disposeThreeObj(child))
  }
}

// ─── 静态数据 ────────────────────────────────────────────────

const sphereRadius = 3.3

const stations = [
  { name: "Ordos", lat: 39.6, lon: 109.8, size: 0.45 },
  { name: "Beijing", lat: 39.9, lon: 116.4, size: 0.42 },
  { name: "Shanghai", lat: 31.2, lon: 121.5, size: 0.38 },
  { name: "Shenzhen", lat: 22.5, lon: 114.1, size: 0.35 },
  { name: "London", lat: 51.5, lon: -0.1, size: 0.35 },
  { name: "New York", lat: 40.7, lon: -74.0, size: 0.38 },
  { name: "Washington", lat: 38.9, lon: -77.0, size: 0.40 },
  { name: "Tokyo", lat: 35.7, lon: 139.7, size: 0.38 },
  { name: "Paris", lat: 48.8, lon: 2.3, size: 0.32 },
  { name: "Moscow", lat: 55.7, lon: 37.6, size: 0.35 },
  { name: "Sydney", lat: -33.8, lon: 151.2, size: 0.35 },
  { name: "Brasilia", lat: -15.8, lon: -47.9, size: 0.32 },
  { name: "Cape Town", lat: -33.9, lon: 18.4, size: 0.32 }
]

const flylinePairs = [
  { from: "Ordos", to: "Beijing" },
  { from: "Ordos", to: "Shanghai" },
  { from: "Ordos", to: "Shenzhen" },
  { from: "Beijing", to: "Washington" },
  { from: "Beijing", to: "London" },
  { from: "Beijing", to: "Moscow" },
  { from: "Beijing", to: "Tokyo" },
  { from: "New York", to: "Shanghai" },
  { from: "Washington", to: "London" },
  { from: "Washington", to: "Tokyo" },
  { from: "Paris", to: "New York" },
  { from: "Moscow", to: "London" },
  { from: "Sydney", to: "Tokyo" },
  { from: "Sydney", to: "Shanghai" },
  { from: "Brasilia", to: "Washington" },
  { from: "Cape Town", to: "London" }
]

// ─── 坐标工具 ────────────────────────────────────────────────

function latLongToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.sin(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.cos(theta)
  )
}

// ─── 主导出函数 ──────────────────────────────────────────────

export function useThreeEarth(canvasContainer) {
  // Three.js 核心实例
  let scene, camera, renderer
  let earthMesh, overlayMesh, glowMesh
  let baseMapCanvas, textureCanvas, textureCtx, earthTexture
  let droneGroup, rotorGroup1, rotorGroup2, rotorGroup3, rotorGroup4
  let laserLine, scanIntersectionRing
  let sideParticles
  let animationFrameId

  // LED / 旋翼引用
  let centralLED, leftLED, rightLED, rearLED
  let propBlur1, propBlur2, propBlur3, propBlur4

  // 缓动变量
  const dronePos = new THREE.Vector3(0, 5, 0)
  const droneTarget = new THREE.Vector3(0, 5, 0)
  let isMouseOverEarth = false
  const latestHitPoint = new THREE.Vector3()

  // 拖拽旋转
  let isDragging = false
  let previousMousePosition = { x: 0, y: 0 }
  const autoRotateSpeed = 0.001

  // 动态裂缝
  let cracks = []
  let lastCrackPoint = null

  // 飞线 & 波纹列表
  const flylinesList = []
  const ripplesList = []

  // Jellyfish Shader uniforms
  let jellyfishUniforms

  // Raycaster
  const raycaster = new THREE.Raycaster()
  const mouseVec = new THREE.Vector2()
  const virtualPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -2.0)

  // ─── 子模块 ──────────────────────────────────────────────

  // 1. 经纬网格底图
  function createBaseMap() {
    baseMapCanvas = document.createElement("canvas")
    baseMapCanvas.width = 1024
    baseMapCanvas.height = 512
    const ctx = baseMapCanvas.getContext("2d")
    ctx.clearRect(0, 0, baseMapCanvas.width, baseMapCanvas.height)

    ctx.strokeStyle = "rgba(200, 146, 75, 0.12)"
    ctx.lineWidth = 0.5
    for (let i = 1; i < 12; i++) {
      ctx.beginPath()
      ctx.moveTo(0, i * (baseMapCanvas.height / 12))
      ctx.lineTo(baseMapCanvas.width, i * (baseMapCanvas.height / 12))
      ctx.stroke()
    }
    for (let i = 0; i < 24; i++) {
      ctx.beginPath()
      ctx.moveTo(i * (baseMapCanvas.width / 24), 0)
      ctx.lineTo(i * (baseMapCanvas.width / 24), baseMapCanvas.height)
      ctx.stroke()
    }
  }

  // 2. 裂缝细分
  function generateJaggedPoints(x1, y1, x2, y2, displacement, depth) {
    const points = [[x1, y1]]
    function subdivide(xa, ya, xb, yb, disp, d) {
      if (d === 0) { points.push([xb, yb]); return }
      const mx = (xa + xb) / 2
      const my = (ya + yb) / 2
      const dx = xb - xa, dy = yb - ya
      const len = Math.sqrt(dx * dx + dy * dy)
      const nx = -dy / len, ny = dx / len
      const amt = (Math.random() - 0.5) * disp
      subdivide(xa, ya, mx + nx * amt, my + ny * amt, disp * 0.5, d - 1)
      subdivide(mx + nx * amt, my + ny * amt, xb, yb, disp * 0.5, d - 1)
    }
    subdivide(x1, y1, x2, y2, displacement, depth)
    return points
  }

  // 3. 动态裂缝纹理绘制
  function renderDynamicTexture() {
    const ctx = textureCtx
    const w = textureCanvas.width, h = textureCanvas.height
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = "rgba(0,0,0,0)"
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(baseMapCanvas, 0, 0)

    for (let i = cracks.length - 1; i >= 0; i--) {
      const crack = cracks[i]
      crack.life--
      if (crack.life <= 0) { cracks.splice(i, 1); continue }

      const alpha = crack.life / crack.maxLife
      const pts = crack.points

      const drawLine = (ox, oy, color, width) => {
        ctx.beginPath()
        ctx.moveTo(pts[0][0] + ox, pts[0][1] + oy)
        for (let j = 1; j < pts.length; j++) ctx.lineTo(pts[j][0] + ox, pts[j][1] + oy)
        ctx.strokeStyle = color
        ctx.lineWidth = width
        ctx.lineCap = "round"; ctx.lineJoin = "round"
        ctx.stroke()
      }

      ctx.save()
      ctx.shadowColor = "transparent"
      drawLine(2, 2, `rgba(0,0,0,${alpha * 0.8})`, crack.width + 5)
      ctx.shadowColor = "rgba(0,0,0,0.9)"; ctx.shadowBlur = 6
      drawLine(0, 0, `rgba(5,5,8,${alpha * 0.98})`, crack.width + 3.5)
      ctx.shadowColor = "rgba(210,150,60,0.9)"; ctx.shadowBlur = 12
      drawLine(0, 0, `rgba(200,140,55,${alpha * 0.7})`, crack.width + 1)
      ctx.shadowColor = "rgba(255,210,100,1.0)"; ctx.shadowBlur = 8
      drawLine(0, 0, `rgba(255,200,80,${alpha})`, crack.width * 0.45)
      if (crack.width > 1.5) {
        ctx.shadowBlur = 4
        drawLine(0, 0, `rgba(255,240,180,${alpha * 0.85})`, crack.width * 0.15)
      }
      ctx.restore()
    }
    earthTexture.needsUpdate = true
  }

  // 4. 全球节点飞线 & 波纹
  function setupDigitalAssets() {
    const stationMap = {}
    stations.forEach(s => {
      const pos = latLongToVector3(s.lat, s.lon, sphereRadius)
      stationMap[s.name] = pos

      // 圆柱数据柱
      const barH = s.size * 0.8
      const geo = new THREE.CylinderGeometry(0.015, 0.015, barH, 8)
      geo.translate(0, barH / 2, 0)
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xC8924B, transparent: true, opacity: 0.85 }))
      mesh.position.copy(pos)
      mesh.lookAt(new THREE.Vector3(0, 0, 0))
      mesh.rotateX(Math.PI / 2)
      earthMesh.add(mesh)

      // 波纹
      const ringGeo = new THREE.RingGeometry(0.015, 0.04, 16)
      const ringMesh = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xC8924B, transparent: true, opacity: 0.6, side: THREE.DoubleSide }))
      ringMesh.position.copy(pos).normalize().multiplyScalar(sphereRadius + 0.005)
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0))
      earthMesh.add(ringMesh)
      ripplesList.push({ mesh: ringMesh, scale: 1.0, maxScale: 2.2, speed: 0.015 + Math.random() * 0.01 })
    })

    // 飞线
    const lineMat = new THREE.LineBasicMaterial({ color: 0xC8924B, transparent: true, opacity: 0.3 })
    flylinePairs.forEach(pair => {
      const p1 = stationMap[pair.from], p2 = stationMap[pair.to]
      if (!p1 || !p2) return
      const dist = p1.distanceTo(p2)
      const mid = p1.clone().lerp(p2, 0.5).normalize().multiplyScalar(sphereRadius + dist * 0.25)
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2)
      const points = curve.getPoints(32)
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lineMat)
      earthMesh.add(line)

      const flyer = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffea00 }))
      earthMesh.add(flyer)
      flylinesList.push({ curve, flyer, progress: Math.random(), speed: 0.003 + Math.random() * 0.003 })
    })
  }

  // 5. 激光扫描线
  function assembleScannerBeam() {
    const laserGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -1, 0)
    ])
    laserLine = new THREE.Line(laserGeo, new THREE.LineBasicMaterial({ color: 0x7cd4f0, transparent: true, opacity: 0.9 }))
    laserLine.visible = false
    scene.add(laserLine)

    const ringGeo = new THREE.RingGeometry(0.06, 0.1, 32)
    scanIntersectionRing = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({
      color: 0x7cd4f0, transparent: true, opacity: 0.8, side: THREE.DoubleSide, blending: THREE.AdditiveBlending
    }))
    scanIntersectionRing.visible = false
    scene.add(scanIntersectionRing)
  }

  // 6. 悬浮粒子 (Jellyfish)
  function setupSideParticles() {
    const count = 700
    const positions = new Float32Array(count * 3)
    const randoms = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40
      positions[i * 3 + 2] = -12 - Math.random() * 20
      randoms[i] = Math.random()
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geo.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1))

    jellyfishUniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColor: { value: new THREE.Color(0xd4a05a) }
    }

    const mat = new THREE.ShaderMaterial({
      uniforms: jellyfishUniforms,
      vertexShader: /* glsl */`
        uniform float uTime;
        uniform vec2 uMouse;
        attribute float aRandom;
        varying float vAlpha;
        varying float vSize;
        void main() {
          vec2 mouseWorld = uMouse * vec2(30.0, 15.0);
          float dist = distance(position.xy, mouseWorld);
          float hoverFactor = 1.0 - smoothstep(2.0, 18.0, dist);
          float waveAmplitude = hoverFactor * 2.5 + 0.2;
          vec3 pos = position;
          pos.y += sin(uTime * 0.5 + pos.x * 0.1 + aRandom * 6.28) * waveAmplitude;
          pos.x += cos(uTime * 0.4 + pos.y * 0.1) * waveAmplitude * 0.5;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          vSize = mix(0.0, 3.8, hoverFactor) * (aRandom * 0.5 + 0.5);
          vAlpha = mix(0.0, 0.65, hoverFactor) * (0.7 + 0.3 * sin(uTime + aRandom * 6.28));
          gl_PointSize = vSize * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */`
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          vec2 p = gl_PointCoord - vec2(0.5);
          vec2 b = vec2(0.35);
          float r = 0.15;
          vec2 d = abs(p) - b + vec2(r);
          float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
          if (dist > 0.0) discard;
          float alpha = smoothstep(0.02, -0.02, dist);
          gl_FragColor = vec4(uColor, vAlpha * alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })

    sideParticles = new THREE.Points(geo, mat)
    scene.add(sideParticles)
  }

  function animateSideParticles() {
    if (!jellyfishUniforms) return
    jellyfishUniforms.uMouse.value.lerp(mouseVec, 0.04)
    jellyfishUniforms.uTime.value = performance.now() * 0.001
  }

  // 7. 无人机模型 — 仿工业级四旋翼：椭圆舱体 / 锥形机臂 / 云台相机 / 起落滑橇
  function assemble3DDrone() {
    droneGroup = new THREE.Group()
    const carbonMat = new THREE.MeshStandardMaterial({ color: 0x17171b, metalness: 0.8, roughness: 0.32 })
    const carbonSoft = new THREE.MeshStandardMaterial({ color: 0x222227, metalness: 0.6, roughness: 0.5 })
    const goldMetalMat = new THREE.MeshStandardMaterial({ color: 0xC8924B, metalness: 1.0, roughness: 0.18 })
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0a1016, metalness: 1.0, roughness: 0.05 })

    // ── 主机身：上下两片椭圆舱体 ──
    const hullGeo = new THREE.SphereGeometry(0.11, 32, 24)
    const hull = new THREE.Mesh(hullGeo, carbonMat)
    hull.scale.set(1.25, 0.42, 1.0)
    droneGroup.add(hull)

    const canopyGeo = new THREE.SphereGeometry(0.085, 32, 24)
    const canopy = new THREE.Mesh(canopyGeo, carbonSoft)
    canopy.scale.set(1.1, 0.36, 0.85)
    canopy.position.y = 0.028
    droneGroup.add(canopy)

    // 金色腰线
    const beltGeo = new THREE.TorusGeometry(0.115, 0.004, 8, 48)
    const belt = new THREE.Mesh(beltGeo, goldMetalMat)
    belt.rotation.x = Math.PI / 2
    belt.scale.set(1.25, 1.0, 1.0)
    belt.position.y = -0.004
    droneGroup.add(belt)

    // 中央呼吸灯
    centralLED = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 12), new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.8 }))
    centralLED.position.set(0, 0.052, 0)
    droneGroup.add(centralLED)

    // ── 机臂 + 电机 + 旋翼（X 型四轴）──
    const armLen = 0.34
    const armGeo = new THREE.CylinderGeometry(0.009, 0.016, armLen, 10)
    const motorGeo = new THREE.CylinderGeometry(0.026, 0.03, 0.038, 16)
    const motorCapGeo = new THREE.SphereGeometry(0.02, 16, 12)
    // 桨叶：细长矩形 + 扭转尖端的近似
    const bladeGeo = new THREE.BoxGeometry(0.30, 0.0028, 0.022)
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x2c2c30, metalness: 0.7, roughness: 0.35 })
    const bladeTipMat = new THREE.MeshStandardMaterial({ color: 0xC8924B, metalness: 0.9, roughness: 0.3 })
    const blurGeo = new THREE.RingGeometry(0.03, 0.155, 32)
    const blurMat = new THREE.MeshBasicMaterial({ color: 0xd4a05a, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false })

    rotorGroup1 = new THREE.Group(); rotorGroup2 = new THREE.Group()
    rotorGroup3 = new THREE.Group(); rotorGroup4 = new THREE.Group()
    const rotorGroups = [rotorGroup1, rotorGroup2, rotorGroup3, rotorGroup4]

    const up = new THREE.Vector3(0, 1, 0)
    for (let i = 0; i < 4; i++) {
      const angle = Math.PI / 4 + i * (Math.PI / 2) // 45°, 135°, 225°, 315°
      const dir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle))

      // 机臂：从机身伸向旋翼，略微上扬
      const armDir = dir.clone(); armDir.y = 0.10; armDir.normalize()
      const arm = new THREE.Mesh(armGeo, carbonMat)
      arm.quaternion.setFromUnitVectors(up, armDir)
      arm.position.copy(armDir).multiplyScalar(armLen / 2 + 0.07)
      droneGroup.add(arm)

      // 旋翼组：children[0]=电机 children[1]=桨叶 children[2]=模糊盘
      const group = rotorGroups[i]
      const rotorPos = armDir.clone().multiplyScalar(armLen + 0.09)
      group.position.copy(rotorPos)

      const motor = new THREE.Mesh(motorGeo, carbonSoft)
      group.add(motor)

      const blade = new THREE.Group()
      const bladeMain = new THREE.Mesh(bladeGeo, bladeMat)
      blade.add(bladeMain)
      ;[1, -1].forEach(s => {
        const tip = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.003, 0.024), bladeTipMat)
        tip.position.x = s * 0.135
        blade.add(tip)
      })
      blade.position.y = 0.034
      group.add(blade)

      const blurDisk = new THREE.Mesh(blurGeo, blurMat)
      blurDisk.rotation.x = Math.PI / 2
      blurDisk.position.y = 0.034
      group.add(blurDisk)

      const motorCap = new THREE.Mesh(motorCapGeo, goldMetalMat)
      motorCap.position.y = 0.024
      group.add(motorCap)

      droneGroup.add(group)
      if (i === 0) propBlur1 = blurDisk; else if (i === 1) propBlur2 = blurDisk
      else if (i === 2) propBlur3 = blurDisk; else propBlur4 = blurDisk
    }

    // ── 导航灯：左红 / 右绿 / 尾蓝 ──
    const ledGeo = new THREE.SphereGeometry(0.013, 10, 10)
    const glowGeo = new THREE.SphereGeometry(0.028, 10, 10)
    const addLED = (color, x, y, z) => {
      const led = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 }))
      led.position.set(x, y, z)
      const halo = new THREE.Mesh(glowGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }))
      halo.position.set(x, y, z)
      droneGroup.add(halo)
      droneGroup.add(led)
      return led
    }
    leftLED = addLED(0xff3b30, -0.16, 0.01, 0.10)
    rightLED = addLED(0x34c759, 0.16, 0.01, 0.10)
    rearLED = addLED(0x0a84ff, 0, 0.01, -0.15)

    // ── 起落架：双侧滑橇 ──
    const skidGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.26, 8)
    const strutGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.07, 6)
    ;[1, -1].forEach(s => {
      const skid = new THREE.Mesh(skidGeo, carbonSoft)
      skid.rotation.x = Math.PI / 2
      skid.position.set(s * 0.085, -0.115, 0)
      droneGroup.add(skid)
      ;[0.07, -0.07].forEach(z => {
        const strut = new THREE.Mesh(strutGeo, carbonSoft)
        strut.position.set(s * 0.085, -0.08, z)
        strut.rotation.z = s * 0.25
        droneGroup.add(strut)
      })
    })

    // ── 云台相机：前下方三轴云台 + 玻璃镜头 ──
    const gimbal = new THREE.Group()
    gimbal.position.set(0, -0.075, 0.09)
    const gimbalArm = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.035, 8), carbonMat)
    gimbalArm.position.y = 0.01
    gimbal.add(gimbalArm)
    const cameraBody = new THREE.Mesh(new THREE.SphereGeometry(0.032, 20, 16), carbonSoft)
    cameraBody.position.y = -0.02
    gimbal.add(cameraBody)
    const lensBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.018, 0.02, 16), goldMetalMat)
    lensBarrel.rotation.x = Math.PI / 2
    lensBarrel.position.set(0, -0.02, 0.032)
    gimbal.add(lensBarrel)
    const lensGlass = new THREE.Mesh(new THREE.SphereGeometry(0.013, 16, 12), glassMat)
    lensGlass.position.set(0, -0.02, 0.042)
    gimbal.add(lensGlass)
    droneGroup.add(gimbal)

    // 整体放大，增强存在感
    droneGroup.scale.setScalar(1.35)
    scene.add(droneGroup)
  }

  // 8. 射线检测
  function checkIntersection(clientX, clientY) {
    const container = canvasContainer.value
    if (!container || !renderer || !overlayMesh) return null
    const rect = renderer.domElement.getBoundingClientRect()
    mouseVec.x = ((clientX - rect.left) / rect.width) * 2 - 1
    mouseVec.y = -((clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(mouseVec, camera)
    const intersects = raycaster.intersectObject(overlayMesh)
    if (intersects.length > 0) {
      const uv = intersects[0].uv
      return { x: uv.x * textureCanvas.width, y: (1 - uv.y) * textureCanvas.height, point: intersects[0].point }
    }
    return null
  }

  // ─── 事件处理 ────────────────────────────────────────────

  function onMouseDown(e) {
    isDragging = true
    previousMousePosition = { x: e.clientX, y: e.clientY }
  }

  function onMouseMove(e) {
    if (isDragging && earthMesh) {
      const dx = e.clientX - previousMousePosition.x
      const dy = e.clientY - previousMousePosition.y
      earthMesh.rotation.y += dx * 0.004
      earthMesh.rotation.x += dy * 0.004
      earthMesh.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, earthMesh.rotation.x))
      previousMousePosition = { x: e.clientX, y: e.clientY }
    }

    const hit = checkIntersection(e.clientX, e.clientY)
    if (hit) {
      if (!isMouseOverEarth) { isMouseOverEarth = true; if (droneGroup) droneGroup.visible = true }
      latestHitPoint.copy(hit.point)
      droneTarget.copy(hit.point).normalize().multiplyScalar(sphereRadius + 1.5)
      if (!lastCrackPoint) {
        lastCrackPoint = { x: hit.x, y: hit.y }
      } else {
        const dist = Math.hypot(hit.x - lastCrackPoint.x, hit.y - lastCrackPoint.y)
        if (dist > 18) {
          cracks.push({ points: generateJaggedPoints(lastCrackPoint.x, lastCrackPoint.y, hit.x, hit.y, 12, 3), maxLife: 160, life: 160, width: 1.5 + Math.random() * 2.2 })
          lastCrackPoint = { x: hit.x, y: hit.y }
        }
      }
    } else {
      if (isMouseOverEarth) {
        isMouseOverEarth = false; lastCrackPoint = null
        if (droneGroup) droneGroup.visible = false
        if (laserLine) laserLine.visible = false
        if (scanIntersectionRing) scanIntersectionRing.visible = false
      }
      raycaster.ray.intersectPlane(virtualPlane, latestHitPoint)
    }
  }

  function onMouseUp() { isDragging = false }

  let cameraZ = 9.2
  function onWheel(e) {
    e.preventDefault()
    cameraZ += e.deltaY * 0.01
    cameraZ = Math.max(5.0, Math.min(18.0, cameraZ))
    camera.position.z = cameraZ
    camera.updateProjectionMatrix()
  }

  function onWindowResize() {
    const container = canvasContainer.value
    if (!container || !renderer) return
    const w = container.clientWidth, h = container.clientHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }

  // ─── 动画循环 ────────────────────────────────────────────

  function tick() {
    if (earthMesh) {
      if (!isDragging) earthMesh.rotation.y += autoRotateSpeed
      glowMesh.rotation.copy(earthMesh.rotation)
    }
    animateSideParticles()

    for (const r of ripplesList) {
      r.scale += r.speed
      if (r.scale > r.maxScale) r.scale = 1.0
      r.mesh.scale.set(r.scale, r.scale, 1)
      r.mesh.material.opacity = 0.6 * (1 - (r.scale - 1) / (r.maxScale - 1))
    }

    for (const f of flylinesList) {
      f.progress += f.speed; if (f.progress > 1.0) f.progress = 0
      f.flyer.position.copy(f.curve.getPointAt(f.progress))
    }

    if (droneGroup && droneGroup.visible) {
      const rSpeed = 0.8
      if (rotorGroup1) {
        rotorGroup1.children[1].rotation.y += rSpeed; rotorGroup2.children[1].rotation.y -= rSpeed
        rotorGroup3.children[1].rotation.y += rSpeed; rotorGroup4.children[1].rotation.y -= rSpeed
        if (propBlur1) propBlur1.rotation.z += 0.04; if (propBlur2) propBlur2.rotation.z -= 0.04
        if (propBlur3) propBlur3.rotation.z += 0.04; if (propBlur4) propBlur4.rotation.z -= 0.04
      }
      const blinkPeriod = 600
      const isLit = (Date.now() % blinkPeriod) < (blinkPeriod * 0.6)
      if (leftLED) leftLED.material.opacity = isLit ? 1.0 : 0.15
      if (rightLED) rightLED.material.opacity = isLit ? 1.0 : 0.15
      if (rearLED) rearLED.material.opacity = isLit ? 0.9 : 0.1
      if (centralLED) centralLED.material.opacity = 0.5 + Math.sin(Date.now() * 0.005) * 0.3
      dronePos.lerp(droneTarget, 0.05)
      droneGroup.position.copy(dronePos)
      const lookAt = isMouseOverEarth ? latestHitPoint : new THREE.Vector3(0, 0, 0)
      droneGroup.lookAt(lookAt); droneGroup.rotateX(Math.PI / 2)
    }

    if (laserLine && droneGroup) {
      if (isMouseOverEarth) {
        laserLine.visible = true; scanIntersectionRing.visible = true
        const pa = laserLine.geometry.attributes.position
        pa.setXYZ(0, dronePos.x, dronePos.y - 0.1, dronePos.z)
        const sp = latestHitPoint.clone().normalize().multiplyScalar(sphereRadius + 0.01)
        pa.setXYZ(1, sp.x, sp.y, sp.z); pa.needsUpdate = true
        scanIntersectionRing.position.copy(sp)
        scanIntersectionRing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), sp.clone().normalize())
        const rs = 1.0 + ((Date.now() % 900) / 900) * 1.5
        scanIntersectionRing.scale.set(rs, rs, 1)
        scanIntersectionRing.material.opacity = 0.35 * (1 - (rs - 1) / 1.5)
      } else {
        laserLine.visible = false; scanIntersectionRing.visible = false
      }
    }

    if (textureCtx) renderDynamicTexture()
    if (renderer && scene && camera) renderer.render(scene, camera)
    animationFrameId = requestAnimationFrame(tick)
  }

  // ─── 场景初始化 ──────────────────────────────────────────

  function initThree() {
    const container = canvasContainer.value
    if (!container) return
    const w = container.clientWidth, h = container.clientHeight

    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
    camera.position.set(0, 0, 9.2)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    container.appendChild(renderer.domElement)

    // 环境反射贴图：让金属/碳纤维材质产生真实高光
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.06).texture
    pmrem.dispose()

    scene.add(new THREE.AmbientLight(0xffffff, 0.35))
    const dl1 = new THREE.DirectionalLight(0xfff4e0, 1.5); dl1.position.set(5, 3, 5); scene.add(dl1)
    const gl = new THREE.DirectionalLight(0xC8924B, 2.0); gl.position.set(-6, 2, -4); scene.add(gl)

    createBaseMap()

    textureCanvas = document.createElement("canvas")
    textureCanvas.width = 1024; textureCanvas.height = 512
    textureCtx = textureCanvas.getContext("2d")
    earthTexture = new THREE.CanvasTexture(textureCanvas)

    earthMesh = new THREE.Group(); scene.add(earthMesh)

    // 加载预处理黑金地球贴图（scripts/process_earth.py 由 8K NASA 日图生成）
    new THREE.TextureLoader().load("/assets/earth-gold.jpg", tex => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
      const surfGeo = new THREE.SphereGeometry(sphereRadius, 96, 96)
      const surfMat = new THREE.ShaderMaterial({
        uniforms: {
          earthMap: { value: tex },
          lightDir: { value: new THREE.Vector3(0.55, 0.35, 0.75).normalize() }
        },
        vertexShader: "varying vec2 vUv; varying vec3 vNormal; void main() { vUv = uv; vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader: `
          uniform sampler2D earthMap;
          uniform vec3 lightDir;
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            vec3 base = texture2D(earthMap, vUv).rgb;

            // 柔和光照：背光面不死黑
            float ndl = dot(normalize(vNormal), lightDir);
            float day = smoothstep(-0.25, 0.7, ndl);
            vec3 col = base * mix(0.40, 1.16, day);

            // 晨昏线金色微光
            float terminator = smoothstep(0.22, 0.0, abs(ndl - 0.06));
            col += vec3(0.98, 0.78, 0.42) * terminator * 0.10;

            // 菲涅尔边缘光，勾勒球体轮廓
            float fres = pow(1.0 - clamp(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 2.6);
            col += vec3(0.80, 0.60, 0.30) * fres * 0.28;

            gl_FragColor = vec4(col, 1.0);
          }
        `
      })
      const surf = new THREE.Mesh(surfGeo, surfMat)
      // 贴图经度零点与站点坐标系对齐（SphereGeometry UV 与 latLongToVector3 相差 90°）
      surf.rotation.y = Math.PI / 2
      earthMesh.add(surf)
    }, undefined, err => console.error("Failed to load earth texture:", err))

    // 线框覆盖层
    const wireGeo = new THREE.SphereGeometry(sphereRadius + 0.005, 48, 48)
    earthMesh.add(new THREE.Mesh(wireGeo, new THREE.MeshBasicMaterial({ color: 0xc8924b, wireframe: true, transparent: true, opacity: 0.035 })))

    // 动态裂缝覆盖层
    const ovGeo = new THREE.SphereGeometry(sphereRadius + 0.008, 64, 64)
    overlayMesh = new THREE.Mesh(ovGeo, new THREE.MeshPhongMaterial({ map: earthTexture, transparent: true, shininess: 25, specular: 0x222222, depthWrite: false }))
    earthMesh.add(overlayMesh)

    setupDigitalAssets()

    // 大气辉光
    const glowMat = new THREE.ShaderMaterial({
      vertexShader: "varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: "varying vec3 vNormal; void main() { float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8); gl_FragColor = vec4(0.78, 0.57, 0.29, 0.3) * intensity; }",
      blending: THREE.AdditiveBlending, side: THREE.BackSide, transparent: true
    })
    glowMesh = new THREE.Mesh(new THREE.SphereGeometry(sphereRadius + 0.16, 64, 64), glowMat)
    scene.add(glowMesh)

    setupSideParticles()
    assemble3DDrone()
    assembleScannerBeam()
    renderDynamicTexture()

    window.addEventListener("resize", onWindowResize)
    container.addEventListener("mousedown", onMouseDown)
    container.addEventListener("mousemove", onMouseMove)
    container.addEventListener("mouseup", onMouseUp)
    container.addEventListener("wheel", onWheel, { passive: false })
    tick()
  }

  // ─── 生命周期 ────────────────────────────────────────────

  onMounted(() => {
    initThree()
    dronePos.set(0, sphereRadius + 1.8, 2)
    if (droneGroup) droneGroup.position.copy(dronePos)
  })

  onUnmounted(() => {
    window.removeEventListener("resize", onWindowResize)
    if (scene) scene.traverse(child => disposeThreeObj(child))
    if (baseMapCanvas) baseMapCanvas.width = 0
    if (textureCanvas) textureCanvas.width = 0
    if (earthTexture) earthTexture.dispose()
    if (canvasContainer.value && renderer) {
      renderer.dispose()
      renderer.forceContextLoss()
      canvasContainer.value.removeChild(renderer.domElement)
    }
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
  })
}
