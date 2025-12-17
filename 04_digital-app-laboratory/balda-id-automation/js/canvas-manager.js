class CanvasManager {
    constructor(canvasId) {
        this.canvas = new fabric.Canvas(canvasId, {
            width: 638, // 53.98mm @ 300dpi
            height: 1011, // 85.60mm @ 300dpi
            backgroundColor: '#ffffff',
            preserveObjectStacking: true
        });

        // Add ID Card Overlay/Border guide? 
        // For now just white background.

        this.initEvents();
    }

    initEvents() {
        this.canvas.on('selection:created', (e) => this.onSelectionChange(e));
        this.canvas.on('selection:updated', (e) => this.onSelectionChange(e));
        this.canvas.on('selection:cleared', () => this.onSelectionChange(null));

        // Key events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                // Check if not editing text
                if (this.canvas.getActiveObject() && !this.canvas.getActiveObject().isEditing) {
                    this.deleteActiveObject();
                }
            }
        });
    }

    onSelectionChange(e) {
        const event = new CustomEvent('canvas:selection', {
            detail: e ? e.selected[0] : null
        });
        document.dispatchEvent(event);
    }

    addText(text = 'New Text') {
        const iText = new fabric.IText(text, {
            left: 100,
            top: 100,
            fontFamily: 'Outfit',
            fontSize: 40,
            fill: '#000000'
        });
        this.canvas.add(iText);
        this.canvas.setActiveObject(iText);
    }

    addImage(file) {
        const reader = new FileReader();
        reader.onload = (f) => {
            fabric.Image.fromURL(f.target.result, (img) => {
                img.scaleToWidth(200);
                this.canvas.add(img);
                this.canvas.setActiveObject(img);
                this.canvas.renderAll();
            });
        };
        reader.readAsDataURL(file);
    }

    addQR(text = '123456') {
        // Generate QR on a hidden div then create image
        const div = document.createElement('div');
        new QRCode(div, {
            text: text,
            width: 256,
            height: 256
        });

        // QRCode.js implementation is async regarding the image loading inside it sometimes, 
        // but usually it creates a canvas or img immediately.
        // Let's grab the data URL.
        setTimeout(() => {
            const imgEl = div.querySelector('img');
            const canvasEl = div.querySelector('canvas');
            let dataUrl = '';

            if (canvasEl) {
                dataUrl = canvasEl.toDataURL();
            } else if (imgEl) {
                dataUrl = imgEl.src;
            }

            if (dataUrl) {
                fabric.Image.fromURL(dataUrl, (img) => {
                    img.set({ left: 100, top: 100 });
                    img.scaleToWidth(150);
                    // Add custom property to identify as QR
                    img.set('isQRCode', true);
                    img.set('qrContent', text);
                    this.canvas.add(img);
                    this.canvas.setActiveObject(img);
                });
            }
        }, 100);
    }

    deleteActiveObject() {
        const active = this.canvas.getActiveObject();
        if (active) {
            this.canvas.remove(active);
            this.canvas.discardActiveObject();
            this.canvas.renderAll();
        }
    }

    updateActiveObject(prop, value) {
        const active = this.canvas.getActiveObject();
        if (active) {
            if (prop === 'text' && active.type === 'i-text') {
                active.set('text', value);
            } else if (prop === 'qrContent' && active.isQRCode) {
                // Regenerate QR
                active.set('qrContent', value);
                // We need to re-generate the image texture... 
                // For MVP, maybe just storing the property is enough for the "Merge" step, 
                // but visual update in canvas requires removing and re-adding or complex swap.
                // Let's unimplemented visual update for QR content in editor for now, 
                // just update the property so data merge knows what to use.
            } else {
                active.set(prop, value);
            }
            this.canvas.requestRenderAll();
        }
    }

    clear() {
        this.canvas.clear();
        this.canvas.setBackgroundColor('#ffffff', this.canvas.renderAll.bind(this.canvas));
    }

    resize(width, height) {
        this.canvas.setWidth(width);
        this.canvas.setHeight(height);
        this.canvas.renderAll();
    }

    setBackgroundColor(color) {
        this.canvas.setBackgroundColor(color, this.canvas.renderAll.bind(this.canvas));
    }

    toJSON() {
        // Include custom properties
        return this.canvas.toJSON(['isQRCode', 'qrContent']);
    }

    loadJSON(json) {
        this.canvas.loadFromJSON(json, () => {
            this.canvas.renderAll();
        });
    }

    // Capture canvas as DataURL
    toDataURL() {
        return this.canvas.toDataURL({
            format: 'png',
            multiplier: 1
        });
    }
}
