import React, { useEffect, useRef, useState } from 'react'
import { Experience } from '@quarkworks-inc/avatar-webkit-rendering'

const ExperienceLayout = () => {
  const sceneCanvasRef = useRef<HTMLCanvasElement>()
  const [experience, setExperience] = useState(null)

  useEffect(() => {
    setExperience(new Experience(sceneCanvasRef.current, 'level1'))
  }, [sceneCanvasRef])

  return <canvas ref={sceneCanvasRef} width={800} height={600} style={{ position: 'absolute' }} />
}

export default ExperienceLayout
