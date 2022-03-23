import * as Rx from 'rxjs'

export type AvatarPrediction = {
  readonly actionUnits: ActionUnits
  readonly rotation: Rotation
  readonly transform: Transform
}

export type ActionUnits = {
  eyeBlinkLeft?: number
  eyeBlinkRight?: number
  eyeLookDownLeft?: number
  eyeLookDownRight?: number
  eyesLookDown?: number
  eyeLookInLeft?: number
  eyeLookInRight?: number
  eyeLookOutLeft?: number
  eyeLookOutRight?: number
  eyeLookUpLeft?: number
  eyeLookUpRight?: number
  eyesLookUp?: number
  eyeSquintLeft?: number
  eyeSquintRight?: number
  eyeWideLeft?: number
  eyeWideRight?: number
  jawForward?: number
  jawLeft?: number
  jawRight?: number
  jawOpen?: number
  mouthClose?: number
  mouthFunnel?: number
  mouthPucker?: number
  mouthLeft?: number
  mouthRight?: number
  mouthSmileLeft?: number
  mouthSmileRight?: number
  mouthFrownLeft?: number
  mouthFrownRight?: number
  mouthDimpleLeft?: number
  mouthDimpleRight?: number
  mouthStretchLeft?: number
  mouthStretchRight?: number
  mouthRollLower?: number
  mouthRollUpper?: number
  mouthShrugLower?: number
  mouthShrugUpper?: number
  mouthPressLeft?: number
  mouthPressRight?: number
  mouthLowerDownLeft?: number
  mouthLowerDownRight?: number
  mouthUpperUpLeft?: number
  mouthUpperUpRight?: number
  browDownLeft?: number
  browDownRight?: number
  browInnerUp?: number
  browOuterUpLeft?: number
  browOuterUpRight?: number
  cheekPuff?: number
  cheekSquintLeft?: number
  cheekSquintRight?: number
  tongueOut?: number
}

export const baseActionUnits: ActionUnits = {
  eyeBlinkLeft: 0,
  eyeBlinkRight: 0,
  eyeLookDownLeft: 0,
  eyeLookDownRight: 0,
  eyesLookDown: 0,
  eyeLookInLeft: 0,
  eyeLookInRight: 0,
  eyeLookOutLeft: 0,
  eyeLookOutRight: 0,
  eyeLookUpLeft: 0,
  eyeLookUpRight: 0,
  eyesLookUp: 0,
  eyeSquintLeft: 0,
  eyeSquintRight: 0,
  eyeWideLeft: 0,
  eyeWideRight: 0,
  jawForward: 0,
  jawLeft: 0,
  jawRight: 0,
  jawOpen: 0,
  mouthClose: 0,
  mouthFunnel: 0,
  mouthPucker: 0,
  mouthLeft: 0,
  mouthRight: 0,
  mouthSmileLeft: 0,
  mouthSmileRight: 0,
  mouthFrownLeft: 0,
  mouthFrownRight: 0,
  mouthDimpleLeft: 0,
  mouthDimpleRight: 0,
  mouthStretchLeft: 0,
  mouthStretchRight: 0,
  mouthRollLower: 0,
  mouthRollUpper: 0,
  mouthShrugLower: 0,
  mouthShrugUpper: 0,
  mouthPressLeft: 0,
  mouthPressRight: 0,
  mouthLowerDownLeft: 0,
  mouthLowerDownRight: 0,
  mouthUpperUpLeft: 0,
  mouthUpperUpRight: 0,
  browDownLeft: 0,
  browDownRight: 0,
  browInnerUp: 0,
  browOuterUpLeft: 0,
  browOuterUpRight: 0,
  cheekPuff: 0,
  cheekSquintLeft: 0,
  cheekSquintRight: 0,
  tongueOut: 0
}

export type Rotation = {
  pitch?: number
  roll?: number
  yaw?: number
}

export type Transform = {
  x?: number
  y?: number
  z?: number
}

export type AUPredictorState = 'stopped' | 'starting' | 'started'

export type AUPredictorUpdatableOptions = {
  shouldMirrorOutput?: boolean
}

export type AUPredictorConfig = {
  apiToken: string
  fps?: number
  onPredict?: (results: AvatarPrediction) => void
} & AUPredictorUpdatableOptions

export type AUPredictorStartOptions = {
  stream: MediaStream
}
