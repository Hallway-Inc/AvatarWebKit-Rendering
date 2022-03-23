import * as Rx from 'rxjs'
import axios from 'axios'
import AsyncLock from 'async-lock'
import { Results } from '@mediapipe/face_mesh'

import AvatarDenseCombinePredictor from './service/AvatarDenseCombinePredictor'
import MediaPipeFaceMeshCalculator from './service/MediaPipeFaceMeshCalculator'
import {
  AUPredictorConfig,
  AUPredictorStartOptions,
  AUPredictorState,
  AUPredictorUpdatableOptions,
  AvatarPrediction
} from './types'

const DEFAULT_FPS = 40
const VIDEO_WIDTH = 640
const VIDEO_HEIGHT = 360

// Lock is used to keep init/start/stop from overlapping
// Note: KEEP STATIC -- we are locking inits between instances
// If two instances of AUPredictor are initialized at once, it creates errors.
// Thanks google :p
const lockKey = 'predictor-lock'
const lock = new AsyncLock()

export class AUPredictor {
  private apiToken?: string
  private avatarDensePredictor: AvatarDenseCombinePredictor
  private faceMeshCalculator: MediaPipeFaceMeshCalculator
  private frameRateMs: number
  private requestFrameToken?: number
  private _stream?: MediaStream
  private _state: AUPredictorState = 'stopped'

  private _video: HTMLVideoElement = document.createElement('video')
  private _dataStream?: Rx.Subject<AvatarPrediction> = new Rx.Subject()
  private _onPredict?: (results: AvatarPrediction) => void
  // Uses requestVideoFrameCallback if available but defaults to requestAnimationFrame
  private videoCallback = window.requestAnimationFrame.bind(window)

  get dataStream(): Rx.Subject<AvatarPrediction> {
    return this._dataStream
  }

  get video() {
    return this._video
  }

  get onPredict() {
    return this._onPredict
  }

  get stream() {
    return this._stream
  }

  get state() {
    return this._state
  }

  set onPredict(callback: ((results: AvatarPrediction) => void) | undefined) {
    this._onPredict = callback
  }

  constructor(config: AUPredictorConfig) {
    const { apiToken, fps = DEFAULT_FPS, onPredict, shouldMirrorOutput = false } = config

    this._video.muted = true
    this.apiToken = apiToken
    this.faceMeshCalculator = new MediaPipeFaceMeshCalculator(
      this.updateScene,
      VIDEO_WIDTH,
      VIDEO_HEIGHT,
      shouldMirrorOutput
    )
    this.avatarDensePredictor = new AvatarDenseCombinePredictor()
    this._onPredict = onPredict

    const newFPS = fps > 0 ? fps : DEFAULT_FPS
    this.frameRateMs = 1000 / newFPS
  }

  private _initializePromise?: Promise<void>

  async initialize() {
    // Static lock allows us to ensure that at any time, only one scope of initialize() is
    // running. Additionally, the promise "stores" the result - the calculators do not need
    // to be initialized more than once.
    return lock.acquire(lockKey, () => this._initialize())
  }

  private _initialize() {
    if (!this._initializePromise) {
      console.log('Initializing AUPredictor...')

      this._initializePromise = this.#authenticate()
        .then(() => this.faceMeshCalculator.init())
        .then(() => this.avatarDensePredictor.init())
        .then(() => console.log('AUPredictor initialized.'))
    }
    return this._initializePromise
  }

  #authenticate = async () => {
    const webApiUrl = 'https://joinhallway.com/auth'
    await axios.get(webApiUrl, { headers: { authorization: `Bearer ${this.apiToken}` } })
    return true
  }

  private updateCallback() {
    // @ts-expect-error
    if (this._videoElement?.requestVideoFrameCallback) {
      console.log('requestVideoFrameCallback available.')
      // @ts-expect-error
      this.videoCallback = this._videoElement.requestVideoFrameCallback.bind(this._videoElement)
    } else {
      console.log('using requestAnimationFrame')
      this.videoCallback = window.requestAnimationFrame.bind(window)
    }
  }

  private cancelCallback() {
    // @ts-expect-error
    if (this._videoElement?.cancelVideoFrameCallback) {
      // @ts-expect-error
      this._videoElement?.cancelVideoFrameCallback(this.requestFrameToken)
    }
    cancelAnimationFrame(this.requestFrameToken)
  }

  setOptions({ shouldMirrorOutput = false }: AUPredictorUpdatableOptions) {
    this.faceMeshCalculator.setOptions({ selfieMode: shouldMirrorOutput })
  }

  async start(opts: AUPredictorStartOptions) {
    return lock.acquire(lockKey, () => this._start(opts))
  }

  private async _start({ stream }: AUPredictorStartOptions) {
    try {
      if (this._state !== 'stopped' || this.stream || this.requestFrameToken) {
        this._stop()
      }

      await this._initialize()

      this._state = 'starting'
      this._stream = stream

      this._video.width = VIDEO_WIDTH
      this._video.height = VIDEO_HEIGHT
      this._video.srcObject = stream
      await this._video.play()

      this.updateCallback()
      this.requestFrameToken = this.videoCallback(this.step)
      this._state = 'started'
    } catch (e) {
      // Reset state is something fails
      this._stop()
      throw e
    }
  }

  async stop() {
    return lock.acquire(lockKey, () => this._stop())
  }

  private async _stop() {
    this.cancelCallback()
    this.requestFrameToken = undefined
    this.video.srcObject = null
    this._stream = null
    this._state = 'stopped'
  }

  private step = async (): Promise<void> => {
    await this.faceMeshCalculator.send(this._video)
  }

  private lastFrameTime = performance.now()
  private updateScene = async (results: Results): Promise<void> => {
    if (this.requestFrameToken) this.cancelCallback()
    if (!this.stream) this.requestFrameToken = undefined
    if (!this._dataStream) this.requestFrameToken = undefined
    if (this._video.paused) this.requestFrameToken = undefined
    if (!this.requestFrameToken) return
    if (performance.now() - this.lastFrameTime <= this.frameRateMs) {
      this.requestFrameToken = this.videoCallback(() => this.updateScene(results))
      return
    }

    this.lastFrameTime = performance.now()
    const avatarPrediction = await this.avatarDensePredictor.predictFace(results)

    // Only push stream if we are getting results
    if (avatarPrediction) {
      if (this._onPredict) {
        this.onPredict(avatarPrediction)
      }
      this._dataStream.next(avatarPrediction)
    }

    this.requestFrameToken = this.videoCallback(async () => {
      await this.faceMeshCalculator.send(this._video)
    })
  }
}
