import { AvatarPrediction, BlendShapeKeys, BlendShapes } from '@quarkworks-inc/avatar-webkit'
import { Group, Scene, SkinnedMesh, Object3D, AxesHelper, Mesh } from 'three'

import { Model, ModelType } from '../../types'
import { loadModel } from '../systems/loadModel'
import { enumerateChildNodes } from '../../utils/three'

import { GLBModelSettings } from './modelSettings'

const Y_OFFSET = 0
const Z_OFFSET = 0

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

    this.model.position.y = Y_OFFSET
    this.model.position.z = Z_OFFSET
    console.log('Length: ', this.model.position.length())

    return this
  }

  addToScene(scene: Scene) {
    const axesHelper = new AxesHelper(2)
    scene.add(axesHelper)
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

    const xRotation = pitch / 2
    const yRotation = yaw
    const zRotation = roll

    this.model.rotation.x = xRotation
    this.model.rotation.y = this.shouldMirror ? -yRotation : yRotation
    this.model.rotation.z = this.shouldMirror ? zRotation : -zRotation
  }

  private updatePosition(x: number, y: number, z: number) {
    if (!this.model) return
    this.model.position.x = x
    this.model.position.y = Y_OFFSET + y
    this.model.position.z = Z_OFFSET + z
  }
}
