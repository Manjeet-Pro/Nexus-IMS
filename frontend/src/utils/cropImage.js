export const createImage = (url) => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        // Only set crossOrigin if not a data URL to avoid some browser issues
        if (!url.startsWith('data:')) {
            image.setAttribute('crossOrigin', 'anonymous');
        }
        image.src = url;
    });
};

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 * @param {File} image - Image File Object
 * @param {Object} pixelCrop - pixelCrop Object
 * @param {number} maxDimension - Maximum width/height of the output image (default 1024px)
 */
export default async function getCroppedImg(imageSrc, pixelCrop, maxDimension = 800) {
    const image = await createImage(imageSrc);

    // If no crop is provided (Skip), use the full image
    if (!pixelCrop) {
        pixelCrop = {
            x: 0,
            y: 0,
            width: image.naturalWidth,
            height: image.naturalHeight,
        };
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return null;
    }

    // Determine target size (scale down if necessary)
    let targetWidth = pixelCrop.width;
    let targetHeight = pixelCrop.height;

    // Aspect ratio of the crop
    const aspect = targetWidth / targetHeight;

    if (targetWidth > maxDimension || targetHeight > maxDimension) {
        if (targetWidth > targetHeight) {
            targetWidth = maxDimension;
            targetHeight = Math.round(maxDimension / aspect);
        } else {
            targetHeight = maxDimension;
            targetWidth = Math.round(maxDimension * aspect);
        }
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Draw the cropped image onto the canvas, resizing it in the process
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        targetWidth,
        targetHeight
    );

    // Compression Loop
    return new Promise((resolve) => {
        let quality = 0.9;

        const tryCompress = (q) => {
            const dataUrl = canvas.toDataURL('image/jpeg', q);
            // Check rough size (base64 length * 0.75 is approx byte size)
            // limit to ~200KB to be safe for backend
            const sizeInBytes = dataUrl.length * 0.75;

            if (sizeInBytes > 200 * 1024 && q > 0.3) {
                console.log("Image size too large:", Math.round(sizeInBytes / 1024) + "KB", "Reducing quality to:", (q - 0.1).toFixed(1));
                tryCompress(q - 0.1);
            } else {
                console.log("Final Image Size:", Math.round(sizeInBytes / 1024) + "KB", "Quality:", q.toFixed(1));
                resolve(dataUrl);
            }
        }

        tryCompress(quality);
    });
}
