import { AvatarPrediction, BlendShapes } from '@quarkworks-inc/avatar-webkit'
import { Group, SkinnedMesh, Scene, Bone } from 'three'

import { Model, ModelType } from '../../types'
import { loadModel } from '../systems/loadModel'
import { object3DChildNamed, setMorphTarget } from '../../utils/three'

import { MozillaModelSettings } from './modelSettings'

const Y_OFFSET = -0.55
const Z_OFFSET = -0.5

export class MozillaModel implements Model {
  readonly type: ModelType = 'mozilla'

  static readonly defaultSettings: MozillaModelSettings = {}

  readonly defaultSettings = MozillaModel.defaultSettings
  settings = this.defaultSettings
  shouldMirror = true

  model: Group
  private combinedMesh?: SkinnedMesh
  private headNode?: Bone
  private rightHandNode?: Bone
  private leftHandNode?: Bone

  static async init(url: string): Promise<MozillaModel> {
    const model = new MozillaModel()
    return model.load(url)
  }

  private constructor() {
    // use static init
  }

  private async load(url: string): Promise<MozillaModel> {
    this.model = await loadModel(url)

    this.model.position.y = Y_OFFSET
    this.model.position.z = Z_OFFSET
    const object = this.model.children[0]
    this.combinedMesh = object3DChildNamed(object, 'CombinedMesh') as SkinnedMesh
    this.headNode = object3DChildNamed(object, 'Head', { recursive: true }) as Bone
    this.rightHandNode = object3DChildNamed(object, 'RightHand', { recursive: true }) as Bone
    this.leftHandNode = object3DChildNamed(object, 'LeftHand', { recursive: true }) as Bone

    // Hide hands
    this.leftHandNode.position.y = -10
    this.rightHandNode.position.y = -10

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
    if (!this.combinedMesh) return

    const blink = (blendShapes.eyeBlink_L + blendShapes.eyeBlink_R) / 2
    setMorphTarget(this.combinedMesh, 'Blink', blink)

    const eyeRotation = (blendShapes.browDown_L + blendShapes.browDown_R) / 2
    setMorphTarget(this.combinedMesh, 'Eye Rotation', eyeRotation)

    setMorphTarget(this.combinedMesh, 'MouthFlap', blendShapes.jawOpen)

    // TODO: more morph targets?
    // you can inspect the nodes to see what is available.
  }

  private updateHeadRotation(pitch: number, yaw: number, roll: number) {
    if (!this.headNode) return

    this.headNode.rotation.x = pitch
    this.headNode.rotation.y = this.shouldMirror ? -yaw : yaw
    this.headNode.rotation.z = this.shouldMirror ? roll : -roll
  }

  private updatePosition(x: number, y: number, z: number) {
    if (!this.model) return

    this.model.position.x = x
    this.model.position.y = Y_OFFSET + y
    this.model.position.z = Z_OFFSET + z / 2
  }

  lookAt(x: number, y: number, z: number): void {
    this.headNode.lookAt(x, y, z)
  }
}
