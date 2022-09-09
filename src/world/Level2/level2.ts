import * as THREE from 'three'
import { MeshBasicMaterial } from 'three'

import { World } from '../World'

import Baked from './baked'
import Basics from './basics'
import Block from './block'
import FloorShadow from './floorShadow'
import Intersect from './intersect'
import Laser from './laser'
import Window from './window'

export class Level2 extends World {
  bakedMaterial: MeshBasicMaterial
  baked: Baked
  intersect: Intersect
  window: Window
  block: Block
  basics: Basics
  floorShadow: FloorShadow
  laser: Laser

  constructor() {
    super()

    // Wait for resources
    this.resources.on('ready', () => {
      // Setup

      const bakedTexture = this.resources.items.level2BakedTexture
      bakedTexture.flipY = false
      bakedTexture.encoding = THREE.sRGBEncoding
      this.bakedMaterial = new MeshBasicMaterial({ map: bakedTexture })

      this.baked = new Baked({ bakedMaterial: this.bakedMaterial })
      this.intersect = new Intersect()
      this.window = new Window()
      this.block = new Block()
      this.basics = new Basics()
      this.floorShadow = new FloorShadow()
      this.laser = new Laser()
    })
  }

  update() {
    // if (this.fox) this.fox.update()
  }
}
