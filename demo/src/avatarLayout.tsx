import React from 'react'

// eslint-disable-next-line
import { AUPredictor, AvatarPrediction } from '@quarkworks-inc/avatar-webkit'
import { RenderLoop, EnvironmentLoader, AvatarWorld, modelFactory } from '@quarkworks-inc/avatar-webkit-rendering'

import { Loader } from './components/loader'
import { Switch } from './components/switch'
import { MenuSelect } from './components/menuSelect'

import styles from './avatarLayout.module.scss'

const CAMERA_WIDTH = 640
const CAMERA_HEIGHT = 360

const SCENE_ASPECT_RATIO = 16.0 / 9.0

type ComponentState = 'loading' | 'running' | 'paused'

type Props = any
type State = {
  flipped: boolean
  avatarState: ComponentState
  videoInDevices: MediaDeviceInfo[]
  selectedVideoInDeviceId?: string
  sceneWidth: number
  sceneHeight: number
}

class AvatarLayout extends React.Component<Props, State> {
  private renderLoop: RenderLoop
  private environmentLoader: EnvironmentLoader
  private world?: AvatarWorld

  private predictor!: AUPredictor

  private node: HTMLDivElement
  private videoRef = React.createRef<HTMLVideoElement>()
  private avatarCanvas = React.createRef<HTMLCanvasElement>()

  state: State = {
    flipped: true,
    avatarState: 'loading',
    videoInDevices: [],
    sceneWidth: 0,
    sceneHeight: 0
  }

  async componentDidMount() {
    this.predictor = new AUPredictor({
      apiToken: process.env.REACT_APP_AVATAR_WEBKIT_AUTH_TOKEN,
      shouldMirrorOutput: true
    })

    const videoInDevices = await this.fetchVideoDevices()
    const selectedVideoInDeviceId = videoInDevices[0]?.deviceId ?? undefined

    this.setState({ videoInDevices, selectedVideoInDeviceId })

    this._windowDidResize = this._windowDidResize.bind(this)
    window.addEventListener('resize', this._windowDidResize)

    this._calculateSceneSize()

    this.start()
  }

  componentWillUnmount(): void {
    window.removeEventListener('resize', this._windowDidResize)
    this.stop()
  }

  private _windowDidResize() {
    this._calculateSceneSize()
  }

  private _calculateSceneSize() {
    // Calculate potential width/height for scene based on both screen width & height
    // At least 10% padding on every side
    const widthBasedW = window.innerWidth * 0.8
    const widthBasedH = widthBasedW / SCENE_ASPECT_RATIO

    const heightBasedH = window.innerHeight * 0.8
    const heightBasedW = heightBasedH * SCENE_ASPECT_RATIO

    // Treating widthBasedW & heightBasedH as max width/height,
    // choose one or the other
    if (widthBasedH > heightBasedH) {
      // Base on max height
      this.setState({ sceneWidth: heightBasedW, sceneHeight: heightBasedH })
    } else {
      // Base on max width
      this.setState({ sceneWidth: widthBasedW, sceneHeight: widthBasedH })
    }
  }

  async start() {
    this.setState({
      avatarState: 'loading'
    })

    const videoElement = this.videoRef.current
    videoElement.width = CAMERA_WIDTH
    videoElement.height = CAMERA_HEIGHT
    videoElement.srcObject = this.predictor.stream
    videoElement.play()

    this.predictor.dataStream.subscribe(this.updateScene.bind(this))

    await this._initWorlds()
    await this._startAvatar()
  }

  async stop() {
    this.renderLoop.stop()
    this.renderLoop.canvas.remove()
    this.predictor.stop()
    this.world = undefined
  }

  async _initWorlds() {
    if (this.world) return

    const avatarCanvas = this.avatarCanvas.current
    if (!avatarCanvas) return

    this.renderLoop = new RenderLoop({ canvas: avatarCanvas })
    this.environmentLoader = new EnvironmentLoader(this.renderLoop.webGLRenderer)

    this.world = new AvatarWorld({
      container: avatarCanvas,
      environmentLoader: this.environmentLoader
    })

    const model = await modelFactory('emoji')
    await this.world.loadScene(model)

    this.renderLoop.updatables.push(this.world)
    this.renderLoop.renderables.push(this.world)

    this.renderLoop.start()
  }

  private async _startAvatar() {
    const { selectedVideoInDeviceId: deviceId } = this.state

    const constraints = {
      width: 640,
      height: 360,
      deviceId: deviceId ? { exact: deviceId } : undefined
    }

    const stream = await navigator.mediaDevices.getUserMedia({ video: constraints })

    await this.predictor.start({ stream })

    const videoElement = this.videoRef.current
    videoElement.srcObject = this.predictor.stream
    videoElement.play()

    // Update device list
    // We may have just asked for video permission for the first time
    const videoInDevices = await this.fetchVideoDevices()
    const selectedVideoInDeviceId = stream.getVideoTracks()[0].getSettings().deviceId

    this.setState({ videoInDevices, selectedVideoInDeviceId })
  }

  private async _stopAvatar() {
    this.predictor.stop()
  }

  _videoInChange(deviceId: string) {
    this.setState(
      {
        selectedVideoInDeviceId: deviceId
      },
      () => {
        this._startAvatar()
      }
    )
  }

  async fetchVideoDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices()

    const videoDevices = []
    devices.forEach(function (device) {
      if (device.kind === 'videoinput') {
        videoDevices.push(device)
      }
    })

    return videoDevices
  }

  updateScene(results: AvatarPrediction) {
    const { avatarState } = this.state

    // End loading state
    if (avatarState !== 'running' && avatarState !== 'paused') {
      this.setState({
        avatarState: 'running'
      })
    }

    this.world?.updateFromResults(results)
  }

  handleToggle = () => {
    const newState = this.state.avatarState === 'running' ? 'paused' : 'running'

    newState === 'running' ? this._startAvatar() : this._stopAvatar()
    this.setState({
      avatarState: newState
    })
  }

  render() {
    const { avatarState, videoInDevices, sceneWidth, sceneHeight } = this.state

    return (
      <div
        className={styles.app}
        ref={n => {
          if (!this.node) {
            this.node = n
          }
        }}
      >
        <div className={styles.container}>
          <div className={styles.sceneContainer} style={{ width: sceneWidth, height: sceneHeight }}>
            <canvas ref={this.avatarCanvas} width={sceneWidth} height={sceneHeight} />
            <video
              ref={this.videoRef}
              className={styles.video}
              style={{ transform: this.state.flipped ? 'scaleX(-1)' : '' }}
            />
            <div className={styles.buttonContainer}>
              <div className={styles.switchContainer}>
                <Switch
                  isOn={avatarState === 'running'}
                  onColor={'#4A57B9'}
                  handleToggle={() => {
                    this.handleToggle()
                  }}
                />
              </div>
              <div className={styles.deviceSelectContainer}>
                <MenuSelect
                  errorMessage="Unable to access video devices"
                  label=""
                  options={videoInDevices.map(device => ({ value: device.deviceId, label: device.label }))}
                  permission={true}
                  value={undefined}
                  onChange={this._videoInChange.bind(this)}
                />
              </div>
            </div>
          </div>
          {avatarState === 'loading' && (
            <div className={styles.loadingContainer}>
              <Loader width={80} height={80} subtext={'Loading...'} position={'relative'} />
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default AvatarLayout
