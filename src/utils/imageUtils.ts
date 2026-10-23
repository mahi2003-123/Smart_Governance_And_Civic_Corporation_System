export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

/**
 * Validates image type and size, and resizes large images before sending.
 * - Allowed types: image/jpeg, image/png, image/webp
 * - Max decoded size: 2 MB
 * - Resizes dimensions exceeding maxDimension (default 1600px) maintaining aspect ratio
 */
export const validateAndResizeImage = (
  file: File,
  maxDimension = 1600,
  maxBytes = MAX_IMAGE_SIZE_BYTES,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 1. Strict MIME type validation
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return reject(new Error('Invalid format: Only JPEG, PNG, and WebP images are allowed.'));
    }

    // 2. Initial file size guard
    if (file.size > maxBytes * 4) {
      return reject(new Error('File is too large. Maximum allowed size is 2 MB.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) return reject(new Error('Failed to read image content.'));

      const img = new Image();
      img.onerror = () => reject(new Error('Invalid or corrupted image content.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Resize proportionally if exceeding maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not process image on canvas.'));
        }

        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === 'image/png' ? 'image/png' : (file.type === 'image/webp' ? 'image/webp' : 'image/jpeg');
        let resizedDataUrl = canvas.toDataURL(mimeType, 0.85);

        // Check decoded size in bytes
        const base64Data = resizedDataUrl.split(',')[1] || '';
        const decodedBytes = Math.round((base64Data.length * 3) / 4);

        if (decodedBytes > maxBytes) {
          // If still over 2MB, try with higher compression
          resizedDataUrl = canvas.toDataURL('image/jpeg', 0.65);
          const compressedBytes = Math.round(((resizedDataUrl.split(',')[1] || '').length * 3) / 4);
          if (compressedBytes > maxBytes) {
            return reject(new Error('Processed image exceeds maximum allowed size of 2 MB.'));
          }
        }

        resolve(resizedDataUrl);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
};
