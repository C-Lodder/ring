import { BaseDeviceAccessory } from './base-device-accessory'
import { RingDevice } from '../api'
import { hap } from './hap'
import { RingPlatformConfig } from './config'
import { PlatformAccessory } from 'homebridge'
import { logInfo } from '../api/util'

export class MultiLevelSwitch extends BaseDeviceAccessory {
  constructor(
    public readonly device: RingDevice,
    public readonly accessory: PlatformAccessory,
    public readonly config: RingPlatformConfig
  ) {
    super()

    const { Characteristic, Service } = hap,
      { data: initialData } = this.device

    this.registerCharacteristic({
      characteristicType: Characteristic.On,
      serviceType: Service.Lightbulb,
      getValue: (data) => Boolean(data.on),
      setValue: (value) => this.setOnState(value),
    })

    if (initialData.level !== undefined) {
      this.registerLevelCharacteristic({
        characteristicType: Characteristic.Brightness,
        serviceType: Service.Lightbulb,
        getValue: (data) => {
          return data.level && !isNaN(data.level) ? 100 * data.level : 0
        },
        setValue: (value) => this.setLevelState(value),
      })
    }

    // SOMEDAY: Hue/Sat/Color Temp
  }

  setOnState(on: boolean) {
    logInfo(`Turning ${this.device.name} ${on ? 'On' : 'Off'}`)

    return this.device.setInfo({ device: { v1: { on } } })
  }

  setLevelState(level: number) {
    logInfo(`Setting brightness of ${this.device.name} to ${level}%`)

    return this.device.setInfo({
      device: { v1: { level: level / 100 } },
    })
  }
}
