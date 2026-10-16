/**
 * Client-Side Image Optimizer
 * Compresses images to WebP format using HTML5 Canvas, stripping EXIF for privacy
 * and reducing size by up to 80% with zero server cost.
 */

export async function optimizeImage(fileOrDataUrl, maxWidth = 1280, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let { width, height } = img;

      // Maintain aspect ratio while scaling down
      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      // High-quality downsampling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Export as WebP
      const webpDataUrl = canvas.toDataURL('image/webp', quality);
      
      // Calculate sizes
      const base64Clean = webpDataUrl.split(',')[1];
      const approxBytes = Math.round((base64Clean.length * 3) / 4);

      resolve({
        dataUrl: webpDataUrl,
        base64: base64Clean,
        mimeType: 'image/webp',
        width,
        height,
        sizeKb: Math.round(approxBytes / 1024),
      });
    };

    img.onerror = (err) => reject(new Error('Failed to load image for optimization: ' + err));

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else if (fileOrDataUrl instanceof Blob || fileOrDataUrl instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    } else {
      reject(new Error('Unsupported image input type'));
    }
  });
}
