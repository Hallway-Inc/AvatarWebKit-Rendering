import * as THREE from 'three'
import { Mesh, MeshBasicMaterial, MeshMatcapMaterial } from 'three'

import { WorldObject } from '../worldObject'

export default class Printer extends WorldObject {
  constructor(props?: Record<string, any>) {
    super(props)

    this.resource = this.resources.items.level3PrinterModel

    this.setMaterial()

    this.setModel()
  }

  setModel() {
    this.model = this.resource.scene

    this.model.traverse(child => {
      const mesh = child as Mesh
      mesh.material = this.material
    })

    console.log(this.resource)
    const bobin = this.model.getObjectByName('bobin') as Mesh
    bobin.material = new MeshMatcapMaterial({ matcap: this.resources.items.matcapDarkGreyOnDarkGreyTexture })

    const movingTube = this.model.getObjectByName('movingTube') as Mesh
    movingTube.material = new MeshMatcapMaterial({ matcap: this.resources.items.matcapOrangeOnDarkGreyTexture })

    const rolledTube = this.model.getObjectByName('rolledTube') as Mesh
    rolledTube.material = new MeshMatcapMaterial({ matcap: this.resources.items.matcapOrangeOnDarkGreyTexture })

    const tube = this.model.getObjectByName('tube') as Mesh
    tube.material = new MeshMatcapMaterial({ matcap: this.resources.items.matcapOrangeOnDarkGreyTexture })

    const endTube = this.model.getObjectByName('endTube') as Mesh
    endTube.material = new MeshMatcapMaterial({ matcap: this.resources.items.matcapOrangeOnDarkGreyTexture })

    const car = this.model.getObjectByName('car') as Mesh
    car.traverse(child => {
      const mesh = child as Mesh
      mesh.material = new MeshMatcapMaterial({ matcap: this.resources.items.matcapOrangeOnDarkGreyTexture })
    })

    this.scene.add(this.model)
  }
  setMaterial() {
    this.material = this.props.bakedMaterial
  }
}
