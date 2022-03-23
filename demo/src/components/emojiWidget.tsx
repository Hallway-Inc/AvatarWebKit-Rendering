import React from 'react'
import classNames from 'classnames'
import { WebGLRenderer } from 'three'

// eslint-disable-next-line import/no-unresolved
import { AUPredictor, AvatarPrediction } from '@quarkworks-inc/avatar-webkit'

import { EmojiWorld } from '../World/world'
import { WebGLLoop } from '../World/systems/loop'
import { createRenderer } from '../World/systems/renderer'

import styles from './emojiWidget.module.scss'
import { Loader } from './shared/loader'
import { TryMeSwitch } from './shared/tryMeSlider'
import { MenuSelect } from './shared/menuSelect'

const CAMERA_WIDTH = 640
const CAMERA_HEIGHT = 360

const AVATAR_WIDTH = 1280
const AVATAR_HEIGHT = 720

type Props = {
  requested: boolean
  enableDemo: boolean
}
type ComponentState = 'disabled' | 'loading' | 'running' | 'paused'
type State = {
  flipped: boolean
  tryMeState: ComponentState
  videoInDevices: MediaDeviceInfo[]
}

class EmojiWidget extends React.Component<Props, State> {
  private emojiGlobalCanvas: HTMLCanvasElement
  private webGLRenderer: WebGLRenderer
  private webGLLoop: WebGLLoop
  private peerId = 'pantzeater77'
  private isMe = true
  private isDev = false
  private zoom = 3.75

  private predictor: AUPredictor

  private node: HTMLDivElement
  private videoRef = React.createRef<HTMLVideoElement>()
  private world!: EmojiWorld
  private emojiDiv!: HTMLDivElement

  state: State = {
    flipped: true,
    tryMeState: 'disabled',
    videoInDevices: []
  }

  constructor(props: Props) {
    super(props)

    this.emojiGlobalCanvas = document.createElement('canvas') as HTMLCanvasElement
    this.emojiGlobalCanvas.setAttribute('id', 'emojiGlobalCanvas')
    this.emojiGlobalCanvas.style.zIndex = '0'
    this.emojiGlobalCanvas.style.position = this.isDev ? 'fixed' : 'absolute'
    this.emojiGlobalCanvas.style.top = '0'
    this.emojiGlobalCanvas.style.left = '0'

    this.webGLRenderer = createRenderer(this.emojiGlobalCanvas)
    this.webGLLoop = new WebGLLoop(this.emojiGlobalCanvas, this.webGLRenderer)
    this.webGLLoop.isGlobalCanvas = this.isDev
    this.webGLRenderer.setClearColor(0xffffff, 0)

    this.predictor = new AUPredictor({
      apiToken: '6d7f3f6e-269c-4e1b-abf8-9a0add479511',
      shouldMirrorOutput: true
    })
  }

  async componentDidMount() {
    const videoDevices = await this.fetchVideoDevices()

    this.setState({
      videoInDevices: videoDevices
    })
  }

  componentDidUpdate(oldProps: Props) {
    const { requested, enableDemo } = this.props
    const { tryMeState } = this.state
    if (oldProps.enableDemo !== enableDemo) {
      if (!enableDemo && tryMeState !== 'disabled') {
        this.setState({
          tryMeState: 'disabled'
        })
      }
    }
    if (oldProps.requested !== requested) {
      this.tryMe()
    }
  }

  async initWorld(threeDiv: HTMLDivElement) {
    if (this.world || threeDiv.clientWidth === 0 || !this.webGLLoop) return

    this.world = new EmojiWorld(
      this.emojiGlobalCanvas,
      this.webGLRenderer,
      threeDiv,
      this.webGLLoop,
      this.peerId,
      this.isMe,
      this.zoom,
      this.isDev
    )

    await this.world.initWithEmoji()
    await this.world.addHeadphones()
    this.world.start()
  }

