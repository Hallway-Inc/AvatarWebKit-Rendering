import { BlendShapeKeys, BlendShapes } from '@quarkworks-inc/avatar-webkit'
import { AnimationMixer, Object3D, SkinnedMesh } from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'

import { getObjectByNameAssert, setMorphTarget } from '../../utils/three'
import { WorldObject } from '../worldObject'

const euler = new THREE.Euler()

export default class ReadyPlayerMeModelV2 extends WorldObject {
  private headBone: THREE.Bone
  private neckBone: THREE.Bone
  private spineBone: THREE.Bone
  private leftEyeBone: THREE.Bone
  private rightEyeBone: THREE.Bone
  private avatarMesh: THREE.SkinnedMesh

  private headBoneInitialQuaternion: THREE.Quaternion
  private neckBoneInitialQuaternion: THREE.Quaternion
  private spineBoneInitialQuaternion: THREE.Quaternion
  private eyeBoneInitialQuaternion: THREE.Quaternion

  maximoResource: GLTF
  maximoModel: Object3D

  constructor(props?: Record<string, any>) {
    super(props)

    this.resource = this.resources.items.rpmModel

    this.maximoResource = this.resources.items.typingAnimation
    this.maximoModel = this.maximoResource.scene

    this.maximoModel.traverse(child => {
      child.frustumCulled = false
    })

    this.scene.add(this.maximoModel)
    this.setModel()
  }

  playAnimation() {
    this.animation.play('typing')
  }

  stopAnimation() {
    console.log('yeet')
    this.animation.mixer.stopAllAction()
  }

  setModel() {
    this.model = this.resource.scene
    console.log(this.maximoModel)

    this.headBone = getObjectByNameAssert(this.maximoModel, 'Head', THREE.Bone)
    this.neckBone = getObjectByNameAssert(this.maximoModel, 'Neck', THREE.Bone)
    this.spineBone = getObjectByNameAssert(this.maximoModel, 'Spine', THREE.Bone)
    this.leftEyeBone = getObjectByNameAssert(this.maximoModel, 'LeftEye', THREE.Bone)
    this.rightEyeBone = getObjectByNameAssert(this.maximoModel, 'RightEye', THREE.Bone)
    this.avatarMesh = getObjectByNameAssert(this.maximoModel, 'SkeletalMesh_01', THREE.SkinnedMesh)
    // this.teethMesh = getObjectByNameAssert(this.model, 'Wolf3D_Teeth', THREE.Mesh)

    this.headBoneInitialQuaternion = this.headBone.quaternion.clone()
    this.neckBoneInitialQuaternion = this.neckBone.quaternion.clone()
    this.spineBoneInitialQuaternion = this.spineBone.quaternion.clone()
    this.eyeBoneInitialQuaternion = this.leftEyeBone.quaternion.clone()

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
    this.maximoModel.scale.set(2.5, 2.5, 2.5)
    this.maximoModel.position.set(1, 0.1, -1)
    this.animation.mixer = new AnimationMixer(this.maximoModel)

    this.animation.actions.typing = this.animation.mixer.clipAction(this.maximoResource.animations[0])
    this.animation.current = this.animation.actions.typing
    this.playAnimation()

    const skeletalMesh = this.maximoModel.getObjectByName('SkeletalMesh_01') as SkinnedMesh
    const rpmMesh = this.model.getObjectByName('Wolf3D_Avatar') as SkinnedMesh
    skeletalMesh.material = rpmMesh.material

    this.model.visible = false
  }

  update() {
    this.animation.mixer.update(this.time.delta * 0.001)
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

  updateBlendShapes(blendShapes: BlendShapes) {
    for (const key in blendShapes) {
      const value = this._tuneMorphTargetValue(key, blendShapes[key])

      const arKitKey = BlendShapeKeys.toARKitConvention(key)

      setMorphTarget(this.avatarMesh, arKitKey, value)
    }

    // Eye rotation
    const maxAngle = (1 / 57.3) * 28
    euler.set(
      maxAngle * (blendShapes.eyeLookDown_R + -blendShapes.eyeLookUp_R),
      maxAngle * (-blendShapes.eyeLookOut_R + blendShapes.eyeLookIn_R),
      0
    )
    this.leftEyeBone.quaternion.setFromEuler(euler).premultiply(this.eyeBoneInitialQuaternion)
    this.rightEyeBone.quaternion.setFromEuler(euler).premultiply(this.eyeBoneInitialQuaternion)
  }

  updateHeadPosition(x: number, y: number, z: number) {
    euler.set(z * 0.1, 0, -x * 0.5)
    this.spineBone.quaternion.setFromEuler(euler).premultiply(this.spineBoneInitialQuaternion)
  }

  updateHeadRotation(pitch: number, yaw: number, roll: number) {
    // Maximo model yaw and roll are switched
    // probably because 3js is Y-up and everything else is not
    const headWeight = 0.8
    euler.set(-pitch * headWeight, -roll * headWeight, yaw * headWeight)
    this.headBone.quaternion.setFromEuler(euler).premultiply(this.headBoneInitialQuaternion)

    const neckWeight = 0.2
    euler.set(-pitch * neckWeight, -roll * neckWeight, yaw * neckWeight)
    this.neckBone.quaternion.setFromEuler(euler).premultiply(this.neckBoneInitialQuaternion)
  }
}
