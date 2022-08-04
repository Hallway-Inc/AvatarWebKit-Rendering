import { AvatarPrediction, BlendShapeKeys, BlendShapes } from '@quarkworks-inc/avatar-webkit'
import { Bone, Group, Mesh, Object3D, Scene, SkinnedMesh } from 'three'

import { Model, ModelType } from '../../types'
import { loadModel } from '../systems/loadModel'
import { enumerateChildNodes, object3DChildNamed } from '../../utils/three'

import { ChibModelSettings } from './modelSettings'

const Y_OFFSET = -1
const Z_OFFSET = -0.8

export class ChibModel implements Model {
  readonly type: ModelType = 'chib'

  static readonly defaultSettings: ChibModelSettings = {}

  readonly defaultSettings: ChibModelSettings = ChibModel.defaultSettings
  private _settings = this.defaultSettings
  shouldMirror = true

  private model: Group
  private headBone?: Bone
  private neckBone?: Bone
  private leftArm?: Bone
  private rightArm?: Bone
  private backDrop?: Mesh

  static async init(url: string): Promise<ChibModel> {
    const model = new ChibModel()
    return model.load(url)
  }

  private constructor() {
    // use static init
  }

  private async load(url: string): Promise<ChibModel> {
    this.model = await loadModel(url, { useMeshopt: true })

    this.model.position.y = Y_OFFSET
    this.model.position.z = Z_OFFSET

    enumerateChildNodes(this.model, (node: Object3D) => {
      node.frustumCulled = false
    })

    // Meshes & bonez
    this.neckBone = object3DChildNamed(this.model, 'mixamorigNeck', { recursive: true }) as Bone
    this.headBone = object3DChildNamed(this.model, 'mixamorigHead', { recursive: true }) as Bone

    this.leftArm = object3DChildNamed(this.model, 'mixamorigLeftArm', { recursive: true }) as Bone
    this.rightArm = object3DChildNamed(this.model, 'mixamorigRightArm', { recursive: true }) as Bone

    this.backDrop = object3DChildNamed(this.model, 'Backdrop', { recursive: true }) as Mesh
    this.backDrop.position.y += 0.3

    if (this.leftArm) this.leftArm.rotation.x = 1.0
    if (this.rightArm) this.rightArm.rotation.x = 1.0

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

    enumerateChildNodes(this.model, node => {
      const nodeMesh = node as SkinnedMesh

      if (!nodeMesh.morphTargetDictionary || !nodeMesh.morphTargetInfluences) return

      for (const key in blendShapes) {
        const arKitKey = BlendShapeKeys.toARKitConvention(key)

        const morphIndex = nodeMesh.morphTargetDictionary[arKitKey]
        let value = blendShapes[key]

        // Eyes are clipping on larger values
        if (key == 'eyeWide_R' || key == 'eyeWide_L') {
          value = Math.min(value, 0.8)
        }

        // console.log(arKitKey, blendShapes[key], Math.min(blendShapes[key], 0.9))
        nodeMesh.morphTargetInfluences[morphIndex] = value
      }
    })
  }

  private updateHeadRotation(pitch: number, yaw: number, roll: number) {
    if (!this.neckBone || !this.headBone) return

    const xRotation = pitch / 3
    const yRotation = yaw / 2
    const zRotation = roll / 3

    this.headBone.rotation.x = this.shouldMirror ? xRotation : -xRotation
    this.headBone.rotation.y = this.shouldMirror ? -yRotation : yRotation
    this.headBone.rotation.z = zRotation

    this.neckBone.rotation.x = this.shouldMirror ? xRotation : -xRotation
    this.neckBone.rotation.y = this.shouldMirror ? -yRotation : yRotation
    this.neckBone.rotation.z = zRotation
  }

  get settings(): ChibModelSettings {
    return this._settings
  }

  set settings(settings: ChibModelSettings) {
    this._settings = settings
  }
}
