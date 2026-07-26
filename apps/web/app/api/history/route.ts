import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { UTApi } from "uploadthing/server";

function extractFileKey(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return null;
    return parts[parts.length - 1] ?? null;
  } catch {
    return url;
  }
}

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const images = await prisma.processedImage.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Failed to fetch image history:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const id = searchParams.get("id");
  const all = searchParams.get("all");

  const utapi = new UTApi();

  if (all === "true") {
    try {
      const userImages = await prisma.processedImage.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          sourceUrl: true,
          resultUrl: true,
        },
      });

      const keysToDelete: string[] = [];
      for (const img of userImages) {
        const sourceKey = extractFileKey(img.sourceUrl);
        if (sourceKey) keysToDelete.push(sourceKey);
        const resultKey = extractFileKey(img.resultUrl);
        if (resultKey) keysToDelete.push(resultKey);
      }

      if (keysToDelete.length > 0) {
        try {
          await utapi.deleteFiles(keysToDelete);
        } catch (utError) {
          console.error("Failed to delete files from UploadThing:", utError);
        }
      }

      await prisma.processedImage.deleteMany({
        where: {
          userId: session.user.id,
        },
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Failed to delete all image history items:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  if (!id) {
    return NextResponse.json(
      { error: "Image ID is required" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.processedImage.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const keysToDelete: string[] = [];
    const sourceKey = extractFileKey(existing.sourceUrl);
    if (sourceKey) keysToDelete.push(sourceKey);
    const resultKey = extractFileKey(existing.resultUrl);
    if (resultKey) keysToDelete.push(resultKey);

    if (keysToDelete.length > 0) {
      try {
        await utapi.deleteFiles(keysToDelete);
      } catch (utError) {
        console.error("Failed to delete files from UploadThing:", utError);
      }
    }

    await prisma.processedImage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete image history item:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
