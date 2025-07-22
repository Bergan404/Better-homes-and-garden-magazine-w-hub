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
});

// $(document).ready(function () {
//     let currentSection = null;

//     $(".ai-select-btn").on("click", function () {
//         const target = $(this).data("target");
//         currentSection = target;

//         $("section[id]").addClass("d-none");
//         $(target).removeClass("d-none");
//     });

//     $("#copyOutput").on("click", function () {
//         const outputText = $(currentSection).find(".ai-output").text().trim();

//         if (!outputText) {
//             navigator.clipboard.writeText(outputText).then(() => {
//                 const copiedMsg = $(this).closest("section").find(".copied");
//                 copiedMsg.css("visibility", "visible");

//                 setTimeout(() => {
//                     copiedMsg.css("visibility", "hidden");
//                 }, 2000);
//             });
//         }

//         if (outputText) {
//             navigator.clipboard.writeText(outputText).then(() => {
//                 const copiedMsg = $(this).closest("section").find(".copied");
//                 copiedMsg.css("visibility", "visible");

//                 setTimeout(() => {
//                     copiedMsg.css("visibility", "hidden");
//                 }, 2000);
//             });
//         }
//     });
// });

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