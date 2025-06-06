import type { Characteristic, CharacteristicValue, Logger, PlatformAccessory, Service } from 'homebridge';
import type { PushoverNotificationPlatform } from './platform';
import type { PushoverClient } from './pushover-client';
import type { Message } from './types.js';
import { wait } from './utils.js';

const PriorityMap: Record<string, number> = {
  emergency: 2,
  high: 1,
  normal: 0,
  low: -1,
  lowest: -2,
};

export class SwitchAccessory {
  private log: Logger;
  private service: Service;
  private onCharacteristic: Characteristic;

  private isOn = false;
  private inCooldown = false;

  constructor(
    private readonly platform: PushoverNotificationPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly pushoverClient: PushoverClient,
    private readonly message: Message,
  ) {
    this.log = platform.log;

    // Set accessory information
    const infoService = this.accessory.getService(this.platform.Service.AccessoryInformation);
    if (infoService) {
      infoService
        .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Homebridge Pushover Notification')
        .setCharacteristic(this.platform.Characteristic.Model, 'Notification Switch')
        .setCharacteristic(this.platform.Characteristic.SerialNumber, 'N/A');
    }

    this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

    this.service.setCharacteristic(this.platform.Characteristic.Name, this.message.name);

    this.onCharacteristic = this.service.getCharacteristic(this.platform.Characteristic.On);

    // Register handlers for the On/Off Characteristic
    this.onCharacteristic
      .onSet(this.setOn.bind(this))
      .onGet(this.getOn.bind(this));
  }

  private async setOn(value: CharacteristicValue) {
    this.log.debug('setOn:', value);

    this.isOn = value as boolean;
    this.onCharacteristic.updateValue(this.isOn);

    if (this.inCooldown) {
      this.log.info('Still in cooldown:', this.message.name);
      await wait(250);
      this.resetSwitch();
      return;
    }

    if (this.isOn) {
      this.triggerCooldown(this.message.cooldownTime);
      await this.sendMessage();
      this.resetSwitch();
    }
  }

  private async getOn(): Promise<CharacteristicValue> {
    return this.isOn;
  }

  private async sendMessage() {
    await this.pushoverClient.sendMessage({
      title: this.message.title,
      message: this.message.message,
      priority: this.mapPriority(this.message.priority),
      sound: this.message.sound,
    });

    this.log.info('Message sent:', this.message.name);
  }
  
  private async triggerCooldown(cooldownTime = 0) {
    if (cooldownTime <= 0) {
      return;
    }

    this.log.debug('Entering cooldown:', this.message.name);
    this.inCooldown = true;
    await wait(cooldownTime);
    this.inCooldown = false;
    this.log.debug('Exited cooldown:', this.message.name);
  }

  private resetSwitch() {
    this.log.debug('Resetting switch:', this.message.name);

    this.isOn = false;
    this.onCharacteristic.updateValue(this.isOn);
  }

  private mapPriority(priority?: string): number | undefined {
    return priority ? PriorityMap[priority] : undefined;
  }
}
