window.addEventListener("DOMContentLoaded", () => {
    initModalManagers();
    initSimulationEngine();
    initVideoWidgetController();
    initVideoWidgetDragAndResize(); 
    initLightbox();
});

function initLightbox() {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxClose = document.getElementById("lightboxClose");
    if (!lightbox || !lightboxImg || !lightboxClose) return;

    const images = document.querySelectorAll(".bounded-media");

    images.forEach(img => {
        img.addEventListener("click", () => {
            lightbox.style.display = "flex";
            lightboxImg.src = img.src;
            document.body.style.overflow = "hidden"; 
        });
    });

    const closeLightbox = () => {
        lightbox.style.display = "none";
        lightboxImg.src = ""; 
        document.body.style.overflow = "auto"; 
    };

    lightboxClose.addEventListener("click", closeLightbox);
    
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && lightbox.style.display === "flex") {
            closeLightbox();
        }
    });
}

function initModalManagers() {
    const triggerCode = document.getElementById("trigger-modal-code");
    const closeCode = document.getElementById("close-modal-code");
    const wrapperCode = document.getElementById("modal-code-wrapper");

    const triggerSim = document.getElementById("trigger-modal-sim");
    const closeSim = document.getElementById("close-modal-sim");
    const wrapperSim = document.getElementById("modal-sim-wrapper");

    if (triggerCode && closeCode && wrapperCode) {
        triggerCode.addEventListener("click", () => wrapperCode.classList.add("is-active"));
        closeCode.addEventListener("click", () => wrapperCode.classList.remove("is-active"));
        wrapperCode.addEventListener("click", (e) => {
            if (e.target === wrapperCode) wrapperCode.classList.remove("is-active");
        });
    }

    if (triggerSim && closeSim && wrapperSim) {
        triggerSim.addEventListener("click", () => wrapperSim.classList.add("is-active"));
        closeSim.addEventListener("click", () => wrapperSim.classList.remove("is-active"));
        wrapperSim.addEventListener("click", (e) => {
            if (e.target === wrapperSim) wrapperSim.classList.remove("is-active");
        });
    }
}

function initSimulationEngine() {
    const fileInput = document.getElementById("sim-file-input");
    const executeBtn = document.getElementById("sim-execute-btn");
    const canvasSrc = document.getElementById("sim-canvas-src");
    const canvasDest = document.getElementById("sim-canvas-dest");
    const fallbackSrc = document.getElementById("fallback-src");
    const fallbackDest = document.getElementById("fallback-dest");

    if (!fileInput || !canvasSrc || !canvasDest) return;

    let ctxSrc = canvasSrc.getContext("2d");
    let ctxDest = canvasDest.getContext("2d");
    let targetImage = null;

    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            targetImage = new Image();
            targetImage.onload = () => {
                const boundary = 600;
                let width = targetImage.width;
                let height = targetImage.height;

                if (width > boundary || height > boundary) {
                    if (width > height) {
                        height = (boundary / width) * height;
                        width = boundary;
                    } else {
                        width = (boundary / height) * width;
                        height = boundary;
                    }
                }

                canvasSrc.width = width;
                canvasSrc.height = height;
                canvasDest.width = width;
                canvasDest.height = height;

                ctxSrc.drawImage(targetImage, 0, 0, width, height);
                canvasSrc.style.display = "block";
                if (fallbackSrc) fallbackSrc.style.display = "none";

                ctxDest.clearRect(0, 0, width, height);
                canvasDest.style.display = "none";
                if (fallbackDest) {
                    fallbackDest.style.display = "block";
                    fallbackDest.textContent = "Matriz cargada. Listo para aplicar filtro.";
                }

                executeBtn.disabled = false;
            };
            targetImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    executeBtn.addEventListener("click", () => {
        if (!targetImage) return;

        const w = canvasSrc.width;
        const h = canvasSrc.height;

        const srcData = ctxSrc.getImageData(0, 0, w, h);
        const destData = ctxDest.createImageData(w, h);

        const input = srcData.data;
        const output = destData.data;

        for (let i = 0; i < input.length; i++) {
            output[i] = input[i];
        }

        // Simulación de Filtro de Convolución (Caja/Media)
        for (let x = 1; x < w - 1; x++) {
            for (let y = 1; y < h - 1; y++) {
                let sumR = 0;
                let sumG = 0;
                let sumB = 0;

                for (let kx = -1; kx <= 1; kx++) {
                    for (let ky = -1; ky <= 1; ky++) {
                        const pixelIdx = ((y + ky) * w + (x + kx)) * 4;
                        sumR += input[pixelIdx];
                        sumG += input[pixelIdx + 1];
                        sumB += input[pixelIdx + 2];
                    }
                }

                const currentIdx = (y * w + x) * 4;
                output[currentIdx] = Math.floor(sumR / 9);
                output[currentIdx + 1] = Math.floor(sumG / 9);
                output[currentIdx + 2] = Math.floor(sumB / 9);
                output[currentIdx + 3] = input[currentIdx + 3];
            }
        }

        ctxDest.putImageData(destData, 0, 0);
        canvasDest.style.display = "block";
        if (fallbackDest) fallbackDest.style.display = "none";
    });
}

