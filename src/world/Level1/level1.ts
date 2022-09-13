import * as THREE from 'three'
import { AmbientLight, MeshBasicMaterial } from 'three'

import ReadyPlayerMeModelV2 from '../models/readyPlayerMeV2'

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
  rpmModel: ReadyPlayerMeModelV2

  constructor() {
    super()

    // Wait for resources
    this.resources.on('ready', () => {
      // Setup
      const color = 0xffffff
      const intensity = 1
      const light = new AmbientLight(color, intensity)
      this.scene.add(light)

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

      if (this.resources.items.rpmModel) {
        this.rpmModel = new ReadyPlayerMeModelV2()
        this.rpmModel.sitLevel1()
      }
    })
  }

  update() {
    // if (this.fox) this.fox.update()
  }
}
