import { AvatarPrediction } from '@quarkworks-inc/avatar-webkit'
import * as THREE from 'three'
import { AmbientLight, MeshBasicMaterial } from 'three'

import { CameraView } from '../../Camera'

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

  readonly views: { [key in 'isometric' | 'portrait']: CameraView } = {
    isometric: {
      position: { x: 4, y: 1.5, z: 4 },
      target: { x: -0.5, y: 1, z: -0.5 },
      zoom: 1
    },
    portrait: {
      position: { x: 0.15, y: 1.1, z: 0.25 },
      target: { x: 0.15, y: 0.8, z: -1 },
      zoom: 1
    }
  }

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

      this.experience.camera.setView(this.views.isometric)
      // Debug
      if (this.experience.debug.active) {
        const cameraDebugObject = {
          isometric: () => this.experience.camera.setView(this.views.isometric, true),
          portrait: () => this.experience.camera.setView(this.views.portrait, true)
        }
        const cameraFolder = this.experience.debug.ui.addFolder('camera')
        cameraFolder.add(cameraDebugObject, 'isometric')
        cameraFolder.add(cameraDebugObject, 'portrait')
      }
    })
  }

  manualAvatarPrediction({ rotation, transform, blendShapes }: AvatarPrediction) {
    if (blendShapes) {
      this.rpmModel.updateBlendShapes(blendShapes)
    }

    if (transform) {
      this.rpmModel.updateHeadPosition(transform.x, transform.y, transform.z)
    }

    if (rotation) {
      this.rpmModel.updateHeadRotation(rotation.pitch, rotation.yaw, rotation.roll)
    }
  }

  update() {
    if (this.stream) {
      this.predictor.update(({ rotation, transform, blendShapes }) => {
        if (this.rpmModel) {
          this.rpmModel.updateHeadRotation(rotation.pitch, rotation.yaw, rotation.roll)
          this.rpmModel.updateHeadPosition(transform.x, transform.y, transform.z)
          this.rpmModel.updateBlendShapes(blendShapes)
        }
      })
    }
  }
}
