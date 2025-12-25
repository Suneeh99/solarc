import fs from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"
import { DatabaseSchema } from "./prisma-types"

const dataDir = path.join(process.cwd(), "data")
const dbPath = path.join(dataDir, "db.json")
const seedPath = path.join(dataDir, "seed.json")

async function ensureDataFile() {
  await fs.mkdir(dataDir, { recursive: true })
  try {
    await fs.access(dbPath)
  } catch {
    const seed = await readSeed()
    await fs.writeFile(dbPath, JSON.stringify(seed, null, 2), "utf-8")
  }
}

async function readSeed(): Promise<DatabaseSchema> {
  const raw = await fs.readFile(seedPath, "utf-8")
  return JSON.parse(raw) as DatabaseSchema
}

export async function readDb(): Promise<DatabaseSchema> {
  await ensureDataFile()
  const raw = await fs.readFile(dbPath, "utf-8")
  return JSON.parse(raw) as DatabaseSchema
}

export async function writeDb(data: DatabaseSchema) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), "utf-8")
}

export function generateId(prefix: string) {
  return `${prefix}_${randomUUID()}`
}
