import { Mesh } from 'three'

import { WorldObject } from '../worldObject'

export default class CameraHead extends WorldObject {
  constructor(props?: Record<string, any>) {
    super(props)

    this.resource = this.resources.items.level1CameraHeadModel

    this.setMaterial()

    this.setModel()
  }

  setMaterial() {
    this.material = this.props.bakedMaterial
  }

  setModel() {
    this.model = this.resource.scene

    this.model.traverse(child => {
      const mesh = child as Mesh
      mesh.material = this.material
    })

    this.scene.add(this.model)
  }
}
