import React from 'react'

import './tryMeSlider.scss'

type Props = {
  isOn: boolean
  handleToggle: () => void
  onColor: string
}

export class TryMeSwitch extends React.Component<Props> {
  render() {
    return (
      <>
        <input
          checked={this.props.isOn}
          onChange={this.props.handleToggle}
          className="react-switch-checkbox"
          id={`react-switch-new`}
          type="checkbox"
        />
        <label
          style={{ background: this.props.isOn && this.props.onColor }}
          className="react-switch-label"
          htmlFor={`react-switch-new`}
        >
          <span className={`react-switch-button`} />
        </label>
      </>
    )
  }
}
