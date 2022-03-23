import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

function setupEmoji(data) {
  const model = data.scene
  return model
}

async function loadEmoji() {
  const loader = new GLTFLoader()

  const [emojiData] = await Promise.all([loader.loadAsync('../Smiley_eye.glb')])

  const emoji = setupEmoji(emojiData)
  emoji.position.set(0, 0, 0)

  //   const flamingo = setupModel(flamingoData);
  //   flamingo.position.set(7.5, 0, -10);

  //   const stork = setupModel(storkData);
  //   stork.position.set(0, -2.5, -10);

  return emoji
}

export { loadEmoji }
