import type { Controller, GUI } from 'lil-gui'

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

      navigator.mediaDevices.addEventListener('devicechange', () => this.requestCamera())
      window['updateVideoDevices'] = () => this.requestCamera()
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
      /**
       * FIRST TIME
       * Request a stream (provide deviceId if user has selected one)
       * Determine which deviceId was actually retrieved from stream (maybe the requested deviceId wasn't available)
       * Save the stream for later
       * Enumerate available device
       * Update lil-gui to show the device list
       * Update lil-gui to show the active device
       *
       * MANUAL RESTART
       * Request a stream with the provided deviceId (assume it is still available)
       * Save the stream for later
       */
      const stream = await this.requestCamera()
      await this.startLiveMode(stream)
    } catch (e) {
      console.error('Failed to start:', e)
    }
  }

  // Runs when video device dropdown value changes
  async handleDeviceIdControllerChange() {
    if (this.stream !== undefined) {
      await this.stopLiveMode()

      const stream = await this.requestCamera()

      await this.startLiveMode(stream)
    }
  }

  // Runs when 'devicechange' event fires (e.g. device disconnected)
  async handleDeviceChange() {
    await this.stopLiveMode()

    const stream = await this.requestCamera()

    await this.startLiveMode(stream)
  }

  /**
   * Start live mode with currently selected video device
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
   * Note: this returns a stream obtained during the permission flow
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

    console.log({ videoDevices })

    // Format for lil-gui

    const options = Object.fromEntries(videoDevices.map(info => [info.label, info.deviceId])) // Lil-gui options take the shape { label: value }
    this.deviceIdController ??= this.liveModeFolder.add(this.liveModeDebugObject, 'deviceId').name('Camera') // Add the controller on first time only
    this.deviceIdController = this.deviceIdController // Reassign because updating options() destroys old reference
      .options(options) // Update options and destroy old controller
      .onChange(() => this.handleDeviceIdControllerChange()) // Needs to be set each time on new controller
    this.deviceIdController.setValue(browserSelectedDeviceId) // Update to reflect true value

    return stream
  }
}
