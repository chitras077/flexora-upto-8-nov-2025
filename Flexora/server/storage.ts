import type { User, InsertUser } from "@shared/schema";

export interface IStorage {
  // Add your storage methods here as needed
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: User[] = [];
  private nextUserId = 1;

  async getUsers(): Promise<User[]> {
    return this.users;
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.nextUserId++,
      ...user,
    };
    this.users.push(newUser);
    return newUser;
  }
}

export const storage = new MemStorage();
