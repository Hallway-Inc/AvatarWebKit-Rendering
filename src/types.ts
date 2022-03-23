import { AvatarPrediction } from '@quarkworks-inc/avatar-webkit'
import { Scene, Vector3, WebGLRenderer } from 'three'

export interface Updateable {
  tick(delta: number): void
}

export interface Renderable {
  render(renderer: WebGLRenderer): void
  getContainerRect(): DOMRect
}

export interface Model {
  readonly type: ModelType
  addToScene(scene: Scene): void
  removeFromScene(scene: Scene): void
  getPosition(): Vector3
  updateFromResults(results: AvatarPrediction): void
}

export type ModelType = 'emoji' | 'readyPlayerMe' | 'mozilla'
