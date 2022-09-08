import * as THREE from 'three'
import { MeshBasicMaterial } from 'three'

import { World } from '../World'

import Baked from './baked'
import Cactus from './cactus'
import CameraHead from './cameraHead'
import CubeModel from './cubeModel'
import Intersect from './intersect'
import PyramidModel from './pyramidModel'
import Sudo from './sudo'
import SudoHead from './sudoHead'

export class Level1 extends World {
  bakedMaterial: MeshBasicMaterial
  baked: Baked
  cactus: Cactus
  sudoHead: SudoHead
  intersect: Intersect
  sudo: Sudo
  cameraHead: CameraHead
  cubeModel: CubeModel
  pyramidModel: PyramidModel

  constructor() {
    super()

    // Wait for resources
    this.resources.on('ready', () => {
      // Setup

      const bakedTexture = this.resources.items.level1BakedTexture
      bakedTexture.flipY = false
      bakedTexture.encoding = THREE.sRGBEncoding
      this.bakedMaterial = new MeshBasicMaterial({ map: bakedTexture })

      this.baked = new Baked({ bakedMaterial: this.bakedMaterial })
      this.intersect = new Intersect()
      this.cactus = new Cactus({ bakedMaterial: this.bakedMaterial })
      this.sudoHead = new SudoHead({ bakedMaterial: this.bakedMaterial })
      this.sudo = new Sudo({ bakedMaterial: this.bakedMaterial })
      this.cameraHead = new CameraHead({ bakedMaterial: this.bakedMaterial })
      this.cubeModel = new CubeModel()
      this.pyramidModel = new PyramidModel()
    })
  }

  update() {
    // if (this.fox) this.fox.update()
  }
}
