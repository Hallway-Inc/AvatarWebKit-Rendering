import { BlendShapeKeys, BlendShapes } from '@quarkworks-inc/avatar-webkit'
import * as THREE from 'three'

import { getObjectByNameAssert, setMorphTarget } from '../../utils/three'

import { WorldObject } from '../worldObject'

export default class ChibModelV2 extends WorldObject {
  model: THREE.Group
  private headBone?: THREE.Bone
  private neckBone?: THREE.Bone
  private backDrop?: THREE.Mesh
  private euler = new THREE.Euler()

  private headBoneInitialQuaternion: THREE.Quaternion
  private neckBoneInitialQuaternion: THREE.Quaternion

  constructor(props?: Record<string, any>) {
    super(props)

    this.resource = this.resources.items.chibModel

    this.setModel()
  }

  setModel() {
    this.model = this.resource.scene

    this.headBone = getObjectByNameAssert(this.model, 'mixamorigHead', THREE.Bone)
    this.neckBone = getObjectByNameAssert(this.model, 'mixamorigNeck', THREE.Bone)
    this.backDrop = getObjectByNameAssert(this.model, 'Backdrop', THREE.Mesh)

    this.model.traverse(child => (child.frustumCulled = false))

    this.headBoneInitialQuaternion = this.headBone.quaternion.clone()
    this.neckBoneInitialQuaternion = this.neckBone.quaternion.clone()

    this.backDrop.visible = false

    this.scene.add(this.model)
  }

  sitHallwayStreamRoom() {
    this.model.scale.set(1.75, 1.75, 1.75)
    this.model.position.set(0.96, 0.75, -1.2)

    const leftUpLeg = this.model.getObjectByName('mixamorigLeftUpLeg')
    leftUpLeg.rotateX(Math.PI / 2)

    const rightUpLeg = this.model.getObjectByName('mixamorigRightUpLeg')
    rightUpLeg.rotateX(Math.PI / 2)

    const leftArm = this.model.getObjectByName('mixamorigLeftArm')
    leftArm.rotateZ(Math.PI / 16)

    const rightArm = this.model.getObjectByName('mixamorigRightArm')
    rightArm.rotateZ(-Math.PI / 16)

    const leftForeArm = this.model.getObjectByName('mixamorigLeftForeArm')
    leftForeArm.rotateZ(1)

    const rightForeArm = this.model.getObjectByName('mixamorigRightForeArm')
    rightForeArm.rotateZ(-1)

    const leftHand = this.model.getObjectByName('mixamorigLeftHand')
    leftHand.rotateY(Math.PI / 3)

    const rightHand = this.model.getObjectByName('mixamorigRightHand')
    rightHand.rotateY(-Math.PI / 3)

    if (this.experience.debug.active) {
      const chibFolder = this.experience.debug.ui.addFolder('chib')
      chibFolder.add(this.model.position, 'x').name('posX').min(-Math.PI).max(Math.PI)
      chibFolder.add(this.model.position, 'y').name('posY').min(-Math.PI).max(Math.PI)
      chibFolder.add(this.model.position, 'z').name('posZ').min(-Math.PI).max(Math.PI)

      chibFolder.add(rightArm.rotation, 'x').name('rightArmX').min(-Math.PI).max(Math.PI)
      chibFolder.add(rightArm.rotation, 'y').name('rightArmY').min(-Math.PI).max(Math.PI)
      chibFolder.add(rightArm.rotation, 'z').name('rightArmZ').min(-Math.PI).max(Math.PI)

      chibFolder.add(rightForeArm.rotation, 'x').name('rightForeArmX').min(-Math.PI).max(Math.PI)
      chibFolder.add(rightForeArm.rotation, 'y').name('rightForeArmY').min(-Math.PI).max(Math.PI)
      chibFolder.add(rightForeArm.rotation, 'z').name('rightForeArmZ').min(-Math.PI).max(Math.PI)
    }
  }

  private _tuneMorphTargetValue(key: string, value: number): number {
    switch (key) {
      case BlendShapeKeys.eyeWide_R:
      case BlendShapeKeys.eyeWide_L:
        // Eyes are clipping on larger values
        return Math.min(value, 0.8)
      default:
        return value
    }
  }

  updateBlendShapes(blendShapes: BlendShapes) {
    if (!this.model) return

    this.model.traverse(node => {
      const nodeMesh = node as THREE.Mesh

      if (!nodeMesh.morphTargetDictionary || !nodeMesh.morphTargetInfluences) return

      for (const key in blendShapes) {
        const arKitKey = BlendShapeKeys.toARKitConvention(key)
        const value = this._tuneMorphTargetValue(key, blendShapes[key])

        setMorphTarget(nodeMesh, arKitKey, value)
      }
    })
  }

  updateHeadRotation(pitch: number, yaw: number, roll: number) {
    if (!this.neckBone || !this.headBone) return

    const headWeight = 0.8
    this.euler.set(-pitch * headWeight, yaw * headWeight, -roll * headWeight)
    this.headBone.quaternion.setFromEuler(this.euler).premultiply(this.headBoneInitialQuaternion)
    const neckWeight = 0.2
    this.euler.set(-pitch * neckWeight, yaw * neckWeight, -roll * neckWeight)
    this.neckBone.quaternion.setFromEuler(this.euler).premultiply(this.neckBoneInitialQuaternion)
  }
}
