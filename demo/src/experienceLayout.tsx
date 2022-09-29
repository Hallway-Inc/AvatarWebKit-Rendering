import React, { useEffect, useRef, useState } from 'react'
import { Experience } from '@quarkworks-inc/avatar-webkit-rendering'

const ExperienceLayout = () => {
  const sceneCanvasRef = useRef<HTMLCanvasElement>()
  const [experience, setExperience] = useState(null)

  useEffect(() => {
    const experience = new Experience({
      _canvas: sceneCanvasRef.current,
      name: 'level1',
      modelType: 'rpm',
      modelUrl: 'https://d1a370nemizbjq.cloudfront.net/9f35ad26-5b47-4530-b245-be743317e094.glb',
      config: {
        maxPixelRatio: 2
      }
      // modelType: 'chib',
      // modelUrl: '/models/chibs/1.glb'
    })

    setExperience(experience)

    // Cleanup
    return () => experience.destroy()
  }, [sceneCanvasRef])

  return <canvas ref={sceneCanvasRef} width={800} height={600} style={{ position: 'absolute' }} />
}

export default ExperienceLayout
