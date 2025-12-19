import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/duplicates", async (req, res) => {
    try {
      const duplicates = await storage.getDuplicates();
      res.json(duplicates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch duplicates" });
    }
  });

  app.post("/api/duplicates/scan", async (req, res) => {
    try {
      const count = await storage.scanForDuplicates();
      res.json({ count, message: `Found ${count} duplicates` });
    } catch (error) {
      res.status(500).json({ error: "Failed to scan for duplicates" });
    }
  });

  app.delete("/api/duplicates/:id", async (req, res) => {
    try {
      await storage.deleteDuplicate(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete duplicate" });
    }
  });

  app.patch("/api/duplicates/:id/ignore", async (req, res) => {
    try {
      await storage.ignoreDuplicate(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to ignore duplicate" });
    }
  });

  app.get("/api/vault/files", async (req, res) => {
    try {
      const files = await storage.getVaultFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vault files" });
    }
  });

  app.post("/api/vault/files", async (req, res) => {
    try {
      const file = await storage.addVaultFile(req.body);
      res.json(file);
    } catch (error) {
      res.status(500).json({ error: "Failed to add vault file" });
    }
  });

  app.delete("/api/vault/files/:id", async (req, res) => {
    try {
      await storage.deleteVaultFile(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vault file" });
    }
  });

  app.get("/api/media", async (req, res) => {
    try {
      const items = await storage.getMediaItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch media items" });
    }
  });

  app.post("/api/media", async (req, res) => {
    try {
      const item = await storage.addMediaItem(req.body);
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to add media item" });
    }
  });

  return httpServer;
}
