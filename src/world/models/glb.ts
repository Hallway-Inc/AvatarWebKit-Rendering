import { AvatarPrediction, BlendShapeKeys, BlendShapes } from '@quarkworks-inc/avatar-webkit'
import { Group, Scene, SkinnedMesh, Box3, Vector3 } from 'three'

import { Model, ModelType } from '../../types'
import { loadModel } from '../systems/loadModel'
import { enumerateChildNodes } from '../../utils/three'

import { GLBModelSettings } from './modelSettings'

export class GLBModel implements Model {
  readonly type: ModelType = 'glb'

  static readonly defaultSettings: GLBModelSettings = {}

  readonly defaultSettings = GLBModel.defaultSettings
  settings = this.defaultSettings
  shouldMirror = true

  // Model group
  private model: Group

  static async init(url: string): Promise<GLBModel> {
    const model = new GLBModel()
    return model.load(url)
  }

  private constructor() {
    // use static init
  }

  private async load(url: string): Promise<GLBModel> {
    this.model = await loadModel(url)
    this.normalizeScale()
    this.centerGLB()

    console.log(this.model)

    return this
  }

  addToScene(scene: Scene) {
    scene.add(this.model)
  }

  removeFromScene(scene: Scene) {
    scene.remove(this.model)
  }

  centerGLB = () => {
    const modelBox = new Box3().setFromObject(this.model)
    const vector = new Vector3()
    modelBox.getCenter(vector)
    this.model.position.set(-vector.x, -vector.y, -vector.z)
  }

  normalizeScale = () => {
    const modelBox = new Box3().setFromObject(this.model)
    const depth = modelBox.max.z - modelBox.min.z
    const mult = 0.35 / depth
    this.model.scale.set(this.model.scale.x * mult, this.model.scale.y * mult, this.model.scale.z * mult)
  }

  getPosition = () => this.model.position

  updateFromResults(results: AvatarPrediction) {
    if (!this.model) return

    this.updateBlendShapes(results.blendShapes)
    this.updateHeadRotation(-results.rotation.pitch, -results.rotation.yaw, -results.rotation.roll)
  }

  private updateBlendShapes(blendShapes: BlendShapes) {
    if (!this.model) return

    enumerateChildNodes(this.model, node => {
      const nodeMesh = node as SkinnedMesh

      if (!nodeMesh.morphTargetDictionary || !nodeMesh.morphTargetInfluences) return

      for (const key in blendShapes) {
        const arKitKey = BlendShapeKeys.toARKitConvention(key)

        const morphIndex = nodeMesh.morphTargetDictionary[arKitKey]
        const value = blendShapes[key]

        nodeMesh.morphTargetInfluences[morphIndex] = value
      }
    })
  }

  private updateHeadRotation(pitch: number, yaw: number, roll: number) {
    if (!this.model) return

    this.model.rotation.x = pitch / 2
    this.model.rotation.y = this.shouldMirror ? -yaw : yaw
    // this.model.rotation.z = this.shouldMirror ? roll : -roll
  }
}
