import crypto from 'node:crypto';
import { getDb } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'kachua-protidin-super-secret-key-2026';

// User structure interface
export interface User {
  _id: string;
  username: string;
  email: string;
  password: string; // Hashed password
  name?: string;
  createdAt: string;
}

// Fallback in-memory store for users if MongoDB is not live
export let memoryUsers: User[] = [
  {
    _id: 'seed-admin-1',
    username: 'admin',
    email: 'admin@kachuaprotidin.com',
    password: hashPassword('admin123'), // SHA256 of "admin123"
    name: 'কচুয়া প্রতিদিন এডমিন',
    createdAt: new Date().toISOString()
  }
];

// Secure simple SHA256 password hashing helper
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Find user by username or email
export async function findUser(identifier: string): Promise<User | null> {
  const { db, isUsingFallback } = await getDb();
  
  if (!isUsingFallback && db) {
    try {
      // Ensure the default admin user is seeded in MongoDB
      const adminUser = await db.collection('users').findOne({ username: 'admin' });
      if (!adminUser) {
        try {
          await db.collection('users').insertOne({
            username: 'admin',
            email: 'admin@kachuaprotidin.com',
            password: hashPassword('admin123'),
            name: 'কচুয়া প্রতিদিন এডমিন',
            createdAt: new Date().toISOString()
          });
          console.log('Successfully seeded default admin user into live MongoDB collection');
        } catch (seedErr) {
          console.error('Error seeding default admin user to MongoDB:', seedErr);
        }
      }

      const user = await db.collection('users').findOne({
        $or: [
          { username: identifier.toLowerCase().trim() },
          { email: identifier.toLowerCase().trim() }
        ]
      });
      if (user) {
        return {
          ...user,
          _id: user._id.toString()
        } as User;
      }
      return null;
    } catch (err) {
      console.error('Error finding user in MongoDB', err);
    }
  }

  // Fallback check
  const ident = identifier.toLowerCase().trim();
  const found = memoryUsers.find(
    u => u.username.toLowerCase() === ident || u.email.toLowerCase() === ident
  );
  return found || null;
}

// Create new user (Signup)
export async function createUser(fields: Omit<User, '_id' | 'createdAt'>): Promise<User | null> {
  const { db, isUsingFallback } = await getDb();
  const lowercaseUsername = fields.username.toLowerCase().trim();
  const lowercaseEmail = fields.email.toLowerCase().trim();
  
  const existingUser = await findUser(lowercaseUsername) || await findUser(lowercaseEmail);
  if (existingUser) {
    throw new Error('এই ব্যবহারকারীর নাম বা ইমেইল ইতিমধ্যে নিবন্ধিত করা হয়েছে');
  }

  const hashedPassword = hashPassword(fields.password);
  const now = new Date().toISOString();

  if (!isUsingFallback && db) {
    try {
      const result = await db.collection('users').insertOne({
        username: lowercaseUsername,
        email: lowercaseEmail,
        password: hashedPassword,
        name: fields.name || 'এডমিন ব্যবহারকারী',
        createdAt: now
      });
      return {
        _id: result.insertedId.toString(),
        username: lowercaseUsername,
        email: lowercaseEmail,
        password: hashedPassword,
        name: fields.name || 'এডমিন ব্যবহারকারী',
        createdAt: now
      };
    } catch (err) {
      console.error('Error inserting user to MongoDB', err);
    }
  }

  // Fallback save in-memory
  const id = `user-${Date.now()}`;
  const newUser: User = {
    _id: id,
    username: lowercaseUsername,
    email: lowercaseEmail,
    password: hashedPassword,
    name: fields.name || 'এডমিন ব্যবহারকারী',
    createdAt: now
  };
  memoryUsers.push(newUser);
  return newUser;
}

// Generate JWT token for sessions
export function createToken(payload: { userId: string; username: string; email: string; name?: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  // Expires in 24 hours
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 })).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
    
  return `${header}.${body}.${signature}`;
}

// Verify Session token
export function verifyToken(token: string): { userId: string; username: string; email: string; name?: string } | null {
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;
    
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
      
    if (signature !== expectedSignature) return null;
    
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch (err) {
    return null;
  }
}
