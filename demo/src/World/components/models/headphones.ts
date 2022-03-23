import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

function setupHeadphones(data) {
  // console.log(data)
  const model = data.scene
  return model
}

async function loadHeadphones() {
  const loader = new GLTFLoader()
  const [headphoneData] = await Promise.all([loader.loadAsync('../headphones_2.glb')])

  const headphones = setupHeadphones(headphoneData)
  return headphones
}

export { loadHeadphones }
