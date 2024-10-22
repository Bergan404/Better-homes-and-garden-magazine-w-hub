document.addEventListener("DOMContentLoaded", () => {
  const viewBtn = document.querySelector(".view-modal");
  const popup = document.querySelector(".popup");
  const overlay = document.querySelector(".pop-up-overlay");
  const sharButtons = document.querySelector(".share-print");
  const close = popup.querySelector(".close");
  const field = popup.querySelector(".field");
  const input = field.querySelector("input");
  const copy = field.querySelector("button");

  viewBtn.addEventListener("click", () => {
    popup.classList.toggle("show");
    overlay.classList.toggle("seen");
    sharButtons.classList.toggle("white");
  });

  close.addEventListener("click", () => {
    viewBtn.click();
  });

  // copy.addEventListener("click", () => {
  //     input.select(); // Select input value
  //     if (document.execCommand("copy")) { // If the selected text is copied
  //         field.classList.add("active");
  //         copy.innerText = "Copied";
  //         setTimeout(() => {
  //             window.getSelection().removeAllRanges(); // Remove selection from document
  //             field.classList.remove("active");
  //             copy.innerText = "Copy";
  //         }, 3000);
  //     }
  // });
});
