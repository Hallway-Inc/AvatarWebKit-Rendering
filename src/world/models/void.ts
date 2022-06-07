import { AvatarPrediction, BlendShapeKeys, BlendShapes } from '@quarkworks-inc/avatar-webkit'
import { Bone, Group, Object3D, Scene, SkinnedMesh } from 'three'

import { Model, ModelType } from '../../types'
import { loadModel } from '../systems/loadModel'
import { enumerateChildNodes, object3DChildNamed } from '../../utils/three'

import { ModelSettings, VoidModelSettings } from './modelSettings'

const Y_OFFSET = -1.57
const Z_OFFSET = -0.1
const Z_ROTATION_OFFSET = -0.5

export class VoidModel implements Model {
  readonly type: ModelType = 'void'

  static readonly defaultSettings: VoidModelSettings = {}

  readonly defaultSettings: ModelSettings = VoidModel.defaultSettings
  settings = this.defaultSettings
  shouldMirror = true

  // Model group
  private model: Group

  private neckBone?: Bone
  private leftEyeBone?: Bone
  private rightEyeBone?: Bone
  private leftArm?: Bone
  private rightArm?: Bone

  private maxAngle = (1 / 57.3) * 30

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

    enumerateChildNodes(this.model, (node: Object3D) => {
      node.frustumCulled = false
    })

    // Meshes & bonez
    this.neckBone =
      (object3DChildNamed(this.model, 'Neck_1', { recursive: true }) as Bone) ??
      (object3DChildNamed(this.model, 'Neck', { recursive: true }) as Bone)

    this.leftEyeBone = object3DChildNamed(this.model, 'LeftEye', { recursive: true }) as Bone
    this.rightEyeBone = object3DChildNamed(this.model, 'RightEye', { recursive: true }) as Bone
    this.leftArm = object3DChildNamed(this.model, 'LeftArm', { recursive: true }) as Bone
    this.rightArm = object3DChildNamed(this.model, 'RightArm', { recursive: true }) as Bone

    if (this.leftArm) this.leftArm.rotation.x = -1.3
    if (this.rightArm) this.rightArm.rotation.x = -1.3

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
    if (!this.model) return

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

    const flip = this.shouldMirror ? -1 : 1
    this.rightEyeBone.rotation.z = flip * eulerRight[0] * this.maxAngle
    this.rightEyeBone.rotation.y = eulerRight[1] * this.maxAngle
    // this.rightEyeBone.rotation.z = eulerRight[2] * this.maxAngle

    this.leftEyeBone.rotation.z = flip * eulerLeft[0] * this.maxAngle
    this.leftEyeBone.rotation.y = eulerLeft[1] * this.maxAngle
    // this.leftEyeBone.rotation.z = eulerLeft[2] * this.maxAngle

    enumerateChildNodes(this.model, node => {
      const nodeMesh = node as SkinnedMesh

      if (!nodeMesh.morphTargetDictionary || !nodeMesh.morphTargetInfluences) return

      for (const key in blendShapes) {
        const arKitKey = BlendShapeKeys.toARKitConvention(key)

        const morphIndex = nodeMesh.morphTargetDictionary[arKitKey]

        nodeMesh.morphTargetInfluences[morphIndex] = blendShapes[key]
      }
    })
  }

  private updateHeadRotation(pitch: number, yaw: number, roll: number) {
    if (!this.neckBone) return

    this.neckBone.rotation.x = this.shouldMirror ? roll : -roll
    this.neckBone.rotation.y = this.shouldMirror ? -yaw : yaw
    this.neckBone.rotation.z = Z_ROTATION_OFFSET - pitch
  }
}
