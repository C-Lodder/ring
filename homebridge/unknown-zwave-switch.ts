import { BaseDeviceAccessory } from './base-device-accessory'
import { RingDevice } from '../api'
import { hap } from './hap'
import { RingPlatformConfig } from './config'
import { PlatformAccessory } from 'homebridge'
import { logInfo } from '../api/util'

export class UnknownZWaveSwitchSwitch extends BaseDeviceAccessory {
  constructor(
    public readonly device: RingDevice,
    public readonly accessory: PlatformAccessory,
    public readonly config: RingPlatformConfig
  ) {
    super()

    const { Characteristic, Service } = hap

    this.registerCharacteristic({
      characteristicType: Characteristic.On,
      serviceType: Service.Switch,
      getValue: (data) => Boolean(data.basicValue),
      setValue: (value) => this.setOnState(value),
    })
  }

  setOnState(on: boolean) {
    logInfo(`Turning ${this.device.name} ${on ? 'On' : 'Off'}`)

    return this.device.setInfo({ device: { v1: { basicValue: on ? 255 : 0 } } })
  }
}
