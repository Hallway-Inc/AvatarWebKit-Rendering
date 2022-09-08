import * as THREE from 'three'

import Debug from './utils/Debug.js'
import Sizes from './utils/Sizes.js'
import Time from './utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import { FoxWorld } from './world/FoxWorld/FoxWorld'
import Resources from './utils/Resources.js'

// Worlds
import foxSources from './world/FoxWorld/sources.js'
import { World } from './world/World'

import level1Sources from './world/Level1/sources'
import { Level1 } from './world/Level1/level1.js'

export class Experience {
  static instance = null
  debug: Debug
  sizes: Sizes
  time: Time
  scene: THREE.Scene
  canvas: HTMLCanvasElement
  resources: Resources
  camera: Camera
  renderer: Renderer
  world: World

  constructor(_canvas: HTMLCanvasElement, name: string) {
    // Singleton
    if (Experience.instance) {
      return Experience.instance
    }
    Experience.instance = this

    // @ts-expect-error global access
    window.experience = this

    // Options
    this.canvas = _canvas

    // Setup
    this.debug = new Debug()
    this.sizes = new Sizes()
    this.time = new Time()
    this.scene = new THREE.Scene()
    this.camera = new Camera()
    this.renderer = new Renderer()

    if (name === 'fox') {
      this.resources = new Resources(foxSources)
      this.world = new FoxWorld()
    } else if (name === 'level1') {
      this.resources = new Resources(level1Sources)
      console.log(level1Sources)
      this.world = new Level1()
    }

    // Resize event
    this.sizes.on('resize', () => {
      this.resize()
    })

    // Time tick event
    this.time.on('tick', () => {
      this.update()
    })
  }

  resize() {
    this.camera.resize()
    this.renderer.resize()
  }

  update() {
    this.camera.update()
    this.world.update()
    this.renderer.update()
  }

  destroy() {
    this.sizes.off('resize')
    this.time.off('tick')

    // Traverse the whole scene
    this.scene.traverse(child => {
      // Test if it's a mesh
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()

        // Loop through the material properties
        for (const key in child.material) {
          const value = child.material[key]

          // Test if there is a dispose function
          if (value && typeof value.dispose === 'function') {
            value.dispose()
          }
        }
      }
    })

    this.camera.controls.dispose()
    this.renderer.instance.dispose()

    if (this.debug.active) this.debug.ui.destroy()
  }
}
