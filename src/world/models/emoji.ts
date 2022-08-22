import { AvatarPrediction, BlendShapeKeys, BlendShapes } from '@quarkworks-inc/avatar-webkit'
import { Group, Scene, Mesh, MeshStandardMaterial, MathUtils, Color } from 'three'

import { Model, ModelType } from '../../types'
import { emojiColors } from '../../utils/emojiColors'
import { loadModelFromPublicCDN } from '../systems/loadModel'

import { EmojiModelSettings, ModelSettingType } from './modelSettings'

export class EmojiModel implements Model {
  readonly type: ModelType = 'emoji'

  static readonly defaultSettings: EmojiModelSettings = {
    faceColor: {
      name: 'Face Color',
      type: ModelSettingType.color,
      value: emojiColors[0]
    },
    eyeColor: {
      name: 'Eye Color',
      type: ModelSettingType.color,
      value: '#000000'
    }
  }

  readonly defaultSettings = EmojiModel.defaultSettings
  private _settings = this.defaultSettings
  shouldMirror = true

  // Groups
  private model: Group
  private headphones?: Group

  // Mesh components
  private face: Mesh
  private mouth: Mesh
  private tongue: Mesh
  private teeth: Mesh
  private rightEye: Mesh
  private rightPupil: Mesh
  private leftEye: Mesh
  private leftPupil: Mesh

  // Materials
  private faceMaterial: MeshStandardMaterial
  private leftPupilMaterial: MeshStandardMaterial
  private rightPupilMaterial: MeshStandardMaterial

  static async init(): Promise<EmojiModel> {
    const model = new EmojiModel()
    return model.load()
  }

  private constructor() {
    // use static init
  }

  private async load(): Promise<EmojiModel> {
    this.model = await loadModelFromPublicCDN('models/Smiley_eye_compressed.glb', { useMeshopt: true })
    this.headphones = await loadModelFromPublicCDN('models/headphones_2_compressed.glb', { useMeshopt: true })

    this.model.add(this.headphones)

    // Mesh components
    this.rightEye = this.model.children[0] as Mesh
    this.leftEye = this.model.children[1] as Mesh

    this.rightPupil = this.rightEye.children[1] as Mesh
    this.leftPupil = this.leftEye.children[1] as Mesh

    const smileyGroup = this.model.children[2]

    this.face = smileyGroup.children[0] as Mesh
    this.mouth = smileyGroup.children[1] as Mesh
    this.tongue = smileyGroup.children[2] as Mesh
    this.teeth = smileyGroup.children[3] as Mesh

    // Materials
    this.faceMaterial = this.face.material as MeshStandardMaterial
    this.leftPupilMaterial = this.leftPupil.material as MeshStandardMaterial
    this.rightPupilMaterial = this.rightPupil.material as MeshStandardMaterial

    this.faceMaterial.metalness = 0.1
    this.faceMaterial.roughness = 0.5
    this.faceMaterial.needsUpdate = true

    // Update props from settings
    this.settings = this._settings

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
    if (!this.face) return

    for (const key in blendShapes) {
      let value = blendShapes[key]

      if (key === BlendShapeKeys.browDown_L || key === BlendShapeKeys.browDown_R) {
        value = Math.min(Math.max(value - 0.0, 0), 1)
      }

      // Morph index for emoji doesn't quite match up with ARKit keys
      const morphIndex = this.face.morphTargetDictionary[key]

      this.face.morphTargetInfluences[morphIndex] = value
      this.mouth.morphTargetInfluences[morphIndex] = value
      this.teeth.morphTargetInfluences[morphIndex] = value
      this.tongue.morphTargetInfluences[morphIndex] = value
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
    const maxAngle = (1 / 57.3) * 30

    this.rightEye.rotation.x = eulerRight[0] * maxAngle
    this.rightEye.rotation.y = eulerRight[1] * maxAngle
    this.rightEye.rotation.z = eulerRight[2] * maxAngle

    this.leftEye.rotation.x = eulerLeft[0] * maxAngle
    this.leftEye.rotation.y = eulerLeft[1] * maxAngle
    this.leftEye.rotation.z = eulerLeft[2] * maxAngle
  }

  updateEyeGaze(value: number) {
    this.leftEye.rotation.y = -MathUtils.degToRad(value)
    this.rightEye.rotation.y = -MathUtils.degToRad(value)
  }

  updateHeadRotation(pitch: number, yaw: number, roll: number) {
    if (!this.model) return

    this.model.rotation.x = pitch
    this.model.rotation.y = this.shouldMirror ? -yaw : yaw
    this.model.rotation.z = this.shouldMirror ? roll : -roll
  }

  updatePosition(x: number, y: number, z: number) {
    if (!this.model) return

    this.model.position.x = x
    this.model.position.y = y
    this.model.position.z = z / 2
  }

  get settings(): EmojiModelSettings {
    return this._settings
  }

  set settings(settings: EmojiModelSettings) {
    this._settings = settings

    const {
      faceColor = EmojiModel.defaultSettings.faceColor,
      eyeColor = EmojiModel.defaultSettings.eyeColor
    } = settings

    this.faceMaterial.color = new Color(faceColor.value)
    this.leftPupilMaterial.color = new Color(eyeColor.value)
    this.rightPupilMaterial.color = new Color(eyeColor.value)
  }

  lookAt(x: number, y: number, z: number): void {
    this.model.lookAt(x, y, z)
  }
}
