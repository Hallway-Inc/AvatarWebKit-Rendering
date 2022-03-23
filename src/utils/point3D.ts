export const X = 0
export const Y = 1
export const Z = 2

export const ORIGIN: Point3D = [0, 0, 0]

export type Point3D = [number, number, number]
export type Points3D = Point3D[]

export const x = (p: Point3D): number => p[X]
export const y = (p: Point3D): number => p[Y]
export const z = (p: Point3D): number => p[Z]

export const createPoint = (x: number, y: number, z: number): Point3D => [x, y, z]
export const midpoint = (p1: Point3D, p2: Point3D): Point3D => multiply(translatePoint(p1, p2), 0.5)

export const translatePoint = (origin: Point3D, amount: Point3D): Point3D =>
  createPoint(x(origin) + x(amount), y(origin) + y(amount), z(origin) + z(amount))

export const multiply = (point: Point3D, ammount: number): Point3D =>
  createPoint(x(point) * ammount, y(point) * ammount, z(point) * ammount)

export const length = (point: Point3D): number =>
  Math.sqrt(Math.pow(x(point), 2) + Math.pow(y(point), 2) + Math.pow(z(point), 2))
