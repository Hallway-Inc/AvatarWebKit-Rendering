import * as THREE from 'three'
import { MeshBasicMaterial } from 'three'

import { World } from '../World'

import Baked from './baked'
import Block from './block'
import Drone from './drone'
import Printer from './printer'
export class Level3 extends World {
  bakedMaterial: MeshBasicMaterial
  baked: Baked
  printer: Printer
  drone: Drone
  block: Block

  constructor() {
    super()

    // Wait for resources
    this.resources.on('ready', () => {
      // Setup

      const bakedTexture = this.resources.items.level3BakedTexture
      bakedTexture.flipY = false
      bakedTexture.encoding = THREE.sRGBEncoding
      this.bakedMaterial = new MeshBasicMaterial({ map: bakedTexture })

      this.baked = new Baked({ bakedMaterial: this.bakedMaterial })
      this.block = new Block()
      this.drone = new Drone()
      this.printer = new Printer()
    })
  }

  update() {
    // if (this.fox) this.fox.update()
  }
}
