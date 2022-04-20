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
  const idx = mesh.morphTargetDictionary[key]
  if (!idx) return
  mesh.morphTargetInfluences[idx] = value
}

export type AvailableMorphTarget = {
  meshId: number
  meshUuid: string
  name: string
}

export const availableMorphTargets = (object: Object3D): AvailableMorphTarget[] => {
  let targets: AvailableMorphTarget[] = []

  const mesh = object as Mesh
  if (mesh && mesh.morphTargetDictionary) {
    targets = Object.keys(mesh.morphTargetDictionary).map(name => ({
      meshId: mesh.id,
      meshUuid: mesh.uuid,
      name
    }))
  }

  object.children.forEach(child => {
    const found = availableMorphTargets(child)
    if (found && found.length > 0) {
      targets = targets.concat(found)
    }
  })

  return targets
}

export type AvailableChildren = {
  meshId: number
  meshUuid: string
  name: string
  type: string
}

export const availableChildren = (object: Object3D): AvailableChildren[] => {
  let children: AvailableChildren[] = []

  children.push({
    meshId: object.id,
    meshUuid: object.uuid,
    name: object.name,
    type: object.type
  })

  object.children.forEach(child => {
    const found = availableChildren(child)
    if (found && found.length > 0) {
      children = children.concat(found)
    }
  })

  return children
}
