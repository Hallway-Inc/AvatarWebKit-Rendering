import { AvatarPrediction, BlendShapeKeys, BlendShapes } from '@quarkworks-inc/avatar-webkit'
import { Bone, Euler, Group, Object3D, Scene, SkinnedMesh } from 'three'

import { Model, ModelType } from '../../types'
import { loadModel } from '../systems/loadModel'
import { object3DChildNamed, setMorphTarget } from '../../utils/three'

import { ReadyPlayerMeModelSettings } from './modelSettings'

export class ReadyPlayerMeModel implements Model {
  readonly type: ModelType = 'readyPlayerMe'

  static readonly defaultSettings: ReadyPlayerMeModelSettings = {}

  readonly defaultSettings = ReadyPlayerMeModel.defaultSettings
  settings = this.defaultSettings
  shouldMirror = true

  // Model group
  root?: Group
  private avatarRoot: Object3D

  // Nodes for current RPM version
  private faceNode?: SkinnedMesh
  private teethNode?: SkinnedMesh

  // Bonez
  private headBone?: Bone
  private leftEyeBone?: Bone
  private rightEyeBone?: Bone

  // Nodes for old RPM versions
  private wolf3D_Avatar?: SkinnedMesh

  private maxAngle = (-1 / 57.3) * 28
  private eulerLeftUnity = new Euler(1.5489933490753174, -3.2918876513576834e-9, 3.141592502593994)
  private eulerRightUnity = new Euler(1.5489933490753174, -3.2918876513576834e-9, 3.141592502593994)

  static async init(url: string): Promise<ReadyPlayerMeModel> {
    const model = new ReadyPlayerMeModel()
    return model.load(url)
  }

  private constructor() {
    // use static init
  }

  private async load(url: string): Promise<ReadyPlayerMeModel> {
    this.root = await loadModel(url)

    this.root.position.set(0, -0.55, 0)

    this.avatarRoot = object3DChildNamed(this.root, 'AvatarRoot')

    // Meshes & bonez
    this.faceNode = object3DChildNamed(this.avatarRoot, 'Wolf3D_Head') as SkinnedMesh
    this.teethNode = object3DChildNamed(this.avatarRoot, 'Wolf3D_Teeth') as SkinnedMesh
    this.headBone = object3DChildNamed(this.avatarRoot, 'Head', { recursive: true }) as Bone
    this.leftEyeBone = object3DChildNamed(this.avatarRoot, 'LeftEye', { recursive: true }) as Bone
    this.rightEyeBone = object3DChildNamed(this.avatarRoot, 'RightEye', { recursive: true }) as Bone

    // Old version of RPM models
    this.wolf3D_Avatar = object3DChildNamed(this.avatarRoot, 'Wolf3D_Avatar') as SkinnedMesh

    // Save initial rotation of eye nodes. We will apply our transforms to eye gaze as deltas to this
    this.eulerLeftUnity = this.leftEyeBone?.rotation.clone() ?? this.eulerLeftUnity
    this.eulerRightUnity = this.rightEyeBone?.rotation.clone() ?? this.eulerRightUnity

    // Remove hands
    const handsNode = object3DChildNamed(this.avatarRoot, 'Wolf3D_Hands', { recursive: true }) as SkinnedMesh
    handsNode.removeFromParent()

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
    this.updatePosition(results.transform.x, results.transform.y, results.transform.z)
  }

  private updateBlendShapes(blendShapes: BlendShapes) {
    for (const key in blendShapes) {
      const value = this._tuneMorphTargetValue(key, blendShapes[key])

      // RPM uses the ARKit key convention ("mouthSmileLeft" as opposed to "mouthSmile_L")
      const arKitKey = BlendShapeKeys.toARKitConvention(key)

      setMorphTarget(this.faceNode, arKitKey, value)
      setMorphTarget(this.teethNode, arKitKey, value)
      setMorphTarget(this.wolf3D_Avatar, arKitKey, value)
    }

    /**
     * Handle eye gaze rotation
     * Notes:
     *   * The eye nodes in RPM models have a rotation to them causing the Y/Z axes to act 'switched'. e.g. Z is pointing up/down (vertical),
     *     while Y is pointing forward/backward (normally how we think about Z). This causes a change here where eye gaze Y deltas
     *     needs to be applied to Z instead of Y.
     *   * 'Unity' eulers are initial values for node rotation that we pulled from the model. Our transoforms are applied as small deltas to
     *     that original rotation.
     *
     */
    if (this.leftEyeBone && this.rightEyeBone) {
      const gazeRightDelta = new Euler(
        blendShapes.eyeLookDown_L + -blendShapes.eyeLookUp_L,
        blendShapes.eyeLookOut_L + -blendShapes.eyeLookIn_L,
        0
      )

      const gazeLeftDelta = new Euler(
        blendShapes.eyeLookDown_R + -blendShapes.eyeLookUp_R,
        -blendShapes.eyeLookOut_R + blendShapes.eyeLookIn_R,
        0
      )

      const eyeRotationLeft = new Euler(
        this.eulerLeftUnity.x + gazeLeftDelta.x * this.maxAngle,
        this.eulerLeftUnity.y,
        this.eulerLeftUnity.z - gazeLeftDelta.y * this.maxAngle
      )

      const eyeRotationRight = new Euler(
        this.eulerRightUnity.x + gazeRightDelta.x * this.maxAngle,
        this.eulerRightUnity.y,
        this.eulerRightUnity.z - gazeRightDelta.y * this.maxAngle
      )

      this.leftEyeBone?.setRotationFromEuler(eyeRotationLeft)
      this.rightEyeBone?.setRotationFromEuler(eyeRotationRight)
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
    const object = this.headBone ?? this.wolf3D_Avatar

    object.rotation.x = pitch
    object.rotation.y = this.shouldMirror ? -yaw : yaw
    object.rotation.z = this.shouldMirror ? roll : -roll
  }

  private updatePosition(x: number, y: number, z: number) {
    const object = this.avatarRoot ?? this.wolf3D_Avatar

    // Note: The default Z values feel pretty far back. These are adjusted.
    object.position.set(x, y, z / 2)
  }
}
