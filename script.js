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

    initTabs();
    initSidebar();
    initFilters();
})();
