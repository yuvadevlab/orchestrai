/**
 * @file apps/gateway/src/db/local-store.ts
 * @description Local-first embedded in-memory and file-backed database storage engine (Zero-Docker required).
 * @module apps/gateway/db
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("LocalStore"));

export interface LocalUser {
  id: string;
  tenant_id: string;
  email: string;
  name: string;
  password_hash: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface LocalTenant {
  id: string;
  name: string;
  plan: string;
  created_at: string;
}

export interface LocalDatabaseState {
  users: LocalUser[];
  tenants: LocalTenant[];
}

const DATA_DIR = join(process.cwd(), ".data");
const STORE_PATH = join(DATA_DIR, "orchestrai-local-store.json");

/**
 * Singleton Local Store providing zero-docker embedded storage with JSON file persistence.
 */
export class LocalStore {
  private static instance: LocalStore;
  private state: LocalDatabaseState = {
    users: [],
    tenants: [],
  };

  private constructor() {
    this.load();
  }

  public static getInstance(): LocalStore {
    if (!LocalStore.instance) {
      LocalStore.instance = new LocalStore();
    }
    return LocalStore.instance;
  }

  private load(): void {
    try {
      if (existsSync(STORE_PATH)) {
        const raw = readFileSync(STORE_PATH, "utf-8");
        this.state = JSON.parse(raw);
        logger.info("[LocalStore] Loaded local database state", {
          usersCount: this.state.users?.length ?? 0,
          tenantsCount: this.state.tenants?.length ?? 0,
        });
      } else {
        // Initialize with completely clean state (no seed or default data)
        this.state = {
          users: [],
          tenants: [],
        };
        this.save();
        logger.info("[LocalStore] Initialized clean local database storage");
      }
    } catch {
      this.state = {
        users: [],
        tenants: [],
      };
      this.save();
    }
  }

  public save(): void {
    try {
      if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true });
      }
      writeFileSync(STORE_PATH, JSON.stringify(this.state, null, 2), "utf-8");
    } catch (err) {
      logger.error("[LocalStore] Failed to persist local store file", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  public findUserByEmail(email: string): LocalUser | undefined {
    return this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): LocalUser | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  public createUser(user: LocalUser): void {
    this.state.users.push(user);
    this.save();
  }

  public createTenant(tenant: LocalTenant): void {
    this.state.tenants.push(tenant);
    this.save();
  }

  public updateUserPassword(userId: string, newPasswordHash: string): boolean {
    const user = this.findUserById(userId);
    if (!user) return false;
    user.password_hash = newPasswordHash;
    user.updated_at = new Date().toISOString();
    this.save();
    return true;
  }
}
