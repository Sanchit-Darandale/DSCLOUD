const toast = document.getElementById("toast");
const statsUploads = document.getElementById("stat-uploads");
const statsViews = document.getElementById("stat-views");
const statsBandwidth = document.getElementById("stat-bandwidth");

const fileInput = document.getElementById("file-input");
const dropZone = document.getElementById("drop-zone");
const uploadButton = document.getElementById("upload-button");
const uploadUrlButton = document.getElementById("upload-url-button");
const urlInput = document.getElementById("url-input");
const mediaResult = document.getElementById("media-result");
const mediaUrl = document.getElementById("media-url");
const mediaDelete = document.getElementById("media-delete");
const mediaType = document.getElementById("media-type");
const mediaSize = document.getElementById("media-size");
const mediaDirectUrl = document.getElementById("media-direct-url");
const mediaDownloadUrl = document.getElementById("media-download-url");
const copyMediaUrl = document.getElementById("copy-media-url");
const uploadProgress = document.getElementById("upload-progress");
const uploadProgressLabel = document.getElementById("upload-progress-label");
const uploadProgressPercent = document.getElementById("upload-progress-percent");
const uploadProgressBar = document.getElementById("upload-progress-bar");
const uploadHistorySection = document.getElementById("upload-history-section");
const uploadHistory = document.getElementById("upload-history");
const clearHistoryButton = document.getElementById("clear-history-button");
const textHistorySection = document.getElementById("text-history-section");
const textHistory = document.getElementById("text-history");
const clearTextHistoryButton = document.getElementById("clear-text-history-button");
const authLinks = document.getElementById("auth-links");
const authSection = document.getElementById("auth-section");
const uploadSection = document.getElementById("upload-section");
const authForm = document.getElementById("auth-form");
const sendCodeButton = document.getElementById("send-code-button");
const verifyCodeButton = document.getElementById("verify-code-button");
const codeSection = document.getElementById("code-section");
const authFeedback = document.getElementById("auth-feedback");
const googleAuthButton = document.getElementById("google-auth-button");

const deleteMediaButton = document.getElementById("delete-media-button");
const deleteMediaId = document.getElementById("delete-media-id");
const deleteMediaKey = document.getElementById("delete-media-key");
const deleteMediaFeedback = document.getElementById("delete-media-feedback");

const textForm = document.getElementById("text-form");
const textInput = document.getElementById("text-input");
const customAlias = document.getElementById("custom-alias");
const checkAliasButton = document.getElementById("check-alias-button");
const aliasFeedback = document.getElementById("alias-feedback");
const adminPassword = document.getElementById("admin-password");
const viewPassword = document.getElementById("view-password");
const dayLimit = document.getElementById("day-limit");
const optPreformatted = document.getElementById("opt-preformatted");
const optClickable = document.getElementById("opt-clickable");
const optBbcode = document.getElementById("opt-bbcode");
const hostTextButton = document.getElementById("host-text-button");
const textResult = document.getElementById("text-result");
const textUrl = document.getElementById("text-url");
const textRawUrl = document.getElementById("text-raw-url");
const textDelete = document.getElementById("text-delete");
const textExpiry = document.getElementById("text-expiry");
const copyTextUrl = document.getElementById("copy-text-url");

const metadataArea = document.getElementById("metadata");
const metaAlias = document.getElementById("meta-alias");
const metaViews = document.getElementById("meta-views");
const metaExpires = document.getElementById("meta-expires");
const metaProtected = document.getElementById("meta-protected");
const passwordPanel = document.getElementById("password-panel");
const viewPasswordInput = document.getElementById("view-password-input");
const unlockText = document.getElementById("unlock-text");
const textOutput = document.getElementById("text-output");
const renderedText = document.getElementById("rendered-text");
const copyTextButton = document.getElementById("copy-text-button");
const rawLink = document.getElementById("raw-link");
const adminPanel = document.getElementById("admin-panel");
const adminPasswordInput = document.getElementById("admin-password-input");
const adminTextInput = document.getElementById("admin-text-input");
const adminOptPreformatted = document.getElementById("admin-opt-preformatted");
const adminOptClickable = document.getElementById("admin-opt-clickable");
const adminOptBbcode = document.getElementById("admin-opt-bbcode");
const adminDayLimit = document.getElementById("admin-day-limit");
const saveTextButton = document.getElementById("save-text-button");
const adminFeedback = document.getElementById("admin-feedback");
const pageFeedback = document.getElementById("page-feedback");

const apiBase = "";
const uploadHistoryKey = "dscloudUploadHistory";
const textHistoryKey = "dscloudTextHistory";
let selectedUploadFile = null;

// Single conditional render area (upload cards OR login card)
let authCheckCompleted = false;
let authenticated = false;



