import { AvatarPrediction, BlendShapeKeys, BlendShapes } from '@quarkworks-inc/avatar-webkit'
import { Bone, Group, Object3D, Scene, SkinnedMesh } from 'three'

import { Model, ModelType } from '../../types'
import { loadModel } from '../systems/loadModel'
import { enumerateChildNodes, object3DChildNamed } from '../../utils/three'

import { ModelSettingType, VoidModelSettings } from './modelSettings'

const Y_OFFSET = -1.57
const Z_OFFSET = -0.1
const Z_ROTATION_OFFSET = -0.5

export class VoidModel implements Model {
  readonly type: ModelType = 'void'

  static readonly defaultSettings: VoidModelSettings = {
    hideExtraAssets: {
      name: 'Hide Extra Assets',
      type: ModelSettingType.boolean,
      value: false
    }
  }

  readonly defaultSettings: VoidModelSettings = VoidModel.defaultSettings
  private _settings = this.defaultSettings
  shouldMirror = true

  // Model group
  root?: Group

  private headBone?: Bone
  private neckBone?: Bone
  private leftEyeBone?: Bone
  private rightEyeBone?: Bone
  private leftArm?: Bone
  private rightArm?: Bone

  private maxAngle = (1 / 57.3) * 30

  private assetsToHide = [
    'Fangs',
    'ToothPick',
    'Rose',
    'Knife',
    'BuckImage',
    'BanditMask',
    'FaceMask',
    'Respirator',
    'Pipe',
    'Gagged',
    'BubbleGum'
  ]

  static async init(url: string): Promise<VoidModel> {
    const model = new VoidModel()
    return model.load(url)
  }

  private constructor() {
    // use static init
  }

  private async load(url: string): Promise<VoidModel> {
    this.root = await loadModel(url)

    this.root.position.y = Y_OFFSET
    this.root.position.z = Z_OFFSET

    enumerateChildNodes(this.root, (node: Object3D) => {
      node.frustumCulled = false

      if ((this.settings.hideExtraAssets.value as boolean) && this.assetsToHide.includes(node.name)) {
        node.visible = false
      }
    })

    // Meshes & bonez
    this.neckBone =
      (object3DChildNamed(this.root, 'Neck_1', { recursive: true }) as Bone) ??
      (object3DChildNamed(this.root, 'Neck', { recursive: true }) as Bone)

    this.headBone =
      (object3DChildNamed(this.neckBone, 'Head_1', { recursive: true }) as Bone) ??
      (object3DChildNamed(this.neckBone, 'Head', { recursive: true }) as Bone)

    this.leftEyeBone = object3DChildNamed(this.root, 'LeftEye', { recursive: true }) as Bone
    this.rightEyeBone = object3DChildNamed(this.root, 'RightEye', { recursive: true }) as Bone
    this.leftArm = object3DChildNamed(this.root, 'LeftArm', { recursive: true }) as Bone
    this.rightArm = object3DChildNamed(this.root, 'RightArm', { recursive: true }) as Bone

    if (this.leftArm) this.leftArm.rotation.x = -1.3
    if (this.rightArm) this.rightArm.rotation.x = -1.3

    return this
  }

  addToScene(scene: Scene) {
    scene.add(this.root)
  }

  removeFromScene(scene: Scene) {
    scene.remove(this.root)
  }

  getPosition = () => this.root.position

  updateFromResults(results: AvatarPrediction) {
    if (!this.root) return

    this.updateBlendShapes(results.blendShapes)
    this.updateHeadRotation(-results.rotation.pitch, -results.rotation.yaw, -results.rotation.roll)
  }

  private updateBlendShapes(blendShapes: BlendShapes) {
    if (!this.root) return

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

    enumerateChildNodes(this.root, node => {
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
    if (!this.neckBone || !this.headBone) return

    const xRotation = roll / 4
    const yRotation = yaw / 2
    const zRotation = (Z_ROTATION_OFFSET - pitch) / 4

    this.headBone.rotation.x = this.shouldMirror ? xRotation : -xRotation
    this.headBone.rotation.y = this.shouldMirror ? -yRotation : yRotation
    this.headBone.rotation.z = zRotation

    this.neckBone.rotation.x = this.shouldMirror ? xRotation : -xRotation
    this.neckBone.rotation.y = this.shouldMirror ? -yRotation : yRotation
    this.neckBone.rotation.z = zRotation
  }

  get settings(): VoidModelSettings {
    return this._settings
  }

  set settings(settings: VoidModelSettings) {
    this._settings = settings

    const { hideExtraAssets = VoidModel.defaultSettings.hideExtraAssets } = settings

    enumerateChildNodes(this.root, (node: Object3D) => {
      if (hideExtraAssets.value && this.assetsToHide.includes(node.name)) {
        node.visible = false
      }
    })
  }
}
