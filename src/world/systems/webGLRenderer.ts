import { WebGLRenderer, LinearToneMapping, sRGBEncoding } from 'three'

/**
 * Options for default renderer behavior
 * If you want more fine-grain control, you can create your own WebGLRenderer instead
 */
export type DefaultWebGLRendererOpts = {
  /**
   * Renderer size (viewport) is set based on canvas size. This parameter instructs three.js
   * whether to update the canvas style to match or not. Defaults to false to keep canvas size
   * from being changed as a side effect of updating renderer size.
   *
   * Default: false
   */
  updateCanvasStyle?: boolean

  /**
   * If enabled, uses the ResizeObserver API to monitor the size of the canvas, and update the
   * renderer size if changed. This should handle scaling the scene correctly for both window resizing
   * and any other size changes of the canvas (ex. animations), provided you are setting the width/height
   * of the canvas some how.
   */
  resizeWithCanvas?: boolean
}

/**
 * Used by the RenderLoop to create a default WebGLRenderer in the case where one is not provided in the
 * constructor. This can be used for most circumstances.
 *
 * If you would like further control outside of the default options, you can create your own to give to the
 * RenderLoop, or you have public access as well to modify its properties after creation.
 */
export const createDefaultWebGLRenderer = (canvas: HTMLCanvasElement, opts: DefaultWebGLRendererOpts = {}) => {
  const { updateCanvasStyle = false, resizeWithCanvas = true } = opts

  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas: canvas,
    // MSN Docs: whether to preserve the buffers until manually cleared or overwritten. Default is false.
    //
    // We should probably not change this to true.
    // * If canvas context is lost & restored, something with three.js/canvas stops functioning and it becomes blank.
    //   This can happen for example if you connect/disconnect a monitor (open/close laptop lid to test). For some reason,
    //   a new React render of the <canvas> element fixes it. This what discovered by accident. Couldn't find out why or
    //   how to trigger ourselves. This module itself is not a React-based lib, so we couldn't use a Reactful way to solve
    //   the problem from within the lib.
    // * 'false' is the more optimized option. The browser has 2 drawing buffers, only 1 is actively on screen. The other
    //   is drawn to while offscreen and swapped when ready. Turning this on changes the paradigm to copy instead of swap,
    //   which is inefficient.
    // * We may want to set this to 'true' for scissoring optimizations (ex. with this enabled, we could leave one scene
    //   untouched child updating another in 1 frame pass, instead of clearing and redrawing everything.) If we decide to
    //   do this we will want to figure out how to handle the context loss/restoration issue.
    preserveDrawingBuffer: false
  })

  renderer.physicallyCorrectLights = true
  renderer.toneMapping = LinearToneMapping
  renderer.toneMappingExposure = 0.8
  renderer.outputEncoding = sRGBEncoding

  renderer.setClearColor(0xffffff, 0)
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, updateCanvasStyle)

  // Resize the renderer if canvas size changes. ex) window resize, animation...
  if (resizeWithCanvas) {
    new ResizeObserver(entries => {
      for (const entry of entries) {
        renderer.setSize(entry.contentRect.width, entry.contentRect.height, updateCanvasStyle)
      }
    }).observe(canvas, { box: 'content-box' })
  }

  /**
   * Note: I think this pixel ratio listener is unneeded now because the
   * ResizeObserver accounts for it in its contentRect. I no longer see a
   * blurring problem when moving the page between 1dpi / 2dpi monitor.
   * If I enable this code, the canvas size scales out of control on 2dpi monitor
   * because the setSize() multiplies the size given it by the pixel ratio that's
   * been set.
   */

  // Listen for pixel ratio changes using matchMedia() query and update the WebGL renderer
  // as needed. This can happen when the window switches between devices. ex) retina --> monitor
  // const updatePixelRatio = () => {
  //   console.log('setting pixel ratio...', window.devicePixelRatio)
  //   renderer.setPixelRatio(window.devicePixelRatio)

  //   const mediaQuery = `(resolution: ${window.devicePixelRatio}dppx)`
  //   matchMedia(mediaQuery).addEventListener('change', updatePixelRatio, {
  //     once: true
  //   })
  // }

  // Sets initial value
  // updatePixelRatio()

  return renderer
}
