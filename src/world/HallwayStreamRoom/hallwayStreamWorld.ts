import { AmbientLight, DirectionalLight } from 'three'

import ReadyPlayerMeModelV2 from '../models/readyPlayerMeV2'

import { World } from '../World'

import HallwayStreamRoom from './cube'

export class HallwayStreamWorld extends World {
  roomModel: HallwayStreamRoom
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

      const dLight = new DirectionalLight(color)
      this.scene.add(dLight)
      this.roomModel = new HallwayStreamRoom()

      if (this.resources.items.rpmModel) {
        this.rpmModel = new ReadyPlayerMeModelV2()
        this.rpmModel.sitHallwayStreamRoom()
      }
    })
  }

  update() {
    // if (this.fox) this.fox.update()
  }
}
