import { Mesh, MeshMatcapMaterial } from 'three'

import { WorldObject } from '../worldObject'

export default class SudoHead extends WorldObject {
  constructor(props?: Record<string, any>) {
    super(props)

    this.resource = this.resources.items.level1SudoHeadModel

    this.setMaterial()

    this.setModel()
  }

  setMaterial() {
    this.material = this.props.bakedMaterial
  }

  setModel() {
    this.model = this.resource.scene
    console.log(this.model)
    const sudoHead = this.model.getObjectByName('sudoHead') as Mesh
    sudoHead.material = this.material

    const earsInside = this.model.getObjectByName('earsInside') as Mesh
    earsInside.material = new MeshMatcapMaterial({ matcap: this.resources.items.matcapPinkOnBeigeTexture })

    const earsOutside = this.model.getObjectByName('earsOutside') as Mesh
    earsOutside.material = new MeshMatcapMaterial({ matcap: this.resources.items.matcapWhiteOnPurpleTexture })

    const collar = this.model.getObjectByName('orange022') as Mesh
    collar.material = new MeshMatcapMaterial({ matcap: this.resources.items.matcapOrangeOnDarkGreyTexture })

    this.scene.add(this.model)
  }
}
