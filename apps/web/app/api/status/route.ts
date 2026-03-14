import { NextResponse } from "next/server";
import { redis, PREFIX } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
  }

  try {
    const key = `${PREFIX}:job_status:${jobId}`;
    console.log(`[Status] Checking job status for key: ${key}`);

    const statusData = await redis.hGetAll(key);

    console.log(`[Status] Found data:`, statusData);

    if (Object.keys(statusData).length === 0) {
      console.log(`[Status] Job not found: ${jobId}`);
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (statusData.userId !== session.user.id) {
      console.log(`[Status] Unauthorized access to job: ${jobId} by user: ${session.user.id}`);
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(statusData, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch job status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
