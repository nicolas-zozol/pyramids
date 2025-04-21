import { IntelLog } from '@robusta/scribe-intel';
import { IntelLogAdapter } from './IntelLogAdapter.js';
import fetch from 'node-fetch';

export class LokiAdapter implements IntelLogAdapter {
  private readonly lokiUrl: string;
  private readonly headers: Record<string, string>;

  constructor(config: {
    url: string;
    auth?: { username: string; password: string };
  }) {
    this.lokiUrl = `${config.url}/loki/api/v1/push`;
    this.headers = {
      'Content-Type': 'application/json',
    };

    if (config.auth) {
      const authString = Buffer.from(
        `${config.auth.username}:${config.auth.password}`,
      ).toString('base64');
      this.headers['Authorization'] = `Basic ${authString}`;
    }
  }

  private formatLogForLoki(log: IntelLog): object {
    return {
      streams: [
        {
          stream: log.labels || {},
          values: [
            [
              log.timestampNS.toString(),
              JSON.stringify({
                level: log.level,
                message: log.message,
                component: log.component,
                ...log.data,
              }),
            ],
          ],
        },
      ],
    };
  }

  async sendLog(log: IntelLog): Promise<void> {
    const body = this.formatLogForLoki(log);

    const response = await fetch(this.lokiUrl, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send log to Loki: ${error}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.lokiUrl.replace('/push', '/ready')}`,
        { headers: this.headers },
      );
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
