import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let adminAuthInstance: ReturnType<typeof getAuth> | null = null;

try {
  if (!getApps().length && firebaseConfig?.projectId) {
    initializeApp({
      projectId: firebaseConfig.projectId,
    });
  }
  if (getApps().length > 0) {
    adminAuthInstance = getAuth();
  }
} catch (err) {
  console.warn('Firebase Admin Auth not initialized (external hosting mode):', err);
}

export const adminAuth = {
  async verifyIdToken(token: string) {
    if (!adminAuthInstance) {
      throw new Error('Firebase Admin Auth não disponível neste ambiente.');
    }
    return adminAuthInstance.verifyIdToken(token);
  }
};
