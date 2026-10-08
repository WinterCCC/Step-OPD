(() => {
  "use strict";

  document.documentElement.classList.add("js-ready");

  const copyButton = document.querySelector("[data-copy-bib]");
  const copyLabel = document.querySelector("[data-copy-label]");
  const copyStatus = document.querySelector("[data-copy-status]");
  const bibtex = document.querySelector("#bibtex");

  const fallbackCopy = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (_error) {
      copied = false;
    }

    textArea.remove();
    return copied;
  };

  if (copyButton && copyLabel && copyStatus && bibtex) {
    copyButton.addEventListener("click", async () => {
      const text = bibtex.textContent;
      let copied = false;

      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          copied = true;
        } catch (_error) {
          copied = fallbackCopy(text);
        }
      } else {
        copied = fallbackCopy(text);
      }

      copyLabel.textContent = copied ? "Copied" : "Select text";
      copyStatus.textContent = copied
        ? "BibTeX copied to clipboard."
        : "Clipboard access was unavailable. Select the citation text to copy it.";

      window.setTimeout(() => {
        copyLabel.textContent = "Copy";
      }, 1800);
    });
  }

  document.querySelectorAll("[data-gallery]").forEach((gallery) => {
    const items = Array.from(gallery.querySelectorAll(".gallery-item"));
    const previousButton = gallery.querySelector("[data-gallery-prev]");
    const nextButton = gallery.querySelector("[data-gallery-next]");
    const dotsContainer = gallery.querySelector(".gallery-dots");

    if (items.length < 2 || !previousButton || !nextButton || !dotsContainer) {
      return;
    }

    let activeIndex = 0;
    const dots = items.map((_item, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "gallery-dot";
      dot.setAttribute("aria-label", `Show comparison ${String.fromCharCode(65 + index)}`);
      dot.addEventListener("click", () => showItem(index));
      dotsContainer.appendChild(dot);
      return dot;
    });

    const showItem = (index) => {
      activeIndex = (index + items.length) % items.length;
      items.forEach((item, itemIndex) => {
        const isActive = itemIndex === activeIndex;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-hidden", String(!isActive));
      });
      dots.forEach((dot, dotIndex) => {
        if (dotIndex === activeIndex) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    };

    previousButton.addEventListener("click", () => showItem(activeIndex - 1));
    nextButton.addEventListener("click", () => showItem(activeIndex + 1));
    gallery.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showItem(activeIndex - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        showItem(activeIndex + 1);
      }
    });

    gallery.classList.add("is-ready");
    showItem(activeIndex);
  });
})();

/* 按模型名切换的对比块。可有多组, 每组自带路径前缀与分隔符。 */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('.compare-block'), function (block) {
    var pills = Array.prototype.slice.call(block.querySelectorAll('.model-pill'));
    var imgs  = Array.prototype.slice.call(block.querySelectorAll('.compare-img'));
    if (!pills.length || !imgs.length) return;
    var prefix = block.dataset.prefix || '';
    var sep    = block.dataset.sep || '_';

    function src(model, key) { return prefix + model + sep + key + '.jpg'; }

    function show(model) {
      imgs.forEach(function (img) { img.src = src(model, img.dataset.key); });
      pills.forEach(function (b) {
        var on = b.dataset.model === model;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    pills.forEach(function (b) {
      b.addEventListener('click', function () { show(b.dataset.model); });
    });

    // 首屏之后预取其余模型, 切换时不闪白。
    window.addEventListener('load', function () {
      pills.forEach(function (b) {
        imgs.forEach(function (img) {
          var pre = new Image();
          pre.src = src(b.dataset.model, img.dataset.key);
        });
      });
    });
  });
})();
