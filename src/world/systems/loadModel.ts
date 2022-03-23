import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

async function loadModel(url: string) {
  const loader = new GLTFLoader()

  const [emojiData] = await Promise.all([loader.loadAsync(url)])
  console.log(emojiData)
  const emoji = emojiData.scene
  emoji.position.set(0, 0, 0)

  return emoji
}

export { loadModel }
