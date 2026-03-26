import { NextResponse } from "next/server";
import { getMediaCatalog } from "@/lib/media-files";
import { getStuffRoot } from "@/lib/media-config";

export async function GET() {
  try {
    const catalog = await getMediaCatalog();
    return NextResponse.json({
      stuffRoot: getStuffRoot(),
      ...catalog,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to read media catalog",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
