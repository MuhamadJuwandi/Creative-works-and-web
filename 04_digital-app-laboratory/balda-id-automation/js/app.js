document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    // Storing designs as a Map: ID -> { manager, wrapperId }
    const designs = new Map();
    let activeDesignId = null;
    let zoomLevel = 1;

    // Services
    const dataProcessor = new DataProcessor();

    // UI Elements
    const canvasListEl = document.getElementById('canvas-list');
    const addCanvasBtn = document.getElementById('add-canvas-btn');
    const templateList = document.getElementById('template-list');

    // Tools
    const addTextBtn = document.getElementById('add-text-btn');
    const addImageBtn = document.getElementById('add-image-btn');
    const imageUpload = document.getElementById('image-upload');
    const addQrBtn = document.getElementById('add-qr-btn');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const saveTemplateBtn = document.getElementById('save-template-btn');
    const dataMergeBtn = document.getElementById('data-merge-btn');
    const csvUpload = document.getElementById('csv-upload');

    // Properties
    const propPanel = document.getElementById('properties-panel');
    const noSelection = document.getElementById('no-selection');
    const objectProperties = document.getElementById('object-properties');

    const propText = document.getElementById('prop-text');
    const propFill = document.getElementById('prop-fill');
    const propFillHex = document.getElementById('prop-fill-hex');
    const propFontSize = document.getElementById('prop-fontSize');
    const propFontFamily = document.getElementById('prop-fontFamily');
    const propOpacity = document.getElementById('prop-opacity');
    const deleteObjBtn = document.getElementById('delete-btn');

    // Canvas Settings
    const canvasWidthInput = document.getElementById('canvas-width');
    const canvasHeightInput = document.getElementById('canvas-height');
    const applyCanvasSizeBtn = document.getElementById('apply-canvas-size');
    const canvasBgColorInput = document.getElementById('canvas-bg-color');
    const canvasBgHex = document.getElementById('canvas-bg-hex');

    // Zoom Controls
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomLevelDisplay = document.getElementById('zoom-level');


    // --- Core Design Management ---

    function createDesign(width = 638, height = 1011, jsonToLoad = null) {
        const id = 'design_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

        // 1. Create DOM Elements
        const wrapper = document.createElement('div');
        wrapper.className = 'canvas-wrapper';
        wrapper.id = wrapper.id || `wrapper_${id}`;

        // Header (Delete Button)
        const header = document.createElement('div');
        header.className = 'canvas-header';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete-canvas';
        deleteBtn.innerHTML = '<i class="ph ph-trash"></i>';
        deleteBtn.title = "Delete Design";
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteDesign(id);
        };

        header.appendChild(deleteBtn);
        wrapper.appendChild(header);

        // Canvas
        const canvasEl = document.createElement('canvas');
        canvasEl.id = `c_${id}`;
        wrapper.appendChild(canvasEl);

        // Append to List
        canvasListEl.appendChild(wrapper);

        // 2. Init Fabric Manager
        const mgr = new CanvasManager(canvasEl.id);
        mgr.resize(width, height);

        if (jsonToLoad) {
            mgr.loadJSON(jsonToLoad);
        }

        // 3. Store in State
        designs.set(id, { manager: mgr, wrapper: wrapper });

        // 4. Bind Events
        mgr.canvas.on('mouse:down', () => setActiveDesign(id));
        mgr.canvas.on('selection:created', (e) => handleSelection(e));
        mgr.canvas.on('selection:updated', (e) => handleSelection(e));
        mgr.canvas.on('selection:cleared', (e) => handleSelection(null));

        // 5. Set Active
        setActiveDesign(id);

        // 6. Apply Current Zoom
        updateZoomForManager(mgr, wrapper);

        return id;
    }

    function deleteDesign(id) {
        if (designs.size <= 1) {
            alert("You must keep at least one design.");
            return;
        }

        if (!confirm("Are you sure you want to delete this design?")) return;

        const design = designs.get(id);
        if (!design) return;

        // Cleanup
        design.manager.canvas.dispose();
        design.wrapper.remove();

        designs.delete(id);

        // If deleted active, switch to another
        if (activeDesignId === id) {
            const nextId = designs.keys().next().value;
            setActiveDesign(nextId);
        }
    }

    function setActiveDesign(id) {
        if (!designs.has(id)) return;

        activeDesignId = id;

        // Highlight UI
        designs.forEach((d, key) => {
            if (key === id) {
                d.wrapper.style.borderColor = 'var(--brand-yellow)';
                d.wrapper.style.boxShadow = '0 0 0 2px var(--brand-yellow)';
            } else {
                d.wrapper.style.borderColor = 'transparent';
                d.wrapper.style.boxShadow = 'none';
            }
        });

        updatePropertiesUI();
    }

    function getActiveManager() {
        if (!activeDesignId) return null;
        return designs.get(activeDesignId)?.manager;
    }

    // --- Zoom Logic ---
    function updateZoomForManager(mgr, wrapper) {
        // We use CSS transform on the wrapper for visual consistency and performance
        // This is easier than scaling all fabric objects
        wrapper.style.transform = `scale(${zoomLevel})`;
        wrapper.style.transformOrigin = 'top center';

        // Adjust margins to prevent overlap
        // Height grows by (scale - 1) * height
        const height = 1011; // Approx/Base height
        const margin = (height * zoomLevel) - height + 20; // +20 padding
        wrapper.style.marginBottom = `${margin > 20 ? margin : 20}px`;
    }

    function setZoom(level) {
        zoomLevel = parseFloat(level.toFixed(1));
        zoomLevelDisplay.innerText = Math.round(zoomLevel * 100) + '%';

        designs.forEach(d => {
            updateZoomForManager(d.manager, d.wrapper);
        });
    }

    zoomInBtn.addEventListener('click', () => setZoom(Math.min(zoomLevel + 0.1, 2.0)));
    zoomOutBtn.addEventListener('click', () => setZoom(Math.max(zoomLevel - 0.1, 0.5)));


    // --- Properties UI ---
    function updatePropertiesUI() {
        const mgr = getActiveManager();
        if (!mgr) return;

        // Canvas Settings
        canvasWidthInput.value = mgr.canvas.width;
        canvasHeightInput.value = mgr.canvas.height;
        canvasBgColorInput.value = mgr.canvas.backgroundColor;
        canvasBgHex.innerText = mgr.canvas.backgroundColor;

        // Object Settings
        const obj = mgr.canvas.getActiveObject();
        handleSelection({ selected: obj ? [obj] : [] });
    }

    function handleSelection(e) {
        const obj = e && e.selected ? e.selected[0] : null;

        if (!obj) {
            noSelection.classList.remove('hidden');
            objectProperties.classList.add('hidden');
            return;
        }

        noSelection.classList.add('hidden');
        objectProperties.classList.remove('hidden');

        // Populate Fields
        if (obj.type === 'i-text') {
            propText.value = obj.text;
            propText.disabled = false;
            propFontSize.closest('.prop-group').classList.remove('hidden');
            propFontFamily.closest('.prop-group').classList.remove('hidden');
            propFontSize.value = obj.fontSize;
            propFontFamily.value = obj.fontFamily;
        } else if (obj.isQRCode) {
            propText.value = obj.qrContent || '';
            propText.disabled = false;
        } else {
            propText.value = '';
            propText.disabled = true;
            propFontSize.closest('.prop-group').classList.add('hidden');
            propFontFamily.closest('.prop-group').classList.add('hidden');
        }

        propFill.value = obj.fill;
        propFillHex.innerText = obj.fill;
        propOpacity.value = obj.opacity;
    }

    // Property Listeners
    propText.addEventListener('input', (e) => {
        const mgr = getActiveManager();
        const obj = mgr?.canvas.getActiveObject();
        if (obj) {
            if (obj.isQRCode) obj.set('qrContent', e.target.value);
            else if (obj.type === 'i-text') mgr.updateActiveObject('text', e.target.value);
        }
    });

    propFill.addEventListener('input', (e) => {
        getActiveManager()?.updateActiveObject('fill', e.target.value);
        propFillHex.innerText = e.target.value;
    });

    propFontSize.addEventListener('input', (e) => getActiveManager()?.updateActiveObject('fontSize', parseInt(e.target.value)));
    propFontFamily.addEventListener('change', (e) => getActiveManager()?.updateActiveObject('fontFamily', e.target.value));
    propOpacity.addEventListener('input', (e) => getActiveManager()?.updateActiveObject('opacity', parseFloat(e.target.value)));
    deleteObjBtn.addEventListener('click', () => getActiveManager()?.deleteActiveObject());

    // Canvas Settings Listeners
    applyCanvasSizeBtn.addEventListener('click', () => {
        const w = parseInt(canvasWidthInput.value);
        const h = parseInt(canvasHeightInput.value);
        if (w && h) {
            designs.forEach(d => d.manager.resize(w, h));
        }
    });

    canvasBgColorInput.addEventListener('input', (e) => {
        getActiveManager()?.setBackgroundColor(e.target.value);
        canvasBgHex.innerText = e.target.value;
    });


    // --- Toolbar Actions ---
    addCanvasBtn.addEventListener('click', () => {
        // Inherit dimensions from active or default
        const mgr = getActiveManager();
        const w = mgr ? mgr.canvas.width : 638;
        const h = mgr ? mgr.canvas.height : 1011;
        createDesign(w, h);

        // Scroll to bottom
        setTimeout(() => {
            const scrollArea = document.querySelector('.canvas-scroll-area');
            scrollArea.scrollTop = scrollArea.scrollHeight;
        }, 100);
    });

    addTextBtn.addEventListener('click', () => getActiveManager()?.addText('Text'));
    addImageBtn.addEventListener('click', () => imageUpload.click());
    imageUpload.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            getActiveManager()?.addImage(e.target.files[0]);
            imageUpload.value = '';
        }
    });
    addQrBtn.addEventListener('click', () => getActiveManager()?.addQR('123456'));

    // --- PDF Export ---
    exportPdfBtn.addEventListener('click', async () => {
        const btnText = exportPdfBtn.innerText;
        exportPdfBtn.innerText = 'Generating...';
        exportPdfBtn.disabled = true;

        try {
            const { jsPDF } = window.jspdf;

            // Get data
            const data = dataProcessor.data.length ? dataProcessor.data : [{}];

            // Collect templates from MAP
            // We want them in DOM order!
            const sortedDesigns = Array.from(designs.values()).sort((a, b) => {
                // Determine order by DOM position
                return Array.from(canvasListEl.children).indexOf(a.wrapper) - Array.from(canvasListEl.children).indexOf(b.wrapper);
            });

            const firstMgr = sortedDesigns[0].manager;
            const width = firstMgr.canvas.width;
            const height = firstMgr.canvas.height;

            const doc = new jsPDF({
                orientation: width > height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [width, height]
            });

            // Helper for QR
            async function getQRData(text) {
                const div = document.createElement('div');
                new QRCode(div, { text, width: 256, height: 256, correctLevel: QRCode.CorrectLevel.H });
                return new Promise(resolve => {
                    setTimeout(() => resolve(div.querySelector('canvas').toDataURL()), 50);
                });
            }

            // Work Canvas
            const workCanvasEl = document.createElement('canvas');
            workCanvasEl.width = width;
            workCanvasEl.height = height;
            const workCanvas = new fabric.Canvas(workCanvasEl);
            workCanvas.setWidth(width);
            workCanvas.setHeight(height);

            let pageAdded = false;

            for (const row of data) {
                for (const design of sortedDesigns) {
                    if (pageAdded) doc.addPage([width, height]);
                    pageAdded = true;

                    const json = design.manager.toJSON();
                    workCanvas.backgroundColor = design.manager.canvas.backgroundColor;
                    await new Promise(r => workCanvas.loadFromJSON(json, r));

                    // Replace Text/QR
                    const objects = workCanvas.getObjects();
                    for (const obj of objects) {
                        if (obj.type === 'i-text' && obj.text.includes('{{')) {
                            obj.set('text', obj.text.replace(/{{(\w+)}}/g, (_, k) => row[k] || `{{${k}}}`));
                        }
                        if (obj.isQRCode) {
                            const val = obj.qrContent.replace(/{{(\w+)}}/g, (_, k) => row[k] || `{{${k}}}`);
                            const url = await getQRData(val);

                            // Replace rect with image
                            const img = await new Promise(r => fabric.Image.fromURL(url, i => r(i)));
                            img.set({
                                left: obj.left, top: obj.top, scaleX: obj.scaleX, scaleY: obj.scaleY,
                                angle: obj.angle, opacity: obj.opacity
                            });
                            workCanvas.remove(obj);
                            workCanvas.add(img);
                        }
                    }

                    workCanvas.renderAll();
                    const imgData = workCanvas.toDataURL({ format: 'png', quality: 1.0 });
                    doc.addImage(imgData, 'PNG', 0, 0, width, height);
                }
            }

            doc.save('id_cards.pdf');
            alert('Export Complete!');

        } catch (err) {
            console.error(err);
            alert('Export Failed: ' + err.message);
        } finally {
            exportPdfBtn.innerText = btnText;
            exportPdfBtn.disabled = false;
        }
    });


    // --- CSV & Templates ---
    dataMergeBtn.addEventListener('click', () => csvUpload.click());
    csvUpload.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            dataProcessor.parseCSV(e.target.files[0]).then(res => {
                alert(`Loaded ${res.data.length} records.`);
                document.getElementById('data-stats').classList.remove('hidden');
                document.getElementById('record-count').innerText = res.data.length;
            });
        }
    });

    saveTemplateBtn.addEventListener('click', () => {
        const name = prompt("Template Name:");
        if (!name) return;
        const json = Array.from(designs.values()).map(d => d.manager.toJSON());
        localStorage.setItem(`idcard_tpl_${Date.now()}`, JSON.stringify({ name, json }));
        loadTemplates();
    });

    function loadTemplates() {
        templateList.innerHTML = '';
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('idcard_tpl_')) {
                const data = JSON.parse(localStorage.getItem(key));
                const btn = document.createElement('div');
                btn.className = 'tool-btn';
                btn.style.justifyContent = 'space-between';
                btn.innerHTML = `<span>${data.name}</span> <i class="ph ph-trash text-red-500"></i>`;
                btn.querySelector('span').onclick = () => {
                    canvasListEl.innerHTML = '';
                    designs.clear();
                    data.json.forEach(j => createDesign(638, 1011, j));
                };
                btn.querySelector('.ph-trash').onclick = (e) => {
                    e.stopPropagation();
                    if (confirm('Delete?')) { localStorage.removeItem(key); loadTemplates(); }
                };
                templateList.appendChild(btn);
            }
        });
    }
    loadTemplates();

    // Initialize
    createDesign();

});
