const main = document.querySelector("main");
export const setVisibility = () => {
  const x = document.documentElement.style.getPropertyValue("--x");
  const y = document.documentElement.style.getPropertyValue("--y");

  const product = x * y;
  if (!product || product === 0) {
    console.error("Invalid product");
  }
  Array.from(main.children).forEach((el, index) => {
    if (index < product) {
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
    }
  });
};
