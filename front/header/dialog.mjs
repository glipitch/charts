const dialog = document.querySelector("dialog");
document.documentElement.dataset.current = "hidden";
document.querySelector(".dialog-visibility").querySelector("svg").innerHTML = `
<path  
d="M4.707 2.293a1 1 0 00-1.414 1.414l6 6a1 1 0 001.414 0l6-6a1 1 0 00-1.414-1.414L10 7.586 4.707 2.293zm0 8a1 1 0 10-1.414 1.414l6 6a1 1 0 001.414 0l6-6a1 1 0 00-1.414-1.414L10 15.586l-5.293-5.293z" />
`;

document.querySelector("header").addEventListener("click", async () => {
  if (dialog.open) {
    document.documentElement.dataset.current = "hidden";

    dialog.close();
  } else {
    open();
  }
});
export const open = () => {
  document.documentElement.dataset.current = "visible";
  dialog.show();

}
