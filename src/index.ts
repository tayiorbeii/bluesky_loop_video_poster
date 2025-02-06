import { AtpAgent } from "@atproto/api";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";

// Load environment variables
dotenv.config();

const { BSKY_HANDLE, BSKY_PASSWORD, VIDEO_DIR } = process.env;

if (!BSKY_HANDLE || !BSKY_PASSWORD || !VIDEO_DIR) {
  console.error("Missing required environment variables");
  process.exit(1);
}

// Initialize the Bluesky agent
const agent = new AtpAgent({
  service: "https://bsky.social",
});

const POSTED_VIDEOS_FILE = "posted_videos.json";

interface PostedVideos {
  lastPosted: string;
  posted: string[];
}

async function loadPostedVideos(): Promise<PostedVideos> {
  try {
    const data = await fs.readFile(POSTED_VIDEOS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    // If file doesn't exist, return default structure
    return { lastPosted: "00000", posted: ["00000"] };
  }
}

async function savePostedVideos(data: PostedVideos): Promise<void> {
  await fs.writeFile(POSTED_VIDEOS_FILE, JSON.stringify(data, null, 2));
}

async function findNextVideo(): Promise<string | null> {
  // Load the posted videos data
  const postedVideos = await loadPostedVideos();

  // Calculate next number by incrementing the last posted number
  const lastNum = parseInt(postedVideos.lastPosted);
  const nextNum = (lastNum + 1).toString().padStart(5, "0");

  try {
    const files = await fs.readdir(VIDEO_DIR as string);
    const videoFile = files.find((file) => file.startsWith(nextNum));
    return videoFile ? path.join(VIDEO_DIR as string, videoFile) : null;
  } catch (error) {
    console.error("Error reading video directory:", error);
    return null;
  }
}

async function uploadVideo(
  filePath: string
): Promise<{ success: boolean; error?: unknown }> {
  try {
    const fileData = await fs.readFile(filePath);

    // First upload the video to get a blob reference
    const videoUpload = await agent.uploadBlob(fileData, {
      encoding: "video/mp4",
    });

    const videoNumber = path.basename(filePath).substring(0, 5);
    const postText = `loop${videoNumber}_ #samplethis`;

    // Create facet for hashtag
    const facets = [
      {
        index: {
          byteStart: postText.indexOf("#"),
          byteEnd: postText.length,
        },
        features: [
          {
            $type: "app.bsky.richtext.facet#tag",
            tag: "samplethis",
          },
        ],
      },
    ];

    await agent.post({
      text: postText,
      facets,
      embed: {
        $type: "app.bsky.embed.video",
        video: videoUpload.data.blob,
        alt: `loop${videoNumber}_`,
      },
    });

    // Update tracking file
    const postedVideos = await loadPostedVideos();
    postedVideos.lastPosted = videoNumber;
    postedVideos.posted.push(videoNumber);
    await savePostedVideos(postedVideos);

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

async function main() {
  try {
    // Attempt to login
    await agent.login({
      identifier: BSKY_HANDLE as string,
      password: BSKY_PASSWORD as string,
    });

    console.log("Successfully logged in to Bluesky!");
    console.log("Video directory configured as:", VIDEO_DIR);

    // Find and post the next video
    const nextVideoPath = await findNextVideo();
    if (!nextVideoPath) {
      console.log("No new videos found to post");
      return;
    }

    console.log("Attempting to post video:", nextVideoPath);
    const result = await uploadVideo(nextVideoPath);

    if (result.success) {
      console.log("Successfully posted video!");
    } else {
      console.error("Failed to post video:", result.error);
    }
  } catch (error) {
    console.error("Failed to login:", error);
    process.exit(1);
  }
}

main();
