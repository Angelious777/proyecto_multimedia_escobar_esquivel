const viewerFrame = document.getElementById('meshroom-widget-frame');
const viewerHeader = document.getElementById('meshroom-widget-header');
const triggerBtn = document.getElementById('trigger-3d-viewer');
const closeBtn = document.getElementById('close-meshroom-widget');
const modelViewer = document.getElementById('integrante-3d-model');
const customHint = document.getElementById('custom-hint');

let mX = 0, mY = 0, wW = 0, wH = 0, wL = 0, wT = 0;

// Desplegar el visor interactivo
triggerBtn.addEventListener('click', () => {
    viewerFrame.classList.add('is-active');
});

// Cerrar y resetear orientaciones
closeBtn.addEventListener('click', () => {
    viewerFrame.classList.remove('is-active');
});

// Ocultar las instrucciones de control una vez que el docente interactúe con el modelo
modelViewer.addEventListener('camera-change', () => {
    customHint.style.opacity = '0';
    customHint.style.transition = 'opacity 0.5s ease';
});

// Control de Arrastre Flotante (Drag)
viewerHeader.addEventListener('mousedown', (e) => {
    if (e.target.closest('.viewer-widget-close')) return;
    
    const rect = viewerFrame.getBoundingClientRect();
    viewerFrame.style.left = `${rect.left}px`;
    viewerFrame.style.top = `${rect.top}px`;
    viewerFrame.style.bottom = 'auto';
    viewerFrame.style.right = 'auto';
    
    mX = e.clientX;
    mY = e.clientY;
    wL = rect.left;
    wT = rect.top;

    const onMouseMove = (ev) => {
        const dx = ev.clientX - mX;
        const dy = ev.clientY - mY;
        viewerFrame.style.left = `${wL + dx}px`;
        viewerFrame.style.top = `${wT + dy}px`;
    };

    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

// Control de Redimensionamiento Bidireccional (Resize)
viewerFrame.querySelectorAll('.resizer').forEach(resizer => {
    resizer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        
        const mode = e.target.className.split(' ')[1];
        const rect = viewerFrame.getBoundingClientRect();
        
        viewerFrame.style.left = `${rect.left}px`;
        viewerFrame.style.top = `${rect.top}px`;
        viewerFrame.style.bottom = 'auto';
        viewerFrame.style.right = 'auto';

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
                viewerFrame.style.width = `${wW + dx}px`;
                viewerFrame.style.height = `${wH + dy}px`;
            } else if (mode === 'bl') {
                viewerFrame.style.width = `${wW - dx}px`;
                viewerFrame.style.height = `${wH + dy}px`;
                viewerFrame.style.left = `${wL + dx}px`;
            } else if (mode === 'tr') {
                viewerFrame.style.width = `${wW + dx}px`;
                viewerFrame.style.height = `${wH - dy}px`;
                viewerFrame.style.top = `${wT + dy}px`;
            } else if (mode === 'tl') {
                viewerFrame.style.width = `${wW - dx}px`;
                viewerFrame.style.height = `${wH - dy}px`;
                viewerFrame.style.left = `${wL + dx}px`;
                viewerFrame.style.top = `${wT + dy}px`;
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