import React from 'react'

import styles from './mobileVideo.module.scss'

type Props = {
  isMobile: boolean
}

class MobileVideo extends React.Component<Props> {
  render() {
    return (
      <>
        {this.props.isMobile && (
          <div className={styles.mobileVideoWrapper}>
            <video className={styles.mobileVideo} playsInline autoPlay muted loop>
              <source src="videos/tryMe.mp4" type="video/mp4" />
            </video>
          </div>
        )}
      </>
    )
  }
}

export default MobileVideo
