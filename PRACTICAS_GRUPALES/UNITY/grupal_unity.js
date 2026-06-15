const webglFrame = document.getElementById('webgl-widget-frame');
const webglHeader = document.getElementById('webgl-widget-header');
const triggerBtn = document.getElementById('trigger-webgl-widget');
const closeBtn = document.getElementById('close-webgl-widget');
const overlayTrigger = document.getElementById('webgl-overlay-trigger');
const unityIframe = document.getElementById('unity-loader-iframe');

let mX = 0, mY = 0, wW = 0, wH = 0, wL = 0, wT = 0;

triggerBtn.addEventListener('click', () => {
    webglFrame.classList.add('is-active');
});

closeBtn.addEventListener('click', () => {
    webglFrame.classList.remove('is-active');
    unityIframe.src = "";
    overlayTrigger.style.display = "flex";
});

overlayTrigger.addEventListener('click', () => {
    overlayTrigger.style.display = "none";
    // Apunta al subdirectorio donde guardes la compilación grupal de WebGL
    unityIframe.src = "./grupal_build/index.html"; 
});

// Control de arrastre (Drag)
webglHeader.addEventListener('mousedown', (e) => {
    if (e.target.closest('.video-widget-close')) return;
    
    const rect = webglFrame.getBoundingClientRect();
    webglFrame.style.left = `${rect.left}px`;
    webglFrame.style.top = `${rect.top}px`;
    webglFrame.style.bottom = 'auto';
    webglFrame.style.right = 'auto';
    
    mX = e.clientX;
    mY = e.clientY;
    wL = rect.left;
    wT = rect.top;

    const onMouseMove = (ev) => {
        const dx = ev.clientX - mX;
        const dy = ev.clientY - mY;
        webglFrame.style.left = `${wL + dx}px`;
        webglFrame.style.top = `${wT + dy}px`;
    };

    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

// Control de redimensionamiento bidireccional (Resize)
webglFrame.querySelectorAll('.resizer').forEach(resizer => {
    resizer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        
        const mode = e.target.className.split(' ')[1];
        const rect = webglFrame.getBoundingClientRect();
        
        webglFrame.style.left = `${rect.left}px`;
        webglFrame.style.top = `${rect.top}px`;
        webglFrame.style.bottom = 'auto';
        webglFrame.style.right = 'auto';

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
                webglFrame.style.width = `${wW + dx}px`;
                webglFrame.style.height = `${wH + dy}px`;
            } else if (mode === 'bl') {
                webglFrame.style.width = `${wW - dx}px`;
                webglFrame.style.height = `${wH + dy}px`;
                webglFrame.style.left = `${wL + dx}px`;
            } else if (mode === 'tr') {
                webglFrame.style.width = `${wW + dx}px`;
                webglFrame.style.height = `${wH - dy}px`;
                webglFrame.style.top = `${wT + dy}px`;
            } else if (mode === 'tl') {
                webglFrame.style.width = `${wW - dx}px`;
                webglFrame.style.height = `${wH - dy}px`;
                webglFrame.style.left = `${wL + dx}px`;
                webglFrame.style.top = `${wT + dy}px`;
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