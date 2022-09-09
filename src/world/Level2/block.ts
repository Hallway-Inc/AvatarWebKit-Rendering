import * as THREE from 'three'
import { Mesh, MeshBasicMaterial } from 'three'

import { WorldObject } from '../worldObject'

export default class Block extends WorldObject {
  constructor(props?: Record<string, any>) {
    super(props)

    this.resource = this.resources.items.level2BlockBakedModel

    this.setMaterial()

    this.setModel()
  }

  setMaterial() {
    const bakedTexture = this.resources.items.level2BlockBakedTexture
    bakedTexture.flipY = false
    bakedTexture.encoding = THREE.sRGBEncoding
    this.material = new MeshBasicMaterial({ map: bakedTexture })
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
