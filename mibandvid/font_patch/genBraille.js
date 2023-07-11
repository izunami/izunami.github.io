const { createCanvas } = require('canvas');
const fs = require('fs');
const bmp = require("bmp-js");

(async () => {
    for (let i = 0; i < 256; i++) {
        const canvas = createCanvas(24, 24);
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = "#00000000";
        ctx.fillRect(0, 0, 24, 24);
        ctx.fillStyle = "#FFFFFF";
        
        if (i & (1 << 0)) ctx.fillRect(0, 0, 5, 5);
        if (i & (1 << 1)) ctx.fillRect(0, 5, 5, 5);
        if (i & (1 << 2)) ctx.fillRect(0, 10, 5, 5);
        if (i & (1 << 3)) ctx.fillRect(5, 0, 5, 5);
        if (i & (1 << 4)) ctx.fillRect(5, 5, 5, 5);
        if (i & (1 << 5)) ctx.fillRect(5, 10, 5, 5);
        if (i & (1 << 6)) ctx.fillRect(0, 15, 5, 5);
        if (i & (1 << 7)) ctx.fillRect(5, 15, 5, 5);

        const buf = canvas.toBuffer('raw');
        fs.writeFileSync(`braille/28${i.toString(16).padStart(2, '0')}.bmp`, bmp.encode({data: buf, width: 24, height: 24}).data);

        // const stream = canvas.createPNGStream()
        // const out = fs.createWriteStream(`braille/28${i.toString(16)}12.png`);
        // stream.pipe(out);

        // await new Promise((res) => {
        //     out.on('finish', () => {
        //         res();
        //     })
        // });
    }
})();
