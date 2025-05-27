import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Photo storage (in production, use cloud storage like AWS S3, Cloudinary, etc.)
const photoStorage: Map<string, {
  id: string;
  studentId: string;
  registrationId?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  status: 'uploaded' | 'processing' | 'approved' | 'rejected';
  rejectionReason?: string;
  metadata: {
    width?: number;
    height?: number;
    format?: string;
    quality?: number;
  };
}> = new Map();

// Allowed image types and size limits
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_WIDTH = 300;
const MIN_HEIGHT = 400;
const MAX_WIDTH = 2000;
const MAX_HEIGHT = 2000;

// Mock image processing (in production, use image processing service)
const processImage = async (imageData: string): Promise<{
  success: boolean;
  url?: string;
  thumbnailUrl?: string;
  metadata?: any;
  error?: string;
}> => {
  try {
    // Simulate image processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock URLs (in production, upload to cloud storage)
    const timestamp = Date.now();
    const url = `/uploads/photos/${timestamp}-original.jpg`;
    const thumbnailUrl = `/uploads/photos/${timestamp}-thumbnail.jpg`;
    
    // Mock metadata extraction
    const metadata = {
      width: 600,
      height: 800,
      format: 'JPEG',
      quality: 85
    };
    
    return {
      success: true,
      url,
      thumbnailUrl,
      metadata
    };
  } catch (error) {
    return {
      success: false,
      error: 'Image processing failed'
    };
  }
};

// Validate image data
const validateImage = (imageData: string, mimeType: string): { valid: boolean; error?: string } => {
  // Check file type
  if (!ALLOWED_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG and PNG images are allowed.'
    };
  }
  
  // Check file size (base64 estimation)
  const sizeInBytes = (imageData.length * 3) / 4;
  if (sizeInBytes > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
    };
  }
  
  return { valid: true };
};

// POST - Upload student photo
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Extract user ID from token
    const tokenParts = token.split('-');
    if (tokenParts.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Invalid token format' },
        { status: 401 }
      );
    }

    const userId = tokenParts.slice(2, -1).join('-');
    const user = userStorage.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      imageData,
      filename,
      mimeType,
      registrationId
    } = body;

    // Validate required fields
    if (!imageData || !filename || !mimeType) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: imageData, filename, mimeType' },
        { status: 400 }
      );
    }

    // Validate image
    const validation = validateImage(imageData, mimeType);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    // Check if user already has a photo for this registration
    const existingPhoto = Array.from(photoStorage.values()).find(
      photo => photo.studentId === userId && photo.registrationId === registrationId
    );

    if (existingPhoto) {
      return NextResponse.json(
        { success: false, message: 'Photo already uploaded for this registration. Use PUT to update.' },
        { status: 409 }
      );
    }

    // Process image
    const processingResult = await processImage(imageData);
    if (!processingResult.success) {
      return NextResponse.json(
        { success: false, message: processingResult.error || 'Image processing failed' },
        { status: 500 }
      );
    }

    // Generate photo ID
    const photoId = `PHOTO-${userId}-${Date.now()}`;

    // Create photo record
    const photo = {
      id: photoId,
      studentId: userId,
      registrationId,
      filename: `${photoId}-${filename}`,
      originalName: filename,
      mimeType,
      size: Math.round((imageData.length * 3) / 4), // Approximate size from base64
      url: processingResult.url!,
      thumbnailUrl: processingResult.thumbnailUrl,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded' as const,
      metadata: processingResult.metadata || {}
    };

    // Store photo
    photoStorage.set(photoId, photo);

    return NextResponse.json({
      success: true,
      data: {
        photoId: photo.id,
        url: photo.url,
        thumbnailUrl: photo.thumbnailUrl,
        status: photo.status,
        uploadedAt: photo.uploadedAt
      },
      message: 'Photo uploaded successfully'
    });

  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update/replace student photo
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');
    const user = userStorage.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      photoId,
      imageData,
      filename,
      mimeType,
      registrationId
    } = body;

    // Find existing photo
    let existingPhoto;
    if (photoId) {
      existingPhoto = photoStorage.get(photoId);
    } else if (registrationId) {
      existingPhoto = Array.from(photoStorage.values()).find(
        photo => photo.studentId === userId && photo.registrationId === registrationId
      );
    }

    if (!existingPhoto) {
      return NextResponse.json(
        { success: false, message: 'Photo not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (existingPhoto.studentId !== userId) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Validate new image if provided
    if (imageData) {
      const validation = validateImage(imageData, mimeType);
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, message: validation.error },
          { status: 400 }
        );
      }

      // Process new image
      const processingResult = await processImage(imageData);
      if (!processingResult.success) {
        return NextResponse.json(
          { success: false, message: processingResult.error || 'Image processing failed' },
          { status: 500 }
        );
      }

      // Update photo record
      const updatedPhoto = {
        ...existingPhoto,
        filename: filename ? `${existingPhoto.id}-${filename}` : existingPhoto.filename,
        originalName: filename || existingPhoto.originalName,
        mimeType: mimeType || existingPhoto.mimeType,
        size: Math.round((imageData.length * 3) / 4),
        url: processingResult.url!,
        thumbnailUrl: processingResult.thumbnailUrl,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded' as const,
        metadata: processingResult.metadata || {}
      };

      photoStorage.set(existingPhoto.id, updatedPhoto);

      return NextResponse.json({
        success: true,
        data: {
          photoId: updatedPhoto.id,
          url: updatedPhoto.url,
          thumbnailUrl: updatedPhoto.thumbnailUrl,
          status: updatedPhoto.status,
          uploadedAt: updatedPhoto.uploadedAt
        },
        message: 'Photo updated successfully'
      });
    }

    return NextResponse.json({
      success: true,
      data: existingPhoto,
      message: 'Photo information retrieved successfully'
    });

  } catch (error) {
    console.error('Photo update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
