import { Color, PerspectiveCamera, Scene, WebGLRenderer, Texture } from 'three'
import { AvatarPrediction } from '@quarkworks-inc/avatar-webkit'

import { Renderable, Updateable, Model, WorldConfig } from '../types'

import { hallwayPublicCDNUrl } from '../utils/cdn'

import { createCamera } from './components/camera'
import { createLights } from './components/lights'
import { createScene } from './components/scene'
import { createControls, UpdateableControls } from './systems/controls'
import { EnvironmentLoader } from './systems/environmentLoader'

const sceneBackgroundColor = new Color(0xffffff)

export class AvatarWorld implements Updateable, Renderable {
  private container: HTMLElement
  private enableControls: boolean
  private environmentLoader: EnvironmentLoader

  private scene: Scene
  private camera: PerspectiveCamera
  private controls: UpdateableControls

  private controlsEnabled = true

  private model?: Model

  debugConfig = {
    cameraPositionX: {},
    cameraPositionY: {},
    cameraPositionZ: {}
  }

  constructor({ container, renderer, enableControls, useDefaultBackground = true, debug = false }: WorldConfig) {
    this.container = container
    this.enableControls = enableControls ?? false
    this.environmentLoader = renderer.environmentLoader

    this.camera = createCamera()
    this.scene = createScene()
    this.scene.background = sceneBackgroundColor

    this.scene.rotateY((Math.PI / 180) * 0)

    this.controls = createControls(this.camera, this.container)
    this.controls.enabled = this.enableControls

    const { hemisphereLight, ambientLight, mainLight } = createLights()
    this.scene.add(hemisphereLight)
    this.camera.add(ambientLight, mainLight)

    this.scene.add(this.camera)

    this.resize()

    // Load default lighting environment
    this.environmentLoader
      .load(hallwayPublicCDNUrl('backgrounds/venice_sunset_1k.hdr'))
      .then(texture => {
        if (useDefaultBackground) {
          this.setBackground(texture)
        }
        this.setEnvironment(texture)
      })
      .catch(e => console.error('Error loading default environment', e))

    if (debug) this.setupDebug()
  }

  setupDebug() {
    this.debugConfig.cameraPositionX = {
      object: this.camera.position,
      value: 'x',
      property: 'number',
      min: -5,
      max: 5
    }
    this.debugConfig.cameraPositionY = {
      object: this.camera.position,
      value: 'y',
      property: 'number',
      min: -5,
      max: 5
    }
    this.debugConfig.cameraPositionZ = {
      object: this.camera.position,
      value: 'z',
      property: 'number',
      min: 0,
      max: 10
    }
  }

  setModel(model: Model) {
    if (this.model) {
      this.model.removeFromScene(this.scene)
    }

    this.model = model
    this.model.addToScene(this.scene)

    this.camera.position.x = 0
    this.camera.position.z = model.type === 'emoji' ? 1 : 0.6
    this.camera.position.y = 0
  }

  setEnvironment(environment: Texture) {
    this.scene.environment = environment
  }

  setBackground(background: Texture | Color | string | null) {
    this.scene.background = typeof background === 'string' ? new Color(background as string) : background
    this.resize()
  }

  cleanUp() {
    this.setAvatarEnabled(false)
    this.model = undefined
  }

  setAvatarEnabled(enabled: boolean) {
    if (enabled) {
      this.model?.addToScene(this.scene)
    } else {
      this.model?.removeFromScene(this.scene)
    }
  }

  resize() {
    if (!this.camera) return

    this.camera.aspect = this.container.clientWidth / this.container.clientHeight
    this.camera.updateProjectionMatrix()

    if (this.scene.background instanceof Texture) {
      const texture = this.scene.background
      const texAspect = texture.image.width / texture.image.height
      const combinedAspect = this.camera.aspect / texAspect
      // Update texture scaling
      if (combinedAspect > 1) {
        texture.repeat.set(1, 1 / combinedAspect)
        texture.offset.set(0, 0.5 * (1 - 1 / combinedAspect))
      } else {
        texture.repeat.set(combinedAspect, 1)
        texture.offset.set(0.5 * (1 - combinedAspect), 0)
      }
    }
  }

  tick(delta: number): void {
    this.controls.tick(delta)
  }

  getContainerRect(): DOMRect {
    return this.container.getBoundingClientRect()
  }

  render(renderer: WebGLRenderer): void {
    renderer.render(this.scene, this.camera)
  }

  updateFromResults(results: AvatarPrediction) {
    this.model?.updateFromResults(results)
  }

  lookAt(x: number, y: number, z: number) {
    if (this.model?.lookAt) {
      this.model.lookAt(x, y, z)
    }
  }
}
