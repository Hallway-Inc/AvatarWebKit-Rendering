import { Camera, Clock, Scene, WebGLRenderer } from 'three'

type PeerId = string
const clock = new Clock()

export interface TickUpdateable {
  tick(delta: number): void
}

export class WebGLLoop {
  cameras: Map<PeerId, Camera>
  canvas: HTMLCanvasElement
  containers: Map<PeerId, HTMLElement>
  isRunning: boolean
  renderer: WebGLRenderer
  scenes: Map<PeerId, Scene>
  updatables: TickUpdateable[]
  isGlobalCanvas: boolean

  constructor(
    canvas: HTMLCanvasElement,
    renderer: WebGLRenderer,
    cameras: Map<PeerId, Camera> = new Map(),
    containers: Map<PeerId, HTMLElement> = new Map(),
    scenes: Map<PeerId, Scene> = new Map(),
    isGlobalCanvas = true
  ) {
    this.cameras = cameras
    this.canvas = canvas
    this.containers = containers
    this.renderer = renderer
    this.scenes = scenes
    this.updatables = []
    this.isGlobalCanvas = isGlobalCanvas
  }

  start() {
    this.isRunning = true
    this.renderer.setAnimationLoop(() => {
      // tell every animated object to tick forward one frame
      this.tick()

      this.canvas.style.transform = `translateY(${this.isGlobalCanvas ? window.scrollY : 0}px)`

      this.renderer.setClearColor(0xffffff)
      this.renderer.setScissorTest(false)
      this.renderer.clear()
      this.renderer.setScissorTest(true)

      this.containers.forEach((container: HTMLElement, key: PeerId) => {
        const scene = this.scenes.get(key)
        const camera = this.cameras.get(key)
        if (!container || !scene || !camera) return
        const { left, right, top, bottom, width, height } = container.getBoundingClientRect()

        const isOffScreen =
          bottom < 0 ||
          top > this.renderer.domElement.clientHeight ||
          right < 0 ||
          left > this.renderer.domElement.clientWidth

        if (isOffScreen && this.isGlobalCanvas) return

        // These adjustments should only be used for the global canvas
        const finalLeft = this.isGlobalCanvas ? left : 0

        // Y position for 3js is relative to bottom left
        // Using renderer domElements clientHeight, the canvas height
        // varies based upon window.devicePixelRatio
        // const yPos = this.canvas.height - bottom
        // These adjustments should only be used for the global canvas
        const yPos = this.isGlobalCanvas ? this.renderer.domElement.clientHeight - bottom : 0

        this.renderer.setViewport(finalLeft, yPos, width, height)
        this.renderer.setScissor(finalLeft, yPos, width, height)

        this.renderer.render(scene, camera)
      })
    })
  }

  stop() {
    this.isRunning = false
    this.renderer.setAnimationLoop(null)
  }

  addWorld(id: PeerId, camera: Camera, scene: Scene, container: HTMLElement) {
    // this.renderer.compile(scene, camera)
    this.cameras.set(id, camera)
    this.scenes.set(id, scene)
    this.containers.set(id, container)
  }

  removeWorld(id: PeerId) {
    console.log('removeWorld', id)
    this.cameras.delete(id)
    this.scenes.delete(id)
    this.containers.delete(id)
  }

  tick() {
    // Only do this once per frame
    const delta = clock.getDelta()

    for (const object of this.updatables) {
      object.tick(delta)
    }
  }
}
