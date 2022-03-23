import React from 'react'
import classNames from 'classnames'

import styles from './takeBackYourCamera.module.scss'

type Props = {
  enableDemo: boolean
  tryMeAction: () => void
}

type State = {
  requested: boolean
}

export default class TakeBackYourCamera extends React.Component<Props, State> {
  state: State = {
    requested: false
  }

  tryMeButton() {
    return (
      <button className={classNames(styles.ctaButton, 'ga-try_me')} onClick={this.onTryMeClick.bind(this)}>
        <div>Try Me</div>
      </button>
    )
  }

  onTryMeClick() {
    this.props.tryMeAction()
    this.setState({
      requested: true
    })
  }

  downloadButton(isPrimary: boolean) {
    return (
      <button
        className={classNames(isPrimary ? styles.ctaButton : styles.cta2Button, 'ga-download')}
        onClick={() => {
          window.open('download', '_self')
        }}
      >
        <div>Download</div>
      </button>
    )
  }

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.textWrapper}>
          <h1 className={styles.h1}>Take Back Your Camera</h1>
          <p className={styles.p}>Explore the freedom of expressing your digital self.</p>

          <div
            className={classNames({
              [styles.buttonContainer]: true,
              [styles.hidden]: this.state.requested
            })}
          >
            {this.props.enableDemo ? (
              <>
                {this.tryMeButton()}
                {this.downloadButton(false)}
              </>
            ) : (
              this.downloadButton(true)
            )}
          </div>
        </div>
      </div>
    )
  }
}
