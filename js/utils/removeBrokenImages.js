export function removeBrokenImages() {
  const images = document.querySelectorAll("img[data-remove-on-error]");

  images.forEach((image) => {
    function removeBrokenItem() {
      const selector = image.dataset.removeOnError;

      const item = image.closest(selector);

      if (item) {
        item.remove();
      } else {
        image.remove();
      }
    }

    image.addEventListener("error", removeBrokenItem, { once: true });

    if (image.complete && image.naturalWidth === 0) {
      removeBrokenItem();
    }
  });
}
