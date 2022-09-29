import { ExperienceConfig } from '../Experience.js'

import EventEmitter from './EventEmitter.js'

export default class Sizes extends EventEmitter {
  width: number
  height: number
  pixelRatio: number

  constructor(config: ExperienceConfig) {
    super()

    // Setup
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.pixelRatio = Math.min(window.devicePixelRatio, config.maxPixelRatio)

    // Resize event
    window.addEventListener('resize', () => {
      this.width = window.innerWidth
      this.height = window.innerHeight
      this.pixelRatio = Math.min(window.devicePixelRatio, config.maxPixelRatio)

      this.trigger('resize')
    })
  }
}
