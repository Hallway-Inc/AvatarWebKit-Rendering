import { AvatarPrediction, ActionUnits } from '@quarkworks-inc/avatar-webkit'
import { Group, Object3D, Scene, SkinnedMesh } from 'three'
import { Model, ModelType } from '../../types'
import { loadModel } from '../systems/loadModel'
import { object3DChildNamed, setMorphTarget } from '../../utils/three'
import { ReadyPlayerMeModelSettings } from './modelSettings'

const Y_OFFSET = -0.55

export class ReadyPlayerMeModel implements Model {
  readonly type: ModelType = 'readyPlayerMe'

  static readonly defaultSettings: ReadyPlayerMeModelSettings = {}

  readonly defaultSettings = ReadyPlayerMeModel.defaultSettings
  settings = this.defaultSettings

  // Model group
  private model: Group
  private avatarRoot: Object3D

  // Nodes for current RPM version
  private faceNode?: SkinnedMesh
  private teethNode?: SkinnedMesh

  // Nodes for old RPM versions
  private wolf3D_Avatar?: SkinnedMesh

  static async init(url: string): Promise<ReadyPlayerMeModel> {
    const model = new ReadyPlayerMeModel()
    return model.load(url)
  }

  private constructor() {}

  private async load(url: string): Promise<ReadyPlayerMeModel> {
    this.model = await loadModel(url)

    this.model.position.y = Y_OFFSET

    this.avatarRoot = object3DChildNamed(this.model, 'AvatarRoot')

    this.faceNode = object3DChildNamed(this.avatarRoot, 'Wolf3D_Head') as SkinnedMesh
    this.teethNode = object3DChildNamed(this.avatarRoot, 'Wolf3D_Teeth') as SkinnedMesh

    this.wolf3D_Avatar = object3DChildNamed(this.avatarRoot, 'Wolf3D_Avatar') as SkinnedMesh

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
      const value = targets[key]
      setMorphTarget(this.faceNode, key, value)
      setMorphTarget(this.teethNode, key, value)
      setMorphTarget(this.wolf3D_Avatar, key, value)
    }
  }

  private updateHeadRotation(pitch: number, yaw: number, roll: number) {
    // this.head.rotation.x = pitch
    // // Inverse yaw & roll effects for yourself to give mirror effect
    // this.head.rotation.y = this.isMe ? -yaw : yaw
    // this.head.rotation.z = this.isMe ? roll : -roll
  }

  private updatePosition(x: number, y: number, z: number) {
    // this.head.position.x = x
    // this.head.position.y = Y_OFFSET + y
    // this.head.position.z = z
  }
}
