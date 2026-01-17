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

            const isLight = (r, g, b) => r > 240 && g > 240 && b > 240;
            const isGrey = (r, g, b) => r > 190 && r < 215 && g > 190 && g < 215 && b > 190 && b < 215 && Math.abs(r - g) < 5;

            // Also very dark grey checkerboard sometimes?
            // Based on user screenshot, it looks like standard white/grey pattern.

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                if (isLight(r, g, b) || isGrey(r, g, b)) {
                    data[i + 3] = 0; // Alpha 0
                }
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL());
        };
        img.onerror = reject;
    });
}
