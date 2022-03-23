import { Mesh, Object3D } from 'three'

export const object3DChildNamed = (object: Object3D, name: string) => object.children.find(child => child.name === name)

export const setMorphTarget = (mesh: Mesh | undefined, key: string, value: any) => {
  if (!mesh) return
  let idx = mesh.morphTargetDictionary[key]
  if (!idx) return
  mesh.morphTargetInfluences[idx] = value
}
