import { Mesh } from 'three'

import { WorldObject } from '../worldObject'

export default class Baked extends WorldObject {
  constructor(props?: Record<string, any>) {
    super(props)

    this.resource = this.resources.items.level3BakedModel

    this.setMaterial()
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
