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
  private isMe: boolean
  private enableControls: boolean
  private environmentLoader: EnvironmentLoader

  private scene: Scene
  private camera: PerspectiveCamera
  private controls: UpdateableControls

  private controlsEnabled = true

  private model?: Model

  constructor({ container, renderer, isMe, enableControls }: WorldConfig) {
    this.container = container
    this.isMe = isMe ?? true
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
  }

  async setModel(model: Model) {
    if (this.model) {
      this.model.removeFromScene(this.scene)
    }

    this.model = model
    this.model.addToScene(this.scene)

    this.camera.position.x = 0
    this.camera.position.z = model.type === 'emoji' ? 1 : 0.6
    this.camera.position.y = 0
  }
  async setEnvironment(envUrl: string) {
    const envMap = await this.environmentLoader.load(envUrl)
    this.scene.environment = envMap
  }
  async setBackground(background: string) {
    const bgTexture = await this.environmentLoader.load(background)
    this.scene.background = bgTexture
    this.resize()
  }
  async loadScene(model: Model) {
    await this.setModel(model)

    const envUrl = hallwayPublicCDNUrl('backgrounds/venice_sunset_1k.hdr')
    await this.setEnvironment(envUrl)
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
}
