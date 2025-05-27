import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared marking scores storage (in production, use database)
const markingScores: Map<string, any> = new Map();

// Helper function to check marking access
const canAccessMarking = (token: string, markingId?: string): { canAccess: boolean; userId: string | null; userType: string | null } => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return { canAccess: false, userId: null, userType: null };
  
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  
  if (!user) return { canAccess: false, userId: null, userType: null };
  
  // Admin can access all markings
  if (user.userType === 'admin') return { canAccess: true, userId, userType: user.userType };
  
  // Examiners can access their own markings
  if (markingId) {
    const marking = markingScores.get(markingId);
    if (marking && marking.examinerId === userId) {
      return { canAccess: true, userId, userType: user.userType };
    }
  }
  
  return { canAccess: user.userType === 'examiner', userId, userType: user.userType };
};

// PUT - Update marking scores
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { canAccess, userId } = canAccessMarking(token, id);

    if (!canAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if ID is scriptId (get scores by script) or markingId (get specific marking)
    let markingScore;
    
    if (id.startsWith('SCRIPT-')) {
      // Get all markings for this script
      const scriptMarkings = Array.from(markingScores.values()).filter(
        score => score.scriptId === id
      );
      
      if (scriptMarkings.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No markings found for this script' },
          { status: 404 }
        );
      }

      // For bulk update of script markings
      const body = await request.json();
      const { action, markingType, data } = body;

      if (action === 'verify_markings') {
        const updatedMarkings = [];
        
        for (const marking of scriptMarkings) {
          if (markingType && marking.markingType !== markingType) continue;
          
          const updateData = {
            ...marking,
            verification: {
              ...marking.verification,
              isVerified: true,
              verifiedBy: userId,
              verifiedAt: new Date().toISOString(),
              verificationComments: data.verificationComments || '',
              discrepancies: data.discrepancies || []
            },
            status: 'verified',
            updatedAt: new Date().toISOString()
          };

          markingScores.set(marking.id, updateData);
          updatedMarkings.push(updateData);
        }

        return NextResponse.json({
          success: true,
          data: updatedMarkings,
          message: 'Markings verified successfully'
        });
      }

      return NextResponse.json(
        { success: false, message: 'Invalid action for script markings update' },
        { status: 400 }
      );
    } else {
      // Update specific marking
      markingScore = markingScores.get(id);
      
      if (!markingScore) {
        return NextResponse.json(
          { success: false, message: 'Marking not found' },
          { status: 404 }
        );
      }

      // Check if marking can be modified
      if (markingScore.status === 'finalized') {
        return NextResponse.json(
          { success: false, message: 'Cannot modify finalized marking' },
          { status: 400 }
        );
      }

      const body = await request.json();
      const {
        scores,
        flags,
        markingTime,
        status,
        verification,
        moderation,
        action
      } = body;

      // Prepare update data
      const updateData: any = {
        ...markingScore,
        updatedAt: new Date().toISOString()
      };

      // Handle specific actions
      if (action) {
        switch (action) {
          case 'submit_marking':
            updateData.status = 'submitted';
            updateData.submittedAt = new Date().toISOString();
            if (markingTime?.endTime) {
              updateData.markingTime.endTime = markingTime.endTime;
              updateData.markingTime.totalMinutes = markingTime.totalMinutes;
            }
            break;

          case 'verify_marking':
            updateData.verification = {
              ...updateData.verification,
              isVerified: true,
              verifiedBy: userId,
              verifiedAt: new Date().toISOString(),
              verificationComments: verification?.verificationComments || '',
              discrepancies: verification?.discrepancies || []
            };
            updateData.status = 'verified';
            break;

          case 'moderate_marking':
            updateData.moderation = {
              ...updateData.moderation,
              isModerated: true,
              moderatedBy: userId,
              moderatedAt: new Date().toISOString(),
              moderationComments: moderation?.moderationComments || '',
              finalMarks: moderation?.finalMarks || updateData.totalMarks,
              adjustments: moderation?.adjustments || []
            };
            updateData.status = 'moderated';
            
            // Recalculate if final marks changed
            if (moderation?.finalMarks && moderation.finalMarks !== updateData.totalMarks) {
              updateData.totalMarks = moderation.finalMarks;
              updateData.percentage = updateData.totalMaxMarks > 0 ? 
                Math.round((moderation.finalMarks / updateData.totalMaxMarks) * 100) : 0;
            }
            break;

          case 'finalize_marking':
            updateData.status = 'finalized';
            break;

          case 'add_flag':
            if (body.flag) {
              updateData.flags.push({
                ...body.flag,
                flaggedAt: new Date().toISOString()
              });
            }
            break;

          case 'remove_flag':
            if (body.flagIndex !== undefined) {
              updateData.flags.splice(body.flagIndex, 1);
            }
            break;
        }
      }

      // Update individual fields
      if (scores !== undefined) {
        // Recalculate totals
        let totalMarks = 0;
        let totalMaxMarks = 0;

        const processedScores = scores.map((section: any) => {
          let sectionTotal = 0;
          let sectionMaxMarks = 0;

          section.questions.forEach((question: any) => {
            sectionTotal += question.marksAwarded || 0;
            sectionMaxMarks += question.maxMarks || 0;
          });

          totalMarks += sectionTotal;
          totalMaxMarks += sectionMaxMarks;

          return {
            ...section,
            sectionTotal,
            sectionMaxMarks
          };
        });

        updateData.scores = processedScores;
        updateData.totalMarks = totalMarks;
        updateData.totalMaxMarks = totalMaxMarks;
        updateData.percentage = totalMaxMarks > 0 ? Math.round((totalMarks / totalMaxMarks) * 100) : 0;
      }

      if (flags !== undefined) updateData.flags = flags;
      if (markingTime !== undefined) updateData.markingTime = { ...updateData.markingTime, ...markingTime };
      if (status !== undefined) updateData.status = status;
      if (verification !== undefined) updateData.verification = { ...updateData.verification, ...verification };
      if (moderation !== undefined) updateData.moderation = { ...updateData.moderation, ...moderation };

      // Update marking score
      markingScores.set(id, updateData);

      return NextResponse.json({
        success: true,
        data: updateData,
        message: 'Marking updated successfully'
      });
    }

  } catch (error) {
    console.error('Update marking scores error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get marking scores by ID or script ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { canAccess } = canAccessMarking(token, id);

    if (!canAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    if (id.startsWith('SCRIPT-')) {
      // Get all markings for this script
      const scriptMarkings = Array.from(markingScores.values()).filter(
        score => score.scriptId === id
      );
      
      if (scriptMarkings.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No markings found for this script' },
          { status: 404 }
        );
      }

      // Sort by marking type and creation date
      scriptMarkings.sort((a, b) => {
        const typeOrder = { 'first': 1, 'second': 2, 'moderation': 3, 'chief_review': 4 };
        const typeDiff = (typeOrder[a.markingType as keyof typeof typeOrder] || 0) - 
                        (typeOrder[b.markingType as keyof typeof typeOrder] || 0);
        
        if (typeDiff !== 0) return typeDiff;
        
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

      // Calculate marking summary
      const summary = {
        scriptId: id,
        totalMarkings: scriptMarkings.length,
        markingTypes: scriptMarkings.map(m => m.markingType),
        averageMarks: scriptMarkings.length > 0 ? 
          Math.round(scriptMarkings.reduce((sum, m) => sum + m.totalMarks, 0) / scriptMarkings.length) : 0,
        markingConsistency: calculateMarkingConsistency(scriptMarkings),
        finalMarks: getFinalMarks(scriptMarkings),
        status: getOverallMarkingStatus(scriptMarkings),
        flags: scriptMarkings.reduce((allFlags: any[], marking) => allFlags.concat(marking.flags), [])
      };

      return NextResponse.json({
        success: true,
        data: {
          markings: scriptMarkings,
          summary
        },
        message: 'Script markings retrieved successfully'
      });
    } else {
      // Get specific marking
      const markingScore = markingScores.get(id);
      
      if (!markingScore) {
        return NextResponse.json(
          { success: false, message: 'Marking not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: markingScore,
        message: 'Marking retrieved successfully'
      });
    }

  } catch (error) {
    console.error('Get marking scores error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
const calculateMarkingConsistency = (markings: any[]): number => {
  if (markings.length < 2) return 100;
  
  const marks = markings.map(m => m.totalMarks);
  const average = marks.reduce((sum, mark) => sum + mark, 0) / marks.length;
  const variance = marks.reduce((sum, mark) => sum + Math.pow(mark - average, 2), 0) / marks.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Convert to consistency percentage (lower deviation = higher consistency)
  return Math.max(0, Math.round(100 - (standardDeviation / average) * 100));
};

const getFinalMarks = (markings: any[]): number => {
  const moderatedMarking = markings.find(m => m.moderation.isModerated);
  if (moderatedMarking) return moderatedMarking.moderation.finalMarks || moderatedMarking.totalMarks;
  
  const verifiedMarking = markings.find(m => m.verification.isVerified);
  if (verifiedMarking) return verifiedMarking.totalMarks;
  
  const submittedMarkings = markings.filter(m => m.status === 'submitted');
  if (submittedMarkings.length > 0) {
    return Math.round(submittedMarkings.reduce((sum, m) => sum + m.totalMarks, 0) / submittedMarkings.length);
  }
  
  return 0;
};

const getOverallMarkingStatus = (markings: any[]): string => {
  if (markings.some(m => m.status === 'finalized')) return 'finalized';
  if (markings.some(m => m.status === 'moderated')) return 'moderated';
  if (markings.some(m => m.status === 'verified')) return 'verified';
  if (markings.some(m => m.status === 'submitted')) return 'submitted';
  return 'draft';
};
