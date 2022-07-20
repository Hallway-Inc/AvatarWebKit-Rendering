import path from 'path'

import { Loader, PMREMGenerator, Texture, WebGLRenderer, TextureLoader, sRGBEncoding, RepeatWrapping } from 'three'
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

export class EnvironmentLoader {
  private pmremGenerator: PMREMGenerator

  constructor(renderer: WebGLRenderer) {
    this.pmremGenerator = new PMREMGenerator(renderer)
    this.pmremGenerator.compileEquirectangularShader()
  }

  textureLoaderForExtension(ext: string, fallback: Loader | undefined = new TextureLoader()): Loader {
    switch (ext) {
      case 'exr':
      case '.exr':
        return new EXRLoader()
      case 'hdr':
      case '.hdr':
        return new RGBELoader()
      case 'jpg':
      case '.jpg':
      case 'jpeg':
      case '.jpeg':
      case 'png':
      case '.png':
        return new TextureLoader()
      default:
        return fallback
    }
  }

  async load(url: string, onProgress?: (event: ProgressEvent<EventTarget>) => void): Promise<Texture | null> {
    if (!url) return Promise.reject('invalid url')

    return this.loadWith(url, this.textureLoaderForExtension(path.extname(url)), onProgress)
  }

  async loadWith(
    url: string,
    textureLoader: Loader,
    onProgress?: (event: ProgressEvent<EventTarget>) => void
  ): Promise<Texture | null> {
    if (!url) return Promise.reject('invalid url')

    return textureLoader.loadAsync(url, onProgress).then(texture => {
      if (textureLoader instanceof TextureLoader) {
        // LDR images
        texture.encoding = sRGBEncoding
        return texture
      }
      const envMap = this.pmremGenerator.fromEquirectangular(texture).texture
      this.pmremGenerator.dispose()

      return envMap
    })
  }
}
