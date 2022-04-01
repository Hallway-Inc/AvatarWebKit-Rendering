import { Clock, WebGLRenderer } from 'three'
import { createGlobalCanvas, isGlobalCanvas } from './globalCanvas'
import { Updateable, Renderable, AvatarRendererConfig } from './types'
import { EnvironmentLoader } from './world/systems/environmentLoader'
import { createDefaultWebGLRenderer } from './world/systems/webGLRenderer'

const clock = new Clock()

export class AvatarRenderer {
  webGLRenderer: WebGLRenderer
  canvas: HTMLCanvasElement
  environmentLoader: EnvironmentLoader
  drawWhenOffscreen: boolean
  isRunning: boolean = false

  updatables: Updateable[] = []
  renderables: Renderable[] = []

  constructor({ canvas, webGLRenderer, environmentLoader }: AvatarRendererConfig) {
    this.canvas = canvas || createGlobalCanvas()
    this.webGLRenderer = webGLRenderer || createDefaultWebGLRenderer(this.canvas)
    this.environmentLoader = environmentLoader || new EnvironmentLoader(this.webGLRenderer)
  }

  start() {
    this.isRunning = true
    this.webGLRenderer.setAnimationLoop(() => {
      // tell every animated object to tick forward one frame
      const delta = clock.getDelta()
      for (const updatable of this.updatables) {
        updatable.tick(delta)
      }

      // translate to match scroll on page
      if (isGlobalCanvas(this.canvas)) {
        this.canvas.style.transform = `translate(${window.scrollX}px, ${window.scrollY}px)`
      }

      // Clear canvas
      this.webGLRenderer.clear()

      // Draw things
      for (const renderable of this.renderables) {
        this._withScissoredViewport(renderable, () => {
          renderable.render(this.webGLRenderer)
        })
      }
    })
  }

  private _isRenderableOffscreen(renderable: Renderable): boolean {
    const { top, left, bottom, right } = renderable.getContainerRect()

    return (
      bottom < 0 || // above
      top > this.canvas.clientHeight || // below
      right < 0 || // left
      left > this.canvas.clientWidth
    ) // right
  }

  private _withScissoredViewport(renderable: Renderable, render: () => void) {
    if (!isGlobalCanvas(this.canvas)) {
      render()
      return
    }

    // For global canvas, we do some optimization to skip item drawing when offscreen
    if (this._isRenderableOffscreen(renderable)) {
      return
    }

    // For global canvas, we use scissoring technique to draw scenes to different locations on the canvas
    this.webGLRenderer.setScissorTest(true)

    const { width, height, left, bottom } = renderable.getContainerRect()

    const xPos = left
    const yPos = this.canvas.clientHeight - bottom

    this.webGLRenderer.setViewport(xPos, yPos, width, height)
    this.webGLRenderer.setScissor(xPos, yPos, width, height)

    render()

    this.webGLRenderer.setScissorTest(false)
  }

  stop() {
    this.isRunning = false
    this.webGLRenderer.setAnimationLoop(null)
  }
}
