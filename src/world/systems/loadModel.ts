import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { hallwayPublicCDNUrl } from '../../utils/cdn'

async function loadModel(url: string, useMeshopt = false) {
  const loader = new GLTFLoader()

  if (useMeshopt) {
    // Lazy load
    const { MeshoptDecoder } = await import('three/examples/jsm/libs/meshopt_decoder.module')
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
