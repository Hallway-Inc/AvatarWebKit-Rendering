import * as THREE from 'three'
import { Scene } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { Experience } from './Experience.js'
import Sizes from './utils/Sizes.js'

export default class Camera {
  instance: THREE.PerspectiveCamera
  controls: OrbitControls

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
    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.enableDamping = true
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }

  update() {
    this.controls.update()
  }
}
