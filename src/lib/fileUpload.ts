/**
 * 📁 File Upload Handler for Profile Pictures
 * Handles image uploads, validation, and storage
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  error?: string;
}

export class FileUploadHandler {
  private static uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
  private static maxFileSize = 5 * 1024 * 1024; // 5MB
  private static allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  /**
   * Initialize upload directory
   */
  static async initializeUploadDir(): Promise<void> {
    try {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!this.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      };
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: 'File size too large. Maximum size is 5MB.'
      };
    }

    return { valid: true };
  }

  /**
   * Generate unique filename
   */
  static generateFileName(originalName: string, userId: string): string {
    const extension = path.extname(originalName);
    const timestamp = Date.now();
    const uuid = uuidv4().substring(0, 8);
    return `${userId}_${timestamp}_${uuid}${extension}`;
  }

  /**
   * Save file to disk (for development - in production use cloud storage)
   */
  static async saveFile(file: File, userId: string): Promise<UploadResult> {
    try {
      // Initialize upload directory
      await this.initializeUploadDir();

      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Generate unique filename
      const fileName = this.generateFileName(file.name, userId);
      const filePath = path.join(this.uploadDir, fileName);

      // Convert File to Buffer (for Node.js)
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Save file
      fs.writeFileSync(filePath, buffer);

      // Return relative path for database storage
      const relativePath = `/uploads/profiles/${fileName}`;

      return {
        success: true,
        filePath: relativePath,
        fileName: fileName
      };

    } catch (error) {
      console.error('Error saving file:', error);
      return {
        success: false,
        error: 'Failed to save file'
      };
    }
  }

  /**
   * Delete file from disk
   */
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(process.cwd(), 'public', filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Get file URL for display
   */
  static getFileUrl(filePath: string | null | undefined): string | null {
    if (!filePath) return null;
    
    // If it's already a full URL, return as is
    if (filePath.startsWith('http')) {
      return filePath;
    }
    
    // If it's a relative path, ensure it starts with /
    if (!filePath.startsWith('/')) {
      return `/${filePath}`;
    }
    
    return filePath;
  }

  /**
   * Process base64 image data (from form submission)
   */
  static async processBase64Image(base64Data: string, userId: string): Promise<UploadResult> {
    try {
      // Extract file type and data from base64 string
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return {
          success: false,
          error: 'Invalid base64 image data'
        };
      }

      const mimeType = matches[1];
      const imageData = matches[2];

      // Validate MIME type
      if (!this.allowedTypes.includes(mimeType)) {
        return {
          success: false,
          error: 'Invalid image type. Only JPEG, PNG, and WebP are allowed.'
        };
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(imageData, 'base64');

      // Check file size
      if (buffer.length > this.maxFileSize) {
        return {
          success: false,
          error: 'Image size too large. Maximum size is 5MB.'
        };
      }

      // Initialize upload directory
      await this.initializeUploadDir();

      // Generate filename
      const extension = mimeType === 'image/jpeg' ? '.jpg' : 
                       mimeType === 'image/png' ? '.png' : 
                       mimeType === 'image/webp' ? '.webp' : '.jpg';
      
      const fileName = this.generateFileName(`profile${extension}`, userId);
      const filePath = path.join(this.uploadDir, fileName);

      // Save file
      fs.writeFileSync(filePath, buffer);

      // Return relative path
      const relativePath = `/uploads/profiles/${fileName}`;

      return {
        success: true,
        filePath: relativePath,
        fileName: fileName
      };

    } catch (error) {
      console.error('Error processing base64 image:', error);
      return {
        success: false,
        error: 'Failed to process image'
      };
    }
  }

  /**
   * Clean up old profile pictures for a user
   */
  static async cleanupOldProfilePictures(userId: string, keepCurrent?: string): Promise<void> {
    try {
      const files = fs.readdirSync(this.uploadDir);
      const userFiles = files.filter(file => file.startsWith(`${userId}_`));
      
      for (const file of userFiles) {
        const filePath = `/uploads/profiles/${file}`;
        if (keepCurrent && filePath === keepCurrent) {
          continue; // Don't delete the current profile picture
        }
        
        await this.deleteFile(filePath);
      }
    } catch (error) {
      console.error('Error cleaning up old profile pictures:', error);
    }
  }

  /**
   * Get file stats
   */
  static getFileStats(filePath: string): { exists: boolean; size?: number; created?: Date } {
    try {
      const fullPath = path.join(process.cwd(), 'public', filePath);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        return {
          exists: true,
          size: stats.size,
          created: stats.birthtime
        };
      }
      return { exists: false };
    } catch (error) {
      console.error('Error getting file stats:', error);
      return { exists: false };
    }
  }
}

export default FileUploadHandler;
