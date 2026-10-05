import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const contentTypes: Record<string, string> = {
    ".css": "text/css; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
};

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ asset: string[] }> },
) {
    const { asset } = await params;
    const assetRoot = path.resolve(process.cwd(), "app", "php");
    const assetPath = path.resolve(assetRoot, ...asset);
    const relativePath = path.relative(assetRoot, assetPath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        return new Response("Not found", { status: 404 });
    }

    try {
        const contents = await readFile(assetPath);
        const contentType = contentTypes[path.extname(assetPath).toLowerCase()] ?? "application/octet-stream";

        return new Response(contents, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch {
        return new Response("Not found", { status: 404 });
    }
}