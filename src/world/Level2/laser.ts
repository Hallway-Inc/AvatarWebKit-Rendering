import { Mesh, MeshMatcapMaterial } from 'three'

import { WorldObject } from '../worldObject'

export default class Laser extends WorldObject {
  constructor(props?: Record<string, any>) {
    super(props)

    this.resource = this.resources.items.level2LaserModel

    this.setModel()
  }
  setModel() {
    this.model = this.resource.scene

    const cylinder = this.model.getObjectByName('cylinder') as Mesh
    cylinder.material = new MeshMatcapMaterial({ matcap: this.resources.items.matcapDarkGreyOnWhiteTexture })

    const base = this.model.getObjectByName('base') as Mesh
    base.material = new MeshMatcapMaterial({ matcap: this.resources.items.matcapWhiteOnPurpleTexture })

    this.scene.add(this.model)
  }
}
