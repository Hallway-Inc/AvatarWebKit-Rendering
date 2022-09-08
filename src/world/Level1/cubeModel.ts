import { Mesh, MeshMatcapMaterial } from 'three'

import { WorldObject } from '../worldObject'

export default class CubeModel extends WorldObject {
  constructor(props?: Record<string, any>) {
    super(props)

    this.resource = this.resources.items.level1CubeModel

    this.setMaterial()

    this.setModel()
  }

  setMaterial() {
    this.material = new MeshMatcapMaterial({ matcap: this.resources.items.matcapPinkOnBeigeTexture })
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
