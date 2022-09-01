import { Scene } from 'three'

import { Experience } from '../Experience.js'
import Resources from '../utils/Resources.js'

import Environment from './Environment.js'
import Floor from './Floor.js'
import Fox from './Fox.js'

export class World {
  experience: Experience
  scene: Scene
  resources: Resources

  floor: Floor
  fox: Fox
  environment: Environment

  constructor() {
    this.experience = Experience.instance
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on('ready', () => {
      // Setup
      this.floor = new Floor()
      this.fox = new Fox()
      this.environment = new Environment()
    })
  }

  update() {
    if (this.fox) this.fox.update()
  }
}
