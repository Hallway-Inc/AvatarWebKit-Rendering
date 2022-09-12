import * as THREE from 'three'
import { MeshBasicMaterial } from 'three'

import { World } from '../World'

import Baked from './baked'
import Block from './block'
import Car from './car'
import Emissives from './emissives'
import Intersect from './intersect'
import Screens from './screens'

export class Level5 extends World {
  bakedMaterial: MeshBasicMaterial
  baked: Baked
  block: Block
  intersect: Intersect
  screens: Screens
  emissives: Emissives
  car: Car

  constructor() {
    super()

    // Wait for resources
    this.resources.on('ready', () => {
      // Setup

      const bakedTexture = this.resources.items.level5BakedTexture
      bakedTexture.flipY = false
      bakedTexture.encoding = THREE.sRGBEncoding
      this.bakedMaterial = new MeshBasicMaterial({ map: bakedTexture })

      this.baked = new Baked({ bakedMaterial: this.bakedMaterial })
      this.block = new Block()
      this.intersect = new Intersect()
      this.screens = new Screens()
      this.emissives = new Emissives()
      this.car = new Car()
    })
  }

  update() {
    // if (this.fox) this.fox.update()
  }
}
