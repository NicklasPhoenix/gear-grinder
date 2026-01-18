// Process character sprites - remove checkerboard background
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

            // Sample background colors from corners
            const getColor = (idx) => ({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
            const colorsMatch = (c1, c2, tol = 10) =>
                Math.abs(c1.r - c2.r) <= tol &&
                Math.abs(c1.g - c2.g) <= tol &&
                Math.abs(c1.b - c2.b) <= tol;

            // Sample background from corners
            const bg1 = getColor(0);
            let bg2 = bg1;

            // Find second checkerboard color
            for (let x = 0; x < Math.min(32, canvas.width); x++) {
                const c = getColor(x * 4);
                if (!colorsMatch(c, bg1, 5)) {
                    bg2 = c;
                    break;
                }
            }

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Only remove exact background matches - be conservative
                const isBG1 = colorsMatch({ r, g, b }, bg1, 8);
                const isBG2 = colorsMatch({ r, g, b }, bg2, 8);

                if (isBG1 || isBG2) {
                    data[i + 3] = 0;
                }
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL());
        };
        img.onerror = reject;
    });
}

// Process item sprites - much gentler, only remove exact checkerboard
export async function loadAndProcessItemImage(url) {
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

            // Sample the corner pixel as primary background
            const bg1 = { r: data[0], g: data[1], b: data[2] };

            // Find second checkerboard color from first row
            let bg2 = bg1;
            for (let x = 1; x < Math.min(20, canvas.width); x++) {
                const idx = x * 4;
                const c = { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
                const diff = Math.abs(c.r - bg1.r) + Math.abs(c.g - bg1.g) + Math.abs(c.b - bg1.b);
                if (diff > 5 && diff < 80) {
                    bg2 = c;
                    break;
                }
            }

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Very strict - only exact background colors (tolerance of 3)
                const matchesBG1 = Math.abs(r - bg1.r) <= 3 && Math.abs(g - bg1.g) <= 3 && Math.abs(b - bg1.b) <= 3;
                const matchesBG2 = Math.abs(r - bg2.r) <= 3 && Math.abs(g - bg2.g) <= 3 && Math.abs(b - bg2.b) <= 3;

                if (matchesBG1 || matchesBG2) {
                    data[i + 3] = 0;
                }
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL());
        };
        img.onerror = reject;
    });
}
