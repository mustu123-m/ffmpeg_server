import express from "express";
import multer from "multer";
import { exec } from "child_process";
import fs from "fs";

const app = express();
const upload = multer({ dest: "/tmp" });

app.post("/thumbnail", upload.single("video"), (req, res) => {
  const videoPath = req.file.path;
  const outputPath = `${videoPath}.jpg`;

  const cmd = `ffmpeg -ss 5 -i ${videoPath} -vframes 1 -vf "format=yuvj420p" ${outputPath} -y`;

  exec(cmd, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("FFmpeg failed");
    }

    const img = fs.readFileSync(outputPath);
    res.setHeader("Content-Type", "image/jpeg");
    res.send(img);

    // cleanup
    fs.unlinkSync(videoPath);
    fs.unlinkSync(outputPath);
  });
});

app.get("/", (req, res) => {
  res.send("FFmpeg server running");
});

app.listen(3000, () => console.log("Server running on port 3000"));