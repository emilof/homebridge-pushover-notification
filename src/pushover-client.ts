import axios from 'axios';
import type { Logging } from 'homebridge';

export interface MessageRequest {
    message: string;
    title?: string;
    priority?: number;
    device?: string;
    sound?: string;
}

export class PushoverClient {
  constructor(
    private readonly token: string,
    private readonly user: string,
    private readonly log: Logging,
  ) {}    

  async sendMessage(request: MessageRequest) {
    const url = 'https://api.pushover.net/1/messages.json';
  
    const data = {
      ...request,
      token: this.token,
      user: this.user,
    };
    
    this.log.debug('Sending Pushover request:');
    this.log.debug(JSON.stringify(data));

    await axios.post(url, data)
      .then(response => {
        this.log.debug('Success! Result:', response.data);
      })
      .catch(error => {
        this.log.error('Pushover request failed:', error.message);
      });
  };
}