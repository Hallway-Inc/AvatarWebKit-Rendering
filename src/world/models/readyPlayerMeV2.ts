import { WorldObject } from '../worldObject'

export default class ReadyPlayerMeModelV2 extends WorldObject {
  constructor(props?: Record<string, any>) {
    super(props)

    this.resource = this.resources.items.rpmModel

    this.setModel()
  }

  setModel() {
    this.model = this.resource.scene
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
}
