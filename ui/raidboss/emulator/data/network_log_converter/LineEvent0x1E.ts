import EmulatorCommon from '../../EmulatorCommon';

import { LineEvent0x1A } from './LineEvent0x1A';
import LogRepository from './LogRepository';

// Lose status effect event
// Extend the gain status event to reduce duplicate code since they're
// the same from a data perspective
export class LineEvent0x1E extends LineEvent0x1A {
  constructor(repo: LogRepository, line: string, parts: string[]) {
    super(repo, line, parts);

    let stackCountText = '';
    if (
      this.stacks > 0 && this.stacks < 20 &&
      LineEvent0x1A.showStackCountFor.includes(this.effectId)
    )
      stackCountText = ' (' + this.stacks.toString() + ')';

    this.convertedLine = this.prefix() + this.targetId +
      ':' + EmulatorCommon.properCase(this.targetName) +
      ' loses the effect of ' + this.effect +
      ' from ' + EmulatorCommon.properCase(this.fallbackResolvedTargetName) +
      ' for ' + this.durationString + ' Seconds.' + stackCountText;
  }
}

export class LineEvent30 extends LineEvent0x1E {}
