import { AvatarPrediction } from '@quarkworks-inc/avatar-webkit'
import { ColorRepresentation, Scene, Vector3, WebGLRenderer } from 'three'
import { EmojiModel } from './world/models/emoji'

export interface Updateable {
  tick(delta: number): void
}

export interface Renderable {
  render(renderer: WebGLRenderer): void
  getContainerRect(): DOMRect
}

export type EmojiModelSettings = {
  faceColor: ColorRepresentation
  eyeColor: ColorRepresentation
}

export type ModelSettings<M extends Model> = M extends EmojiModel ? EmojiModelSettings : {}

export interface Model {
  readonly type: ModelType
  settings: ModelSettings<this> | {}

  addToScene(scene: Scene): void
  removeFromScene(scene: Scene): void
  getPosition(): Vector3
  updateFromResults(results: AvatarPrediction): void
}

export type ModelType = 'emoji' | 'readyPlayerMe' | 'mozilla'