function setupMobileNavigation() {
    const topbar = document.querySelector(".topbar");
    const nav = topbar?.querySelector("nav");
    if (!topbar || !nav) return;

    // Prevent duplicates across dynamic navigation / hot reload.
    // If they exist, remove and recreate deterministically.
    const existingToggle = topbar.querySelector(".menu-toggle");
    if (existingToggle) existingToggle.remove();

    const existingOverlay = document.querySelector(".nav-overlay");
    if (existingOverlay) existingOverlay.remove();

    const menuButton = document.createElement("button");
    menuButton.type = "button";
    menuButton.className = "menu-toggle";
    menuButton.setAttribute("aria-label", "Open navigation menu");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.innerHTML = "<span></span><span></span><span></span>";

    const overlay = document.createElement("button");
    overlay.type = "button";
    overlay.className = "nav-overlay";
    overlay.setAttribute("aria-label", "Close navigation menu");

    function closeMenu() {
        document.body.classList.remove("nav-open");
        menuButton.setAttribute("aria-expanded", "false");
    }

    function openMenu() {
        document.body.classList.add("nav-open");
        menuButton.setAttribute("aria-expanded", "true");
    }

    menuButton.addEventListener("click", () => {
        const isOpen = document.body.classList.toggle("nav-open");
        menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    overlay.addEventListener("click", closeMenu);

    // Close on any nav link click (event delegation avoids missing/extra handlers)
    nav.addEventListener("click", (e) => {
        const target = e.target;
        if (target && target.tagName === "A") {
            closeMenu();
        }
    });

    topbar.appendChild(menuButton);
    document.body.appendChild(overlay);

    // If user rotates / resizes to desktop, force-close drawer.
    const forceClose = () => {
        if (window.innerWidth > 760) closeMenu();
    };
    window.addEventListener("resize", forceClose);
    window.addEventListener("orientationchange", forceClose);

    // Initial state cleanup
    forceClose();
}


function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = "toast " + type;
    toast.hidden = false;
    setTimeout(() => {
        toast.hidden = true;
    }, 3600);
}

function formatSize(bytes) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let value = Number(bytes);
    while (value >= 1024 && i < units.length - 1) {
        value /= 1024;
        i += 1;
    }
    return `${value.toFixed(1)} ${units[i]}`;
}

function setFeedback(element, message, type = "success") {
    if (!element) return;
    element.textContent = message;
    element.classList.remove("error", "success");
    element.classList.add(type);
    element.hidden = false;
}

function hideFeedback(element) {
    if (!element) return;
    element.hidden = true;
}

async function fetchStats() {
    if (!statsUploads || !statsViews || !statsBandwidth) return;

    try {
        const res = await fetch(`${apiBase}/api/stats`);
        if (!res.ok) return;
        const data = await res.json();
        statsUploads.textContent = data.totalUploads || "0";
        statsViews.textContent = data.totalViews || "0";
        statsBandwidth.textContent = `${Math.round((data.bandwidth || 0) / 1024 / 1024)} MB`;
    } catch (err) {
        console.warn("Stats fetch failed", err);
    }
}

function renderMediaResult(result) {
    mediaResult.hidden = false;
    mediaUrl.textContent = result.url;
    mediaUrl.href = result.url;
    
    // Direct Link
    mediaDirectUrl.textContent = result.directlink || result.url;
    mediaDirectUrl.href = result.directlink || result.url;

    // Download Link
    if (mediaDownloadUrl) {
        mediaDownloadUrl.textContent = result.downloadlink || (result.url + "?dl");
        mediaDownloadUrl.href = result.downloadlink || (result.url + "?dl");
    }

    mediaDelete.textContent = result.deleteKey;
    mediaType.textContent = result.type;
    mediaSize.textContent = formatSize(result.size);
}

let currentUser = null;
let currentHistory = {
    uploads: [],
    texts: []
};

function renderAuthLinks() {
    if (!authLinks) return;
    authLinks.innerHTML = "";

    if (currentUser) {
        const logoutButton = document.createElement("button");
        logoutButton.type = "button";
        logoutButton.className = "button tertiary nav-logout";
        logoutButton.textContent = "Logout";
        logoutButton.addEventListener("click", handleLogout);
        authLinks.append(logoutButton);
        return;
    }
}

async function handleLogout() {
    try {
        await fetch(`${apiBase}/api/logout`, {
            method: "POST"
        });
    } catch (err) {
        console.warn(err);
    }

    // Hard refresh to guarantee both cards swap correctly on all pages.
    window.location.reload();
}


async function loadUserSession() {
    // Both sections start hidden to prevent flash-of-wrong-content.
    // Hero/stats/footer are ALWAYS visible (they live outside these sections).
    if (authSection) {
        authSection.hidden = true;
    }
    if (uploadSection) {
        uploadSection.hidden = true;
    }

    try {
        const res = await fetch(`${apiBase}/api/me`);
        if (!res.ok) {
            currentUser = null;
            authenticated = false;
        } else {
            const data = await res.json();
            authenticated = Boolean(data && data.success);
            if (authenticated) {
                currentUser = {
                    email: data.email,
                    id: data.id
                };
            } else {
                currentUser = null;
            }
        }

        renderAuthLinks();

        if (authenticated) {
            showUploadSection();
            await loadUserHistory();
        } else {
            showAuthSection();
        }

        authCheckCompleted = true;
    } catch (err) {
        currentUser = null;
        authenticated = false;
        renderAuthLinks();
        showAuthSection();
        authCheckCompleted = true;
    }
}



