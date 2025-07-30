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

    const form = document.getElementById("chatForm");
    const input = document.getElementById("userInput");
    const chatBox = document.getElementById("chatBox");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const userText = input.value.trim();
        if (!userText) return;

        appendMessage("user", userText);
        input.value = "";

        activateFullHeightMode();

        const loadingMsg = appendMessage("ai", "...");

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userText }),
            });

            if (!response.ok) {
                const text = await response.text();
                console.error("API error:", response.status, text);
                appendMessage("ai", `Error ${response.status}: ${text}`);
                return;
            }

            const data = await response.json();
            loadingMsg.remove();
            const dynamicSpeed = data.reply.length > 500 ? 5 : 15;
            typeMessage("ai", data.reply || "No response", dynamicSpeed);
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
                msg.textContent = currentText; // show as plain text while typing
                index++;
                chatBox.scrollTop = chatBox.scrollHeight;
                setTimeout(type, speed);
            } else {
                // replace plain text with rendered Markdown
                msg.innerHTML = marked.parse(text);
                saveChatHistory();
            }
        }

        type();
    }

    // Save chat to localStorage
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

    // Load chat from localStorage
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
        msg.innerHTML = marked.parse(text);
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

