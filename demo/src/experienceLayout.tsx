import React, { useEffect, useRef, useState } from 'react'
import { Experience, ExperienceConfig } from '@quarkworks-inc/avatar-webkit-rendering'

const ExperienceLayout = () => {
  const sceneCanvasRef = useRef<HTMLCanvasElement>()
  const [experience, setExperience] = useState(null)
  const experienceParams = new URLSearchParams(window.location.search)
  const roomName = experienceParams.get('room')
  let config: ExperienceConfig = {
    maxPixelRatio: 2
  }

  let name = 'streamRoom'
  if (roomName) {
    name = roomName
  }

  if (experienceParams.get('config') === 'mac') {
    config = {
      maxPixelRatio: 1
    }
  }

  useEffect(() => {
    const experience = new Experience({
      _canvas: sceneCanvasRef.current,
      name,
      modelType: 'rpm',
      modelUrl: 'https://d1a370nemizbjq.cloudfront.net/9f35ad26-5b47-4530-b245-be743317e094.glb',
      config
      // modelType: 'chib',
      // modelUrl: '/models/chibs/1.glb'
    })

    setExperience(experience)
    // @ts-expect-error needed for macosapp
    window.experience = experience
    // Cleanup
    return () => experience.destroy()
  }, [sceneCanvasRef])

  return <canvas ref={sceneCanvasRef} width={800} height={600} style={{ position: 'absolute' }} />
}

export default ExperienceLayout
