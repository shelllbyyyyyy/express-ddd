import { Pool, QueryResult } from "pg";
import dotenv from "dotenv";
import { pool } from "./pg-module";

dotenv.config();

export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  async query(text: string, params?: any[]): Promise<any[]> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<any> = await client.query(text, params);

      if (result.rows.length === 0) {
        return [];
      }

      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }
}
