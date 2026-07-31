(function () {
    "use strict";

    var sidebar = document.querySelector(".sidebar");
    var sidebarBtn = document.querySelector("[data-sidebar-btn]");
    var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav-link]"));
    var pages = Array.prototype.slice.call(document.querySelectorAll("[data-page]"));
    var filterBtns = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var projectItems = Array.prototype.slice.call(document.querySelectorAll(".project-item"));

    var tabTitles = {
        about: "Behzad Ousat | ML & Security Engineer, Ph.D. Candidate",
        resume: "Resume | Behzad Ousat",
        projects: "Projects | Behzad Ousat",
        publications: "Publications | Behzad Ousat",
        skills: "Skills | Behzad Ousat"
    };

    function setTab(tabId, options) {
        options = options || {};

        navLinks.forEach(function (link) {
            var isActive = link.getAttribute("data-tab") === tabId;
            link.classList.toggle("active", isActive);
            link.setAttribute("aria-selected", isActive ? "true" : "false");
            link.setAttribute("tabindex", isActive ? "0" : "-1");
        });

        pages.forEach(function (page) {
            var isActive = page.getAttribute("data-page") === tabId;
            page.classList.toggle("active", isActive);
            page.setAttribute("aria-hidden", isActive ? "false" : "true");
        });

        if (tabTitles[tabId]) {
            document.title = tabTitles[tabId];
        }

        if (!options.skipHash && history.replaceState) {
            history.replaceState(null, "", "#" + tabId);
        }

        if (!options.skipScroll) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }

    function initTabs() {
        navLinks.forEach(function (link) {
            link.addEventListener("click", function () {
                setTab(link.getAttribute("data-tab"));
            });

            link.addEventListener("keydown", function (event) {
                var index = navLinks.indexOf(link);
                var nextIndex = index;

                if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                    nextIndex = (index + 1) % navLinks.length;
                    event.preventDefault();
                } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                    nextIndex = (index - 1 + navLinks.length) % navLinks.length;
                    event.preventDefault();
                } else if (event.key === "Home") {
                    nextIndex = 0;
                    event.preventDefault();
                } else if (event.key === "End") {
                    nextIndex = navLinks.length - 1;
                    event.preventDefault();
                } else {
                    return;
                }

                navLinks[nextIndex].focus();
                setTab(navLinks[nextIndex].getAttribute("data-tab"));
            });
        });

        var validTabs = navLinks.map(function (link) {
            return link.getAttribute("data-tab");
        });

        function applyHash() {
            var hash = window.location.hash.replace("#", "");
            if (validTabs.indexOf(hash) !== -1) {
                setTab(hash, { skipHash: true, skipScroll: true });
            } else {
                setTab("about", { skipHash: true, skipScroll: true });
            }
        }

        applyHash();
        window.addEventListener("hashchange", applyHash);
    }

    function initSidebar() {
        if (!sidebarBtn || !sidebar) return;

        sidebarBtn.addEventListener("click", function () {
            var expanded = sidebar.classList.toggle("active");
            sidebarBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
            sidebarBtn.querySelector("span").textContent = expanded ? "Hide Contacts" : "Show Contacts";
        });
    }

    function initFilters() {
        if (!filterBtns.length) return;

        filterBtns.forEach(function (btn) {
            btn.addEventListener("click", function () {
                var filter = btn.getAttribute("data-filter");

                filterBtns.forEach(function (b) {
                    b.classList.toggle("active", b === btn);
                });

                projectItems.forEach(function (item) {
                    var categories = (item.getAttribute("data-category") || "").split(/\s+/);
                    var show = filter === "all" || categories.indexOf(filter) !== -1;
                    item.classList.toggle("hidden", !show);
                });
            });
        });
    }

    function initAmbient() {
        var canvas = document.getElementById("ambient-canvas");
        if (!canvas || !canvas.getContext) return;

        var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var ctx = canvas.getContext("2d");
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var width = 0;
        var height = 0;
        var nodes = [];
        var raf = 0;
        var linkDist = 140;

        function countForSize() {
            var area = width * height;
            return Math.max(28, Math.min(72, Math.floor(area / 18000)));
        }

        function seed() {
            var n = countForSize();
            nodes = [];
            for (var i = 0; i < n; i++) {
                nodes.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.28,
                    vy: (Math.random() - 0.5) * 0.28,
                    r: Math.random() * 1.6 + 0.7,
                    pulse: Math.random() * Math.PI * 2
                });
            }
        }

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = width + "px";
            canvas.style.height = height + "px";
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            linkDist = Math.max(110, Math.min(170, Math.min(width, height) * 0.16));
            seed();
            if (reduceMotion) drawFrame(0, true);
        }

        function drawFrame(t, freeze) {
            ctx.clearRect(0, 0, width, height);

            for (var i = 0; i < nodes.length; i++) {
                var a = nodes[i];
                if (!freeze) {
                    a.x += a.vx;
                    a.y += a.vy;
                    a.pulse += 0.02;
                    if (a.x < -20) a.x = width + 20;
                    if (a.x > width + 20) a.x = -20;
                    if (a.y < -20) a.y = height + 20;
                    if (a.y > height + 20) a.y = -20;
                }

                for (var j = i + 1; j < nodes.length; j++) {
                    var b = nodes[j];
                    var dx = a.x - b.x;
                    var dy = a.y - b.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < linkDist) {
                        var alpha = (1 - dist / linkDist) * 0.22;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = "rgba(201, 162, 39," + alpha + ")";
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }

            for (var k = 0; k < nodes.length; k++) {
                var p = nodes[k];
                var glow = freeze ? 0.55 : 0.4 + Math.sin(p.pulse) * 0.25;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r + 2.2, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(201, 162, 39," + (glow * 0.12) + ")";
                ctx.fill();
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(232, 220, 190," + (0.45 + glow * 0.35) + ")";
                ctx.fill();
            }
        }

        function loop(t) {
            drawFrame(t, false);
            raf = window.requestAnimationFrame(loop);
        }

        resize();
        window.addEventListener("resize", function () {
            window.cancelAnimationFrame(raf);
            resize();
            if (!reduceMotion) raf = window.requestAnimationFrame(loop);
        });

        if (!reduceMotion) {
            raf = window.requestAnimationFrame(loop);
        }
    }

    initTabs();
    initSidebar();
    initFilters();
    initAmbient();
})();
