document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.ai-form').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;

            const section = form.getAttribute('data-section');
            const textarea = form.querySelector('textarea');
            const output = form.nextElementSibling;
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
