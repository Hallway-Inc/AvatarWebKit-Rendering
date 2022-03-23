import axios from 'axios'
import * as tf from '@tensorflow/tfjs-core'

export class JSONHandler implements tf.io.IOHandler {
  private modelJSON: any
  private dir: string

  constructor(json: any, dir: string) {
    this.modelJSON = json
    this.dir = dir
  }

  async load(): Promise<tf.io.ModelArtifacts> {
    const modelJSON = this.modelJSON

    // Mapping modelJSON to modelArtifacts.
    const modelArtifacts: tf.io.ModelArtifacts = {
      modelTopology: modelJSON.modelTopology,
      format: modelJSON.format,
      generatedBy: modelJSON.generatedBy,
      convertedBy: modelJSON.convertedBy
    }

    if (modelJSON.signature != null) {
      modelArtifacts.signature = modelJSON.signature
    }

    if (modelJSON.userDefinedMetadata != null) {
      modelArtifacts.userDefinedMetadata = modelJSON.userDefinedMetadata
    }

    if (modelJSON.modelInitializer != null) {
      modelArtifacts.modelInitializer = modelJSON.modelInitializer
    }

    if (modelJSON.weightsManifest != null) {
      const [weightSpecs, weightData] = await loadWeights(modelJSON.weightsManifest, this.dir)
      modelArtifacts.weightSpecs = weightSpecs
      modelArtifacts.weightData = weightData
    }
    if (modelJSON.trainingConfig != null) {
      modelArtifacts.trainingConfig = modelJSON.trainingConfig
    }

    return modelArtifacts
  }
}

async function loadWeights(
  weightsManifest: tf.io.WeightsManifestConfig,
  dirName: string
): Promise<[tf.io.WeightsManifestEntry[], ArrayBuffer]> {
  const buffers: ArrayBuffer[] = []
  const weightSpecs: tf.io.WeightsManifestEntry[] = []
  for (const group of weightsManifest) {
    for (const path of group.paths) {
      const weightFilePath = dirName + path
      const buffer = await (await axios.get(weightFilePath, { responseType: 'arraybuffer', withCredentials: false }))
        .data

      buffers.push(buffer)
    }
    weightSpecs.push(...group.weights)
  }
  return [weightSpecs, concatenateArrayBuffers(buffers)]
}

export function concatenateArrayBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
  if (buffers.length === 1) {
    return buffers[0]
  }

  let totalByteLength = 0
  buffers.forEach((buffer: ArrayBuffer) => {
    totalByteLength += buffer.byteLength
  })

  const temp = new Uint8Array(totalByteLength)
  let offset = 0
  buffers.forEach((buffer: ArrayBuffer) => {
    temp.set(new Uint8Array(buffer), offset)
    offset += buffer.byteLength
  })
  return temp.buffer
}
