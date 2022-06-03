import { AvatarPrediction, BlendShapes } from '@quarkworks-inc/avatar-webkit'
import { Bone, Euler, Group, Mesh, Object3D, Scene, SkinnedMesh } from 'three'

import { Model, ModelType } from '../../types'
import { loadModel } from '../systems/loadModel'
import { object3DChildNamed } from '../../utils/three'

import { ModelSettings, VoidModelSettings } from './modelSettings'

const Y_OFFSET = -1
const Z_OFFSET = -1

export class VoidModel implements Model {
  readonly type: ModelType = 'void'

  static readonly defaultSettings: VoidModelSettings = {}

  readonly defaultSettings: ModelSettings = VoidModel.defaultSettings
  settings = this.defaultSettings
  shouldMirror = true

  // Model group
  private model: Group
  private avatarRoot: Object3D

  private faceNode?: SkinnedMesh
  private headBone?: Bone
  private leftEyeBone?: Mesh
  private rightEyeBone?: Bone

  private maxAngle = (-1 / 57.3) * 30
  private eulerLeftUnity = new Euler(-0.14, 0, 0)
  private eulerRightUnity = new Euler(-0.14, 0, 0)

  static async init(url: string): Promise<VoidModel> {
    const model = new VoidModel()
    return model.load(url)
  }

  private constructor() {
    // use static init
  }

  private async load(url: string): Promise<VoidModel> {
    this.model = await loadModel(url)

    this.model.position.y = Y_OFFSET
    this.model.position.z = Z_OFFSET

    this.avatarRoot = object3DChildNamed(this.model, 'Node_0')

    console.log('Root ', this.avatarRoot)

    // Meshes & bonez
    this.faceNode = object3DChildNamed(this.avatarRoot, 'Head') as SkinnedMesh

    this.headBone = object3DChildNamed(this.avatarRoot, 'HeadSSC', { recursive: true }) as Bone
    this.leftEyeBone = object3DChildNamed(this.avatarRoot, 'LeftEyeSSC', { recursive: true }) as Mesh
    this.rightEyeBone = object3DChildNamed(this.avatarRoot, 'RightEyeSSC', { recursive: true }) as Bone

    console.log('headBone', this.faceNode)
    console.log('left', this.leftEyeBone)
    console.log('right', this.rightEyeBone)

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
  }

  private updateBlendShapes(blendShapes: BlendShapes) {
    if (!this.faceNode) return

    for (const key in blendShapes) {
      const morphIndex = this.faceNode.morphTargetDictionary[key]

      this.faceNode.morphTargetInfluences[morphIndex] = blendShapes[key]
    }

    const eulerRight = [
      blendShapes.eyeLookDown_L + -blendShapes.eyeLookUp_L,
      blendShapes.eyeLookOut_L + -blendShapes.eyeLookIn_L,
      0.0
    ]
    const eulerLeft = [
      blendShapes.eyeLookDown_R + -blendShapes.eyeLookUp_R,
      -blendShapes.eyeLookOut_R + blendShapes.eyeLookIn_R,
      0.0
    ]

    this.rightEyeBone.rotation.x = this.eulerLeftUnity[0] + eulerRight[0] * this.maxAngle
    this.rightEyeBone.rotation.y = eulerRight[1] * this.maxAngle
    this.rightEyeBone.rotation.z = eulerRight[2] * this.maxAngle

    this.leftEyeBone.rotation.x = this.eulerRightUnity[0] + eulerLeft[0] * this.maxAngle
    this.leftEyeBone.rotation.y = eulerLeft[1] * this.maxAngle
    this.leftEyeBone.rotation.z = eulerLeft[2] * this.maxAngle
  }

  private updateHeadRotation(pitch: number, yaw: number, roll: number) {
    if (!this.headBone) return

    this.model.rotation.x = pitch
    this.model.rotation.y = this.shouldMirror ? -yaw : yaw
    this.model.rotation.z = this.shouldMirror ? roll : -roll
  }
}
