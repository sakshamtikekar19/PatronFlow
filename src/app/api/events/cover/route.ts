import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRestaurantForUser } from "@/lib/queries/restaurant";

const COVER_BUCKET = "logos";
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
// Stay safely under Vercel's serverless request body limit (~4.5MB).
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const restaurant = await getRestaurantForUser();
    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("cover");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Image must be a PNG, JPG, or WEBP" },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image must be smaller than 4MB" },
        { status: 400 }
      );
    }

    // Service-role upload bypasses Storage RLS, so no storage policies needed.
    const admin = createAdminClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `events/${restaurant.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await admin.storage
      .from(COVER_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: true });
    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = admin.storage.from(COVER_BUCKET).getPublicUrl(path);

    return NextResponse.json({ coverUrl: publicUrl });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
