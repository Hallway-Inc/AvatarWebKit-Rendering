import { AmbientLight, DirectionalLight } from 'three'

import { CameraView } from '../../Camera'

import ReadyPlayerMeModelV2 from '../models/readyPlayerMeV2'
import { World } from '../World'
import { WorldObject } from '../worldObject'

import ChibModelV2 from '../models/chibV2'

import HallwayStreamRoom from './cube'

export class HallwayStreamWorld extends World {
  roomModel: HallwayStreamRoom
  model: WorldObject
  rpmModel: ReadyPlayerMeModelV2
  chibModel: ChibModelV2

  readonly views: { [key in 'isometric' | 'portrait']: CameraView } = {
    isometric: {
      position: { x: 13.5, y: 14, z: 12.5 },
      target: { x: -0.5, y: 1, z: -0.5 },
      zoom: 1
    },
    portrait: {
      position: { x: 1, y: 3.6, z: 1.2 },
      target: { x: 1, y: 2.9, z: -1 },
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

      const dLight = new DirectionalLight(color)
      this.scene.add(dLight)
      this.roomModel = new HallwayStreamRoom()

      if (this.resources.items.rpmModel) {
        this.rpmModel = new ReadyPlayerMeModelV2()
        this.rpmModel.sitHallwayStreamRoom()
      } else if (this.resources.items.chibModel) {
        this.chibModel = new ChibModelV2()
        this.chibModel.sitHallwayStreamRoom()
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

  update() {
    if (this.stream) {
      this.predictor.update(({ rotation, transform, blendShapes }) => {
        if (this.rpmModel) {
          this.rpmModel.updateHeadRotation(rotation.pitch, rotation.yaw, rotation.roll)
          this.rpmModel.updateHeadPosition(transform.x, transform.y, transform.z)
          this.rpmModel.updateBlendShapes(blendShapes)
        } else if (this.chibModel) {
          this.chibModel.updateBlendShapes(blendShapes)
          this.chibModel.updateHeadRotation(rotation.pitch, rotation.yaw, rotation.roll)
        }
      })
    }
  }
}
