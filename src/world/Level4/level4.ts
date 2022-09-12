import * as THREE from 'three'
import { MeshBasicMaterial } from 'three'

import { World } from '../World'

import Baked from './baked'
import Block from './block'
import Box from './box'
import Elevator from './elevator'
import Intersect from './intersect'
import OuterWalls from './outerWalls'

export class Level4 extends World {
  bakedMaterial: MeshBasicMaterial
  baked: Baked
  block: Block
  intersect: Intersect
  box: Box
  elevator: Elevator
  outerWalls: OuterWalls

  constructor() {
    super()

    // Wait for resources
    this.resources.on('ready', () => {
      // Setup

      const bakedTexture = this.resources.items.level4BakedTexture
      bakedTexture.flipY = false
      bakedTexture.encoding = THREE.sRGBEncoding
      this.bakedMaterial = new MeshBasicMaterial({ map: bakedTexture })

      this.baked = new Baked({ bakedMaterial: this.bakedMaterial })
      this.block = new Block()
      this.outerWalls = new OuterWalls({ bakedMaterial: this.bakedMaterial })
      this.intersect = new Intersect()
      // this.box = new Box({ bakedMaterial: this.bakedMaterial })
      // this.elevator = new Elevator({ bakedMaterial: this.bakedMaterial })
    })
  }

  update() {
    // if (this.fox) this.fox.update()
  }
}
