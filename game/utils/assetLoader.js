export async function loadAndProcessImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Checkerboard colors to remove
            // Usually #ffffff (255,255,255) and #cccccc (204,204,204)
            // or #666666 sometimes.
            // Responsive matching with tolerance.

            // Aggressive Checkerboard Removal
            // Detect neutral colors (R=G=B) common in checkerboards
            // Background is usually White (255) and Light Grey (~204 or ~192)

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Check for neutrality (Greyscale)
                // Allow small variance for compression artifacts (though PNG should be clean)
                const isNeutral = Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15;

                if (isNeutral) {
                    // Remove White-ish
                    if (r > 240) { // > 240 is almost certainly background white
                        data[i + 3] = 0;
                    }
                    // Remove Light Grey Checkerboard (Usually around 204/0xCC or 192/0xC0)
                    else if (r > 160 && r < 225) {
                        data[i + 3] = 0;
                    }
                    // Remove any other specific hardcoded checker colors if needed
                    // e.g. dark grey 128
                }
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL());
        };
        img.onerror = reject;
    });
}
