import { WebGLRenderer, LinearToneMapping, sRGBEncoding } from 'three'

export const createRenderer = (canvas: HTMLCanvasElement) => {
  const renderer = new WebGLRenderer({
    alpha: true, // Needed for global canvas
    antialias: true,
    canvas: canvas,
    preserveDrawingBuffer: true
  })

  renderer.setClearColor(0xcccccc)
  renderer.physicallyCorrectLights = true
  renderer.toneMapping = LinearToneMapping
  renderer.toneMappingExposure = 0.8
  renderer.outputEncoding = sRGBEncoding

  return renderer
}
