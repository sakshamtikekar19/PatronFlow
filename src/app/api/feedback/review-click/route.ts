import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const schema = z.object({
  feedbackId: z.string().uuid(),
});

/**
 * Records that a guest clicked through to leave a Google review.
 * Called from the public review page (no auth) so it uses the admin client.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("feedback")
      .update({ review_clicked: true })
      .eq("id", parsed.data.feedbackId);

    if (error) {
      return NextResponse.json({ success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
