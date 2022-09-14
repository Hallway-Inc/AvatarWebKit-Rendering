import * as THREE from 'three'
import { Scene } from 'three'
import CameraControls from 'camera-controls'

import type GUI from 'lil-gui'

import { Experience } from './Experience.js'
import Sizes from './utils/Sizes.js'
import Debug from './utils/Debug.js'

CameraControls.install({ THREE })

type CameraKeypoint = {
  /** Camera position */
  position: { x: number; y: number; z: number }

  /** Where the camera is looking */
  target: { x: number; y: number; z: number }

  /** Camera zoom (affects field of view) */
  zoom: number
}

const KEYPOINTS: { [key in 'isometric' | 'portrait']: CameraKeypoint } = {
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

export default class Camera {
  instance: THREE.PerspectiveCamera
  controls: CameraControls

  experience: Experience
  sizes: Sizes
  scene: Scene
  canvas: HTMLCanvasElement
  debug: Debug
  debugFolder: GUI

  constructor() {
    this.experience = Experience.instance
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas
    this.debug = this.experience.debug

    if (this.debug.active) {
      const debugObject = {
        isometric: () => this.setKeypoint(KEYPOINTS.isometric, true),
        portrait: () => this.setKeypoint(KEYPOINTS.portrait, true)
      }
      this.debugFolder = this.debug.ui.addFolder('camera')
      this.debugFolder.add(debugObject, 'isometric')
      this.debugFolder.add(debugObject, 'portrait')
    }

    this.setInstance()
    this.setControls()
    this.setKeypoint(KEYPOINTS.isometric)
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 100)
    this.instance.position.set(6, 4, 8)
    this.scene.add(this.instance)
  }

  setControls() {
    this.controls = new CameraControls(this.instance, this.canvas)
    this.controls.minAzimuthAngle = 0
    this.controls.maxAzimuthAngle = Math.PI / 2
    this.controls.minPolarAngle = 0
    this.controls.maxPolarAngle = Math.PI / 2
    this.controls.dampingFactor = 0.1
  }

  setKeypoint(keypoint: CameraKeypoint, enableTransition = false) {
    const { position, target, zoom } = keypoint

    this.controls.setPosition(position.x, position.y, position.z, enableTransition)
    this.controls.setTarget(target.x, target.y, target.z, enableTransition)
    this.controls.zoomTo(zoom, enableTransition)
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }

  update() {
    const deltaSeconds = this.experience.time.delta / 1000
    this.controls.update(deltaSeconds)
  }

  dispose() {
    this.controls.dispose()
  }
}
