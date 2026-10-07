// Operasi tulis untuk panel admin. Keamanan dijaga RLS (hanya user di tabel admins).
import { supabase } from "@/lib/supabase";

export type Table = "alumni" | "projects" | "news" | "competitions" | "results" | "competition_images" | "sponsors" | "site_content" | "contact_messages";
export type Row = Record<string, unknown>;

function db() {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  return supabase;
}

export async function list(table: Table, order: string, ascending = true, filter?: [string, string]): Promise<Row[]> {
  let q = db().from(table).select("*").order(order, { ascending });
  if (filter) q = q.eq(filter[0], filter[1]);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function save(table: Table, row: Row, key = "id"): Promise<void> {
  const { [key]: id, ...rest } = row;
  const { error } = id
    ? await db().from(table).update(rest).eq(key, id as string)
    : await db().from(table).insert(rest);
  if (error) throw error;
}

// Insert satu baris dan kembalikan id-nya (mis. alumni/kompetisi baru dari form Hall of Fame).
export async function insertReturningId(table: Table, row: Row): Promise<string> {
  const { data, error } = await db().from(table).insert(row).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function remove(table: Table, id: string, key = "id"): Promise<void> {
  const { error } = await db().from(table).delete().eq(key, id);
  if (error) throw error;
}

export async function upsertContent(rows: { key: string; value_id: string; value_en: string }[]): Promise<void> {
  const { error } = await db().from("site_content").upsert(rows);
  if (error) throw error;
}

// Perkecil gambar di browser sebelum upload (maks 1600px, WebP) agar hemat kuota storage.
async function compress(file: File, maxSize = 1600): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/webp", 0.85));
}

export async function uploadFile(bucket: string, file: File, folder?: string): Promise<string> {
  const blob = await compress(file);
  // Gambar diganti nama acak; file unduhan tetap memakai nama aslinya (diberi prefiks unik).
  const name =
    blob.type === "image/webp"
      ? `${crypto.randomUUID()}.webp`
      : `${crypto.randomUUID().slice(0, 8)}-${file.name.replace(/[^\w.-]+/g, "_")}`;
  const path = folder ? `${folder}/${name}` : name;
  const { error } = await db().storage.from(bucket).upload(path, blob, { contentType: blob.type });
  if (error) throw error;
  return db().storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface UserRow {
  id: string;
  email: string;
  nama: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin: boolean;
  alumni_id: string | null;
  alumni_nama: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  instagram_url: string | null;
  foto_url: string | null;
  bio: string | null;
  pekerjaan: string | null;
  instansi: string | null;
}

// Semua akun terdaftar (khusus admin, lewat fungsi database admin_list_users).
export async function listUsers(): Promise<UserRow[]> {
  const { data, error } = await db().rpc("admin_list_users");
  if (error) throw error;
  return data as UserRow[];
}

export async function setAdmin(userId: string, makeAdmin: boolean): Promise<void> {
  const { error } = await db().rpc("admin_set_admin", { target: userId, make_admin: makeAdmin });
  if (error) throw error;
}

// Hubungkan akun ke alumni: ke alumni yang sudah ada, atau buat alumni baru dari data akun.
export async function linkUserToAlumni(user: UserRow, alumniId: string | null, allAlumni: Row[]): Promise<string> {
  const social = {
    linkedin_url: user.linkedin_url,
    github_url: user.github_url,
    instagram_url: user.instagram_url,
    foto_url: user.foto_url,
    bio_id: user.bio,
    pekerjaan: user.pekerjaan,
    instansi: user.instansi,
  };
  if (alumniId) {
    // Link sosial dari akun hanya mengisi yang masih kosong di data alumni.
    const current = allAlumni.find((a) => a.id === alumniId) ?? {};
    const fill = Object.fromEntries(Object.entries(social).filter(([k, v]) => v && !current[k]));
    const { error } = await db().from("alumni").update({ user_id: user.id, ...fill }).eq("id", alumniId);
    if (error) throw error;
    return alumniId;
  }
  const nama = user.nama || user.email.split("@")[0];
  return insertReturningId("alumni", { nama, slug: uniqueSlug(nama, allAlumni), user_id: user.id, ...social });
}

export async function unlinkUserFromAlumni(alumniId: string): Promise<void> {
  const { error } = await db().from("alumni").update({ user_id: null }).eq("id", alumniId);
  if (error) throw error;
}

// Slug unik: tambah -2, -3, ... bila sudah dipakai baris lain.
export function uniqueSlug(text: string, taken: Row[], selfId?: unknown): string {
  const base = slugify(text) || "item";
  const used = new Set(taken.filter((r) => r.id !== selfId).map((r) => String(r.slug)));
  let slug = base;
  for (let i = 2; used.has(slug); i++) slug = `${base}-${i}`;
  return slug;
}

export const uploadImage = uploadFile;
