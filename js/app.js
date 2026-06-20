document.addEventListener("DOMContentLoaded", () => {
    initTheme();

    const sidebarLinks = document.querySelectorAll(".sidebar-link");
    const defaultHero = document.getElementById("default-hero-view");
    const sandboxIframe = document.getElementById("sandbox-iframe");

    sidebarLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();

            sidebarLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");

            const targetUrl = link.getAttribute("href");

            if (targetUrl && targetUrl !== "#") {
                if (defaultHero) defaultHero.style.display = "none";
                
                sandboxIframe.style.display = "block";
                sandboxIframe.src = targetUrl;

                sandboxIframe.onload = () => {
                    const currentTheme = document.documentElement.getAttribute("data-theme");
                    try {
                        sandboxIframe.contentDocument.documentElement.setAttribute("data-theme", currentTheme);
                    } catch (e) {
                        console.error("No se pudo aplicar el tema al iframe debido a políticas de origen común.", e);
                    }
                };
            }
        });
    });

    const homeLink = document.querySelector('.navbar-menu .navbar-item a[href="#"]');
    if (homeLink) {
        homeLink.parentElement.addEventListener("click", (e) => {
            e.preventDefault();
            if (sandboxIframe) sandboxIframe.style.display = "none";
            if (defaultHero) defaultHero.style.display = "block";
        });
    }
});

function initTheme() {
    const savedTheme = localStorage.getItem("hoka-theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);

    const toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("hoka-theme", newTheme);
            updateThemeIcon(newTheme);

            const sandboxIframe = document.getElementById("sandbox-iframe");
            if (sandboxIframe && sandboxIframe.contentDocument) {
                try {
                    sandboxIframe.contentDocument.documentElement.setAttribute("data-theme", newTheme);
                } catch (e) {}
            }
            
            const viewport = document.getElementById("content-viewport");
            if (viewport) {
                viewport.setAttribute("data-theme", newTheme);
            }
        });
    }
}

function updateThemeIcon(theme) {
    const icon = document.querySelector("#theme-toggle i");
    if (icon) {
        icon.className = theme === "dark" ? "ri-sun-line" : "ri-moon-line";
    }
}

function initNavigation() {
    const links = document.querySelectorAll(".sidebar-link, .nav-action-link");
    const viewport = document.getElementById("content-viewport");

    links.forEach(link => {
        link.addEventListener("click", async (e) => {
            e.preventDefault();
            const targetUrl = link.getAttribute("href");
            if (!targetUrl || targetUrl === "#") return;

            links.forEach(l => l.classList.remove("active"));
            link.classList.add("active");

            viewport.style.opacity = 0;

            setTimeout(async () => {
                try {
                    const response = await fetch(targetUrl);
                    if (!response.ok) throw new Error("Módulo no encontrado");
                    const htmlText = await response.text();

                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlText, "text/html");
                    
                    const incomingContent = doc.querySelector(".exercise-container") || doc.body;
                    viewport.innerHTML = incomingContent.innerHTML;
                    
                    const currentTheme = document.documentElement.getAttribute("data-theme");
                    viewport.setAttribute("data-theme", currentTheme);

                    optimizeBackgroundVideos();
                    if (window.initSubModules) window.initSubModules();

                    viewport.style.opacity = 1;
                } catch (error) {
                    console.error("Error cargando módulo:", error);
                    viewport.innerHTML = `<div class="error-box"><p>Error al cargar el ejercicio multimedia. Asegúrese de que el archivo existe en la ruta especificada.</p></div>`;
                    viewport.style.opacity = 1;
                }
            }, 300);
        });
    });
}

function optimizeBackgroundVideos() {
    const videoBlocks = document.querySelectorAll(".video-container-block");

    const observerOptions = {
        root: null,
        rootMargin: "50px",
        threshold: 0.1
    };

    const videoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const block = entry.target;
                const video = block.querySelector("video");
                
                if (video && !block.classList.contains("loaded")) {
                    setTimeout(() => {
                        const source = video.querySelector("source");
                        if (source && source.getAttribute("data-src")) {
                            source.setAttribute("src", source.getAttribute("data-src"));
                            video.load();
                            video.play().then(() => {
                                block.classList.add("loaded");
                            }).catch(err => console.log("Autoplay bloqueado hasta interacción:", err));
                        }
                    }, 400); 
                } else if (video) {
                    video.play();
                }
            } else {
                const video = entry.target.querySelector("video");
                if (video) video.pause();
            }
        });
    }, observerOptions);

    videoBlocks.forEach(block => videoObserver.observe(block));
}