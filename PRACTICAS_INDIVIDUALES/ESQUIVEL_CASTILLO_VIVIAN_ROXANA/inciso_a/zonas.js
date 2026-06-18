window.addEventListener("DOMContentLoaded", () => {
    initLightbox();
    initVideoWidget();
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

function initVideoWidget() {
    const videoFrame = document.getElementById('video-widget-frame');
    const videoHeader = document.getElementById('video-widget-header');
    const triggerBtn = document.getElementById('trigger-video-widget');
    const closeBtn = document.getElementById('close-video-widget');
    const html5Video = document.getElementById('demo-html5-video');

    if (!videoFrame || !videoHeader) return;

    let mX = 0, mY = 0, wW = 0, wH = 0, wL = 0, wT = 0;

    if (triggerBtn && html5Video) {
        triggerBtn.addEventListener('click', () => {
            videoFrame.classList.add('is-active');
            html5Video.play().catch(err => console.log("Auto-play prevenido por el navegador. Requiere acción manual."));
        });
    }

    if (closeBtn && html5Video) {
        closeBtn.addEventListener('click', () => {
            videoFrame.classList.remove('is-active');
            html5Video.pause();
            html5Video.currentTime = 0;
        });
    }

    videoHeader.addEventListener('mousedown', (e) => {
        if (e.target.closest('.video-widget-close')) return;
        
        const rect = videoFrame.getBoundingClientRect();
        videoFrame.style.left = `${rect.left}px`;
        videoFrame.style.top = `${rect.top}px`;
        videoFrame.style.bottom = 'auto';
        videoFrame.style.right = 'auto';
        
        mX = e.clientX;
        mY = e.clientY;
        wL = rect.left;
        wT = rect.top;

        const onMouseMove = (ev) => {
            const dx = ev.clientX - mX;
            const dy = ev.clientY - mY;
            videoFrame.style.left = `${wL + dx}px`;
            videoFrame.style.top = `${wT + dy}px`;
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    videoFrame.querySelectorAll('.resizer').forEach(resizer => {
        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            
            const mode = e.target.className.split(' ')[1];
            const rect = videoFrame.getBoundingClientRect();
            
            videoFrame.style.left = `${rect.left}px`;
            videoFrame.style.top = `${rect.top}px`;
            videoFrame.style.bottom = 'auto';
            videoFrame.style.right = 'auto';

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
                    videoFrame.style.width = `${wW + dx}px`;
                    videoFrame.style.height = `${wH + dy}px`;
                } else if (mode === 'bl') {
                    videoFrame.style.width = `${wW - dx}px`;
                    videoFrame.style.height = `${wH + dy}px`;
                    videoFrame.style.left = `${wL + dx}px`;
                } else if (mode === 'tr') {
                    videoFrame.style.width = `${wW + dx}px`;
                    videoFrame.style.height = `${wH - dy}px`;
                    videoFrame.style.top = `${wT + dy}px`;
                } else if (mode === 'tl') {
                    videoFrame.style.width = `${wW - dx}px`;
                    videoFrame.style.height = `${wH - dy}px`;
                    videoFrame.style.left = `${wL + dx}px`;
                    videoFrame.style.top = `${wT + dy}px`;
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