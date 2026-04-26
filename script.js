(() => {
  const lenis = window.Lenis
    ? new window.Lenis({
        lerp: 0.1,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.15,
        normalizeWheel: true,
      })
    : null;

  const cursor = document.querySelector("[data-cursor]");
  const powerOn = document.querySelector("[data-power-on]");
  const archiveShell = document.querySelector("[data-archive-shell]");
  const archiveTrack = document.querySelector("[data-archive-track]");
  const parallaxImage = document.querySelector("[data-parallax-media] img");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const revealGroups = Array.from(document.querySelectorAll("[data-stagger-group]"));
  const ctaSection = document.querySelector(".scene--cta");
  const ctaStage = document.querySelector("[data-cta-stage]");
  const ctaItems = ctaStage ? Array.from(ctaStage.querySelectorAll(".reveal-child")) : [];
  if (ctaItems.length && window.gsap && !prefersReducedMotion) {
  window.gsap.set(ctaItems, { autoAlpha: 0, y: 42, filter: "blur(20px)" });
}
  const revealItems = Array.from(document.querySelectorAll("[data-reveal-item]")).filter(
    (element) => !element.closest("[data-stagger-group]")
  );
  const root = document.documentElement;
  const interactiveSelector = "a, button, [role='button'], [data-cursor-zone], .button";

  if (window.ScrollTrigger && window.gsap) {
    window.gsap.registerPlugin(window.ScrollTrigger);

    if (lenis) {
      lenis.on("scroll", window.ScrollTrigger.update);

      window.gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      window.gsap.ticker.lagSmoothing(0);
    }
  }

  const setCursorState = (isActive) => {
    if (!cursor) {
      return;
    }

    cursor.dataset.state = isActive ? "active" : "idle";
  };

  if (cursor) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let cursorScale = 1;
    let targetScale = 1;
    let rafId = null;

    const render = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      cursorScale += (targetScale - cursorScale) * 0.12;
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate3d(-50%, -50%, 0) scale(${cursorScale})`;

      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1 || Math.abs(targetScale - cursorScale) > 0.01) {
        rafId = window.requestAnimationFrame(render);
      } else {
        rafId = null;
      }
    };

    window.addEventListener("pointermove", (event) => {
      targetX = event.clientX;
      targetY = event.clientY;

      if (!rafId) {
        rafId = window.requestAnimationFrame(render);
      }
    });

    window.addEventListener("pointerover", (event) => {
      const target = event.target.closest(interactiveSelector);

      if (target) {
        targetScale = target.matches("[data-cursor-zone]") ? 1.4 : 1.2;
        setCursorState(true);
      }
    });

    window.addEventListener("pointerout", (event) => {
      const leaving = event.target.closest(interactiveSelector);
      const entering = event.relatedTarget?.closest?.(interactiveSelector);

      if (leaving && !entering) {
        targetScale = 1;
        setCursorState(false);
      }
    });

    window.addEventListener("blur", () => {
      targetScale = 1;
      setCursorState(false);
    });
  }

  const refreshFx = (scrollY = window.scrollY) => {
    const scrollableHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = scrollY / scrollableHeight;
    const intensity = Math.min(1, progress * 1.35);

    root.style.setProperty("--glitch-intensity", intensity.toFixed(3));
    root.style.setProperty("--aberration-x", `${Math.sin(progress * 18) * intensity * 4}px`);
    root.style.setProperty("--aberration-y", `${Math.cos(progress * 11) * intensity * 2.5}px`);
    root.style.setProperty("--scanline-shift", `${Math.sin(progress * 8) * intensity * 3}px`);
  };

  const splitPowerOn = (element) => {
    if (!element) {
      return [];
    }

    const label = element.textContent.trim();
    element.setAttribute("aria-label", label);
    element.textContent = "";

    return Array.from(label).map((character) => {
      const span = document.createElement("span");
      span.textContent = character === " " ? "\u00A0" : character;
      element.appendChild(span);
      return span;
    });
  };

  const reveal = (elements, trigger, stagger = 0.12) => {
    if (!elements.length) {
      return;
    }

    if (!window.gsap || prefersReducedMotion) {
      elements.forEach((element) => {
        element.style.opacity = "1";
        element.style.filter = "none";
        element.style.transform = "none";
      });
      return;
    }

    window.gsap.fromTo(
      elements,
      { autoAlpha: 0, y: 42, filter: "blur(20px)" },
      {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.05,
        ease: "elastic.out(1, 0.78)",
        stagger,
        scrollTrigger: trigger
          ? {
              trigger,
              start: "top 78%",
              once: true,
            }
          : undefined,
      }
    );
  };

  const heroLetters = splitPowerOn(powerOn);

  if (window.gsap && !prefersReducedMotion) {
    window.gsap.fromTo(
      ".site-header",
      { y: -22, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.75, ease: "power2.out" }
    );

    window.gsap.timeline({ delay: 0.2 })
      .to(heroLetters, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        rotationX: 0,
        duration: 0.85,
        stagger: 0.045,
        ease: "power3.out",
      })
      .fromTo(
        powerOn,
        { textShadow: "0 0 0 rgba(230, 57, 70, 0.0)" },
        { textShadow: "0 0 18px rgba(230, 57, 70, 0.24)", duration: 0.6 },
        0.25
      );
  } else if (powerOn) {
    powerOn.style.opacity = "1";
  }

  revealGroups.forEach((group) => {
    reveal(Array.from(group.querySelectorAll(".reveal-child")), group, 0.1);
  });

  if (revealItems.length) {
    reveal(revealItems, document.body, 0.08);
  }

  if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
    if (parallaxImage) {
      window.gsap.fromTo(
        parallaxImage,
        { scale: 1.18 },
        {
          scale: 1.03,
          ease: "none",
          scrollTrigger: {
            trigger: parallaxImage.closest("section"),
            start: "top bottom",
            end: "bottom top",
            scrub: 1.7,
          },
        }
      );
    }
    /*
const playCtaReveal = () => {
  if (!ctaItems.length) return;

  if (!window.gsap || prefersReducedMotion) {
    ctaItems.forEach((item) => {
      item.style.opacity = "1";
      item.style.transform = "none";
      item.style.filter = "none";
    });
    return;
  }

  if (ctaStage.dataset.animated === "true") return;
  ctaStage.dataset.animated = "true";

  window.gsap.fromTo(
    ctaItems,
    { autoAlpha: 0, y: 42, filter: "blur(20px)" },
    {
      autoAlpha: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.05,
      ease: "elastic.out(1, 0.78)",
      stagger: 0.1,
    }
  );
};*/
const playCtaReveal = () => {
  if (!ctaSection || !ctaItems.length) return;

  if (ctaSection.dataset.animated === "true") return;
  ctaSection.dataset.animated = "true";

  ctaSection.classList.remove("is-hidden");

  if (!window.gsap || prefersReducedMotion) {
    ctaSection.style.opacity = "1";
    ctaSection.style.visibility = "visible";

    ctaItems.forEach((item) => {
      item.style.opacity = "1";
      item.style.transform = "none";
      item.style.filter = "none";
    });
    return;
  }

  window.gsap.set(ctaSection, {
    autoAlpha: 1,
    visibility: "visible"
  });

  window.gsap.fromTo(
    ctaItems,
    { autoAlpha: 0, y: 42, filter: "blur(20px)" },
    {
      autoAlpha: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.05,
      ease: "elastic.out(1, 0.78)",
      stagger: 0.1,
    }
  );
};
   /* if (archiveShell && archiveTrack) {
      const getDistance = () => archiveTrack.scrollWidth - window.innerWidth;
      const existingArchiveTrigger = window.ScrollTrigger.getById("archive-pin");
      if (existingArchiveTrigger) {
        existingArchiveTrigger.kill();
      }

      window.gsap.to(archiveTrack, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          id: "archive-pin",
          trigger: archiveShell,
          start: "top top",
          end: () => "+=" + (archiveTrack.scrollWidth - window.innerWidth),
          scrub: 1.85,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            root.style.setProperty("--glitch-intensity", Math.min(1, self.progress * 1.2).toFixed(3));
          },
        },
      });
    }
if (archiveShell && archiveTrack) {
  // Calculamos la distancia real del carrete
  const getDistance = () => archiveTrack.scrollWidth - window.innerWidth;

  window.gsap.to(archiveTrack, {
    x: () => -getDistance(),
    ease: "none",
    scrollTrigger: {
      id: "archive-pin",
      trigger: archiveShell,
      start: "top top",
      // CLAVE: Añadimos un margen extra (window.innerHeight * 0.5) 
      // para que el usuario tenga que scrollear un poco más antes de liberar la sección
      end: () => "+=" + (getDistance() + window.innerHeight * 0.5),
      scrub: 1.85,
      pin: true,
      pinSpacing: true, // Esto reservará el espacio necesario abajo
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        root.style.setProperty("--glitch-intensity", Math.min(1, self.progress * 1.2).toFixed(3));
      },
    },
  });
}*/

/*if (archiveShell && archiveTrack) {
  const getDistance = () => archiveTrack.scrollWidth - window.innerWidth;

  window.gsap.to(archiveTrack, {
    x: () => -getDistance(),
    ease: "none",
    scrollTrigger: {
      id: "archive-pin",
      trigger: archiveShell,
      start: "top top",
      end: () => "+=" + (getDistance() + window.innerHeight * 0.5),
      scrub: 1.85,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        root.style.setProperty("--glitch-intensity", Math.min(1, self.progress * 1.2).toFixed(3));
      },
     /* onLeave: () => {
        playCtaReveal();
      }*/
     /*onUpdate: (self) => {
         if (self.progress >= 0.999) {
            playCtaReveal();
  }
}
    },
  });
}*/
if (archiveShell && archiveTrack) {
  const getDistance = () => Math.max(0, archiveTrack.scrollWidth - window.innerWidth);

  const existingArchiveTrigger = window.ScrollTrigger.getById("archive-pin");
  if (existingArchiveTrigger) {
    existingArchiveTrigger.kill();
  }

  window.gsap.set(archiveTrack, { x: 0 });

  window.gsap.to(archiveTrack, {
    x: () => -getDistance(),
    ease: "none",
    scrollTrigger: {
      id: "archive-pin",
      trigger: archiveShell,
      start: "top top",
      end: () => "+=" + getDistance(),
      scrub: 1.85,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        root.style.setProperty("--glitch-intensity", Math.min(1, self.progress * 1.2).toFixed(3));

        if (self.progress >= 0.999) {
          playCtaReveal();
        }
      },
    },
  });
}

    window.ScrollTrigger.refresh();
  }

  refreshFx();

  if (lenis) {
    lenis.on("scroll", ({ scroll }) => {
      refreshFx(scroll);
    });
  } else {
    window.addEventListener("scroll", () => refreshFx(window.scrollY), { passive: true });
  }

  window.addEventListener("resize", refreshFx, { passive: true });
 document.querySelectorAll(".media-shell").forEach((shell) => {
  const media = shell.querySelector("img, video");

  if (!media) return;

  const markAsLoaded = () => {
    shell.classList.add("is-loaded");
  };

  if (media.tagName === "IMG") {
    if (media.complete) {
      markAsLoaded();
    } else {
      media.addEventListener("load", markAsLoaded);
    }
  }

  if (media.tagName === "VIDEO") {
    if (media.readyState >= 2) {
      markAsLoaded();
    } else {
      media.addEventListener("loadeddata", markAsLoaded);
      media.addEventListener("canplay", markAsLoaded);
    }
  }
});})();
