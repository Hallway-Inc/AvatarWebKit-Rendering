import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module'

import { hallwayPublicCDNUrl } from '../../utils/cdn'

async function loadModel(url: string, options: { useMeshopt: boolean } = { useMeshopt: false }) {
  const loader = new GLTFLoader()

  if (options.useMeshopt) {
    loader.setMeshoptDecoder(MeshoptDecoder)
  }

  const [emojiData] = await Promise.all([loader.loadAsync(url)])
  const emoji = emojiData.scene
  emoji.position.set(0, 0, 0)

  return emoji
}

async function loadModelFromPublicCDN(path: string) {
  return loadModel(hallwayPublicCDNUrl(path))
}

export { loadModel, loadModelFromPublicCDN }
