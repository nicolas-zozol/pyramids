import { IntelLog } from '@robusta/scribe-intel';

export interface IntelLogAdapter {
  sendLog: (log: IntelLog) => Promise<void>;
  healthCheck(): Promise<boolean>;
}
