import { Mesh } from 'three'

import { WorldObject } from '../worldObject'

export default class Box extends WorldObject {
  constructor(props?: Record<string, any>) {
    super(props)

    this.resource = this.resources.items.level4BoxModel

    this.setModel()
  }

  setModel() {
    this.model = this.resource.scene

    this.model.traverse(child => {
      const mesh = child as Mesh
      mesh.material = this.material
    })

    this.scene.add(this.model)
  }

  setMaterial() {
    this.material = this.props.bakedMaterial
  }
}