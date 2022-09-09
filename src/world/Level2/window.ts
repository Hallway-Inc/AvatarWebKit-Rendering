import { WorldObject } from '../worldObject'

export default class Window extends WorldObject {
  constructor(props?: Record<string, any>) {
    super(props)

    this.resource = this.resources.items.level2WindowModel

    this.setModel()
  }

  setModel() {
    this.model = this.resource.scene
    this.scene.add(this.model)
  }
}
