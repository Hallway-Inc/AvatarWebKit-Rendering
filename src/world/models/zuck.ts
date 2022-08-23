import { AvatarPrediction, BlendShapeKeys, BlendShapes } from '@quarkworks-inc/avatar-webkit'
import { Group, Scene, SkinnedMesh } from 'three'

import { Model, ModelType } from '../../types'
import { loadModel } from '../systems/loadModel'
import { object3DChildNamed, setMorphTarget } from '../../utils/three'

import { ZuckModelSettings } from './modelSettings'

const Z_POSITION_OFFSET = -3

export class ZuckModel implements Model {
  readonly type: ModelType = 'zuck'

  static readonly defaultSettings: ZuckModelSettings = {}

  readonly defaultSettings = ZuckModel.defaultSettings
  settings = this.defaultSettings
  shouldMirror = true

  // Model group
  private model: Group

  // Bonez
  private headBone?: SkinnedMesh

  static async init(url: string): Promise<ZuckModel> {
    const model = new ZuckModel()
    return model.load(url)
  }

  private constructor() {
    // use static init
  }

  private async load(url: string): Promise<ZuckModel> {
    this.model = await loadModel(url, { useMeshopt: true })

    console.log(this.model)

    // Meshes & bonez
    this.headBone = object3DChildNamed(this.model, 'zuckHead', { recursive: true }) as SkinnedMesh
    this.headBone.position.set(0, 0, Z_POSITION_OFFSET)

    return this
  }

  addToScene(scene: Scene) {
    scene.add(this.model)
  }

  removeFromScene(scene: Scene) {
    scene.remove(this.model)
  }

  getPosition = () => this.model.position

  updateFromResults(results: AvatarPrediction) {
    if (!this.model) return

    this.updateBlendShapes(results.blendShapes)
    this.updateHeadRotation(-results.rotation.pitch, -results.rotation.yaw, -results.rotation.roll)
    this.updatePosition(results.transform.x, results.transform.y, results.transform.z)
  }

  private updateBlendShapes(blendShapes: BlendShapes) {
    for (const key in blendShapes) {
      const value = this._tuneMorphTargetValue(key, blendShapes[key])

      // RPM uses the ARKit key convention ("mouthSmileLeft" as opposed to "mouthSmile_L")
      const arKitKey = BlendShapeKeys.toARKitConvention(key)

      setMorphTarget(this.headBone, arKitKey, value)
    }
  }

  private _tuneMorphTargetValue(key: string, value: number): number {
    switch (key) {
      case BlendShapeKeys.mouthSmile_L:
      case BlendShapeKeys.mouthSmile_R:
        // Tuning down RPM smile so it's less creepy
        return Math.min(Math.max(0, value), 1.0) * 0.7
      default:
        return value
    }
  }

  private updateHeadRotation(pitch: number, yaw: number, roll: number) {
    const object = this.headBone

    object.rotation.x = pitch + Math.PI / 2
    object.rotation.z = this.shouldMirror ? yaw : -yaw
    object.rotation.y = this.shouldMirror ? roll : -roll
  }

  private updatePosition(x: number, y: number, _: number) {
    const object = this.headBone

    object.position.set(x, y, Z_POSITION_OFFSET)
  }
}
