import { FaceMesh, Results } from '@mediapipe/face_mesh'

// import faceMeshPkg from '@mediapipe/face_mesh/package.json'

export default class MediaPipeFaceMeshCalculator {
  /**
   * Uses MediaPipe FaceMesh library to calculate the face mesh from input image (through a video html element)
   *
   * @param resultCallback - Takes 1 argument: The face mesh, Float32Array containing the 1D representation of the face
   *  mesh coordinates. Used to trigger further action after Three.js-friendly 1D representation, such as add to scene,
   *  and render.
   * @param width - The height of the output render canvas. Used rescale the face mesh to fit the render canvas.
   * @param height - The width of the output render canvas. Similar to width.
   *
   * @private
   */
  private readonly model: FaceMesh
  private readonly resultsCallback: (results: Results) => void
  private readonly width: number
  private readonly height: number

  constructor(resultsCallback: (results: Results) => void, width: number, height: number, selfieMode: boolean = false) {
    this.resultsCallback = resultsCallback
    this.width = width
    this.height = height

    this.model = new FaceMesh({
      locateFile: file => {
        return `https://hallway.nyc3.cdn.digitaloceanspaces.com/face_mesh/0.4.1633559619/${file}`
        // return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      }
    })

    this.setOptions({ selfieMode })

    this.model.onResults(this.resultsCallback)
  }

  async init() {
    return this.model.initialize()
  }

  setOptions({ selfieMode }: { selfieMode: boolean }) {
    this.model.setOptions({
      maxNumFaces: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      refineLandmarks: true,
      selfieMode
    })
  }

  /**
   * Send input into the mediapipe face mesh. Results will be process by imageResultHandler
   * @param videoElement
   */
  send = async (videoElement: HTMLVideoElement): Promise<void> => {
    return this.model.send({ image: videoElement })
  }

  close = () => {
    this.model.close()
  }
}
