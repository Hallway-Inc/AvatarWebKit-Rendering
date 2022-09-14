import * as THREE from 'three'
import { Scene } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import CameraControls from 'camera-controls'

import { Experience } from './Experience.js'
import Sizes from './utils/Sizes.js'

CameraControls.install({ THREE })
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
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }

  update(delta: number) {
    this.controls.update(delta / 1000)
  }
}
