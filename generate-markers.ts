import fs from "fs";
import { Jimp } from "jimp";

async function generateMarkers(
  imagePath: string,
  regionImagePath: string,
): Promise<void> {
  try {
    const image = await Jimp.read(imagePath);
    const regionImage = await Jimp.read(regionImagePath);
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const visited = new Array(width * height).fill(false);
    let greenPixelGroupCount = 0;
    const groupCenters: { x: number; y: number; region: string }[] = [];

    const regionColors: { [key: string]: string } = {
      "#BD978F": "Redsee",
      "#C1C1C1": "Sodic Waste",
      "#C1AE90": "Sarsee",
      "#C18160": "Badlands",
      "#657881": "Hakoa",
      "#C1B2AC": "The Wash",
      "#C18D4A": "Ewer",
    };

    function isGreenPixel(x: number, y: number): boolean {
      const idx = (y * width + x) * 4;
      const red = image.bitmap.data[idx + 0];
      const green = image.bitmap.data[idx + 1];
      const blue = image.bitmap.data[idx + 2];
      return red === 0 && green === 255 && blue === 0;
    }

    function getRegion(x: number, y: number): string {
      const idx = (y * width + x) * 4;
      const red = regionImage.bitmap.data[idx + 0]
        .toString(16)
        .padStart(2, "0")
        .toUpperCase();
      const green = regionImage.bitmap.data[idx + 1]
        .toString(16)
        .padStart(2, "0")
        .toUpperCase();
      const blue = regionImage.bitmap.data[idx + 2]
        .toString(16)
        .padStart(2, "0")
        .toUpperCase();
      const colorKey = `#${red}${green}${blue}`;
      return regionColors[colorKey] || "Unknown";
    }

    function floodFill(x: number, y: number): { x: number; y: number }[] {
      const stack = [[x, y]];
      const pixels: { x: number; y: number }[] = [];
      while (stack.length > 0) {
        const [cx, cy] = stack.pop()!;
        const idx = cy * width + cx;
        if (
          cx >= 0 &&
          cx < width &&
          cy >= 0 &&
          cy < height &&
          !visited[idx] &&
          isGreenPixel(cx, cy)
        ) {
          visited[idx] = true;
          pixels.push({ x: cx, y: cy });
          stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
        }
      }
      return pixels;
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (!visited[idx] && isGreenPixel(x, y)) {
          greenPixelGroupCount++;
          const groupPixels = floodFill(x, y);
          const centerX = Math.round(
            groupPixels.reduce((sum, p) => sum + p.x, 0) / groupPixels.length,
          );
          const centerY = Math.round(
            groupPixels.reduce((sum, p) => sum + p.y, 0) / groupPixels.length,
          );
          const region = getRegion(centerX, centerY);
          groupCenters.push({ x: centerX, y: centerY, region });
        }
      }
    }

    console.log(
      `Number of green pixel groups (RGB 0, 255, 0): ${greenPixelGroupCount}`,
    );
    fs.writeFileSync("docs/chums.json", JSON.stringify(groupCenters, null, 2));
  } catch (error) {
    console.error("Error processing the image:", error);
  }
}

generateMarkers("Sable-Chum-Map-Processing.png", "Sable-Chum-Map-regions.png");
