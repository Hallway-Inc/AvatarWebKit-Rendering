import { Level1 } from './Level1/level1'
import { Level2 } from './Level2/level2'

import { World } from './World'

export class Journey extends World {
  level1: Level1
  level2: Level2
  constructor() {
    super()

    this.level1 = new Level1()
    this.level2 = new Level2()

    // Wait for resources
    this.resources.on('ready', () => {
      console.log('ready')
    })
  }

  update() {
    // if (this.fox) this.fox.update()
  }
}
