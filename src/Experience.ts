import * as THREE from 'three'

import Debug from './utils/Debug.js'
import Sizes from './utils/Sizes.js'
import Time from './utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import Resources from './utils/Resources.js'
import { World } from './world/World'

// Worlds
import { FoxWorld } from './world/FoxWorld/FoxWorld'
import foxSources from './world/FoxWorld/sources.js'

import level1Sources from './world/Level1/sources'
import { Level1 } from './world/Level1/level1'

import level2Sources from './world/Level2/sources'
import { Level2 } from './world/Level2/level2'

import { Level3 } from './world/Level3/level3.js'
import level3Sources from './world/Level3/sources'

import { Level4 } from './world/Level4/level4.js'
import level4Sources from './world/Level4/sources'

import { Level5 } from './world/Level5/level5.js'
import level5Sources from './world/Level5/sources'

import { Journey } from './world/journey.js'

import { HallwayStreamWorld } from './world/HallwayStreamRoom/hallwayStreamWorld'
import hallwayStreamWorldSources from './world/HallwayStreamRoom/sources'

export type ExperienceProps = {
  _canvas: HTMLCanvasElement
  name: string
  modelUrl: string
}

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

  constructor({ _canvas, name, modelUrl }: ExperienceProps) {
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

    const modelSource = [
      {
        name: 'rpmModel',
        path: modelUrl,
        type: 'gltfModel'
      }
    ]

    if (name === 'fox') {
      this.resources = new Resources(foxSources)
      this.world = new FoxWorld()
    } else if (name === 'streamRoom') {
      this.resources = new Resources([...hallwayStreamWorldSources, ...modelSource])
      this.world = new HallwayStreamWorld()
    } else if (name === 'level1') {
      this.resources = new Resources([...level1Sources, ...modelSource])
      this.world = new Level1()
    } else if (name === 'level2') {
      this.resources = new Resources(level2Sources)
      this.world = new Level2()
    } else if (name === 'level3') {
      this.resources = new Resources(level3Sources)
      this.world = new Level3()
    } else if (name === 'level4') {
      this.resources = new Resources(level4Sources)
      this.world = new Level4()
    } else if (name === 'level5') {
      this.resources = new Resources(level5Sources)
      this.world = new Level5()
    } else if (name === 'journey') {
      this.resources = new Resources([
        ...level1Sources,
        ...level2Sources,
        ...level3Sources,
        ...level4Sources,
        ...level5Sources
      ])
      this.world = new Journey()
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
    this.world.dispose()

    if (this.debug.active) this.debug.ui.destroy()
  }
}
