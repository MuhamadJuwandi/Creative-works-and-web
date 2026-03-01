const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const INPUT = path.join(__dirname, 'assets', 'logo_pesantren.jpg');
const ANDROID_RES = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

const ICON_SIZES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
};

// Foreground icons for adaptive icons (with padding for safe zone)
const FG_SIZES = {
    'mipmap-mdpi': 108,
    'mipmap-hdpi': 162,
    'mipmap-xhdpi': 216,
    'mipmap-xxhdpi': 324,
    'mipmap-xxxhdpi': 432,
};

async function generateAndroidIcons() {
    for (const [folder, size] of Object.entries(ICON_SIZES)) {
        const dir = path.join(ANDROID_RES, folder);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        // Standard launcher icon
        await sharp(INPUT)
            .resize(size, size)
            .png()
            .toFile(path.join(dir, 'ic_launcher.png'));

        // Round launcher icon
        await sharp(INPUT)
            .resize(size, size)
            .png()
            .toFile(path.join(dir, 'ic_launcher_round.png'));

        console.log(`✓ ${folder}: ${size}x${size}`);
    }

    // Generate foreground icons for adaptive icons
    for (const [folder, size] of Object.entries(FG_SIZES)) {
        const dir = path.join(ANDROID_RES, folder);

        // The foreground image with padding (logo centered in larger canvas)
        const logoSize = Math.round(size * 0.6); // Logo takes 60% of the canvas
        const foreground = await sharp(INPUT)
            .resize(logoSize, logoSize)
            .png()
            .toBuffer();

        await sharp({
            create: {
                width: size,
                height: size,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            }
        })
            .composite([{ input: foreground, gravity: 'centre' }])
            .png()
            .toFile(path.join(dir, 'ic_launcher_foreground.png'));

        console.log(`✓ ${folder} foreground: ${size}x${size}`);
    }

    console.log('All Android icons generated!');
}

generateAndroidIcons().catch(console.error);
