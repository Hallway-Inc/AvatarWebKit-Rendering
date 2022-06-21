// https://github.com/three-types/three-ts-types/blob/6829af2cc5b91731f28a0d3e85a52b46581f4781/types/three/examples/jsm/utils/SkeletonUtils.d.ts

import { AnimationClip, Bone, Matrix4, Object3D, Skeleton, SkeletonHelper } from 'three'

export function retarget(target: Object3D | Skeleton, source: Object3D | Skeleton, options: {}): void

export function retargetClip(
  target: Skeleton | Object3D,
  source: Skeleton | Object3D,
  clip: AnimationClip,
  options: {}
): AnimationClip

export function getHelperFromSkeleton(skeleton: Skeleton): SkeletonHelper

export function getSkeletonOffsets(target: Object3D | Skeleton, source: Object3D | Skeleton, options: {}): Matrix4[]

export function renameBones(skeleton: Skeleton, names: {}): any

export function getBones(skeleton: Skeleton | Bone[]): Bone[]

export function getBoneByName(name: string, skeleton: Skeleton): Bone

export function getNearestBone(bone: Bone, names: {}): Bone

export function findBoneTrackData(name: string, tracks: any[]): {}

export function getEqualsBonesNames(skeleton: Skeleton, targetSkeleton: Skeleton): string[]

export function clone(source: Object3D): Object3D
