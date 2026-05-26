/**
 * Client-side image compression utility using HTML5 Canvas.
 * Downscales and recompresses images to reduce upload payloads by up to 90%
 * while preserving enough detail for AI Vision models (like GPT-4o).
 */
export const compressImage = (base64Str: string, maxDim = 1024, quality = 0.75): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If the image is not a base64/data URI or canvas is not supported, return original
    if (!base64Str || !base64Str.startsWith('data:image/')) {
      return resolve(base64Str);
    }

    const img = new Image();
    img.src = base64Str;
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Scale dimensions maintaining aspect ratio
      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(base64Str); // Fallback to original on failure
      }

      // Draw the image scaled down on canvas
      ctx.drawImage(img, 0, 0, width, height);

      try {
        // Compress as JPEG
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      } catch (e) {
        console.error('Failed to compress canvas:', e);
        resolve(base64Str); // Fallback to original
      }
    };

    img.onerror = (err) => {
      console.error('Image loading failed for compression:', err);
      reject(err);
    };
  });
};

export default compressImage;
