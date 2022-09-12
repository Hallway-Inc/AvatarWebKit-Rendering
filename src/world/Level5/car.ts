import { Mesh, MeshMatcapMaterial } from 'three'

import { WorldObject } from '../worldObject'

export default class Car extends WorldObject {
  constructor(props?: Record<string, any>) {
    super(props)

    this.resource = this.resources.items.level5CarModel

    this.setMaterial()

    this.setModel()
  }

  setMaterial() {
    // const bakedTexture = this.resources.items.level5ScreensBakedTexture
    // bakedTexture.flipY = false
    // bakedTexture.encoding = THREE.sRGBEncoding
    // this.material = new MeshBasicMaterial({ map: bakedTexture })
    this.material = new MeshMatcapMaterial({ matcap: this.resources.items.matcapOrangeOnDarkGreyTexture })
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
