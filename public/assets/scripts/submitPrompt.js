document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.ai-form').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;

            const section = form.getAttribute('data-section');
            const textarea = form.querySelector('textarea');
            const output = form.parentElement.querySelector(".ai-output");
            const userInput = textarea.value;

            output.classList.remove('hidden');
            output.textContent = 'Generating...';

            try {
                const res = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ promptType: section, userInput })
                });

                const data = await res.json();
                output.textContent = data.result || 'No response.';
            } catch (err) {
                output.textContent = 'An error occurred.';
                console.error(err);
            } finally {
                submitButton.disabled = false;
            }
        });
    });

    document.getElementById("newChatBtn").addEventListener("click", () => {
        chatBox.innerHTML = "";
        localStorage.removeItem("chatHistory");
        localStorage.removeItem("fullHeightMode");
        location.reload();
    });

    const bottom_container = document.querySelector(".thread-bottom-container");
    const top_container = document.querySelector(".thread-top-container");
    const chat_box = document.querySelector(".chat-box");

    function activateFullHeightMode() {
        bottom_container.classList.add("full-height-mode");
        top_container.classList.add("d-none");
        chat_box.classList.remove("hidden");
        localStorage.setItem("fullHeightMode", "true");
    }

    if (localStorage.getItem("fullHeightMode") === "true") {
        activateFullHeightMode();
    }

    let selectedPrompt = "";

    const form = document.getElementById("chatForm");
    const input = document.getElementById("userInput");
    const chatBox = document.getElementById("chatBox");

    const promptToggle = document.getElementById("promptToggle");
    const promptMenu = document.getElementById("promptMenu");

    input.addEventListener("input", () => {
        input.style.height = "auto";
        input.style.height = input.scrollHeight + "px";
    });
    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            form.dispatchEvent(new Event("submit"));
        }
    });

    promptToggle.addEventListener("click", () => {
        promptMenu.classList.toggle("d-none");
    });

    promptMenu.querySelectorAll("li").forEach((item) => {
        item.addEventListener("click", () => {
            selectedPrompt = item.dataset.section;
            selectedPromptText = item.dataset.text;

            const existingLabel = document.querySelector(".prompt-label");
            if (existingLabel) existingLabel.remove();

            const label = document.createElement("div");
            const name = document.createElement("p");
            const close = document.createElement("span");

            label.className = "prompt-label mb-2 text-white d-flex justify-content-between align-items-center";
            name.className = "mb-0";
            close.className = "mb-0 prompt-close";
            name.textContent = selectedPromptText;
            close.innerHTML = `<i class="fa-solid fa-xmark" style="cursor:pointer;"></i>`;

            close.addEventListener("click", () => {
                selectedPrompt = "";
                selectedPromptText = "";
                label.remove();
                chatBox.classList.remove("prompt-spacing");
            });

            label.appendChild(name);
            label.appendChild(close);
            form.insertBefore(label, input);

            promptMenu.classList.add("d-none");
            chatBox.classList.add("prompt-spacing");
            input.focus();
        });
    });


    document.addEventListener("click", (e) => {
        if (!promptToggle.contains(e.target) && !promptMenu.contains(e.target)) {
            promptMenu.classList.add("d-none");
        }
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const userText = input.value.trim();
        if (!userText) return;

        const isPrompt = !!selectedPrompt;
        // const fullMessage = isPrompt ? `${selectedPromptText} ${userText}` : userText;

        appendMessage("user", userText);
        input.value = "";

        activateFullHeightMode();

        const loadingMsg = appendMessage("ai", "...");

        try {
            let response;

            if (isPrompt) {
                response = await fetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        promptType: selectedPrompt,
                        userInput: userText,
                    }),
                });
            } else {
                response = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: userText }),
                });
            }

            if (!response.ok) {
                const text = await response.text();
                console.error("API error:", response.status, text);
                appendMessage("ai", `Error ${response.status}: ${text}`);
                return;
            }

            const data = await response.json();
            loadingMsg.remove();
            const replyText = isPrompt ? data.result : data.reply;
            const dynamicSpeed = replyText.length > 500 ? 5 : 15;
            typeMessage("ai", replyText || "No response", dynamicSpeed);
        } catch (err) {
            loadingMsg.remove();
            appendMessage("ai", "Error: Could not get a response.");
            console.error(err);
        }
    });

    function typeMessage(sender, text, speed) {
        const msg = document.createElement("div");
        msg.className = `message ${sender}-msg`;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;

        let index = 0;
        let currentText = "";

        function type() {
            if (index < text.length) {
                currentText += text.charAt(index);
                msg.textContent = currentText;
                index++;
                chatBox.scrollTop = chatBox.scrollHeight;
                setTimeout(type, speed);
            } else {
                msg.innerHTML = marked.parse(text);
                saveChatHistory();
            }
        }

        type();
    }

    function saveChatHistory() {
        const messages = [];
        chatBox.querySelectorAll('.message').forEach(msg => {
            messages.push({
                sender: msg.classList.contains('user-msg') ? 'user' : 'ai',
                text: msg.textContent,
            });
        });
        localStorage.setItem('chatHistory', JSON.stringify(messages));
    }

    function loadChatHistory() {
        const history = localStorage.getItem('chatHistory');
        if (!history) return;

        const messages = JSON.parse(history);
        messages.forEach(msg => {
            appendMessage(msg.sender, msg.text);
        });

        activateFullHeightMode();
    }

    loadChatHistory();

    function appendMessage(sender, text) {
        const msg = document.createElement("div");
        msg.className = `message ${sender}-msg`;

        // Message content (supports markdown)
        const content = document.createElement("div");
        content.className = "message-content";
        content.innerHTML = marked.parse(text);
        msg.appendChild(content);

        // ✅ Only append toolbar if it's an AI message
        if (sender === "ai") {
            const toolbar = document.createElement("div");
            toolbar.className = "message-toolbar mt-2 d-flex gap-2";

            const copyBtn = document.createElement("button");
            copyBtn.className = "toolbar-btn";
            copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
            copyBtn.title = "Copy";
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(content.innerText);
                copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
                }, 2000);
            };

            const thumbsUpBtn = document.createElement("button");
            thumbsUpBtn.className = "toolbar-btn";
            thumbsUpBtn.innerHTML = '<i class="fa-regular fa-thumbs-up"></i>';
            thumbsUpBtn.title = "Good response";

            const thumbsDownBtn = document.createElement("button");
            thumbsDownBtn.className = "toolbar-btn";
            thumbsDownBtn.innerHTML = '<i class="fa-regular fa-thumbs-down"></i>';
            thumbsDownBtn.title = "Bad response";

            // const shareBtn = document.createElement("button");
            // shareBtn.className = "toolbar-btn";
            // shareBtn.innerHTML = '<i class="fa-solid fa-share-nodes"></i>';
            // shareBtn.title = "Share";
            // shareBtn.onclick = () => {
            //     navigator.clipboard.writeText(content.innerText);
            //     alert("Response copied for sharing!");
            // };

            toolbar.append(copyBtn, thumbsUpBtn, thumbsDownBtn);
            msg.appendChild(toolbar);
        }

        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
        saveChatHistory();
        return msg;
    }
});

