import type { Controller, GUI } from 'lil-gui'

import { AUWorkerManager } from '@quarkworks-inc/avatar-webkit'
import { Scene } from 'three'

import { Experience } from '../Experience.js'
import Resources from '../utils/Resources.js'

// https://stackoverflow.com/questions/44153378/typescript-abstract-optional-method
export interface World {
  stopAnimation?(): void
  playAnimation?(): void
  update?(): void
}

export abstract class World {
  experience: Experience
  scene: Scene
  resources: Resources
  predictor: AUWorkerManager

  /** Stream used for predictor, if one is active */
  stream?: MediaStream

  /** Lil-gui properties for live mode */
  liveModeDebugObject?: { start: () => void; stop: () => void; deviceId: string }

  /** Folder for live mode */
  liveModeFolder?: GUI

  /** Start button */
  startController?: Controller

  /** Stop button */
  stopController?: Controller

  /** Dropdown for video devices */
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

      navigator.mediaDevices.addEventListener('devicechange', () => this.handleDeviceChange())
    }
  }

  update() {
    // implement in subclass
  }

  dispose() {
    this.stopLiveMode()
    this.predictor.dispose()
  }

  /**
   * Runs when start button is pressed
   */
  async handleStart() {
    try {
      const stream = await this.requestCamera()
      await this.startLiveMode(stream)
    } catch (e) {
      console.error('Failed to start:', e)
    }
  }

  /**
   * Runs when device list has potentially changed. If necessary, restarts live mode.
   */
  async handleDeviceChange() {
    if (this.stream === undefined) return // Live mode not active

    try {
      await this.stopLiveMode()
      const stream = await this.requestCamera()
      await this.startLiveMode(stream)
    } catch (e) {
      console.error('Failed to restart: ', e)
    }
  }

  /**
   * Start live mode with the provided stream
   */
  async startLiveMode(stream: MediaStream) {
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

  /**
   * Tear down stream and stop predictions
   */
  stopLiveMode() {
    this.predictor.stop()
    this.stream?.getTracks()?.forEach(track => track.stop())
    this.stream = undefined

    this.stopController?.hide()
    this.startController?.show()
  }

  /**
   * Request camera access and enumerate available devices
   *
   * @returns Stream obtained during the permission flow
   */
  async requestCamera() {
    // DeviceId as selected in lil-gui (may be invalid)
    const guiSelectedDeviceId = this.liveModeDebugObject.deviceId

    // Must call .getUserMedia() so Firefox can read device labels
    // We provide our UI's selected deviceId as preference, but it may be overriden by browser UI
    const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: guiSelectedDeviceId } })

    // Which deviceId was ultimately selected by the browser
    const browserSelectedDeviceId = stream.getVideoTracks()[0].getSettings().deviceId

    // Now we have permission to view all device labels
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(device => device.kind === 'videoinput')

    // Format for lil-gui
    const options = Object.fromEntries(videoDevices.map(info => [info.label, info.deviceId])) // Lil-gui options take the shape { label: value }
    this.deviceIdController ??= this.liveModeFolder.add(this.liveModeDebugObject, 'deviceId').name('Camera') // Add the controller on first time only
    this.deviceIdController = this.deviceIdController // Reassign because updating options() destroys old reference
      .options(options) // Update options and destroy old controller
      .onChange(() => this.handleDeviceChange()) // Needs to be set each time on new controller
    this.deviceIdController.setValue(browserSelectedDeviceId) // Update to reflect true value

    return stream
  }
}
