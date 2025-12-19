import { type User, type InsertUser, type Duplicate, type InsertDuplicate, type VaultFile, type InsertVaultFile, type MediaItem, type InsertMediaItem } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getDuplicates(): Promise<Duplicate[]>;
  scanForDuplicates(): Promise<number>;
  deleteDuplicate(id: string): Promise<void>;
  ignoreDuplicate(id: string): Promise<void>;
  getVaultFiles(): Promise<VaultFile[]>;
  addVaultFile(file: InsertVaultFile): Promise<VaultFile>;
  deleteVaultFile(id: string): Promise<void>;
  getMediaItems(): Promise<MediaItem[]>;
  addMediaItem(item: InsertMediaItem): Promise<MediaItem>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private duplicates: Map<string, Duplicate>;
  private vaultFiles: Map<string, VaultFile>;
  private mediaItems: Map<string, MediaItem>;

  constructor() {
    this.users = new Map();
    this.duplicates = new Map();
    this.vaultFiles = new Map();
    this.mediaItems = new Map();
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleItems: MediaItem[] = [
      { id: "1", title: "Video A", url: "https://example.com/video1.mp4", type: "video", thumbnail: null, size: "1.2 GB", duration: "01:30:00", category: "Movies", createdAt: new Date() },
      { id: "2", title: "Video B", url: "https://example.com/video1.mp4", type: "video", thumbnail: null, size: "1.2 GB", duration: "01:30:00", category: "Movies", createdAt: new Date() },
      { id: "3", title: "Video C", url: "https://example.com/video2.mp4", type: "video", thumbnail: null, size: "800 MB", duration: "00:45:00", category: "Series", createdAt: new Date() },
      { id: "4", title: "Video D", url: "https://example.com/video3.mp4", type: "video", thumbnail: null, size: "2.1 GB", duration: "02:15:00", category: "Movies", createdAt: new Date() },
      { id: "5", title: "Video E", url: "https://example.com/video3.mp4", type: "video", thumbnail: null, size: "2.1 GB", duration: "02:15:00", category: "Movies", createdAt: new Date() },
    ];
    sampleItems.forEach(item => this.mediaItems.set(item.id, item));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getDuplicates(): Promise<Duplicate[]> {
    return Array.from(this.duplicates.values());
  }

  async scanForDuplicates(): Promise<number> {
    const items = Array.from(this.mediaItems.values());
    const urlMap = new Map<string, MediaItem[]>();
    
    items.forEach(item => {
      const existing = urlMap.get(item.url) || [];
      existing.push(item);
      urlMap.set(item.url, existing);
    });

    let count = 0;
    urlMap.forEach((duplicateItems, url) => {
      if (duplicateItems.length > 1) {
        const original = duplicateItems[0];
        for (let i = 1; i < duplicateItems.length; i++) {
          const existingDup = Array.from(this.duplicates.values()).find(
            d => d.originalId === original.id && d.duplicateId === duplicateItems[i].id
          );
          if (!existingDup) {
            const id = randomUUID();
            const duplicate: Duplicate = {
              id,
              originalId: original.id,
              duplicateId: duplicateItems[i].id,
              url,
              ignored: false,
              createdAt: new Date(),
            };
            this.duplicates.set(id, duplicate);
            count++;
          }
        }
      }
    });

    return count;
  }

  async deleteDuplicate(id: string): Promise<void> {
    this.duplicates.delete(id);
  }

  async ignoreDuplicate(id: string): Promise<void> {
    const duplicate = this.duplicates.get(id);
    if (duplicate) {
      duplicate.ignored = true;
      this.duplicates.set(id, duplicate);
    }
  }

  async getVaultFiles(): Promise<VaultFile[]> {
    return Array.from(this.vaultFiles.values());
  }

  async addVaultFile(file: InsertVaultFile): Promise<VaultFile> {
    const id = randomUUID();
    const vaultFile: VaultFile = {
      id,
      name: file.name,
      type: file.type || "file",
      size: file.size || null,
      mimeType: file.mimeType || null,
      dataUrl: file.dataUrl || null,
      sourceUrl: file.sourceUrl || null,
      createdAt: new Date(),
    };
    this.vaultFiles.set(id, vaultFile);
    return vaultFile;
  }

  async deleteVaultFile(id: string): Promise<void> {
    this.vaultFiles.delete(id);
  }

  async getMediaItems(): Promise<MediaItem[]> {
    return Array.from(this.mediaItems.values());
  }

  async addMediaItem(item: InsertMediaItem): Promise<MediaItem> {
    const id = randomUUID();
    const mediaItem: MediaItem = {
      id,
      title: item.title,
      url: item.url,
      type: item.type || "video",
      thumbnail: item.thumbnail || null,
      size: item.size || null,
      duration: item.duration || null,
      category: item.category || null,
      createdAt: new Date(),
    };
    this.mediaItems.set(id, mediaItem);
    return mediaItem;
  }
}

export const storage = new MemStorage();