function initVideoWidgetController() {
    const widget = document.getElementById("video-widget-frame");
    const video = document.getElementById("target-widget-video");
    const overlay = document.getElementById("video-overlay-trigger");
    const closeBtn = document.getElementById("close-video-widget");

    if (!video || !overlay) return;

    overlay.addEventListener("click", () => {
        overlay.style.display = "none";
        video.play().catch((err) => {
            console.warn("Reproducción restringida por navegador:", err);
            video.controls = true;
        });
    });

    if (closeBtn && widget) {
        closeBtn.addEventListener("click", () => {
            widget.style.opacity = "0";
            widget.style.transform = "scale(0.9)";
            setTimeout(() => {
                widget.style.display = "none";
            }, 300);
        });
    }
}

// Encapsulado seguro para evitar errores de carga en elementos flotantes
function initVideoWidgetDragAndResize() {
    const widgetFrame = document.getElementById('video-widget-frame');
    const widgetHeader = document.getElementById('video-widget-header');

    if (!widgetFrame || !widgetHeader) return; // Si no existen en la página actual, salta la función pacíficamente

    let mX = 0, mY = 0, wW = 0, wH = 0, wL = 0, wT = 0;

    widgetHeader.addEventListener('mousedown', (e) => {
        if (e.target.closest('.video-widget-close')) return;
        
        const rect = widgetFrame.getBoundingClientRect();
        widgetFrame.style.left = `${rect.left}px`;
        widgetFrame.style.top = `${rect.top}px`;
        widgetFrame.style.bottom = 'auto';
        widgetFrame.style.right = 'auto';
        
        mX = e.clientX;
        mY = e.clientY;
        wL = rect.left;
        wT = rect.top;

        const onMouseMove = (ev) => {
            const dx = ev.clientX - mX;
            const dy = ev.clientY - mY;
            widgetFrame.style.left = `${wL + dx}px`;
            widgetFrame.style.top = `${wT + dy}px`;
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    widgetFrame.querySelectorAll('.resizer').forEach(resizer => {
        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            
            const mode = e.target.className.split(' ')[1];
            const rect = widgetFrame.getBoundingClientRect();
            
            widgetFrame.style.left = `${rect.left}px`;
            widgetFrame.style.top = `${rect.top}px`;
            widgetFrame.style.bottom = 'auto';
            widgetFrame.style.right = 'auto';

            mX = e.clientX;
            mY = e.clientY;
            wW = rect.width;
            wH = rect.height;
            wL = rect.left;
            wT = rect.top;

            const onMouseMoveResize = (ev) => {
                const dx = ev.clientX - mX;
                const dy = ev.clientY - mY;

                if (mode === 'br') {
                    widgetFrame.style.width = `${wW + dx}px`;
                    widgetFrame.style.height = `${wH + dy}px`;
                } else if (mode === 'bl') {
                    widgetFrame.style.width = `${wW - dx}px`;
                    widgetFrame.style.height = `${wH + dy}px`;
                    widgetFrame.style.left = `${wL + dx}px`;
                } else if (mode === 'tr') {
                    widgetFrame.style.width = `${wW + dx}px`;
                    widgetFrame.style.height = `${wH - dy}px`;
                    widgetFrame.style.top = `${wT + dy}px`;
                } else if (mode === 'tl') {
                    widgetFrame.style.width = `${wW - dx}px`;
                    widgetFrame.style.height = `${wH - dy}px`;
                    widgetFrame.style.left = `${wL + dx}px`;
                    widgetFrame.style.top = `${wT + dy}px`;
                }
            };

            const onMouseUpResize = () => {
                document.removeEventListener('mousemove', onMouseMoveResize);
                document.removeEventListener('mouseup', onMouseUpResize);
            };

            document.addEventListener('mousemove', onMouseMoveResize);
            document.addEventListener('mouseup', onMouseUpResize);
        });
    });
}