const { Jimp } = require('jimp');

async function removeWhiteBg() {
  try {
    const inputPath = 'd:/projects/Web-Development/BrainTox/braintox-extension/icons/icon128.png';
    const outputPath = 'd:/projects/Web-Development/BrainTox/braintox-fe/public/logo.png';
    
    // Read the image
    const image = await Jimp.read(inputPath);
    
    // We treat anything that is very close to white as the background
    // and feather it slightly for anti-aliasing.
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      // Calculate how close a pixel is to pure white
      // Average brightness (0-255)
      const brightness = (r + g + b) / 3;
      
      // If the pixel is very light (e.g. background)
      if (brightness > 230 && Math.abs(r - g) < 15 && Math.abs(b - g) < 15) {
        // Soft feathering for edges
        // 255 -> alpha 0
        // 230 -> alpha 255
        let alpha = 255 - ((brightness - 230) / 25) * 255;
        this.bitmap.data[idx + 3] = Math.max(0, Math.min(255, alpha));
      }
    });

    await image.writeAsync(outputPath);
    console.log("Successfully removed white background!");
  } catch (error) {
    console.error("Error processing image:", error);
  }
}

removeWhiteBg();
