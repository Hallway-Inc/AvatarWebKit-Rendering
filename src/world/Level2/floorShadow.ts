import * as THREE from 'three'
import { Mesh, MeshBasicMaterial } from 'three'

import { WorldObject } from '../worldObject'

export default class FloorShadow extends WorldObject {
  constructor(props?: Record<string, any>) {
    super(props)

    this.resource = this.resources.items.level2FloorShadowModel

    this.setMaterial()

    this.setModel()
  }

  setMaterial() {
    const bakedTexture = this.resources.items.level2FloorShadowTexture
    bakedTexture.flipY = false
    bakedTexture.encoding = THREE.sRGBEncoding
    this.material = new MeshBasicMaterial({ map: bakedTexture })
  }

  setModel() {
    this.model = this.resource.scene
    // TODO fix floor shadow
    this.model.visible = false
    this.model.traverse(child => {
      const mesh = child as Mesh
      mesh.material = this.material
      mesh.position.y = 0.1
    })

    this.scene.add(this.model)
  }
}
