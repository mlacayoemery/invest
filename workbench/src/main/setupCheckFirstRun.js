import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

import {
  app,
  ipcMain
} from 'electron';

import { ipcMainChannels } from './ipcMainChannels';
import { getLogger } from './logger';

const logger = getLogger(__filename.split('/').slice(-1)[0]);

export const APP_HAS_RUN_TOKEN = 'app-has-run-token';

/** Check if the user has run this application before.
 *
 * @returns {boolean}
 */
export function checkFirstRun() {
  const userDataPath = app.getPath('userData');
  const hasRunTokenPath = path.join(userDataPath, APP_HAS_RUN_TOKEN);
  try {
    if (fs.existsSync(hasRunTokenPath)) {
      return false;
    }
    logger.info('first run');
    fs.writeFileSync(hasRunTokenPath, '');
    const configPath = path.join(app.getPath('userData'), 'config.json');
    execSync(
      `src/main/coreSetup.sh '${configPath}'`,
      { encoding: 'utf-8', stdio: 'inherit' }
    );
  } catch (error) {
    logger.warn(`Unable to write first-run token: ${error}`);
  }
  return true;
}

export function setupCheckFirstRun() {
  ipcMain.handle(
    ipcMainChannels.IS_FIRST_RUN, () => checkFirstRun()
  );
}
