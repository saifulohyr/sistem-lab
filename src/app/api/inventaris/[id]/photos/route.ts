import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";

// POST /api/inventaris/[id]/photos - Upload photo for inventory item
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify inventory exists
    const inventory = await prisma.inventory.findUnique({
      where: { id },
      select: { id: true, code: true, name: true },
    });

    if (!inventory) {
      return NextResponse.json(
        { error: "Inventaris tidak ditemukan" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const label = (formData.get("label") as string) || "Foto Barang";

    if (!file) {
      return NextResponse.json(
        { error: "File foto wajib diunggah" },
        { status: 400 }
      );
    }

    // Validate mime type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File harus berupa gambar (JPG, PNG, WebP)" },
        { status: 400 }
      );
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 10MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate safe unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;
    const storagePath = `inventaris/${id}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Gagal mengunggah foto ke storage: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // Save record to DB
    const photo = await prisma.inventoryPhoto.create({
      data: {
        inventoryId: id,
        url: publicUrl,
        label: label.trim(),
      },
    });

    // Record audit history
    await prisma.inventoryHistory.create({
      data: {
        inventoryId: id,
        action: "UPDATE",
        description: `Menambahkan foto: ${label} (${file.name})`,
        userId: session.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: photo,
    });
  } catch (error) {
    console.error("Error in photo upload route:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses foto" },
      { status: 500 }
    );
  }
}

// DELETE /api/inventaris/[id]/photos - Delete photo
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "TOOLMAN")) {
      return NextResponse.json(
        { error: "Hanya Admin dan Toolman yang dapat menghapus foto" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get("photoId");

    if (!photoId) {
      return NextResponse.json(
        { error: "Parameter photoId wajib disertakan" },
        { status: 400 }
      );
    }

    const photo = await prisma.inventoryPhoto.findUnique({
      where: { id: photoId },
    });

    if (!photo || photo.inventoryId !== id) {
      return NextResponse.json(
        { error: "Foto tidak ditemukan" },
        { status: 404 }
      );
    }

    // Try to extract storage path from public URL and delete from storage
    try {
      // URL format: https://.../storage/v1/object/public/{bucket}/{storagePath}
      const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
      if (photo.url.includes(marker)) {
        const filePath = photo.url.split(marker)[1];
        if (filePath) {
          await supabase.storage.from(STORAGE_BUCKET).remove([decodeURIComponent(filePath)]);
        }
      }
    } catch (storageErr) {
      console.warn("Storage deletion non-fatal error:", storageErr);
    }

    // Delete DB record
    await prisma.inventoryPhoto.delete({
      where: { id: photoId },
    });

    // Record audit history
    await prisma.inventoryHistory.create({
      data: {
        inventoryId: id,
        action: "UPDATE",
        description: `Menghapus foto: ${photo.label || "Foto inventaris"}`,
        userId: session.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Gagal menghapus foto inventaris" },
      { status: 500 }
    );
  }
}
