import { Jimp } from "jimp";

async function countGreenPixelGroups(imagePath: string): Promise<void> {
  try {
    const image = await Jimp.read(imagePath);
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const visited = new Array(width * height).fill(false);
    let greenPixelGroupCount = 0;

    function isGreenPixel(x: number, y: number): boolean {
      const idx = (y * width + x) * 4;
      const red = image.bitmap.data[idx + 0];
      const green = image.bitmap.data[idx + 1];
      const blue = image.bitmap.data[idx + 2];
      return red === 0 && green === 255 && blue === 0;
    }

    function floodFill(x: number, y: number): void {
      const stack = [[x, y]];
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
          stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
        }
      }
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (!visited[idx] && isGreenPixel(x, y)) {
          greenPixelGroupCount++;
          floodFill(x, y);
        }
      }
    }

    console.log(
      `Number of green pixel groups (RGB 0, 255, 0): ${greenPixelGroupCount}`,
    );
  } catch (error) {
    console.error("Error processing the image:", error);
  }
}

countGreenPixelGroups("Sable-Chum-Map.png");
