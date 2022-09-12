import { Level1 } from './Level1/level1'
import { Level2 } from './Level2/level2'
import { Level3 } from './Level3/level3'
import { Level4 } from './Level4/level4'

import { World } from './World'

export class Journey extends World {
  level1: Level1
  level2: Level2
  level3: Level3
  level4: Level4

  constructor() {
    super()

    this.level1 = new Level1()
    this.level2 = new Level2()
    this.level3 = new Level3()
    this.level4 = new Level4()

    // Wait for resources
    this.resources.on('ready', () => {
      console.log('ready')
    })
  }

  update() {
    // if (this.fox) this.fox.update()
  }
}