function setCardFade(element, visible) {
    if (!element) return;
    // Prevent flicker: use a class if styles exist; fallback to hidden.
    if (visible) {
        element.hidden = false;
        element.style.opacity = "0";
        element.style.transition = "opacity 240ms ease";
        requestAnimationFrame(() => {
            element.style.opacity = "1";
        });
    } else {
        element.style.opacity = "0";
        element.style.transition = "opacity 240ms ease";
        setTimeout(() => {
            element.hidden = true;
        }, 250);
    }
}

function showAuthSection() {
    // Show ONLY the login card; hide upload cards.
    // Hero/stats/footer remain untouched (always visible).
    if (uploadSection) {
        uploadSection.hidden = true;
    }
    if (authSection) {
        authSection.hidden = false;
        authSection.style.opacity = "0";
        authSection.style.transition = "opacity 240ms ease";
        requestAnimationFrame(() => {
            authSection.style.opacity = "1";
        });
    }
}

function showUploadSection() {
    // Show upload cards; hide login card.
    // Hero/stats/footer remain untouched (always visible).
    if (authSection) {
        authSection.hidden = true;
        authSection.style.opacity = "";
    }
    if (uploadSection) {
        uploadSection.hidden = false;
        uploadSection.style.opacity = "0";
        uploadSection.style.transition = "opacity 240ms ease";
        requestAnimationFrame(() => {
            uploadSection.style.opacity = "1";
        });
    }
}


async function loadUserHistory() {
    // Always attempt to load history so the user sees media + text from their account.
    if (!currentUser) {
        renderUploadHistory([]);
        renderTextHistory([]);
        return;
    }

    try {
        const res = await fetch(`${apiBase}/api/history`);
        if (!res.ok) {
            throw new Error("Unable to load history");
        }
        const data = await res.json();
        if (!data.success) {
            throw new Error(data.error || "Unable to load history");
        }

        // Server returns:
        // - uploads: media items (photo/video/document)
        // - texts: text items (aliases)
        currentHistory = {
            uploads: data.uploads || [],
            texts: data.texts || []
        };

        renderUploadHistory(currentHistory.uploads);
        renderTextHistory(currentHistory.texts);

        // Always show history sections if authenticated, regardless of count
        if (uploadHistorySection) uploadHistorySection.hidden = false;
        if (textHistorySection) textHistorySection.hidden = false;
    } catch (err) {
        console.warn(err);
        currentHistory = { uploads: [], texts: [] };
        renderUploadHistory([]);
        renderTextHistory([]);
        if (uploadHistorySection) uploadHistorySection.hidden = true;
        if (textHistorySection) textHistorySection.hidden = true;
    }
}


async function clearHistory(type) {
    if (!currentUser) return;
    try {
        await fetch(`${apiBase}/api/history/clear`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type })
        });
        await loadUserHistory();
    } catch (err) {
        showToast("Failed to clear history", "error");
    }
}

function createHistoryAction(label, className, onClick, is2Step = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    
    let confirmState = false;
    let timeout;

    button.addEventListener("click", (event) => {
        event.stopPropagation();
        if (is2Step) {
            if (!confirmState) {
                confirmState = true;
                button.textContent = "Confirm Delete?";
                button.classList.add("confirming");
                timeout = setTimeout(() => {
                    confirmState = false;
                    button.textContent = label;
                    button.classList.remove("confirming");
                }, 3000);
            } else {
                clearTimeout(timeout);
                onClick();
            }
        } else {
            onClick();
        }
    });
    return button;
}

async function deleteHistoryItem(item) {
    if (!item.id || !item.deleteKey) {
        showToast("Delete key is missing for this item", "error");
        return;
    }

    try {
        const res = await fetch(`${apiBase}/api/delete/${item.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deleteKey: item.deleteKey })
        });
        const data = await res.json();
        if (!data.success) {
            throw new Error(data.error || "Delete failed");
        }
        showToast("Media deleted successfully");
        urlInput.value = ""; // Clear input after successful action
        await loadUserHistory();
        fetchStats();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function deleteTextHistoryItem(item) {
    if (!item.alias || !item.deleteKey) {
        showToast("Delete key is missing for this text", "error");
        return;
    }

    try {
        const res = await fetch(`${apiBase}/api/text/delete/${item.alias}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deleteKey: item.deleteKey })
        });
        const data = await res.json();
        if (!data.success) {
            throw new Error(data.error || "Delete failed");
        }
        showToast("Text deleted successfully");
        await loadUserHistory();
        fetchStats();
    } catch (err) {
        showToast(err.message, "error");
    }
}

