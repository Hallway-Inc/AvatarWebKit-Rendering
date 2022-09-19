import type { Controller } from 'lil-gui'

import { AUWorkerManager } from '@quarkworks-inc/avatar-webkit'
import { Scene } from 'three'

import { Experience } from '../Experience.js'
import Resources from '../utils/Resources.js'

export class World {
  experience: Experience
  scene: Scene
  resources: Resources
  predictor: AUWorkerManager
  stream?: MediaStream
  startController?: Controller
  stopController?: Controller

  constructor() {
    this.experience = Experience.instance
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.predictor = new AUWorkerManager()

    if (this.experience.debug.active) {
      const liveModeDebugObject = {
        start: () => this.startLiveMode(),
        stop: () => this.stopLiveMode()
      }
      const liveModeFolder = this.experience.debug.ui.addFolder('live mode')
      this.startController = liveModeFolder.add(liveModeDebugObject, 'start')
      this.stopController = liveModeFolder.add(liveModeDebugObject, 'stop')
      this.stopController.hide()
    }
  }

  update() {
    // implement in subclass
  }

  dispose() {
    this.stopLiveMode()
    this.predictor.dispose()
  }

  async startLiveMode() {
    const stream = this.stream ?? (await navigator.mediaDevices.getUserMedia({ video: true }))
    const videoTracks = stream.getVideoTracks()

    if (videoTracks.length === 0) throw new Error('no video tracks found')

    await this.predictor.initialize({
      apiToken: process.env.AVATAR_WEBKIT_AUTH_TOKEN
    })

    this.predictor.start(stream)
    this.stream = stream
    this.startController?.hide()
    this.stopController?.show()
  }

  stopLiveMode() {
    this.predictor.stop()
    this.stream?.getTracks()?.forEach(track => track.stop())
    this.stream = undefined

    this.stopController?.hide()
    this.startController?.show()
  }
}
