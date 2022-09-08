import { Scene } from 'three'

import { Experience } from '../../Experience'
import Resources from '../../utils/Resources.js'

import { World } from '../World'

import Environment from './Environment.js'
import Floor from './Floor.js'
import Fox from './Fox.js'

export class FoxWorld extends World {
  experience: Experience
  scene: Scene
  resources: Resources

  floor: Floor
  fox: Fox
  environment: Environment

  constructor() {
    super()

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
