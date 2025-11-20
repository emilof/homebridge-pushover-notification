import type { API, Characteristic, DynamicPlatformPlugin, Logging, PlatformAccessory, PlatformConfig, Service } from 'homebridge';
import { SwitchAccessory } from './switch-accessory.js';
import { PLATFORM_NAME, PLUGIN_NAME } from './const.js';
import type { PushoverNotificationConfig } from './types.js';
import { PushoverClient } from './pushover-client.js';

export class PushoverNotificationPlatform implements DynamicPlatformPlugin {
  readonly Service: typeof Service;
  readonly Characteristic: typeof Characteristic;

  private readonly accessories: Map<string, PlatformAccessory> = new Map();
  private readonly discoveredCacheUUIDs: string[] = [];

  constructor(
    readonly log: Logging,
    readonly config: PlatformConfig,
    readonly api: API,
  ) {
    this.Service = api.hap.Service;
    this.Characteristic = api.hap.Characteristic;

    if (!config.token) {
      this.log.error('Pushover API token must be configured');
      return;
    }
    if (!config.user) {
      this.log.error('Pushover user key must be configured');
      return;
    }

    this.log.debug('Finished initializing platform:', config.name);

    this.api.on('didFinishLaunching', () => {
      log.debug('Registering accessories...');
      this.registerAccessories();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.debug('Loading accessory from cache:', accessory.displayName);

    this.accessories.set(accessory.UUID, accessory);
  }

  private registerAccessories() {
    const config = this.config as PushoverNotificationConfig;

    const pushoverClient = new PushoverClient(config.token, config.user, this.log);
    
    if (config.messages) {
      for (const message of config.messages) {
        if (!message.name || !message.message) {
          this.log.debug('Invalid message config, skipping setup of accessory');
          continue;
        }

        const uuid = this.api.hap.uuid.generate(message.name);

        const existingAccessory = this.accessories.get(uuid);

        if (existingAccessory) {
          this.log.debug('Restoring existing accessory from cache:', existingAccessory.displayName);

          new SwitchAccessory(this, existingAccessory, pushoverClient, message);
        } else {
          this.log.debug('Adding new accessory:', message.name);

          const accessory = new this.api.platformAccessory(message.name, uuid);

          new SwitchAccessory(this, accessory, pushoverClient, message);

          this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        }

        this.discoveredCacheUUIDs.push(uuid);
      }
    }

    for (const [uuid, accessory] of this.accessories) {
      if (!this.discoveredCacheUUIDs.includes(uuid)) {
        this.log.debug('Removing existing accessory from cache:', accessory.displayName);
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
  }
}
