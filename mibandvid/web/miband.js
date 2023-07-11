const q = (query) => document.querySelector(query);

const logEl = q("#log");
const log = (string) => {
    console.log(string);

    if (typeof string === "string") {
        logEl.innerHTML += string + "\n";
    } else {
        logEl.innerHTML += JSON.stringify(string) + "\n";
    }
};

let debug = false;

const video = q("video");
const canvas = q("canvas");
canvas.width = 30;
canvas.height = 24
const ctx = canvas.getContext("2d");
const preview = q("#pv");
const fps = q("#fps");
const fileEl = q("#file");

fileEl.addEventListener("change", () => {
    video.src = URL.createObjectURL(fileEl.files[0]);
})

let frame;

const updateFrame = () => {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.fill();

  frame = ctx.getImageData(0, 0, canvas.width, canvas.height);

  window.fkek = frame;
};

const getPixel = (x, y) => {
  const r = frame.data[(frame.width * y + x) * 4];
  const g = frame.data[(frame.width * y + x) * 4 + 1];
  const b = frame.data[(frame.width * y + x) * 4 + 2];
  const a = frame.data[(frame.width * y + x) * 4 + 3];
  return r + b + g + a > 512;
};

const send = async (char, titile, icon) => {
    let str = `${titile}\0`;

    var buf = new ArrayBuffer(str.length + 4 + (canvas.height / 2) * (canvas.width / 5) * 3);
    var bufView = new Uint8Array(buf);

    let pos = 0;
    bufView[pos++] = -6; // WTF
    bufView[pos++] = 1;
    bufView[pos++] = icon;

    for (let i = 0; i < str.length; i++) {
        bufView[pos++] = str.charCodeAt(i);
    }

    let text = '';
     for (let x = 0; x < canvas.width; x+=5) {
        for (let y = canvas.height; y != 0 ; y-=2) {
            c = 0x2800
            if (getPixel(x + 0, y - 0)) c += 1 << 0;
            if (getPixel(x + 1, y - 0)) c += 1 << 1;
            if (getPixel(x + 2, y - 0)) c += 1 << 2;
            if (getPixel(x + 3, y - 0)) c += 1 << 6;
            if (getPixel(x + 0, y - 1)) c += 1 << 3;
            if (getPixel(x + 1, y - 1)) c += 1 << 4;
            if (getPixel(x + 2, y - 1)) c += 1 << 5;
            if (getPixel(x + 3, y - 1)) c += 1 << 7;

            text += String.fromCharCode(c);

            bufView[pos++] = 0xe2
            bufView[pos++] = 0x80 | (c >> 6);
            bufView[pos++] = 0x80 | (c & 0x3f);
        }
        text += `\n`;
    }
    
    preview.textContent = text;
    if (!debug) {
        await char.writeValue(bufView);
    } else {
        await new Promise((res) => setTimeout(res, 100));
    }
};

q("#connect").addEventListener("click", async () => {
    debug = q("#debug").checked;

    let characteristic;
    try {
        if (!debug) {
            log("Connecting..");
            const dev = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: [0x1811],
            });
            log(dev);
    
            dev.addEventListener("gattserverdisconnected", (...args) => {
                log("disconnect");
                log(args);
            });
    
            const gatt = await dev.gatt.connect();
            log("connected");
    
            const service = await gatt.getPrimaryService(0x1811);
            characteristic = await service.getCharacteristic(0x2a46);
        }


        await video.play();

        while (!video.ended) {
            const time = (new Date()).getTime();
            updateFrame();
            await send(characteristic, "ivanik7", 25);
            const delay = (new Date()).getTime() - time;
            fps.textContent = Math.round(1000 / delay);
        }


    } catch (error) {
        log(error.message);
    }
});