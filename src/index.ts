import type { API } from 'homebridge';
import { PushoverNotificationPlatform } from './platform.js';
import { PLATFORM_NAME } from './const.js';

export default (api: API) => {
  api.registerPlatform(PLATFORM_NAME, PushoverNotificationPlatform);
};
