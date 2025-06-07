# Homebridge Pushover Notification

This plugin allows you to send push notifications through Pushover (https://pushover.net) directly from HomeKit. It works by creating a momentary switch, that when turned on, sends a message via Pushover. Once the message has been sent, the switch automatically returns to its off state.

This is especially useful if you want to send a notification to your device when a particular event occurs. Simply create a HomeKit automation that is triggered by the desired event or condition, and set the action to turn on the switch.

## Prerequisites

- Homebridge installed
- Pushover account
- An application (API token) created under your Pushover account
- A device linked to your Pushover account

## Installation

### Option 1: Homebridge UI

Go to the 'Plugins' page, search for `homebridge-pushover-notification`, and click 'Install'.

### Option 2: Manually

Run the following command to install the plugin globally:

    $ sudo npm install homebridge-pushover-notification -g

## Configuration

### Option 1: Homebridge UI

The easiest way to configure the plugin is to use the config UI in Homebridge. It will be displayed automatically after you've installed the plugin. If not, it can be found under the 'More Menu' `⋮` for the 'Homebridge Pushed Notification' plugin.

### Option 2: Manually

An alternative is to edit the Homebridge JSON config file manually by adding the following config to the `platforms` array:

```json
{
  "platform": "PushoverNotification",
  "user": "<Your Pushover Account User Key>",
  "token": "<Your Application API Token>",
  "messages": [
    {
      "name": "Send warning message",
      "message": "Warning message text"
    }
  ]
}
```

## Config Properties

| Property         | Type      | Required | Description                                                              |
| ---------------- | --------- | -------- | ------------------------------------------------------------------------ |
| `platform`       | `string`  | Yes      | Platform identifier. **Do not change this line**                         |
| `user`           | `string`  | Yes      | The user key for your Pushover account.                                  |
| `token`          | `string`  | Yes      | The application API token created under your Pushover account.           |       
| `messages`       | `array`   | Yes      | List of messages/switch accessories to setup in HomeKit.                 |
| └&nbsp;`name`         | `string`  | Yes      | Name of the switch shown in the Home app.                                |
| └&nbsp;`title`        | `string`  | No       | Title of the notification sent to the device.                            |
| └&nbsp;`message`      | `string`  | Yes      | Message text of the notification sent to the device.                     |
| └&nbsp;`priority`     | `string`  | No       | Priority of the message. Default: **normal**. [[More info](https://pushover.net/api#prioritys)] |
| └&nbsp;`sound`        | `string`  | No       | Sound to be played when notification is received on device. Default: **pushover**. [[More info](https://pushover.net/api#sounds)] |
| └&nbsp;`cooldownTime` | `integer` | No       | Minimum time before this message can be sent again. Default: no cooldown |

### Example config

In the example below, two switch accessories have been configured. The first one has high priority and the second one has custom sound and cooldown set.

```json
{
  "platform": "PushoverNotification",
  "user": "<Your Pushover Account User Key>",
  "token": "<Your Application/API Token>",
  "messages": [
    {
      "name": "Send warning message",
      "title": "Warning title",
      "message": "High priority warning message",
      "priority": "high"
    },
    {
      "name": "Send alert message",
      "title": "Alert title",
      "message": "Alert with custom sound that can be triggered once every 10 seconds at most",
      "sound": "classical",
      "cooldownTime": 10000
    }
  ]
}
```
