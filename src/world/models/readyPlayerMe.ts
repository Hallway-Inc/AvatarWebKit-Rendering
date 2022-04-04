import { AvatarPrediction, ActionUnits } from '@quarkworks-inc/avatar-webkit'
import { AxesHelper, Euler, Group, Object3D, Scene, SkinnedMesh, Vector3 } from 'three'
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
  private model: Group
  private avatarRoot: Object3D

  // Nodes for current RPM version
  private faceNode?: SkinnedMesh
  private teethNode?: SkinnedMesh
  private leftEyeNode?: SkinnedMesh
  private rightEyeNode?: SkinnedMesh

  // Nodes for old RPM versions
  private wolf3D_Avatar?: SkinnedMesh

  private maxAngle = (-1 / 57.3) * 28
  private eulerLeftUnity = new Euler(1.5489933490753174, -3.2918876513576834e-9, 3.141592502593994)
  private eulerRightUnity = new Euler(1.5489933490753174, -3.2918876513576834e-9, 3.141592502593994)

  static async init(url: string): Promise<ReadyPlayerMeModel> {
    const model = new ReadyPlayerMeModel()
    return model.load(url)
  }

  private constructor() {}

  private async load(url: string): Promise<ReadyPlayerMeModel> {
    this.model = await loadModel(url)

    this.model.position.set(0, -0.55, 0)

    this.avatarRoot = object3DChildNamed(this.model, 'AvatarRoot')

    this.faceNode = object3DChildNamed(this.avatarRoot, 'Wolf3D_Head') as SkinnedMesh
    this.teethNode = object3DChildNamed(this.avatarRoot, 'Wolf3D_Teeth') as SkinnedMesh
    this.leftEyeNode = object3DChildNamed(this.avatarRoot, 'LeftEye', { recursive: true }) as SkinnedMesh
    this.rightEyeNode = object3DChildNamed(this.avatarRoot, 'RightEye', { recursive: true }) as SkinnedMesh

    this.wolf3D_Avatar = object3DChildNamed(this.avatarRoot, 'Wolf3D_Avatar') as SkinnedMesh

    // Save initial rotation of eye nodes. We will apply our transforms to eye gaze as deltas to this
    this.eulerLeftUnity = this.leftEyeNode?.rotation.clone() ?? this.eulerLeftUnity
    this.eulerRightUnity = this.rightEyeNode?.rotation.clone() ?? this.eulerRightUnity

    // Remove hands
    const handsNode = object3DChildNamed(this.avatarRoot, 'Wolf3D_Hands', { recursive: true }) as SkinnedMesh
    handsNode.removeFromParent()

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

    this.updateMorphTargets(results.actionUnits)
    this.updateHeadRotation(-results.rotation.pitch, -results.rotation.yaw, -results.rotation.roll)
    this.updatePosition(results.transform.x, results.transform.y, results.transform.z)
  }

  private updateMorphTargets(targets: ActionUnits) {
    for (const key in targets) {
      const value = this._tuneMorphTargetValue(key, targets[key])

      setMorphTarget(this.faceNode, key, value)
      setMorphTarget(this.teethNode, key, value)
      setMorphTarget(this.wolf3D_Avatar, key, value)
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
    if (this.leftEyeNode && this.rightEyeNode) {
      const gazeRightDelta = new Euler(
        targets.eyeLookDownLeft + -targets.eyeLookUpLeft,
        targets.eyeLookOutLeft + -targets.eyeLookInLeft,
        0
      )

      const gazeLeftDelta = new Euler(
        targets.eyeLookDownRight + -targets.eyeLookUpRight,
        -targets.eyeLookOutRight + targets.eyeLookInRight,
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

      this.leftEyeNode?.setRotationFromEuler(eyeRotationLeft)
      this.rightEyeNode?.setRotationFromEuler(eyeRotationRight)
    }
  }

  private _tuneMorphTargetValue(key: string, value: number): number {
    switch (key) {
      case 'mouthSmileLeft':
      case 'mouthSmileRight':
        // Tuning down RPM smile so it's less creepy
        return Math.min(Math.max(0, value), 1.0) * 0.7
      default:
        return value
    }
  }

  private updateHeadRotation(pitch: number, yaw: number, roll: number) {
    this.avatarRoot?.rotation.set(pitch, this.shouldMirror ? -yaw : yaw, this.shouldMirror ? roll : -roll)
  }

  private updatePosition(x: number, y: number, z: number) {
    // Note: The default Z values feel pretty far back. These are adjusted.
    this.avatarRoot?.position.set(x, y, z + 0.55)
  }
}
