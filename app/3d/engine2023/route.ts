import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export async function GET() {
    const pagePath = path.join(process.cwd(), "app", "php", "index.php");
    const source = await readFile(pagePath, "utf8");
    const html = source.replace("<head>", '<head>\n    <base href="/3d/engine2023/">');

    return new Response(html, {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
        },
    });
}