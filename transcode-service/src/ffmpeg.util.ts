import { exec } from 'child_process';
import { promisify } from 'util';

const executeCommand = promisify(exec);

export async function transcodeToResolution(
  input: string,
  outputDir: string,
  res: string,
) {
  const height = parseInt(res.slice(0, -1), 10);
  const outputPath = `${outputDir}/video.mp4`;
  const playlistPath = `${outputDir}/playlist.m3u8`;

  const mp4Cmd = `ffmpeg -y -i "${input}" -vf "scale=-2:${height}" -c:a copy "${outputPath}"`;
  const hlsCmd = `ffmpeg -y -i "${input}" -vf "scale=-2:${height}" -c:v libx264 -crf 23 -preset veryfast -c:a aac -b:a 128k -f hls -hls_time 4 -hls_playlist_type vod -hls_segment_filename "${outputDir}/index%d.ts" "${playlistPath}"`;

  await executeCommand(mp4Cmd);
  await executeCommand(hlsCmd);
}
