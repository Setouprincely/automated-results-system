/**
 * 🔐 Secure Administrator Authentication System
 * 
 * This system provides high-security admin access without storing admin accounts
 * in the database, preventing data leaks and unauthorized access.
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Environment-based admin credentials (never stored in database)
const ADMIN_MASTER_KEY = process.env.ADMIN_MASTER_KEY || 'GCE_ADMIN_2025_SECURE_KEY';
const ADMIN_SECRET_SALT = process.env.ADMIN_SECRET_SALT || 'GCE_CAMEROON_ADMIN_SALT_2025';

// Time-based One-Time Password (TOTP) settings
const TOTP_WINDOW = 30; // 30 seconds
const TOTP_DIGITS = 6;

// Admin access levels
export enum AdminAccessLevel {
  SUPER_ADMIN = 'super_admin',
  SYSTEM_ADMIN = 'system_admin',
  EXAM_ADMIN = 'exam_admin',
  SECURITY_ADMIN = 'security_admin'
}

// Admin session interface
export interface AdminSession {
  sessionId: string;
  accessLevel: AdminAccessLevel;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

// In-memory admin sessions (cleared on server restart for security)
const activeSessions = new Map<string, AdminSession>();

/**
 * Generate Time-based One-Time Password
 */
function generateTOTP(secret: string, timeStep?: number): string {
  const time = Math.floor((timeStep || Date.now()) / 1000 / TOTP_WINDOW);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeUInt32BE(time, 4);
  
  const hmac = crypto.createHmac('sha1', secret);
  hmac.update(timeBuffer);
  const hash = hmac.digest();
  
  const offset = hash[hash.length - 1] & 0xf;
  const code = ((hash[offset] & 0x7f) << 24) |
               ((hash[offset + 1] & 0xff) << 16) |
               ((hash[offset + 2] & 0xff) << 8) |
               (hash[offset + 3] & 0xff);
  
  return (code % Math.pow(10, TOTP_DIGITS)).toString().padStart(TOTP_DIGITS, '0');
}

/**
 * Verify TOTP code with time window tolerance
 */
function verifyTOTP(secret: string, token: string, windowSize: number = 1): boolean {
  const currentTime = Date.now();
  
  for (let i = -windowSize; i <= windowSize; i++) {
    const timeStep = currentTime + (i * TOTP_WINDOW * 1000);
    const expectedToken = generateTOTP(secret, timeStep);
    if (expectedToken === token) {
      return true;
    }
  }
  
  return false;
}

/**
 * Generate admin access key based on multiple factors
 */
