const message = "Coming soon!";
const messageElement = document.querySelector("#coming-soon-text");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let animationRun = 0;

async function animateMessage(run) {
  while (run === animationRun && !reducedMotion.matches) {
    for (let length = 1; length <= message.length; length += 1) {
      if (run !== animationRun || reducedMotion.matches) return;
      messageElement.textContent = message.slice(0, length);
      await new Promise(resolve => window.setTimeout(resolve, 280));
    }

    await new Promise(resolve => window.setTimeout(resolve, 60_000));
    if (run !== animationRun || reducedMotion.matches) return;

    for (let length = message.length - 1; length >= 0; length -= 1) {
      if (run !== animationRun || reducedMotion.matches) return;
      messageElement.textContent = message.slice(0, length);
      await new Promise(resolve => window.setTimeout(resolve, 65));
    }

    await new Promise(resolve => window.setTimeout(resolve, 1_200));
  }
}

function syncAnimation() {
  animationRun += 1;
  messageElement.textContent = reducedMotion.matches ? message : "";

  if (!reducedMotion.matches) {
    animateMessage(animationRun);
  }
}

reducedMotion.addEventListener("change", syncAnimation);
syncAnimation();
