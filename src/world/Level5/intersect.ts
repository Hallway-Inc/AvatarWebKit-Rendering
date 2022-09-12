import { WorldObject } from '../worldObject'

export default class Intersect extends WorldObject {
  constructor(props?: Record<string, any>) {
    super(props)

    this.resource = this.resources.items.level5IntersectModel

    this.setModel()
  }

  setModel() {
    this.model = this.resource.scene
    this.model.visible = false
    this.scene.add(this.model)
  }
}
