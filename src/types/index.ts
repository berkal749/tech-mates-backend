export interface IUser {
  email: string;
  password: string;
  github: string;
  discord: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface IRegistration {
  email: string;
  github: string;
  discord: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

export interface JwtPayload {
  userId: string | import('mongoose').Types.ObjectId;
  role: string;
}
