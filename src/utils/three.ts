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

export const enumerateChildNodes = (object: Object3D, callback: (object: Object3D) => void): void => {
  for (const child of object.children) {
    callback(child)

    if (child.children.length > 0) {
      enumerateChildNodes(child, callback)
    }
  }
}

export const setMorphTarget = (mesh: Mesh | undefined, key: string, value: any) => {
  if (!mesh) return
  const index = mesh.morphTargetDictionary[key]
  if (index === undefined) return
  mesh.morphTargetInfluences[index] = value
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

export const getObjectByNameAssert = <T extends Object3D>(object: Object3D, name: string, type: { new (): T }): T => {
  const node = object.getObjectByName(name)
  if (!node || !(node instanceof type)) throw new Error(`error finding node "${name}" of type "${type.name}"`)
  return node
}
