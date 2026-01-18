// Remove checkerboard transparency background from sprites
// Common checkerboard patterns use specific gray values

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

            // Common checkerboard colors (light and dark squares)
            // These are typical values used in image editors like Photoshop, GIMP, Aseprite
            const checkerboardColors = [
                { r: 204, g: 204, b: 204 },  // Light gray
                { r: 153, g: 153, b: 153 },  // Dark gray
                { r: 192, g: 192, b: 192 },  // Silver
                { r: 128, g: 128, b: 128 },  // Gray
                { r: 255, g: 255, b: 255 },  // White
                { r: 238, g: 238, b: 238 },  // Light
                { r: 221, g: 221, b: 221 },  // Another light
                { r: 170, g: 170, b: 170 },  // Medium gray
                { r: 185, g: 185, b: 185 },  // Another medium
                { r: 200, g: 200, b: 200 },  // Light medium
            ];

            const isCheckerboard = (r, g, b) => {
                // Must be a gray (r ≈ g ≈ b) with high brightness
                const isGray = Math.abs(r - g) <= 5 && Math.abs(g - b) <= 5 && Math.abs(r - b) <= 5;
                const brightness = (r + g + b) / 3;

                // Gray pixels with brightness > 120 are likely checkerboard
                if (isGray && brightness > 120) {
                    return true;
                }

                // Also check against known checkerboard colors
                for (const c of checkerboardColors) {
                    if (Math.abs(r - c.r) <= 15 && Math.abs(g - c.g) <= 15 && Math.abs(b - c.b) <= 15) {
                        return true;
                    }
                }
                return false;
            };

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                if (isCheckerboard(r, g, b)) {
                    data[i + 3] = 0; // Make transparent
                }
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL());
        };
        img.onerror = reject;
    });
}

// Same function for items - uses identical logic
export async function loadAndProcessItemImage(url) {
    return loadAndProcessImage(url);
}
