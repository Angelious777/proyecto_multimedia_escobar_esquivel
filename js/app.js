/*
   ARQUITECTURA DE CONTROLADOR PRINCIPAL 
   Manejo de estados, carga asíncrona de módulos y control optimizado de reproducción multimedia.
*/

document.addEventListener("DOMContentLoaded", () => {
    const sidebarLinks = document.querySelectorAll(".sidebar-link");
    const defaultHero = document.getElementById("default-hero-view");
    const sandboxIframe = document.getElementById("sandbox-iframe");

    sidebarLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault(); // Evita que la página se recargue por completo

            // Remover clase activa de todos los enlaces y agregar al actual
            sidebarLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");

            // Obtener la ruta del archivo HTML del inciso
            const targetUrl = link.getAttribute("href");

            if (targetUrl && targetUrl !== "#") {
                // Ocultar el diseño por defecto del Home
                if (defaultHero) defaultHero.style.display = "none";
                
                // Mostrar el iframe y asignarle la página del sub-módulo
                sandboxIframe.style.display = "block";
                sandboxIframe.src = targetUrl;
            }
        });
    });

    // Manejo del botón de inicio para regresar a la vista por defecto
    const homeLink = document.querySelector('.navbar-menu .navbar-item a[href="#"]');
    if (homeLink) {
        homeLink.parentElement.addEventListener("click", (e) => {
            e.preventDefault();
            if (sandboxIframe) sandboxIframe.style.display = "none";
            if (defaultHero) defaultHero.style.display = "block";
        });
    }
});

/* Control de Modo Oscuro sin parpadeos */
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
        });
    }
}

function updateThemeIcon(theme) {
    const icon = document.querySelector("#theme-toggle i");
    if (icon) {
        icon.className = theme === "dark" ? "ri-sun-line" : "ri-moon-line";
    }
}

/* Enrutamiento dinámico asíncrono para inyección de incisos */
function initNavigation() {
    const links = document.querySelectorAll(".sidebar-link, .nav-action-link");
    const viewport = document.getElementById("content-viewport");

    links.forEach(link => {
        link.addEventListener("click", async (e) => {
            e.preventDefault();
            const targetUrl = link.getAttribute("href");
            if (!targetUrl || targetUrl === "#") return;

            // Actualizar clases activas
            links.forEach(l => l.classList.remove("active"));
            link.classList.add("active");

            // Animación de salida suave del contenido anterior
            viewport.style.opacity = 0;

            setTimeout(async () => {
                try {
                    const response = await fetch(targetUrl);
                    if (!response.ok) throw new Error("Módulo no encontrado");
                    const htmlText = await response.text();

                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlText, "text/html");
                    
                    // Extraemos la sección específica de la práctica
                    const incomingContent = doc.querySelector(".exercise-container") || doc.body;
                    viewport.innerHTML = incomingContent.innerHTML;
                    
                    // Re-inicializar videos y visores 3D inyectados
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

/* Optimización de Videos de Evidencia de Desarrollo:
   Retrasa deliberadamente la carga de los buffers de video pesados e implementa 
   reproducción inteligente basada en la visibilidad del usuario (Intersection Observer).
*/
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
                    // Retraso controlado intencional (simula render progresivo fluido)
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
                // Pausar video si sale de la pantalla 
                const video = entry.target.querySelector("video");
                if (video) video.pause();
            }
        });
    }, observerOptions);

    videoBlocks.forEach(block => videoObserver.observe(block));
}