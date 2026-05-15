const authForm = document.getElementById("auth-form");
const authFeedback = document.getElementById("auth-feedback");
const authTitle = document.getElementById("auth-title");
const authSubmit = document.getElementById("auth-submit");
const googleAuthButton = document.getElementById("google-auth-button");
const isRegisterPage = document.body.classList.contains("register-page");

function setAuthFeedback(message, type = "error") {
    if (!authFeedback) return;
    authFeedback.textContent = message;
    authFeedback.className = type === "error" ? "notice error" : "notice success";
    authFeedback.hidden = false;
}

function clearAuthFeedback() {
    if (!authFeedback) return;
    authFeedback.hidden = true;
    authFeedback.textContent = "";
}

async function handleAuthSubmit(event) {
    event.preventDefault();
    clearAuthFeedback();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password")?.value;

    if (!email || !password) {
        setAuthFeedback("Email and password are required.");
        return;
    }

    if (isRegisterPage && password !== confirmPassword) {
        setAuthFeedback("Passwords do not match.");
        return;
    }

    const endpoint = isRegisterPage ? "/api/register" : "/api/login";
    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || "Authentication failed");
        }

        window.location.href = "/";
    } catch (err) {
        setAuthFeedback(err.message || "Unable to sign in.");
    }
}

if (authSubmit) {
    authSubmit.addEventListener("click", handleAuthSubmit);
}

if (authForm) {
    authForm.addEventListener("submit", handleAuthSubmit);
}

if (googleAuthButton) {
    googleAuthButton.addEventListener("click", () => {
        window.location.href = "/auth/google";
    });
}
