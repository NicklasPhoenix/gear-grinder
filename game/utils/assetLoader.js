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

            // Advanced Transparency Keying
            // Strategy: Sample background colors from corners and remove matching pixels
            // combined with a saturation check to preserve colorful sprites.

            // Helper to get color at index
            const getColor = (idx) => ({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
            const colorsMatch = (c1, c2, tol = 15) => Math.abs(c1.r - c2.r) <= tol && Math.abs(c1.g - c2.g) <= tol && Math.abs(c1.b - c2.b) <= tol;

            // Sample likely background colors (Top-Left, Top-Right)
            // Checkerboards usually alternate, so sampling (0,0) and (16,0) or (0,16) usually gets both.
            const bg1 = getColor(0);

            // Find a second background color by scanning the first row
            let bg2 = bg1;
            for (let x = 0; x < canvas.width; x++) {
                const idx = (x * 4);
                const c = getColor(idx);
                if (!colorsMatch(c, bg1)) {
                    bg2 = c;
                    break;
                }
            }

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Check Saturation
                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const delta = max - min;
                const saturation = max === 0 ? 0 : delta / max;

                // Check Brightness
                const brightness = (r + g + b) / 3;

                // Background criteria:
                // 1. Matches sampled BG colors OR
                // 2. Is very low saturation (grey/white) AND high brightness (not black outlines)
                const isBG1 = colorsMatch({ r, g, b }, bg1, 20);
                const isBG2 = colorsMatch({ r, g, b }, bg2, 20);

                // Allow some saturation wiggle room for compression entropy (0.15)
                // But ensure we don't delete dark grey outlines (Brightness > 50)
                const isNeutral = saturation < 0.15 && brightness > 80;

                if (isBG1 || isBG2 || isNeutral) {
                    data[i + 3] = 0;
                }
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL());
        };
        img.onerror = reject;
    });
}
