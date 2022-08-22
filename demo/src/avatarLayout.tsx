import React from 'react'

import { AUPredictor, AvatarPrediction } from '@quarkworks-inc/avatar-webkit'
import {
  AvatarRenderer,
  AvatarWorld,
  hallwayPublicCDNUrl,
  Model,
  modelFactory
} from '@quarkworks-inc/avatar-webkit-rendering'

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
  private avatarRenderer: AvatarRenderer
  private world?: AvatarWorld
  private predictor!: AUPredictor
  private model?: Model

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
    window.addEventListener('mousemove', this._mouseDidMove)
    window.addEventListener('dblclick', this._doubleClickListener)

    this._calculateSceneSize()

    this.start()
  }

  componentWillUnmount(): void {
    window.removeEventListener('resize', this._windowDidResize)
    window.removeEventListener('mousemove', this._mouseDidMove)
    window.removeEventListener('dblclick', this._doubleClickListener)
    this.stop()
  }

  private _windowDidResize() {
    this._calculateSceneSize()
  }

  private _mouseDidMove = (event: MouseEvent) => {
    if (this.state.avatarState != 'running')
      this.world?.lookAt(
        event.clientX / document.body.clientWidth - 0.5,
        -event.clientY / document.body.clientHeight + 0.5,
        1
      )
  }

  private _doubleClickListener = () => {
    const fullscreenElement = document.fullscreenElement
    const canvas = this.avatarCanvas.current
    if (!canvas) return

    if (!fullscreenElement) {
      if (canvas.requestFullscreen) {
        canvas.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }

      this._windowDidResize()
    }
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

    this.predictor.dataStream.subscribe(this.updateScene.bind(this))

    await this._initRenderer()
    await this._startAvatar()
  }

  async stop() {
    this.avatarRenderer.stop()
    this.predictor.stop()

    this.world = undefined
    this.avatarRenderer = undefined
  }

  async _initRenderer() {
    if (this.avatarRenderer) return

    const avatarCanvas = this.avatarCanvas.current
    if (!avatarCanvas) return

    this.avatarRenderer = new AvatarRenderer({ canvas: avatarCanvas })

    this.world = new AvatarWorld({
      container: avatarCanvas,
      renderer: this.avatarRenderer
    })

    this.model = await modelFactory('emoji')
    // this.model = await modelFactory('readyPlayerMe', hallwayPublicCDNUrl('models/hannah.glb'))
    // this.model = await modelFactory('mozilla', hallwayPublicCDNUrl('models/mozilla.glb'))
    // this.model = await modelFactory(
    //   'void',
    //   'https://hallway-private.nyc3.cdn.digitaloceanspaces.com/avatars/_defaults/voids/void_3157.glb'
    // )
    // this.model = await modelFactory('alienBoy', hallwayPublicCDNUrl('models/alien_boy_225.glb'))
    // this.model = await modelFactory('chib', hallwayPublicCDNUrl('models/1.glb'))
    this.world.setModel(this.model)

    this.avatarRenderer.updatables.push(this.world)
    this.avatarRenderer.renderables.push(this.world)

    this.avatarRenderer.start()
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
    videoElement.width = CAMERA_WIDTH
    videoElement.height = CAMERA_HEIGHT
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
