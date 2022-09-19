import type { Controller, GUI } from 'lil-gui'

import { AUWorkerManager } from '@quarkworks-inc/avatar-webkit'
import { Scene } from 'three'

import { Experience } from '../Experience.js'
import Resources from '../utils/Resources.js'
import { FoxWorld } from './FoxWorld/FoxWorld.js'

export class World {
  experience: Experience
  scene: Scene
  resources: Resources
  predictor: AUWorkerManager
  stream?: MediaStream
  videoDevices: MediaDeviceInfo[]
  liveModeDebugObject?: { start: () => void; stop: () => void; deviceId: string }
  liveModeFolder?: GUI
  startController?: Controller
  stopController?: Controller
  deviceIdController?: Controller

  constructor() {
    this.experience = Experience.instance
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.predictor = new AUWorkerManager()

    if (this.experience.debug.active) {
      this.liveModeDebugObject = {
        start: () => this.handleStart(),
        stop: () => this.stopLiveMode(),
        deviceId: ''
      }
      this.liveModeFolder = this.experience.debug.ui.addFolder('live mode')
      this.startController = this.liveModeFolder.add(this.liveModeDebugObject, 'start')
      this.stopController = this.liveModeFolder.add(this.liveModeDebugObject, 'stop')
      this.stopController.hide()

      navigator.mediaDevices.addEventListener('devicechange', () => this.updateVideoDevices())
      window['updateVideoDevices'] = () => this.updateVideoDevices()
    }
  }

  update() {
    // implement in subclass
  }

  dispose() {
    this.stopLiveMode()
    this.predictor.dispose()
  }

  // Runs when start button is clicked
  async handleStart() {
    try {
      await this.updateVideoDevices()
      await this.startLiveMode()
    } catch (e) {
      console.error('Failed to start:', e)
    }
  }

  // Runs when video device dropdown value changes
  async handleDeviceIdControllerChange() {
    if (this.stream !== undefined) {
      await this.stopLiveMode()
      await this.startLiveMode()
    }
  }

  // Runs when 'devicechange' event fires (e.g. device disconnected)
  async handleDeviceChange() {
    await this.updateVideoDevices()

    await this.stopLiveMode()
    await this.startLiveMode()
  }

  /**
   * Start live mode with currently selected video device
   */
  async startLiveMode() {
    if (this.stream) return

    const deviceId = this.deviceIdController.getValue()
    const constraints: MediaStreamConstraints = {
      video: { deviceId }
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints)

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

  async updateVideoDevices() {
    // Must call .getUserMedia() so Firefox can read device labels
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    this.liveModeDebugObject.deviceId = stream.getVideoTracks()[0].getSettings().deviceId

    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(device => device.kind === 'videoinput')

    console.log({ videoDevices })

    // Format for lil-gui

    const options = Object.fromEntries(videoDevices.map(info => [info.label, info.deviceId]))
    this.deviceIdController ??= this.liveModeFolder.add(this.liveModeDebugObject, 'deviceId') // Add the controller on first time only
    this.deviceIdController = this.deviceIdController // Reassign because updating options() destroys old reference
      .options(options)
      .onChange(() => this.handleDeviceIdControllerChange())

    // Verify the selected deviceId exists. If not, pick the first available device

    const deviceId = this.deviceIdController.getValue()
    if (videoDevices.find(info => info.deviceId === deviceId) === undefined) {
      if (videoDevices.length === 0) throw new Error('No video devices found')
      this.deviceIdController.setValue(videoDevices[0].deviceId)
    }
  }
}
