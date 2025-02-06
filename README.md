# Bluesky Video Poster

This bot posts videos sequentially from a designated video directory to Bluesky.

## Requirements

- A Bluesky account (use an App Password for authentication).
- Node.js (v18.16.0 or later).

## Setup

1. **Clone the repository:**
    ```sh
    git clone git@github.com:tayiorbeii/bluesky_loop_video_poster.git
    cd bluesky_loop_video_poster
    ```

2. **Install dependencies:**
    ```sh
    pnpm install
    ```

3. **Configure environment variables:**
    - Copy `.env.example` to `.env`:
      ```sh
      cp .env.example .env
      ```
    - In `.env`, set the following:
      - `BSKY_HANDLE`: Your Bluesky handle.
      - `BSKY_PASSWORD`: Your Bluesky app password.
      - `VIDEO_DIR`: The path to your video files directory.

## Video File Naming Convention

The bot manages posted videos using the `posted_videos.json` file. Each video file should start with a five-digit number representing its posting order (e.g., `00001_video.mp4`). The bot automatically finds the next video based on this sequential numbering.

## Running the Bot Locally

1. **Build the project (optional):**
    ```sh
    pnpm run build
    ```

2. **Run the bot:**
    ```sh
    pnpm run dev
    ```

If successful, you should see terminal logs:

- `Successfully logged in to Bluesky!`
- `Video directory configured as: <VIDEO_DIR>`
- `Attempting to post video: <video_path>`
- `Successfully posted video!`

## How It Works

- The script logs in to Bluesky using the provided credentials.
- It checks the specified video directory for the next video file based on a five-digit sequential naming convention.
- Once found, the bot uploads the video along with a text caption in the format `loopXXXX_ #samplethis`, where `XXXX` is derived from the video file name.
- After a successful post, the bot updates `posted_videos.json` to track which videos have been posted.

## Running the script

### On a schedule using a cron job

1.  Open a terminal window
2.  Type `crontab -e` and hit enter
3.  If prompted, select an editor
4.  Paste the following into the file:

    ```
    */15 * * * * /bin/zsh -c 'if pgrep -x "loginwindow" > /dev/null; then cd /absolute/path/to/bluesky_loop_video_poster && /path/to/your/pnpm start; fi'
    ```

    replacing `/absolute/path/to/bluesky_loop_video_poster` with the absolute path to the `bluesky_loop_video_poster` directory and `/path/to/your/pnpm` with the absolute path to your `pnpm` executable. You can get the absolute path to `pnpm` by running `which pnpm`.
5.  Save the file and exit the editor. On `nano` you can do this by typing `ctrl + x`, then `y`, then `enter`.

This will run the script every 15 minutes that the computer is awake. The `if pgrep -x "loginwindow" > /dev/null` part ensures that the script only runs when the user is logged in.