import { AnimationAction, AnimationMixer, Group, Material, Mesh, Scene, Texture } from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'

import { Experience } from '../Experience'
import Debug from '../utils/Debug'
import Resources from '../utils/Resources'
import Time from '../utils/Time'

export class WorldObject {
  props?: Record<string, any>
  animation: {
    current?: AnimationAction
    play?: (name: string) => void
    mixer?: AnimationMixer
    actions: Record<string, AnimationAction>
  }
  experience: Experience
  scene: Scene
  resources: Resources
  debug: Debug
  time: Time

  resource: GLTF
  texture: Texture
  model: Group
  material: Material
  mesh: Mesh

  constructor(props?: Record<string, any>) {
    this.props = props
    this.experience = Experience.instance
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.time = this.experience.time
    this.debug = this.experience.debug

    // Play the action
    this.animation = {
      actions: {}
    }
    this.animation.play = name => {
      const newAction = this.animation.actions[name]
      const oldAction = this.animation.actions.current

      newAction.reset()
      newAction.play()
      // newAction.crossFadeFrom(oldAction, 1, true)

      this.animation.actions.current = newAction
    }
  }
}
