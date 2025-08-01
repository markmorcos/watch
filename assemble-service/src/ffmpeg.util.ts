import { exec } from 'child_process';
import { promisify } from 'util';

const executeCommand = promisify(exec);

export function transcodeToResolution(
  input: string,
  outputDir: string,
  res: string,
) {
  const height = parseInt(res.slice(0, -1), 10);
  const cmd = `ffmpeg -i ${input} -vf "scale=-2:${height}" -c:a copy ${outputDir}/video.mp4`;
  const stream = `ffmpeg -i ${input} -vf "scale=-2:${height}" -c:v libx264 -crf 23 -preset veryfast -c:a aac -b:a 128k -f hls -hls_time 4 -hls_playlist_type vod -hls_segment_filename ${outputDir}/index%d.ts ${outputDir}/playlist.m3u8`;

  return Promise.all([executeCommand(cmd), executeCommand(stream)]);
}
