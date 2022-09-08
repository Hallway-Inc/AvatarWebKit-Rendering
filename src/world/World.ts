import { Scene } from 'three'

import { Experience } from '../Experience.js'
import Resources from '../utils/Resources.js'

export class World {
  experience: Experience
  scene: Scene
  resources: Resources

  constructor() {
    this.experience = Experience.instance
    this.scene = this.experience.scene
    this.resources = this.experience.resources
  }

  update() {
    // implement in subclass
  }
}