let $activeSection = null;

$(document).ready(function () {
    $(".ai-select-btn").on("click", function () {
        const targetId = $(this).data("target");
        const $section = $(targetId);
        currentSection = targetId;

        $activeSection = $section;
        $("#aiPromptModalBody").empty().append($section);
        $section.removeClass("d-none");

        const titleText = $section.find("h2").text();
        $("#aiPromptModalLabel").text(titleText);

        const modal = new bootstrap.Modal(document.getElementById("aiPromptModal"));
        modal.show();
    });

    $("#aiPromptModal").on("hidden.bs.modal", function () {
        document.activeElement?.blur();

        if ($activeSection) {
            $("main").append($activeSection);
            $activeSection.addClass("d-none");
            $activeSection = null;
        }
    });

    let currentSection = null;

    $(".copyOutput").on("click", function () {
        const outputText = $(currentSection).find(".ai-output").text().trim();

        if (!outputText) {
            navigator.clipboard.writeText(outputText).then(() => {
                const copiedMsg = $(this).closest("section").find(".copied");
                copiedMsg.css("visibility", "visible");

                setTimeout(() => {
                    copiedMsg.css("visibility", "hidden");
                }, 2000);
            });
        }

        if (outputText) {
            navigator.clipboard.writeText(outputText).then(() => {
                const copiedMsg = $(this).closest("section").find(".copied");
                copiedMsg.css("visibility", "visible");

                setTimeout(() => {
                    copiedMsg.css("visibility", "hidden");
                }, 2000);
            });
        }
    });
});

