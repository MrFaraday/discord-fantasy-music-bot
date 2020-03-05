import { fadeOut } from '../src/libs/effects'
import { StreamDispatcher } from 'discord.js'

describe('Effects test:', () => {

  test('fadeOut', async () => {
    const dispatcher = {
      volume: 0.15,
      setVolume: function(newVolume) {
        this.volume = newVolume
      },
      end: jest.fn()
    }

    const newDispatcher = new StreamDispatcher({})
    newDispatcher.setVolume(0.15)

    //await fadeOut(dispatcher)

  })

})