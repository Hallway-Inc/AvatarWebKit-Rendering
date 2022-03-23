// eslint-disable-next-line import/named
import { NormalizedLandmarkList } from '@mediapipe/face_mesh'
import { cross, divide, dot, matrix, norm, subtract } from 'mathjs'
import { Rotation, Transform } from '../types'

import { Point3D, Points3D } from './point3D'

export type DictCoords = DictCoord[]

export type DictCoord = {
  x: number
  y: number
  visibility: string
}

/** Compute the extent [minimum, maximum] of an array of numbers. */
export function extent(data: number[]) {
  let minimum = Infinity
  let maximum = -Infinity
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    if (item < minimum) minimum = item
    if (item > maximum) maximum = item
  }
  return [minimum, maximum]
}

/** Scale a value linearly within a domain and range */
export function scaleLinear(value: number, domain: number[], range: number[]) {
  const domainDifference = domain[1] - domain[0]
  const rangeDifference = range[1] - range[0]

  const percentDomain = (value - domain[0]) / domainDifference
  return percentDomain * rangeDifference + range[0]
}

export function computeFeature_dot(p1: Point3D, p2: Point3D, p3: Point3D): number {
  const ba = [p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]]
  const bc = [p3[0] - p2[0], p3[1] - p2[1], p3[2] - p2[2]]

  return dot(ba, bc)
}

export function getTriDotFeatures(
  face_points: Points3D,
  tris: number[],
  data_means: number[],
  data_std: number[],
  offset
) {
  const features: number[] = []
  for (let i = 0; i < tris.length / 3; i++) {
    const points = [tris[i * 3], tris[i * 3 + 1], tris[i * 3 + 2]]
    const point0 = face_points[points[0]]
    const point1 = face_points[points[1]]
    const point2 = face_points[points[2]]
    const dot = computeFeature_dot(point0, point1, point2)
    const dot2 = computeFeature_dot(point0, point2, point1)

    const standard_scale_dist0 = (dot - data_means[offset + i * 2]) / data_std[offset + i * 2]
    const standard_scale_dist1 = (dot2 - data_means[offset + i * 2 + 1]) / data_std[offset + i * 2 + 1]

    features.push(standard_scale_dist0 as number)
    features.push(standard_scale_dist1 as number)
  }

  return features
}

export function normalizePoints(points: Points3D): Points3D {
  let xExtent = [0, 0]
  let yExtent = [0, 0]
  let zExtent = [0, 0]

  if (points.length > 0) {
    const dimensions = points[0].length

    const SCATTER_PLOT_CUBE_LENGTH = 2.0
    // Determine max and min of each axis of our data.

    xExtent = extent(points.map(p => (p ? p[0] : 0)))
    yExtent = extent(points.map(p => (p ? p[1] : 0)))
    if (dimensions === 3) {
      zExtent = extent(points.map(p => (p ? p[2] : 0)))
    }

    const getRange = (extent: number[]) => Math.abs(extent[1] - extent[0])
    const xRange = getRange(xExtent)
    const yRange = getRange(yExtent)
    const zRange = getRange(zExtent)
    const maxRange = Math.max(xRange, yRange, zRange)
    const halfCube = SCATTER_PLOT_CUBE_LENGTH / 2
    const makeScaleRange = (range: number, base: number) => [-base * (range / maxRange), base * (range / maxRange)]

    const xScale = makeScaleRange(xRange, halfCube)
    const yScale = makeScaleRange(yRange, halfCube)
    const zScale = makeScaleRange(zRange, halfCube)

    const newPoints = new Array(points.length)

    for (let i = 0; i < points.length; i++) {
      const vector = points[i]
      const px = scaleLinear(vector[0], xExtent, xScale)
      const py = scaleLinear(vector[1], yExtent, yScale)
      let pz = 0
      if (dimensions === 3) {
        pz = scaleLinear(vector[2], zExtent, zScale) || 0
      }
      newPoints[i] = [px, py, pz]
    }

    return newPoints
  }
  return []
}

export function findRotation(
  normalizedPoints: Points3D,
  leftAnchorIndex: number,
  rightAnchorIndex: number,
  bottomAnchorIndex: number
): Rotation {
  const a = normalizedPoints[leftAnchorIndex] //left eyes - 33 idx
  const b = normalizedPoints[rightAnchorIndex] // right eye - 263 idx

  const c = [(a[0] + b[0]) / 2, a[1], a[2]]
  const d = normalizedPoints[bottomAnchorIndex] // chin - 152 idx
  // using pitagoras and identity functions
  let rx = subtract(a, b) as any
  rx = divide(rx, norm(rx)) as any
  // using pitagoras and identity functions
  let ry = subtract(c, d) as any
  ry = divide(ry, norm(ry))

  // project z vector as computing the cross product
  const rz = cross(rx, ry)
  // create rotation matrix
  const rotationMatrix = matrix([rx, ry, rz])

  return rotationMatrixToEulerAngles(rotationMatrix.toArray())
}

export function findTransform(normalizedPoints: NormalizedLandmarkList, centerPoint: number): Transform {
  const center = normalizedPoints[centerPoint]
  const z = center.z
  return {
    x: center.x - 0.5,
    y: -center.y + 0.5, // Y is reverse direction in 3js
    z: -1 + -z * 20
  }
}

export function rotationMatrixToEulerAngles(rotationMatrix: any): Rotation {
  const sy = Math.sqrt(Math.pow(rotationMatrix[0][0], 2) + Math.pow(rotationMatrix[1][0], 2))
  const isSingular = sy < 1e-6
  let pitch = 0
  let yaw = 0
  let roll = 0
  if (!isSingular) {
    pitch = Math.atan2(rotationMatrix[2][1], rotationMatrix[2][2])
    yaw = Math.atan2(-rotationMatrix[2][0], sy)
    roll = Math.atan2(rotationMatrix[1][0], -rotationMatrix[0][0])
  } else {
    pitch = Math.atan2(-rotationMatrix[1][2], rotationMatrix[1][1])
    yaw = Math.atan2(-rotationMatrix[2][0], sy)
    roll = 0
  }
  return { pitch, yaw, roll }
}

export function float2int(value: number): number {
  return value | 0
}
