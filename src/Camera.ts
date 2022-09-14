import * as THREE from 'three'
import { Scene } from 'three'
import CameraControls from 'camera-controls'

import { Experience } from './Experience.js'
import Sizes from './utils/Sizes.js'

CameraControls.install({ THREE })

export type CameraView = {
  /** Camera position */
  position: { x: number; y: number; z: number }

  /** Where the camera is looking */
  target: { x: number; y: number; z: number }

  /** Camera zoom (affects field of view) */
  zoom: number
}

export default class Camera {
  instance: THREE.PerspectiveCamera
  controls: CameraControls

  experience: Experience
  sizes: Sizes
  scene: Scene
  canvas: HTMLCanvasElement

  constructor() {
    this.experience = Experience.instance
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas

    this.setInstance()
    this.setControls()
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

  setView(view: CameraView, enableTransition = false) {
    const { position, target, zoom } = view

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
