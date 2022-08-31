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
  model: Group

  static async init(url: string): Promise<GLBModel> {
    const model = new GLBModel()
    return model.load(url)
  }

  private constructor() {
    // use static init
  }

  private async load(url: string): Promise<GLBModel> {
    this.model = await loadModel(url, { useMeshopt: true })
    this.centerPivot()
    this.normalizeScale()
    this.centerGLB()

    return this
  }

  addToScene(scene: Scene) {
    scene.add(this.model)
  }

  removeFromScene(scene: Scene) {
    scene.remove(this.model)
  }

  centerPivot = () => {
    const modelBox = new Box3().setFromObject(this.model)
    const modelCenter = (modelBox.max.y - modelBox.min.y) * 0.5
    this.model.children.forEach(node => {
      node.position.set(node.position.x, node.position.y - modelBox.min.y - modelCenter, node.position.z)
    })
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
    const mult = 0.375 / depth
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

        const morphIndex = nodeMesh.morphTargetDictionary[key] ?? nodeMesh.morphTargetDictionary[arKitKey]

        const value = blendShapes[key]

        nodeMesh.morphTargetInfluences[morphIndex] = value
      }
    })
  }

  private updateHeadRotation(pitch: number, yaw: number, roll: number) {
    if (!this.model) return

    this.model.rotation.x = pitch / 3
    this.model.rotation.y = this.shouldMirror ? -yaw : yaw
    this.model.rotation.z = this.shouldMirror ? roll : -roll
  }
}
