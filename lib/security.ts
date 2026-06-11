import "server-only";

import { createHash, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export const ADMIN_COOKIE_NAME = "yas_admin_session";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function adminSessionToken() {
  return sha256(`${env.adminPassword}:${env.appSecret}:yas-pronostics-admin`);
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function hasAdminSession() {
  if (!env.adminPassword) return false;
  const value = cookies().get(ADMIN_COOKIE_NAME)?.value ?? "";
  return Boolean(value) && safeEqual(value, adminSessionToken());
}

export async function requireAdmin() {
  if (!hasAdminSession()) redirect("/admin/login");
  return { email: "admin-local" };
}

function toPrismaJson(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function audit(action: string, entity: string, entityId?: string, metadata?: unknown) {
  const h = headers();
  const forwarded = h.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const ipHash = sha256(`${ip}:${env.appSecret}`);

  await prisma.auditLog.create({
    data: {
      actorId: hasAdminSession() ? "admin" : undefined,
      action,
      entity,
      entityId,
      metadata: toPrismaJson(metadata),
      ipHash
    }
  });
}

export function sanitizePersonName(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 80);
}
