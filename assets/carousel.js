(function () {
  var root = document.querySelector("[data-carousel]");
  if (!root) return;

  var track = root.querySelector(".carousel-track");
  var slides = Array.prototype.slice.call(track.children);
  if (slides.length < 2) return;

  var prevBtn = root.querySelector(".carousel-prev");
  var nextBtn = root.querySelector(".carousel-next");
  var dotsBox = root.querySelector(".carousel-dots");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var index = 0;
  var timer = null;
  var animating = false;
  var animTimer = null;

  var dots = slides.map(function (_, i) {
    var dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", "第 " + (i + 1) + " 张，共 " + slides.length + " 张");
    dot.addEventListener("click", function () {
      go(i);
      restart();
    });
    dotsBox.appendChild(dot);
    return dot;
  });

  function render() {
    dots.forEach(function (dot, i) {
      dot.setAttribute("aria-current", i === index ? "true" : "false");
    });
  }

  function go(i, smooth) {
    var wrapped = i < 0 || i >= slides.length;
    index = (i + slides.length) % slides.length;

    animating = true;
    clearTimeout(animTimer);
    animTimer = setTimeout(function () {
      animating = false;
    }, 700);

    track.scrollTo({
      left: index * track.clientWidth,
      behavior: smooth === false || reduceMotion || wrapped ? "auto" : "smooth"
    });
    render();
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function start() {
    if (reduceMotion) return;
    stop();
    timer = setInterval(function () {
      go(index + 1);
    }, 5000);
  }

  function restart() {
    stop();
    start();
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      go(index - 1);
      restart();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      go(index + 1);
      restart();
    });
  }

  var scrollTimer = null;
  track.addEventListener(
    "scroll",
    function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        if (animating) return;
        var i = Math.round(track.scrollLeft / track.clientWidth);
        if (i !== index && i >= 0 && i < slides.length) {
          index = i;
          render();
        }
      }, 120);
    },
    { passive: true }
  );

  root.addEventListener("pointerenter", stop);
  root.addEventListener("pointerleave", start);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", start);

  root.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(index - 1);
      restart();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(index + 1);
      restart();
    }
  });

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      go(index, false);
    }, 150);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  root.classList.add("is-ready");
  render();
  start();
})();
