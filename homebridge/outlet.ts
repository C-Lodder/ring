import { BaseDeviceAccessory } from './base-device-accessory'
import { RingDevice } from '../api'
import { hap } from './hap'
import { RingPlatformConfig } from './config'
import { PlatformAccessory } from 'homebridge'
import { logInfo } from '../api/util'

export class Outlet extends BaseDeviceAccessory {
  constructor(
    public readonly device: RingDevice,
    public readonly accessory: PlatformAccessory,
    public readonly config: RingPlatformConfig
  ) {
    super()

    const { Characteristic, Service } = hap

    this.registerCharacteristic({
      characteristicType: Characteristic.On,
      serviceType: Service.Outlet,
      getValue: (data) => Boolean(data.on),
      setValue: (value) => this.setOnState(value),
    })

    this.registerCharacteristic({
      characteristicType: Characteristic.OutletInUse,
      serviceType: Service.Outlet,
      getValue: (data) => Boolean(data.on),
    })
  }

  setOnState(on: boolean) {
    logInfo(`Turning ${this.device.name} ${on ? 'On' : 'Off'}`)

    return this.device.setInfo({ device: { v1: { on } } })
  }
}
