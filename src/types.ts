import { PlatformConfig } from 'homebridge';

export interface PushoverNotificationConfig extends PlatformConfig {
  user: string,
  token: string,
  messages: Message[]
}

export interface Message {
  name: string,
  title?: string,
  message: string,
  priority?: string,
  sound?: string,
  cooldownTime?: number,
}
