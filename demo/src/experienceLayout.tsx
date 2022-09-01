import React, { useEffect, useRef, useState } from 'react'
import { Experience } from '@quarkworks-inc/avatar-webkit-rendering'

const ExperienceLayout = () => {
  const sceneCanvasRef = useRef<HTMLCanvasElement>()
  const [experience, setExperience] = useState(null)

  useEffect(() => {
    const doubleClickListener = () => {
      const fullscreenElement = document.fullscreenElement
      const canvas = sceneCanvasRef.current
      if (!canvas) return

      if (!fullscreenElement) {
        if (canvas.requestFullscreen) {
          canvas.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
    }

    sceneCanvasRef.current.addEventListener('dblclick', doubleClickListener)
    setExperience(new Experience(sceneCanvasRef.current))
    return () => sceneCanvasRef.current.removeEventListener('dblclick', doubleClickListener)
  }, [sceneCanvasRef])

  return <canvas ref={sceneCanvasRef} width={800} height={600} style={{ position: 'absolute' }} />
}

export default ExperienceLayout
