import express from "express";
import multer from "multer";
import { exec } from "child_process";
import fs from "fs";
const app = express();
const upload = multer({ dest: "/tmp" });

app.use(express.json());

app.post("/thumbnail", async (req, res) => {
  const { videoUrl, timestamp = 5, format = "jpg" } = req.body;

  const videoPath = `/tmp/video-${Date.now()}.mp4`;
  const outputPath = `${videoPath}.${format}`;

  // Download video
  const response = await fetch(videoUrl);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(videoPath, Buffer.from(buffer));

  const cmd = `ffmpeg -ss ${timestamp} -i "${videoPath}" -vframes 1 -vf "format=yuvj420p" "${outputPath}" -y`;

  exec(cmd, (err) => {
    if (err) return res.status(500).send("FFmpeg failed");

    const img = fs.readFileSync(outputPath);
    const base64 = img.toString("base64");

    res.json({
      thumbnail: `data:image/jpeg;base64,${base64}`,
    });

    fs.unlinkSync(videoPath);
    fs.unlinkSync(outputPath);
  });
});



app.get("/", (req, res) => {
  res.send("FFmpeg server running");
});

app.listen(3000, () => console.log("Server running on port 3000"));