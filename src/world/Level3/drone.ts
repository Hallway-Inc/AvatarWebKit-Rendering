import { WorldObject } from '../worldObject'

export default class Drone extends WorldObject {
  constructor(props?: Record<string, any>) {
    super(props)

    this.resource = this.resources.items.level3DroneModel

    this.setModel()
  }

  setModel() {
    this.model = this.resource.scene

    this.scene.add(this.model)
  }
}
