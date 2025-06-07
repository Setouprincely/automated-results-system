import { NextRequest, NextResponse } from 'next/server';
import { FileUploadHandler } from '@/lib/fileUpload';
import { SeparateStudentDatabase } from '@/lib/separateStudentDb';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

/**
 * 📁 Profile Picture Upload API
 * Handles profile picture uploads for all user types
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      userType,
      examLevel,
      imageData, // base64 image data
      fileName
    } = body;

    if (!userId || !userType || !imageData) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Process the image upload
    const uploadResult = await FileUploadHandler.processBase64Image(imageData, userId);

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, message: uploadResult.error },
        { status: 400 }
      );
    }

    // Update user's profile picture path in database
    let updateResult;

    if (userType === 'student') {
      // For students, update in the appropriate database (O Level or A Level)
      if (!examLevel) {
        return NextResponse.json(
          { success: false, message: 'Exam level required for students' },
          { status: 400 }
        );
      }

      // Find the student first
      const studentResult = await SeparateStudentDatabase.findStudentById(userId, examLevel);
      if (!studentResult) {
        return NextResponse.json(
          { success: false, message: 'Student not found' },
          { status: 404 }
        );
      }

      // Update profile picture path
      if (examLevel === 'O Level') {
        updateResult = await prisma.oLevelStudent.update({
          where: { id: userId },
          data: { profilePicturePath: uploadResult.filePath }
        });
      } else {
        updateResult = await prisma.aLevelStudent.update({
          where: { id: userId },
          data: { profilePicturePath: uploadResult.filePath }
        });
      }

      // Clean up old profile pictures
      await FileUploadHandler.cleanupOldProfilePictures(userId, uploadResult.filePath);

    } else if (userType === 'teacher') {
      // Update teacher profile picture
      updateResult = await prisma.teacherUser.update({
        where: { id: userId },
        data: { profilePicturePath: uploadResult.filePath }
      });

      // Clean up old profile pictures
      await FileUploadHandler.cleanupOldProfilePictures(userId, uploadResult.filePath);

    } else if (userType === 'examiner') {
      // Update examiner profile picture
      updateResult = await prisma.examinerUser.update({
        where: { id: userId },
        data: { profilePicturePath: uploadResult.filePath }
      });

      // Clean up old profile pictures
      await FileUploadHandler.cleanupOldProfilePictures(userId, uploadResult.filePath);

    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid user type' },
        { status: 400 }
      );
    }

    // Log the upload
    await prisma.auditLog.create({
      data: {
        tableName: `${userType}_profile_picture`,
        recordId: userId,
        action: 'PROFILE_PICTURE_UPDATED',
        newValues: {
          profilePicturePath: uploadResult.filePath,
          fileName: uploadResult.fileName,
          uploadedAt: new Date()
        },
        userType: userType,
        userId: userId,
        userEmail: 'system@gce.cm',
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        filePath: uploadResult.filePath,
        fileName: uploadResult.fileName,
        fileUrl: FileUploadHandler.getFileUrl(uploadResult.filePath)
      }
    });

  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload profile picture' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve profile picture
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType');
    const examLevel = searchParams.get('examLevel');

    if (!userId || !userType) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let profilePicturePath = null;

    if (userType === 'student') {
      if (!examLevel) {
        return NextResponse.json(
          { success: false, message: 'Exam level required for students' },
          { status: 400 }
        );
      }

      const student = await SeparateStudentDatabase.findStudentById(userId, examLevel as 'O Level' | 'A Level');
      if (student) {
        profilePicturePath = student.profilePicturePath;
      }

    } else if (userType === 'teacher') {
      const teacher = await prisma.teacherUser.findUnique({
        where: { id: userId },
        select: { profilePicturePath: true }
      });
      if (teacher) {
        profilePicturePath = teacher.profilePicturePath;
      }

    } else if (userType === 'examiner') {
      const examiner = await prisma.examinerUser.findUnique({
        where: { id: userId },
        select: { profilePicturePath: true }
      });
      if (examiner) {
        profilePicturePath = examiner.profilePicturePath;
      }
    }

    if (!profilePicturePath) {
      return NextResponse.json(
        { success: false, message: 'No profile picture found' },
        { status: 404 }
      );
    }

    // Check if file exists
    const fileStats = FileUploadHandler.getFileStats(profilePicturePath);
    if (!fileStats.exists) {
      return NextResponse.json(
        { success: false, message: 'Profile picture file not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        filePath: profilePicturePath,
        fileUrl: FileUploadHandler.getFileUrl(profilePicturePath),
        fileSize: fileStats.size,
        uploadedAt: fileStats.created
      }
    });

  } catch (error) {
    console.error('Error retrieving profile picture:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve profile picture' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove profile picture
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType');
    const examLevel = searchParams.get('examLevel');

    if (!userId || !userType) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get current profile picture path
    let currentProfilePicture = null;

    if (userType === 'student') {
      if (!examLevel) {
        return NextResponse.json(
          { success: false, message: 'Exam level required for students' },
          { status: 400 }
        );
      }

      const student = await SeparateStudentDatabase.findStudentById(userId, examLevel as 'O Level' | 'A Level');
      if (student) {
        currentProfilePicture = student.profilePicturePath;
      }
    } else if (userType === 'teacher') {
      const teacher = await prisma.teacherUser.findUnique({
        where: { id: userId },
        select: { profilePicturePath: true }
      });
      if (teacher) {
        currentProfilePicture = teacher.profilePicturePath;
      }
    } else if (userType === 'examiner') {
      const examiner = await prisma.examinerUser.findUnique({
        where: { id: userId },
        select: { profilePicturePath: true }
      });
      if (examiner) {
        currentProfilePicture = examiner.profilePicturePath;
      }
    }

    if (!currentProfilePicture) {
      return NextResponse.json(
        { success: false, message: 'No profile picture to delete' },
        { status: 404 }
      );
    }

    // Delete file from disk
    await FileUploadHandler.deleteFile(currentProfilePicture);

    // Update database to remove profile picture path
    if (userType === 'student') {
      if (examLevel === 'O Level') {
        await prisma.oLevelStudent.update({
          where: { id: userId },
          data: { profilePicturePath: null }
        });
      } else {
        await prisma.aLevelStudent.update({
          where: { id: userId },
          data: { profilePicturePath: null }
        });
      }
    } else if (userType === 'teacher') {
      await prisma.teacherUser.update({
        where: { id: userId },
        data: { profilePicturePath: null }
      });
    } else if (userType === 'examiner') {
      await prisma.examinerUser.update({
        where: { id: userId },
        data: { profilePicturePath: null }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile picture deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete profile picture' },
      { status: 500 }
    );
  }
}