function renderUploadHistory(items = []) {
    if (!uploadHistory || !uploadHistorySection) return;

    uploadHistory.innerHTML = "";

    if (items.length === 0) {
        const empty = document.createElement("div");
        empty.className = "history-empty-state";
        empty.textContent = "No media uploads found in your account.";
        uploadHistory.appendChild(empty);
        return;
    }

    items.forEach((item) => {
        const card = document.createElement("article");
        card.className = "history-card";
        card.tabIndex = 0;
        
        // Preview section
        const preview = document.createElement("div");
        preview.className = "history-preview";
        if ((item.contentType || "").startsWith("image/")) {
            const image = document.createElement("img");
            image.src = `${item.resourceUrl}?preview=true`;
            image.alt = item.originalName || "Media";
            image.loading = "lazy";
            preview.appendChild(image);
        } else if ((item.contentType || "").startsWith("video/")) {
            const video = document.createElement("video");
            video.src = `${item.resourceUrl}?preview=true`;
            video.muted = true;
            video.controls = false;
            video.preload = "metadata";
            preview.appendChild(video);
            
            const playIcon = document.createElement("div");
            playIcon.className = "preview-play-icon";
            playIcon.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>`;
            preview.appendChild(playIcon);
        } else {
            preview.classList.add("empty-preview");
            preview.textContent = "Media";
        }

        // Details section
        const info = document.createElement("div");
        info.className = "history-info";

        const title = document.createElement("h4");
        title.textContent = item.originalName || "Uploaded media";
        title.title = title.textContent;

        const meta = document.createElement("div");
        meta.className = "history-meta";
        const dateStr = item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : "Unknown date";
        meta.innerHTML = `
            <span class="badge">${item.contentType?.split('/')[1]?.toUpperCase() || "FILE"}</span>
            <span>${formatSize(item.size)}</span>
            <span>${dateStr}</span>
        `;

        info.append(title, meta);

        // Actions section
        const actions = document.createElement("div");
        actions.className = "history-actions";
        
        const copyBtn = createHistoryAction("Copy Link", "button tertiary small", () => {
            copyTextToClipboard(item.directlink || item.resourceUrl || "");
        });

        const viewBtn = document.createElement("a");
        viewBtn.className = "button secondary small";
        const isMedia = (item.contentType || "").startsWith("image/") || (item.contentType || "").startsWith("video/");
        if (isMedia) {
            viewBtn.textContent = "Download";
            viewBtn.href = `${item.resourceUrl}?dl`;
        } else {
            viewBtn.textContent = "View";
            viewBtn.href = item.resourceUrl;
        }
        viewBtn.target = "_blank";
        viewBtn.addEventListener("click", (e) => e.stopPropagation());

        const deleteBtn = createHistoryAction("Delete", "button danger small", () => {
            deleteHistoryItem({ id: item.resourceId, deleteKey: item.deleteKey });
        }, true);

        actions.append(copyBtn, viewBtn, deleteBtn);

        card.append(preview, info, actions);
        card.addEventListener("click", () => {
            if (item.resourceUrl) window.open(item.resourceUrl, "_blank");
        });
        
        uploadHistory.appendChild(card);
    });
}

function renderTextHistory(items = []) {
    if (!textHistory || !textHistorySection) return;

    textHistory.innerHTML = "";

    if (items.length === 0) {
        const empty = document.createElement("div");
        empty.className = "history-empty-state";
        empty.textContent = "No hosted text found in your account.";
        textHistory.appendChild(empty);
        return;
    }

    items.forEach((item) => {
        const card = document.createElement("article");
        card.className = "history-card text-card";
        card.tabIndex = 0;

        // Preview (Snippet)
        const preview = document.createElement("div");
        preview.className = "history-preview text-snippet";
        preview.textContent = item.snippet || "No preview available...";

        // Details
        const info = document.createElement("div");
        info.className = "history-info";

        const title = document.createElement("h4");
        title.textContent = item.alias || "Hosted text";

        const meta = document.createElement("div");
        meta.className = "history-meta";
        const dateStr = item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : "Unknown date";
        meta.innerHTML = `
            <span class="badge">TEXT</span>
            <span>${dateStr}</span>
            <span>ID: ${item.alias}</span>
        `;

        info.append(title, meta);

        // Actions
        const actions = document.createElement("div");
        actions.className = "history-actions";

        const copyBtn = createHistoryAction("Copy Link", "button tertiary small", () => {
            copyTextToClipboard(item.directlink || item.resourceUrl || "");
        });

        const viewBtn = document.createElement("a");
        viewBtn.className = "button secondary small";
        viewBtn.href = item.resourceUrl;
        viewBtn.target = "_blank";
        viewBtn.textContent = "View";
        viewBtn.addEventListener("click", (e) => e.stopPropagation());

        const deleteBtn = createHistoryAction("Delete", "button danger small", () => {
            deleteTextHistoryItem({ alias: item.alias, deleteKey: item.deleteKey });
        }, true);

        actions.append(copyBtn, viewBtn, deleteBtn);

        card.append(preview, info, actions);
        card.addEventListener("click", () => {
            if (item.resourceUrl) window.open(item.resourceUrl, "_blank");
        });

        textHistory.appendChild(card);
    });
}

function setUploadControls(disabled) {
    if (uploadButton) uploadButton.disabled = disabled;
    if (uploadUrlButton) uploadUrlButton.disabled = disabled;
    if (hostTextButton) {
        hostTextButton.disabled = disabled;
        hostTextButton.classList.toggle("loading", disabled);
    }
    if (dropZone) {
        const p = dropZone.querySelector("p");
        if (disabled) {
            dropZone.classList.add("uploading");
            if (p) p.textContent = "Uploading to server...";
        } else {
            dropZone.classList.remove("uploading");
            if (p) p.textContent = "Drop files here or click to browse";
        }
    }
}

function setUploadProgress(percent, label) {
    if (!uploadProgress || !uploadProgressBar || !uploadProgressPercent || !uploadProgressLabel) return;

    const value = Math.max(0, Math.min(100, Math.round(percent)));
    uploadProgress.hidden = false;
    uploadProgressBar.style.width = `${value}%`;
    uploadProgressPercent.textContent = `${value}%`;
    uploadProgressLabel.textContent = label;
}

function resetUploadProgress() {
    if (!uploadProgress || !uploadProgressBar || !uploadProgressPercent || !uploadProgressLabel) return;

    uploadProgress.hidden = true;
    uploadProgressBar.style.width = "0%";
    uploadProgressPercent.textContent = "0%";
    uploadProgressLabel.textContent = "Preparing download...";
}

function renderTextResult(result) {
    textResult.hidden = false;
    textUrl.textContent = result.url;
    textUrl.href = result.url;
    textRawUrl.textContent = result.rawUrl;
    textRawUrl.href = result.rawUrl;
    textDelete.textContent = result.deleteKey;
    textExpiry.textContent = new Date(result.expiresAt).toLocaleString();
}

async function uploadFile(file) {
    if (!authenticated) {
        showToast("Please sign in to upload", "error");
        showAuthSection();
        return;
    }
    const formData = new FormData();

    formData.append("file", file);
    setUploadControls(true);
    setUploadProgress(0, "Preparing download...");

    const data = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${apiBase}/api/upload`);
        xhr.withCredentials = true;

        xhr.upload.addEventListener("progress", (event) => {
            if (!event.lengthComputable) {
                setUploadProgress(35, "Uploading...");
                return;
            }

            const percent = (event.loaded / event.total) * 100;
            setUploadProgress(percent, `Uploading ${file.name}`);
        });

        xhr.addEventListener("load", () => {
            try {
                const parsed = JSON.parse(xhr.responseText || "{}");
                if (xhr.status < 200 || xhr.status >= 300 || !parsed.success) {
                    reject(new Error(parsed.error || "Upload failed"));
                    return;
                }
                resolve(parsed);
            } catch (err) {
                reject(new Error("Upload response was invalid"));
            }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
        xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));
        xhr.send(formData);
    }).catch((err) => {
        showToast(err.message, "error");
        return null;
    }).finally(() => {
        setUploadControls(false);
    });

    if (!data) {
        setUploadProgress(0, "Upload failed");
        return;
    }

    setUploadProgress(100, "Upload complete");
    renderMediaResult(data);
    await loadUserHistory();
    showToast("Media uploaded successfully");
    fetchStats();
    setTimeout(resetUploadProgress, 1200);
}

