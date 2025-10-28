// frontend/src/app/models/achievement.model.ts
export interface Achievement {
  _id?: string;
  studentId: string | {
    _id: string;
    firstName: string;
    lastName: string;
    studentId: string;
    programName?: string;
  };
  title: string;
  description: string;
  imageUrl?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  approvedBy?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  rejectedBy?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  approvalDate?: Date | string | null;
  rejectionDate?: Date | string | null;
  rejectionReason?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CreateAchievementRequest {
  studentId: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface RejectAchievementRequest {
  reason?: string;
}
