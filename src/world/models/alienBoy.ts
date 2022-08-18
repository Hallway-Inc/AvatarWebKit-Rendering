import { AvatarPrediction, BlendShapeKeys, BlendShapes } from '@quarkworks-inc/avatar-webkit'
import { Group, Mesh, Scene, SkinnedMesh } from 'three'

import { Model, ModelType } from '../../types'
import { loadModel } from '../systems/loadModel'
import { enumerateChildNodes, object3DChildNamed } from '../../utils/three'

import { AlienBoyModelSettings } from './modelSettings'

const PITCH_OFFSET = -0.3

const Y_OFFSET = -2.4
const Z_OFFSET = -3

export class AlienBoyModel implements Model {
  readonly type: ModelType = 'alienBoy'

  static readonly defaultSettings: AlienBoyModelSettings = {}

  readonly defaultSettings = AlienBoyModel.defaultSettings
  settings = this.defaultSettings
  shouldMirror = true

  // Model group
  private model: Group

  // Mesh
  private headNode: Mesh

  private childNodesCopy = []

  static async init(url: string): Promise<AlienBoyModel> {
    const model = new AlienBoyModel()
    return model.load(url)
  }

  private constructor() {
    // use static init
  }

  private async load(url: string): Promise<AlienBoyModel> {
    this.model = await loadModel(url, { useMeshopt: true })

    this.model.position.y = Y_OFFSET
    this.model.position.z = Z_OFFSET

    this.headNode = object3DChildNamed(this.model, 'Alien_head', { recursive: true }) as Mesh
    const headXPosition = this.headNode.position.x
    const headYPosition = this.headNode.position.y
    const headZPosition = this.headNode.position.z

    // Setting all nodes as childs of HeadNode to fix rotation
    this.model.children.forEach(node => {
      if (node.name !== 'Alien_head') this.childNodesCopy.push(node)
    })

    this.childNodesCopy.forEach(node => {
      node.position.x -= headXPosition
      node.position.y -= headYPosition
      node.position.z -= headZPosition
      this.headNode.add(node)
    })

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
    if (!this.headNode) return

    const xRotation = pitch + PITCH_OFFSET
    const yRotation = yaw
    const zRotation = roll

    this.headNode.rotation.x = xRotation
    this.headNode.rotation.y = this.shouldMirror ? -yRotation : yRotation
    this.headNode.rotation.z = this.shouldMirror ? zRotation : -zRotation
  }

  private updatePosition(x: number, y: number, z: number) {
    if (!this.model) return

    this.model.position.x = x
    this.model.position.y = Y_OFFSET + y
    this.model.position.z = Z_OFFSET + z
  }

  lookAt(x: number, y: number, z: number): void {
    this.headNode.lookAt(x * 2, y * 2, z)
  }
}
