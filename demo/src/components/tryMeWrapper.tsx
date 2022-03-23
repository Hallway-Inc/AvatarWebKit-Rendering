import React from 'react'

import { avatarsAvailable } from '../utils/browser'

// eslint-disable-next-line
import EmojiWidget from './emojiWidget'
import MobileVideo from './mobileVideo'
import TakeBackYourCamera from './takeBackYourCamera'
import styles from './tryMeWrapper.module.scss'

type Props = Record<string, never>
type State = {
  isDesktop: boolean
  requested: boolean
  enableDemo: boolean
}

class TryMeWrapper extends React.Component<Props, State> {
  state: State = {
    isDesktop: false,
    requested: false,
    enableDemo: false
  }

  onTryMe() {
    this.setState({
      requested: true
    })
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize.bind(this))
    this.resize()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize.bind(this))
  }

  resize() {
    const isDesktop = window.innerWidth > 768
    if (isDesktop !== this.state.isDesktop) {
      this.setState({
        isDesktop,
        enableDemo: isDesktop && avatarsAvailable()
      })
    }
  }

  render() {
    const { requested, enableDemo, isDesktop } = this.state
    return (
      <div className={styles.tryMeRow}>
        <MobileVideo isMobile={!isDesktop} />
        {!requested && <TakeBackYourCamera enableDemo={enableDemo} tryMeAction={this.onTryMe.bind(this)} />}
        <EmojiWidget enableDemo={enableDemo} requested={requested} />
      </div>
    )
  }
}

export default TryMeWrapper
