import { BaseDeviceAccessory } from './base-device-accessory'
import { RingDevice } from '../api'
import { hap } from './hap'
import { RingPlatformConfig } from './config'
import { distinctUntilChanged, filter, map } from 'rxjs/operators'
import { PlatformAccessory } from 'homebridge'
import { logInfo } from '../api/util'

export class FreezeSensor extends BaseDeviceAccessory {
  constructor(
    public readonly device: RingDevice,
    public readonly accessory: PlatformAccessory,
    public readonly config: RingPlatformConfig
  ) {
    super()

    const {
        Characteristic: { OccupancyDetected },
        Service: { OccupancySensor },
      } = hap,
      onFreezeDetected = device.onData.pipe(
        map((data) => {
          return data.faulted
            ? OccupancyDetected.OCCUPANCY_DETECTED
            : OccupancyDetected.OCCUPANCY_NOT_DETECTED
        }),
        distinctUntilChanged()
      )

    this.initSensorService(OccupancySensor)
    this.registerObservableCharacteristic({
      characteristicType: OccupancyDetected,
      serviceType: OccupancySensor,
      onValue: onFreezeDetected,
    })
    onFreezeDetected
      .pipe(filter((faulted) => Boolean(faulted)))
      .subscribe(() => {
        logInfo(device.name + ' Detected Freezing')
      })
  }
}