async function uploadUrl() {
    const url = urlInput.value.trim();
    if (!url) {
        showToast("Remote URL is required", "error");
        return;
    }
    setUploadControls(true);
    setUploadProgress(0, "Preparing download...");
    try {
        setUploadProgress(45, "Downloading remote media...");
        const res = await fetch(`${apiBase}/api/upload-url`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ url })
        });
        const data = await res.json();
        if (!data.success) {
            throw new Error(data.error || "Upload failed");
        }
        setUploadProgress(100, "Upload complete");
        renderMediaResult(data);
        await loadUserHistory();
        showToast("Media uploaded from URL successfully");
        fetchStats();
        setTimeout(resetUploadProgress, 1200);
    } catch (err) {
        setUploadProgress(0, "Upload failed");
        showToast(err.message, "error");
    } finally {
        urlInput.value = "";
        setUploadControls(false);
    }
}

async function deleteMedia() {
    const id = deleteMediaId.value.trim();
    const key = deleteMediaKey.value.trim();
    if (!id || !key) {
        setFeedback(deleteMediaFeedback, "File ID and delete key are required", "error");
        return;
    }
    try {
        const res = await fetch(`${apiBase}/api/delete/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deleteKey: key })
        });
        const data = await res.json();
        if (!data.success) {
            throw new Error(data.error || "Delete failed");
        }
        setFeedback(deleteMediaFeedback, "File deleted successfully", "success");
        fetchStats();
    } catch (err) {
        setFeedback(deleteMediaFeedback, err.message, "error");
    }
}

async function hostText() {
    if (!authenticated) {
        showToast("Please sign in to host text", "error");
        showAuthSection();
        return;
    }
    const text = textInput.value.trim();

    if (!text) {
        showToast("Text content is required", "error");
        return;
    }
    const aliasValue = customAlias.value.trim();
    const validation = validateAliasValue(aliasValue);
    if (!validation.valid) {
        showToast(validation.error, "error");
        return;
    }
    if (aliasValue && !(await checkAliasAvailability())) {
        showToast("Please choose an available alias before hosting.", "error");
        return;
    }
    setUploadControls(true);
    setUploadProgress(10, "Preparing text host...");
    try {
        const payload = {
            text,
            alias: validation.alias || undefined,
            adminPassword: adminPassword.value || undefined,
            viewPassword: viewPassword.value || undefined,
            dayLimit: dayLimit.value || undefined,
            options: {
                preformatted: optPreformatted.checked,
                clickable: optClickable.checked,
                bbcode: optBbcode.checked
            }
        };
        const res = await fetch(`${apiBase}/api/text`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.success) {
            throw new Error(data.error || "Text hosting failed");
        }
        setUploadProgress(100, "Text hosted successfully");
        renderTextResult(data);
        await loadUserHistory();
        showToast("Text hosted successfully");
        fetchStats();
    } catch (err) {
        setUploadProgress(0, "Hosting failed");
        showToast(err.message, "error");
    } finally {
        setTimeout(resetUploadProgress, 1200);
        setUploadControls(false);
    }
}

function validateAliasValue(value) {
    const alias = value.trim().toLowerCase();
    if (!alias) {
        return { valid: true, alias: "" };
    }
    if (!/^[a-z0-9-_]+$/.test(alias)) {
        return { valid: false, error: "Alias may only contain letters, numbers, hyphens, and underscores." };
    }
    if (alias.length > 40) {
        return { valid: false, error: "Alias must be 1-40 characters long." };
    }
    return { valid: true, alias };
}

async function checkAliasAvailability() {
    hideFeedback(aliasFeedback);
    const input = customAlias.value.trim();
    const validation = validateAliasValue(input);
    if (!validation.valid) {
        setFeedback(aliasFeedback, validation.error, "error");
        return false;
    }
    if (!validation.alias) {
        setFeedback(aliasFeedback, "No alias provided, a random link will be generated.", "success");
        return true;
    }
    try {
        const res = await fetch(`${apiBase}/api/check-alias/${encodeURIComponent(validation.alias)}`);
        const data = await res.json();
        if (!data.success) {
            throw new Error(data.error || "Alias check failed");
        }
        if (data.available) {
            setFeedback(aliasFeedback, `Alias available: ${validation.alias}`, "success");
            return true;
        }
        setFeedback(aliasFeedback, `Alias already taken: ${validation.alias}`, "error");
        return false;
    } catch (err) {
        setFeedback(aliasFeedback, err.message, "error");
        return false;
    }
}

function copyTextToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast("Copied to clipboard");
    }).catch(() => {
        showToast("Copy failed", "error");
    });
}

function simpleRender(text, options = {}) {
    const escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    let result = escaped;
    if (options.bbcode) {
        result = result
            .replace(/\[b\](.*?)\[\/b\]/gi, "<strong>$1</strong>")
            .replace(/\[i\](.*?)\[\/i\]/gi, "<em>$1</em>")
            .replace(/\[u\](.*?)\[\/u\]/gi, "<span style='text-decoration: underline;'>$1</span>")
            .replace(/\[s\](.*?)\[\/s\]/gi, "<del>$1</del>")
            .replace(/\[br\]/gi, "<br />")
            .replace(/\[color=(#?[a-zA-Z0-9]+)\](.*?)\[\/color\]/gi, "<span style='color:$1'>$2</span>")
            .replace(/\[size=(\d+)\](.*?)\[\/size\]/gi, "<span style='font-size:$1px'>$2</span>")
            .replace(/\[font=([^\]]+)\](.*?)\[\/font\]/gi, "<span style='font-family:$1'>$2</span>")
            .replace(/\[align=(left|center|right)\](.*?)\[\/align\]/gi, "<div style='text-align:$1'>$2</div>")
            .replace(/\[center\](.*?)\[\/center\]/gi, "<div style='text-align:center'>$1</div>")
            .replace(/\[quote(?:=([^\]]+))?\](.*?)\[\/quote\]/gi, "<blockquote><strong>$1</strong><p>$2</p></blockquote>")
            .replace(/\[code\](.*?)\[\/code\]/gi, "<pre class='code-block'>$1</pre>")
            .replace(/\[url\](https?:\/\/[^\s]+)\[\/url\]/gi, "<a href='$1' target='_blank'>$1</a>")
            .replace(/\[url=(https?:\/\/[^\]]+)\](.*?)\[\/url\]/gi, "<a href='$1' target='_blank'>$2</a>")
            .replace(/\[email\](.*?)\[\/email\]/gi, "<a href='mailto:$1'>$1</a>")
            .replace(/\[email=([^\]]+)\](.*?)\[\/email\]/gi, "<a href='mailto:$1'>$2</a>")
            .replace(/\[img\](https?:\/\/[^\s]+)\[\/img\]/gi, "<img src='$1' alt='Embedded image' />");
    }

    if (options.clickable) {
        result = result.replace(/(https?:\/\/[^\s]+)/g, "<a href='$1' target='_blank'>$1</a>");
    }

    if (options.preformatted) {
        return `<pre>${result}</pre>`;
    }

    return result.replace(/\n/g, "<br />");
}

async function loadTextPage() {
    if (!metadataArea || !textOutput) return;
    const params = new URLSearchParams(window.location.search);
    const alias = params.get("alias");

    if (!alias) {
        setFeedback(pageFeedback, "Missing text alias in URL.", "error");
        pageFeedback.hidden = false;
        return;
    }

    try {
        const metadataRes = await fetch(`${apiBase}/api/text/metadata/${alias}`);
        const metadata = await metadataRes.json();
        if (!metadata.success) {
            throw new Error(metadata.error || "Unable to load metadata");
        }

        metaAlias.textContent = metadata.alias;
        metaViews.textContent = metadata.views;
        metaExpires.textContent = metadata.expiresAt ? new Date(metadata.expiresAt).toLocaleString() : "Never";
        metaProtected.textContent = metadata.protected ? "Yes" : "No";
        metadataArea.hidden = false;

        rawLink.href = `${apiBase}/t/${alias}`;
        rawLink.textContent = "Open raw text";

        if (metadata.protected) {
            passwordPanel.hidden = false;
            return;
        }

        await fetchTextContent(alias);
    } catch (err) {
        setFeedback(pageFeedback, err.message, "error");
    }
}

async function fetchTextContent(alias, password) {
    try {
        let url = `${apiBase}/api/text/view/${alias}`;
        if (password) {
            url += `?pw=${encodeURIComponent(password)}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (!data.success) {
            throw new Error(data.error || "Unable to load text");
        }
        renderTextPage(data);
    } catch (err) {
        setFeedback(pageFeedback, err.message, "error");
    }
}

function renderTextPage(data) {
    passwordPanel.hidden = true;
    const alias = new URLSearchParams(window.location.search).get("alias");
    rawLink.href = `${apiBase}/t/${alias}`;
    const html = simpleRender(data.text, data.options || {});
    renderedText.innerHTML = html;
    textOutput.hidden = false;
    adminPanel.hidden = false;
    adminTextInput.value = data.text;
    adminOptPreformatted.checked = data.options?.preformatted || false;
    adminOptClickable.checked = data.options?.clickable || false;
    adminOptBbcode.checked = data.options?.bbcode || false;
}

async function unlockProtectedText() {
    const alias = new URLSearchParams(window.location.search).get("alias");
    const password = viewPasswordInput.value.trim();
    if (!password) {
        setFeedback(pageFeedback, "Viewing password is required.", "error");
        return;
    }
    await fetchTextContent(alias, password);
}

secureInput(adminPasswordInput, "admin");

function secureInput(input, prefix) {
    if (!input) return;
    input.addEventListener("input", () => {
        if (input.value.length > 128) {
            input.value = input.value.slice(0, 128);
        }
    });
}

async function saveTextUpdate() {
    const alias = new URLSearchParams(window.location.search).get("alias");
    const adminPasswordValue = adminPasswordInput.value.trim();
    const updatedText = adminTextInput.value.trim();

    if (!adminPasswordValue) {
        setFeedback(adminFeedback, "Admin password is required to update.", "error");
        return;
    }

    const payload = {
        text: updatedText,
        adminPassword: adminPasswordValue,
        viewPassword: viewPasswordInput.value.trim() || undefined,
        dayLimit: adminDayLimit.value || undefined,
        options: {
            preformatted: adminOptPreformatted.checked,
            clickable: adminOptClickable.checked,
            bbcode: adminOptBbcode.checked
        }
    };

    try {
        const res = await fetch(`${apiBase}/api/text/update/${alias}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.success) {
            throw new Error(data.error || "Update failed");
        }
        setFeedback(adminFeedback, "Text updated successfully.", "success");
        fetchStats();
    } catch (err) {
        setFeedback(adminFeedback, err.message, "error");
    }
}

if (dropZone) {
    dropZone.addEventListener("click", () => fileInput.click());
    dropZone.addEventListener("dragover", (event) => {
        event.preventDefault();
        dropZone.classList.add("drag-over");
    });
    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("drag-over");
    });
    dropZone.addEventListener("drop", (event) => {
        event.preventDefault();
        dropZone.classList.remove("drag-over");
        const files = event.dataTransfer.files;
        if (files.length) {
            selectedUploadFile = files[0];
            showToast("File ready. Click Upload file to start.");
        }
    });
}

if (fileInput) {
    fileInput.addEventListener("change", () => {
        if (fileInput.files.length) {
            selectedUploadFile = fileInput.files[0];
            showToast("File ready. Click Upload file to start.");
        }
    });
}

if (uploadButton) {
    uploadButton.addEventListener("click", () => {
        const file = selectedUploadFile || fileInput.files[0];
        if (file) {
            setUploadProgress(0, "Preparing download...");
            uploadFile(file);
        } else {
            showToast("Choose a file to upload", "error");
        }
    });
}

if (uploadUrlButton) {
    uploadUrlButton.addEventListener("click", uploadUrl);
}

if (copyMediaUrl) {
    copyMediaUrl.addEventListener("click", () => {
        if (mediaDirectUrl.href) copyTextToClipboard(mediaDirectUrl.href);
    });
}

if (copyTextUrl) {
    copyTextUrl.addEventListener("click", () => {
        if (textUrl.href) copyTextToClipboard(textUrl.href);
    });
}

if (deleteMediaButton) {
    deleteMediaButton.addEventListener("click", deleteMedia);
}

if (hostTextButton) {
    hostTextButton.addEventListener("click", hostText);
}

if (checkAliasButton) {
    checkAliasButton.addEventListener("click", checkAliasAvailability);
}

if (customAlias) {
    customAlias.addEventListener("blur", () => {
        if (customAlias.value.trim()) {
            checkAliasAvailability();
        }
    });
}

if (unlockText) {
    unlockText.addEventListener("click", unlockProtectedText);
}

if (copyTextButton) {
    copyTextButton.addEventListener("click", () => {
        copyTextToClipboard(renderedText.textContent || "");
    });
}

if (saveTextButton) {
    saveTextButton.addEventListener("click", saveTextUpdate);
}

if (clearHistoryButton) {
    let confirmState = false;
    let timeout;
    clearHistoryButton.addEventListener("click", () => {
        if (!confirmState) {
            confirmState = true;
            clearHistoryButton.textContent = "Confirm Clear?";
            clearHistoryButton.classList.add("confirming");
            timeout = setTimeout(() => {
                confirmState = false;
                clearHistoryButton.textContent = "Clear history";
                clearHistoryButton.classList.remove("confirming");
            }, 3000);
        } else {
            clearTimeout(timeout);
            confirmState = false;
            clearHistoryButton.textContent = "Clear history";
            clearHistoryButton.classList.remove("confirming");
            clearHistory("media");
        }
    });
}

if (clearTextHistoryButton) {
    let confirmState = false;
    let timeout;
    clearTextHistoryButton.addEventListener("click", () => {
        if (!confirmState) {
            confirmState = true;
            clearTextHistoryButton.textContent = "Confirm Clear?";
            clearTextHistoryButton.classList.add("confirming");
            timeout = setTimeout(() => {
                confirmState = false;
                clearTextHistoryButton.textContent = "Clear history";
                clearTextHistoryButton.classList.remove("confirming");
            }, 3000);
        } else {
            clearTimeout(timeout);
            confirmState = false;
            clearTextHistoryButton.textContent = "Clear history";
            clearTextHistoryButton.classList.remove("confirming");
            clearHistory("text");
        }
    });
}

document.querySelectorAll(".api-reference-card").forEach((card) => {
    const requestBlock = card.querySelector(".code-sample");
    if (!requestBlock) return;

    const wrapper = document.createElement("div");
    wrapper.className = "request-code";
    requestBlock.parentNode.insertBefore(wrapper, requestBlock);
    wrapper.appendChild(requestBlock);

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "api-copy-button";
    copyButton.textContent = "Copy";
    copyButton.addEventListener("click", () => {
        copyTextToClipboard(requestBlock.textContent.trim());
        copyButton.textContent = "Copied";
        setTimeout(() => {
            copyButton.textContent = "Copy";
        }, 1400);
    });
    wrapper.appendChild(copyButton);
});

if (sendCodeButton) {
    sendCodeButton.addEventListener("click", handleSendCode);
}

if (authForm) {
    authForm.addEventListener("submit", handleVerifyCode);
}

if (googleAuthButton) {
    googleAuthButton.addEventListener("click", () => {
        window.location.href = "/auth/google";
    });
}

async function handleSendCode() {
    const email = document.getElementById("email").value.trim();
    if (!email) {
        showAuthFeedback("Please enter your email address");
        return;
    }

    sendCodeButton.disabled = true;
    sendCodeButton.textContent = "Sending...";

    try {
        const res = await fetch(`${apiBase}/api/auth/send-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || "Failed to send code");
        }

        codeSection.hidden = false;
        document.getElementById("code").focus();
        showAuthFeedback("Verification code sent! Check your email.", "success");
    } catch (err) {
        showAuthFeedback(err.message);
    } finally {
        sendCodeButton.disabled = false;
        sendCodeButton.textContent = "Get verification code";
    }
}

async function handleVerifyCode(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const code = document.getElementById("code").value.trim();

    if (!email || !code) {
        showAuthFeedback("Please enter email and verification code");
        return;
    }

    verifyCodeButton.disabled = true;
    verifyCodeButton.textContent = "Verifying...";

    try {
        const res = await fetch(`${apiBase}/api/auth/verify-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || "Invalid verification code");
        }

        // Success - reload session and show upload UI
        await loadUserSession();
        showToast("Welcome to DSCLOUD!");
    } catch (err) {
        showAuthFeedback(err.message);
    } finally {
        verifyCodeButton.disabled = false;
        verifyCodeButton.textContent = "Verify & Sign in";
    }
}

function showAuthFeedback(message, type = "error") {
    if (!authFeedback) return;
    authFeedback.textContent = message;
    authFeedback.className = type === "error" ? "notice error" : "notice success";
    authFeedback.hidden = false;
}

if (window.location.pathname.endsWith("text.html") || window.location.pathname.endsWith("text-host.html")) {
    loadTextPage();
}

setupMobileNavigation();
renderAuthLinks();
loadUserSession();
fetchStats();
