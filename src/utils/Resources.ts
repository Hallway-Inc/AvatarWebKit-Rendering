import { CubeTextureLoader, TextureLoader } from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module'

import EventEmitter from './EventEmitter.js'

export type ResourceLoaders = {
  gltfLoader: GLTFLoader
  dracoLoader: DRACOLoader
  textureLoader: TextureLoader
  cubeTextureLoader: CubeTextureLoader
}

export default class Resources extends EventEmitter {
  loaders: ResourceLoaders
  sources: any
  items: any = {}
  toLoad = 0
  loaded = 0

  constructor(sources) {
    super()

    this.sources = sources
    this.toLoad = this.sources.length

    this.setLoaders()
    this.startLoading()
  }

  setLoaders() {
    this.loaders = {
      gltfLoader: new GLTFLoader(),
      dracoLoader: new DRACOLoader(),
      textureLoader: new TextureLoader(),
      cubeTextureLoader: new CubeTextureLoader()
    }
    this.loaders.dracoLoader.setDecoderPath('draco/')
    this.loaders.gltfLoader.setDRACOLoader(this.loaders.dracoLoader)
    this.loaders.gltfLoader.setMeshoptDecoder(MeshoptDecoder)
  }

  startLoading() {
    // Load each source
    for (const source of this.sources) {
      if (source.type === 'gltfModel') {
        this.loaders.gltfLoader.load(source.path, file => {
          this.sourceLoaded(source, file)
        })
      } else if (source.type === 'texture') {
        this.loaders.textureLoader.load(source.path, file => {
          this.sourceLoaded(source, file)
        })
      } else if (source.type === 'cubeTexture') {
        this.loaders.cubeTextureLoader.load(source.path, file => {
          this.sourceLoaded(source, file)
        })
      }
    }
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file

    this.loaded++

    if (this.loaded === this.toLoad) {
      this.trigger('ready')
    }
  }
}
