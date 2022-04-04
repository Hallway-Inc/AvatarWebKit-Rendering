import { Event, Mesh, Object3D } from 'three'

export const object3DChildNamed = (
  object: Object3D,
  name: string,
  { recursive = false }: { recursive?: boolean } = {}
): Object3D<Event> | undefined => {
  if (!recursive) {
    return object.children.find(child => child.name === name)
  }

  for (const child of object.children) {
    if (child.name === name) return child
    if (child.children.length > 0) {
      const found = object3DChildNamed(child, name, { recursive })
      if (found) return found
    }
  }

  return undefined
}

export const setMorphTarget = (mesh: Mesh | undefined, key: string, value: any) => {
  if (!mesh) return
  let idx = mesh.morphTargetDictionary[key]
  if (!idx) return
  mesh.morphTargetInfluences[idx] = value
}
