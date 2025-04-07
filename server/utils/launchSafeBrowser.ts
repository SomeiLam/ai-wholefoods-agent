import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export async function launchSafeBrowser() {
  const userDataDir = path.join(__dirname, '..', 'user-data');
  const lockFilePath = path.join(userDataDir, 'SingletonLock');

  if (fs.existsSync(lockFilePath)) {
    console.log('🧹 Removing leftover SingletonLock...');
    fs.unlinkSync(lockFilePath);
  }

  return puppeteer.launch({
    headless: false,
    userDataDir,
    defaultViewport: null,
  });
}