function generateAdminKey(
  masterPassword: string,
  accessLevel: AdminAccessLevel,
  timestamp: number
): string {
  const combined = `${masterPassword}:${accessLevel}:${ADMIN_SECRET_SALT}:${Math.floor(timestamp / (1000 * 60 * 60))}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
}

/**
 * Secure Admin Authentication
 */
export class SecureAdminAuth {
  
  /**
   * Authenticate admin with multi-factor authentication
   */
  static async authenticateAdmin(
    masterPassword: string,
    totpCode: string,
    accessLevel: AdminAccessLevel,
    ipAddress: string,
    userAgent: string
  ): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    
    try {
      // 1. Verify master password with time-based key
      const currentTime = Date.now();
      const expectedKey = generateAdminKey(masterPassword, accessLevel, currentTime);
      const providedKey = crypto.createHash('sha256').update(masterPassword + ADMIN_MASTER_KEY).digest('hex');
      
      // Check current hour and previous hour (for time tolerance)
      const previousHourKey = generateAdminKey(masterPassword, accessLevel, currentTime - (60 * 60 * 1000));
      
      if (expectedKey !== providedKey && previousHourKey !== providedKey) {
        await this.logSecurityEvent('ADMIN_AUTH_FAILED', { reason: 'Invalid master password', ipAddress, userAgent });
        return { success: false, error: 'Invalid credentials' };
      }
      
      // 2. Verify TOTP code
      const totpSecret = crypto.createHash('sha256').update(ADMIN_MASTER_KEY + accessLevel).digest('hex').substring(0, 32);
      
      if (!verifyTOTP(totpSecret, totpCode)) {
        await this.logSecurityEvent('ADMIN_AUTH_FAILED', { reason: 'Invalid TOTP', ipAddress, userAgent });
        return { success: false, error: 'Invalid authentication code' };
      }
      
      // 3. Check for suspicious activity
      const recentFailedAttempts = await this.getRecentFailedAttempts(ipAddress);
      if (recentFailedAttempts > 3) {
        await this.logSecurityEvent('ADMIN_AUTH_BLOCKED', { reason: 'Too many failed attempts', ipAddress, userAgent });
        return { success: false, error: 'Account temporarily locked due to suspicious activity' };
      }
      
      // 4. Create secure session
      const sessionId = crypto.randomBytes(32).toString('hex');
      const session: AdminSession = {
        sessionId,
        accessLevel,
        ipAddress,
        userAgent,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + (2 * 60 * 60 * 1000)), // 2 hours
        lastActivity: new Date(),
        isActive: true
      };
      
      activeSessions.set(sessionId, session);
      
      // 5. Log successful authentication
      await this.logSecurityEvent('ADMIN_AUTH_SUCCESS', { 
        sessionId, 
        accessLevel, 
        ipAddress, 
        userAgent 
      });
      
      return { success: true, sessionId };
      
    } catch (error) {
      console.error('Admin authentication error:', error);
      return { success: false, error: 'Authentication system error' };
    }
  }
  
  /**
   * Validate admin session
   */
  static validateSession(sessionId: string, ipAddress: string): AdminSession | null {
    const session = activeSessions.get(sessionId);
    
    if (!session || !session.isActive) {
      return null;
    }
    
    // Check expiration
    if (new Date() > session.expiresAt) {
      this.invalidateSession(sessionId);
      return null;
    }
    
    // Check IP address consistency (optional security measure)
    if (session.ipAddress !== ipAddress) {
      this.logSecurityEvent('ADMIN_SESSION_IP_MISMATCH', { 
        sessionId, 
        originalIp: session.ipAddress, 
        currentIp: ipAddress 
      });
      // Optionally invalidate session on IP change
      // this.invalidateSession(sessionId);
      // return null;
    }
    
    // Update last activity
    session.lastActivity = new Date();
    activeSessions.set(sessionId, session);
    
    return session;
  }
  
  /**
   * Invalidate admin session
   */
  static invalidateSession(sessionId: string): void {
    const session = activeSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      activeSessions.set(sessionId, session);
      
      this.logSecurityEvent('ADMIN_SESSION_INVALIDATED', { sessionId });
    }
  }
  
  /**
   * Get current TOTP code for admin setup
   */
  static getCurrentTOTP(accessLevel: AdminAccessLevel): string {
    const totpSecret = crypto.createHash('sha256').update(ADMIN_MASTER_KEY + accessLevel).digest('hex').substring(0, 32);
    return generateTOTP(totpSecret);
  }
  
  /**
   * Generate QR code data for TOTP setup
   */
  static getTOTPSetupData(accessLevel: AdminAccessLevel): {
    secret: string;
    qrCodeUrl: string;
    manualEntryKey: string;
  } {
    const totpSecret = crypto.createHash('sha256').update(ADMIN_MASTER_KEY + accessLevel).digest('hex').substring(0, 32);
    const issuer = 'GCE-Cameroon';
    const accountName = `${accessLevel}@gce-admin`;
    
    const qrCodeUrl = `otpauth://totp/${encodeURIComponent(accountName)}?secret=${totpSecret}&issuer=${encodeURIComponent(issuer)}`;
    
    return {
      secret: totpSecret,
      qrCodeUrl,
      manualEntryKey: totpSecret.match(/.{1,4}/g)?.join(' ') || totpSecret
    };
  }
  
  /**
   * Get all active admin sessions
   */
  static getActiveSessions(): AdminSession[] {
    return Array.from(activeSessions.values()).filter(session => session.isActive);
  }
  
  /**
   * Force logout all admin sessions
   */
  static logoutAllSessions(): void {
    activeSessions.clear();
    this.logSecurityEvent('ADMIN_ALL_SESSIONS_CLEARED', {});
  }
  
  /**
   * Log security events (implement with your audit system)
   */
  private static async logSecurityEvent(event: string, data: any): Promise<void> {
    // This should integrate with your audit logging system
    console.log(`[SECURITY] ${event}:`, {
      timestamp: new Date().toISOString(),
      event,
      data
    });
    
    // TODO: Store in secure audit log database
    // await auditLogger.log({
    //   event,
    //   data,
    //   timestamp: new Date(),
    //   severity: 'HIGH'
    // });
  }
  
  /**
   * Get recent failed attempts for IP address
   */
  private static async getRecentFailedAttempts(ipAddress: string): Promise<number> {
    // TODO: Implement with your audit system
    // This should check failed attempts in the last hour
    return 0;
  }
  
  /**
   * Emergency admin access (use only in extreme cases)
   */
  static generateEmergencyAccess(): {
    emergencyCode: string;
    validUntil: Date;
  } {
    const emergencyCode = crypto.randomBytes(16).toString('hex').toUpperCase();
    const validUntil = new Date(Date.now() + (15 * 60 * 1000)); // 15 minutes
    
    this.logSecurityEvent('EMERGENCY_ACCESS_GENERATED', { 
      emergencyCode: emergencyCode.substring(0, 8) + '****', // Partial logging for security
      validUntil 
    });
    
    return { emergencyCode, validUntil };
  }
}

/**
 * Admin middleware for API routes
 */
export function requireAdminAuth(requiredLevel: AdminAccessLevel) {
  return (req: any, res: any, next: any) => {
    const sessionId = req.headers['x-admin-session'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    if (!sessionId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }
    
    const session = SecureAdminAuth.validateSession(sessionId, ipAddress);
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired admin session' });
    }
    
    // Check access level
    const levelHierarchy = {
      [AdminAccessLevel.SUPER_ADMIN]: 4,
      [AdminAccessLevel.SYSTEM_ADMIN]: 3,
      [AdminAccessLevel.EXAM_ADMIN]: 2,
      [AdminAccessLevel.SECURITY_ADMIN]: 1
    };
    
    if (levelHierarchy[session.accessLevel] < levelHierarchy[requiredLevel]) {
      return res.status(403).json({ error: 'Insufficient admin privileges' });
    }
    
    req.adminSession = session;
    next();
  };
}

export default SecureAdminAuth;