  async tryMe() {
    this.setState({
      tryMeState: 'loading'
    })

    await this.initWorld(this.emojiDiv)

    this.predictor.dataStream.subscribe(this.updateScene.bind(this))

    this._startAvatar()

    this.setState({
      videoInDevices: await this.fetchVideoDevices()
    })
  }

  private async _startAvatar(deviceId?: string) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Browser API navigator.mediaDevices.getUserMedia not available')
    }

    const constraints = {
      width: CAMERA_WIDTH,
      height: CAMERA_HEIGHT,
      deviceId: deviceId ? { exact: deviceId } : undefined
    }

    const stream = await navigator.mediaDevices.getUserMedia({ video: constraints })
    await this.predictor.start({ stream })

    const videoElement = this.videoRef.current
    videoElement.width = CAMERA_WIDTH
    videoElement.height = CAMERA_HEIGHT
    videoElement.srcObject = this.predictor.stream
    videoElement.play()
  }

  private _stopAvatar() {
    this.predictor.stop()
  }

  _videoInChange(deviceId: string) {
    this._startAvatar(deviceId)
  }

  async fetchVideoDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices()

    const videoDevices = []
    devices.forEach(function (device) {
      if (device.kind == 'videoinput') {
        videoDevices.push(device)
      }
    })

    return videoDevices
  }

  updateScene(results: AvatarPrediction) {
    const { tryMeState } = this.state
    if (tryMeState !== 'disabled' && !this.isDev) {
      // End loading state
      if (tryMeState !== 'running' && tryMeState !== 'paused') {
        this.setState({
          tryMeState: 'running'
        })
      }

      if (this.world) {
        this.world.updateMorphTargets(results.actionUnits)
        this.world.updateHeadRotation(-results.rotation.pitch, -results.rotation.yaw, -results.rotation.roll)
        this.world.updatePosition(results.transform.x, results.transform.y, results.transform.z)
      }
    }
  }

  handleToggle = () => {
    const newState = this.state.tryMeState === 'running' ? 'paused' : 'running'

    newState === 'running' ? this._startAvatar() : this._stopAvatar()
    this.setState({
      tryMeState: newState
    })
  }

  render() {
    const { tryMeState, videoInDevices } = this.state

    return (
      <div
        className={classNames({ [styles.app]: true, [styles.appShowing]: tryMeState !== 'disabled' })}
        ref={n => {
          if (!this.node) {
            this.node = n
          }
        }}
      >
        <div className={styles.tryMeContainer}>
          <div className={classNames({ [styles.videoContainer]: true, [styles.showing]: tryMeState !== 'disabled' })}>
            <div
              className={styles.emoji}
              ref={div => {
                if (div) {
                  div.append(this.emojiGlobalCanvas)
                  this.emojiDiv = div
                }
              }}
              style={{ width: AVATAR_WIDTH, height: AVATAR_HEIGHT }}
            />
            <div className={styles.video} style={{ width: CAMERA_WIDTH / 8, height: CAMERA_HEIGHT / 8, zIndex: 10 }}>
              <video
                ref={this.videoRef}
                className={styles.video}
                style={{ transform: this.state.flipped ? 'scaleX(-1)' : '' }}
              />
            </div>
            {tryMeState !== 'disabled' && (
              <div className={styles.buttonContainer}>
                <div className={styles.switchContainer}>
                  <TryMeSwitch
                    isOn={tryMeState === 'running'}
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
            )}
          </div>
          {tryMeState === 'disabled' && (
            <div className={styles.inActiveContainer}>
              <video playsInline autoPlay muted loop>
                <source src="videos/tryMe.mp4" type="video/mp4" />
              </video>
            </div>
          )}
          {tryMeState === 'loading' && (
            <div className={styles.loadingContainer}>
              <Loader width={80} height={80} subtext={'Loading...'} position={'relative'} />
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default EmojiWidget
