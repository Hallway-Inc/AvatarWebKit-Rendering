import { BlendShapes, Rotation, Transform } from '@quarkworks-inc/avatar-webkit'
import { WorldObject } from '../worldObject'
import * as THREE from 'three'

const rotationEuler = new THREE.Euler()

export default class ReadyPlayerMeModelV2 extends WorldObject {
  private headBone: THREE.Bone
  private neckBone: THREE.Bone

  private headBoneInitialQuaternion: THREE.Quaternion
  private neckBoneInitialQuaternion: THREE.Quaternion

  constructor(props?: Record<string, any>) {
    super(props)

    this.resource = this.resources.items.rpmModel

    this.setModel()
  }

  setModel() {
    this.model = this.resource.scene

    const headBone = this.model.getObjectByName('Head')
    const neckBone = this.model.getObjectByName('Neck')

    if (!headBone || !(headBone instanceof THREE.Bone)) throw new Error('error finding Head bone')
    if (!neckBone || !(neckBone instanceof THREE.Bone)) throw new Error('error finding Neck bone')

    this.headBone = headBone
    this.neckBone = neckBone

    this.headBoneInitialQuaternion = this.headBone.quaternion.clone()
    this.neckBoneInitialQuaternion = this.neckBone.quaternion.clone()

    this.scene.add(this.model)
  }

  sitLevel1() {
    this.model.scale.set(0.65, 0.65, 0.65)
    this.model.position.set(0.16, -0.15, -0.45)

    const leftUpLeg = this.model.getObjectByName('LeftUpLeg')
    leftUpLeg.rotateX(Math.PI / 2)

    const rightUpLeg = this.model.getObjectByName('RightUpLeg')
    rightUpLeg.rotateX(Math.PI / 2)

    const leftLeg = this.model.getObjectByName('LeftLeg')
    leftLeg.rotateX(-Math.PI / 2)

    const rightLeg = this.model.getObjectByName('RightLeg')
    rightLeg.rotateX(-Math.PI / 2)

    const leftArm = this.model.getObjectByName('LeftForeArm')
    leftArm.rotateZ(Math.PI / 2.5)

    const rightArm = this.model.getObjectByName('RightForeArm')
    rightArm.rotateZ(-Math.PI / 2.5)

    const leftHand = this.model.getObjectByName('LeftHand')
    leftHand.rotateY(Math.PI / 3)

    const rightHand = this.model.getObjectByName('RightHand')
    rightHand.rotateY(-Math.PI / 3)
  }

  sitHallwayStreamRoom() {
    this.model.scale.set(2.5, 2.5, 2.5)
    this.model.position.set(1, -1.1, -1.2)

    const leftUpLeg = this.model.getObjectByName('LeftUpLeg')
    leftUpLeg.rotateX(Math.PI / 2)

    const rightUpLeg = this.model.getObjectByName('RightUpLeg')
    rightUpLeg.rotateX(Math.PI / 2)

    const leftLeg = this.model.getObjectByName('LeftLeg')
    leftLeg.rotateX(-Math.PI / 2)

    const rightLeg = this.model.getObjectByName('RightLeg')
    rightLeg.rotateX(-Math.PI / 2)

    const leftArm = this.model.getObjectByName('LeftForeArm')
    leftArm.rotateZ(Math.PI / 2.5)

    const rightArm = this.model.getObjectByName('RightForeArm')
    rightArm.rotateZ(-Math.PI / 2.5)

    const leftHand = this.model.getObjectByName('LeftHand')
    leftHand.rotateY(Math.PI / 3)

    const rightHand = this.model.getObjectByName('RightHand')
    rightHand.rotateY(-Math.PI / 3)
  }

  updateBlendShapes(blendshapes: BlendShapes) {}

  updatePosition(transform: Transform) {}

  updateHeadRotation(rotation: Rotation) {
    const headWeight = 0.8
    rotationEuler.set(-rotation.pitch * headWeight, rotation.yaw * headWeight, -rotation.roll * headWeight)
    this.headBone.quaternion.setFromEuler(rotationEuler).premultiply(this.headBoneInitialQuaternion)

    const neckWeight = 0.2
    rotationEuler.set(-rotation.pitch * neckWeight, rotation.yaw * neckWeight, -rotation.roll * neckWeight)
    this.neckBone.quaternion.setFromEuler(rotationEuler).premultiply(this.neckBoneInitialQuaternion)
  }
}
