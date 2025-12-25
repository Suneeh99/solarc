import { promisify } from "util"
import { randomUUID, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto"
import { promises as fs } from "fs"
import path from "path"
import type { UserRole } from "@/lib/auth"

export interface StoredUser {
  id: string
  role: UserRole
  email: string
  name: string
  passwordHash: string
  organizationId?: string
  phone?: string
  address?: string
  verified?: boolean
}

export interface InstallerOrganization {
  id: string
  name: string
  registrationNumber: string
  email: string
  phone: string
  address: string
  description: string
  verified: boolean
}

interface DatabaseSchema {
  users: StoredUser[]
  organizations: InstallerOrganization[]
}

export interface PublicUser extends Omit<StoredUser, "passwordHash"> {}

export class EmailConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "EmailConflictError"
  }
}

const dataDir = path.join(process.cwd(), "data")
const dbPath = path.join(dataDir, "db.json")
const scrypt = promisify(scryptCallback)

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

async function ensureDatabase() {
  try {
    await fs.access(dbPath)
    return
  } catch {}

  await fs.mkdir(dataDir, { recursive: true })

  const defaultPasswordHash = await hashPassword("password123")
  const installerOrgId = randomUUID()

  const seed: DatabaseSchema = {
    organizations: [
      {
        id: installerOrgId,
        name: "Solar Pro Ltd",
        registrationNumber: "REG-2024-001",
        email: "installer@demo.com",
        phone: "+94 11 234 5678",
        address: "123 Solar Street, Colombo",
        description: "Leading solar installation company with 10+ years experience",
        verified: true,
      },
    ],
    users: [
      {
        id: randomUUID(),
        role: "customer",
        email: "customer@demo.com",
        name: "John Customer",
        passwordHash: defaultPasswordHash,
        verified: true,
      },
      {
        id: randomUUID(),
        role: "installer",
        email: "installer@demo.com",
        name: "Solar Pro Ltd",
        passwordHash: defaultPasswordHash,
        organizationId: installerOrgId,
        verified: true,
      },
      {
        id: randomUUID(),
        role: "officer",
        email: "officer@demo.com",
        name: "CEB Officer",
        passwordHash: defaultPasswordHash,
        verified: true,
      },
    ],
  }

  await fs.writeFile(dbPath, JSON.stringify(seed, null, 2), "utf8")
}

async function readDatabase(): Promise<DatabaseSchema> {
  await ensureDatabase()
  const content = await fs.readFile(dbPath, "utf8")
  return JSON.parse(content) as DatabaseSchema
}

async function writeDatabase(data: DatabaseSchema) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), "utf8")
}

export async function findUserByEmail(email: string): Promise<StoredUser | undefined> {
  const db = await readDatabase()
  return db.users.find((user) => user.email === normalizeEmail(email))
}

export function toPublicUser(user: StoredUser): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user
  return publicUser
}

async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`
}

async function verifyPassword(password: string, storedHash: string) {
  const [saltHex, keyHex] = storedHash.split(":")
  if (!saltHex || !keyHex) return false

  const derivedKey = (await scrypt(password, Buffer.from(saltHex, "hex"), 64)) as Buffer
  return timingSafeEqual(Buffer.from(keyHex, "hex"), derivedKey)
}

export async function validateUserCredentials(
  email: string,
  password: string,
): Promise<PublicUser | null> {
  const user = await findUserByEmail(email)
  if (!user) return null

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) return null

  return toPublicUser(user)
}

export async function findUserById(id: string): Promise<StoredUser | undefined> {
  const db = await readDatabase()
  return db.users.find((user) => user.id === id)
}

export async function getPublicUserById(id: string): Promise<PublicUser | undefined> {
  const user = await findUserById(id)
  return user ? toPublicUser(user) : undefined
}

export async function createUserAccount({
  role,
  email,
  name,
  password,
  phone,
  address,
  organization,
  verified,
}: {
  role: UserRole
  email: string
  name: string
  password: string
  phone?: string
  address?: string
  organization?: Omit<InstallerOrganization, "id" | "verified"> & { verified?: boolean }
  verified?: boolean
}): Promise<{ user: PublicUser; organization?: InstallerOrganization }> {
  const db = await readDatabase()
  const normalizedEmail = normalizeEmail(email)

  if (db.users.some((existing) => existing.email === normalizedEmail)) {
    throw new EmailConflictError("A user with this email already exists.")
  }

  let organizationId: string | undefined
  let newOrganization: InstallerOrganization | undefined

  if (organization) {
    organizationId = randomUUID()
    newOrganization = {
      ...organization,
      id: organizationId,
      verified: organization.verified ?? false,
    }
    db.organizations.push(newOrganization)
  }

  const passwordHash = await hashPassword(password)
  const newUser: StoredUser = {
    id: randomUUID(),
    role,
    email: normalizedEmail,
    name,
    passwordHash,
    phone,
    address,
    organizationId,
    verified: role === "installer" ? false : verified ?? true,
  }

  db.users.push(newUser)
  await writeDatabase(db)

  return { user: toPublicUser(newUser), organization: newOrganization }
}
