import { AvatarPrediction } from '@quarkworks-inc/avatar-webkit'
import { Group, Scene, Vector3, WebGLRenderer } from 'three'

import { AvatarRenderer } from './avatarRenderer'
import { ModelSettings } from './world/models/modelSettings'
import { EnvironmentLoader } from './world/systems/environmentLoader'

export type AvatarRendererConfig = {
  canvas?: HTMLCanvasElement
  webGLRenderer?: WebGLRenderer
  environmentLoader?: EnvironmentLoader
}

export interface Updateable {
  tick(delta: number): void
}

export interface Renderable {
  render(renderer: WebGLRenderer): void
  getContainerRect(): DOMRect
}

export interface Model {
  readonly type: ModelType
  readonly defaultSettings: ModelSettings
  settings: ModelSettings
  shouldMirror: boolean
  model: Group

  addToScene(scene: Scene): void
  removeFromScene(scene: Scene): void
  getPosition(): Vector3
  updateFromResults(results: AvatarPrediction): void
  lookAt?(x: number, y: number, z: number): void
}

export type ModelType = 'emoji' | 'readyPlayerMe' | 'mozilla' | 'void' | 'chib' | 'alienBoy' | 'zuck' | 'glb'

export type WorldConfig = {
  container: HTMLElement
  renderer: AvatarRenderer
  enableControls?: boolean
  useDefaultBackground?: boolean
  debug?: boolean
}
