import { WorldObject } from '../worldObject'

export default class CubeModel extends WorldObject {
  constructor(props?: Record<string, any>) {
    super(props)

    this.resource = this.resources.items.hallwayStreamRoomModel

    this.setModel()
  }

  setModel() {
    this.model = this.resource.scene

    this.scene.add(this.model)
  }
}
