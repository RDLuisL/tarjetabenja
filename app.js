
document.addEventListener("DOMContentLoaded", () => {

  /* =====================================
     ELEMENTOS PRINCIPALES
  ===================================== */

  const card =
    document.getElementById("birthdayCard");

  const pages =
    Array.from(document.querySelectorAll(".page"));

  const cardHint =
    document.getElementById("cardHint");

  const birthdayVideo =
    document.getElementById("birthdayVideo");

  const birthdayAudio =
    document.getElementById("birthdayAudio");

  const videoPlayBtn =
    document.getElementById("videoPlayBtn");


  /* =====================================
     VARIABLES
  ===================================== */

  let currentPage = 0;

  let touchStartX = 0;
  let touchStartY = 0;

  let touchEndX = 0;
  let touchEndY = 0;

  let playbackAttempt = 0;

  const minimumSwipe = 45;

  const videoPageIndex =
    pages.findIndex(page => page.id === "page4");


  /* =====================================
     MOSTRAR BOTÓN DEL VIDEO
  ===================================== */

  function mostrarBotonVideo(mostrar) {

    if (!videoPlayBtn) {
      return;
    }

    videoPlayBtn.hidden = !mostrar;
  }


  /* =====================================
     DETENER VIDEO Y AUDIO
  ===================================== */

  function detenerVideoBenjamin() {

    // Invalidar intentos anteriores.
    playbackAttempt++;

    if (!birthdayVideo || !birthdayAudio) {
      return;
    }

    birthdayVideo.pause();
    birthdayAudio.pause();

    try {
      birthdayVideo.currentTime = 0;
      birthdayAudio.currentTime = 0;
    } catch (error) {
      console.warn(
        "No se pudo reiniciar el multimedia.",
        error
      );
    }

    mostrarBotonVideo(false);
  }


  /* =====================================
     INICIAR VIDEO Y AUDIO
  ===================================== */

  async function iniciarVideoBenjamin() {

    if (!birthdayVideo || !birthdayAudio) {
      return;
    }

    const attempt = ++playbackAttempt;

    birthdayVideo.pause();
    birthdayAudio.pause();

    try {
      birthdayVideo.currentTime = 0;
      birthdayAudio.currentTime = 0;
    } catch (error) {
      console.warn(error);
    }

    // Usar exclusivamente el audio externo.
    birthdayVideo.muted = true;

    mostrarBotonVideo(false);

    try {

      // Ejecutar ambos play() sin esperar
      // uno antes que el otro.
      const videoPromise = birthdayVideo.play();
      const audioPromise = birthdayAudio.play();

      await Promise.all([
        videoPromise,
        audioPromise
      ]);

      // No continuar si cambió la página.
      if (
        attempt !== playbackAttempt ||
        currentPage !== videoPageIndex ||
        !card.classList.contains("open")
      ) {
        birthdayVideo.pause();
        birthdayAudio.pause();
        return;
      }

    } catch (error) {

      // No mostrar un control sobre otra página.
      if (
        attempt !== playbackAttempt ||
        currentPage !== videoPageIndex ||
        !card.classList.contains("open")
      ) {
        return;
      }

      birthdayVideo.pause();
      birthdayAudio.pause();

      mostrarBotonVideo(true);

      console.warn(
        "El navegador requiere reproducción manual.",
        error
      );
    }
  }


  /* =====================================
     BOTÓN MANUAL DE REPRODUCCIÓN
  ===================================== */

  if (videoPlayBtn) {

    videoPlayBtn.addEventListener(
      "click",
      event => {

        event.stopPropagation();

        if (
          card.classList.contains("open") &&
          currentPage === videoPageIndex
        ) {
          iniciarVideoBenjamin();
        }

      }
    );
  }


  /* =====================================
     EVENTOS MULTIMEDIA
  ===================================== */

  if (birthdayVideo && birthdayAudio) {

    // Pausar música si se pausa el video.
    birthdayVideo.addEventListener(
      "pause",
      () => {
        birthdayAudio.pause();
      }
    );

    // Reanudar música al reproducir video
    // desde los controles del reproductor.
    birthdayVideo.addEventListener(
      "play",
      () => {

        if (
          card.classList.contains("open") &&
          currentPage === videoPageIndex &&
          birthdayAudio.paused
        ) {

          birthdayAudio.play().catch(() => {
            birthdayVideo.pause();
            mostrarBotonVideo(true);
          });
        }
      }
    );

    // Ajustar la música cuando se adelanta
    // o retrocede el video manualmente.
    birthdayVideo.addEventListener(
      "seeked",
      () => {

        if (
          Number.isFinite(
            birthdayVideo.currentTime
          )
        ) {

          try {
            birthdayAudio.currentTime =
              birthdayVideo.currentTime;
          } catch (error) {
            console.warn(error);
          }

        }
      }
    );

    // Cuando termina el video.
    birthdayVideo.addEventListener(
      "ended",
      () => {

        birthdayAudio.pause();
        birthdayAudio.currentTime = 0;

        mostrarBotonVideo(true);
      }
    );

    // Si termina la música antes que el
    // video, no repetimos automáticamente.
    birthdayAudio.addEventListener(
      "ended",
      () => {
        birthdayAudio.pause();
      }
    );

  }


  /* =====================================
     MOSTRAR PAGINA
  ===================================== */

  function showPage(index) {

    if (
      index < 0 ||
      index >= pages.length
    ) {
      return;
    }

    // Detener multimedia al salir
    // de la página 4.
    if (index !== videoPageIndex) {
      detenerVideoBenjamin();
    }

    currentPage = index;

    pages.forEach(
      (page, pageIndex) => {

        page.classList.remove(
          "active",
          "exit-left"
        );

        if (pageIndex === index) {
          page.classList.add("active");
        }

        if (pageIndex < index) {
          page.classList.add("exit-left");
        }

      }
    );

    // Al entrar en la página 4.
    if (
      index === videoPageIndex &&
      card.classList.contains("open")
    ) {
      iniciarVideoBenjamin();
    }
  }


  /* =====================================
     ABRIR TARJETA
  ===================================== */

  function openCard() {

    if (
      card.classList.contains("open")
    ) {
      return;
    }

    card.classList.add("open");

    card.setAttribute(
      "aria-expanded",
      "true"
    );

    cardHint.textContent =
      "Desliza para descubrir la invitación";
  }


  /* =====================================
     CERRAR TARJETA
  ===================================== */

  function closeCard() {

    detenerVideoBenjamin();

    card.classList.remove("open");

    card.setAttribute(
      "aria-expanded",
      "false"
    );

    currentPage = 0;

    showPage(0);

    cardHint.textContent =
      "Toca la tarjeta para abrirla";
  }


  /* =====================================
     SIGUIENTE PAGINA
  ===================================== */

  function nextPage() {

    if (
      currentPage <
      pages.length - 1
    ) {

      showPage(currentPage + 1);

    }
  }


  /* =====================================
     PAGINA ANTERIOR
  ===================================== */

  function previousPage() {

    if (currentPage > 0) {

      showPage(currentPage - 1);

    }
  }


  /* =====================================
     ABRIR AL TOCAR
  ===================================== */

  card.addEventListener(
    "click",
    event => {

      // No interferir con botones,
      // enlaces ni reproductor.
      if (
        event.target.closest(
          "a, button, video"
        )
      ) {
        return;
      }

      if (
        !card.classList.contains("open")
      ) {
        openCard();
      }

    }
  );


  /* =====================================
     INICIO DEL SWIPE
  ===================================== */

  card.addEventListener(
    "touchstart",
    event => {

      if (
        !card.classList.contains("open")
      ) {
        return;
      }

      const touch =
        event.changedTouches[0];

      touchStartX = touch.clientX;
      touchStartY = touch.clientY;

    },
    {
      passive: true
    }
  );


  /* =====================================
     FINAL DEL SWIPE
  ===================================== */

  card.addEventListener(
    "touchend",
    event => {

      if (
        !card.classList.contains("open")
      ) {
        return;
      }

      // No interpretar como swipe un toque
      // sobre los controles del video.
      if (
        event.target.closest(
          "button, a"
        )
      ) {
        return;
      }

      const touch =
        event.changedTouches[0];

      touchEndX = touch.clientX;
      touchEndY = touch.clientY;

      handleSwipe();

    },
    {
      passive: true
    }
  );


  /* =====================================
     DETECTAR DIRECCION
  ===================================== */

  function handleSwipe() {

    const distanceX =
      touchEndX - touchStartX;

    const distanceY =
      touchEndY - touchStartY;

    // Ignorar gestos principalmente
    // verticales.
    if (
      Math.abs(distanceY) >
      Math.abs(distanceX)
    ) {
      return;
    }

    // DESLIZAR HACIA LA IZQUIERDA
    // Avanzar.
    if (
      distanceX < -minimumSwipe
    ) {

      nextPage();
      return;

    }

    // DESLIZAR HACIA LA DERECHA
    // Retroceder.
    if (
      distanceX > minimumSwipe
    ) {

      previousPage();

    }
  }


  /* =====================================
     CERRAR TOCANDO FUERA
  ===================================== */

  document.addEventListener(
    "click",
    event => {

      if (
        card.contains(event.target)
      ) {
        return;
      }

      if (
        card.classList.contains("open")
      ) {
        closeCard();
      }

    }
  );


  /* =====================================
     EVITAR INTERFERENCIA EN LINKS
  ===================================== */

  document
    .querySelectorAll(".action-btn")
    .forEach(
      button => {

        button.addEventListener(
          "click",
          event => {

            event.stopPropagation();

          }
        );

      }
    );


  /* =====================================
     TECLADO PARA PC
  ===================================== */

  document.addEventListener(
    "keydown",
    event => {

      if (
        !card.classList.contains("open")
      ) {

        if (
          event.key === "Enter"
        ) {
          openCard();
        }

        return;
      }

      // Respetar botones y reproductor.
      if (
        event.target.closest &&
        event.target.closest(
          "button, video, input"
        )
      ) {
        return;
      }

      if (
        event.key === "ArrowRight"
      ) {
        nextPage();
      }

      if (
        event.key === "ArrowLeft"
      ) {
        previousPage();
      }

      if (
        event.key === "Escape"
      ) {
        closeCard();
      }

    }
  );


  /* =====================================
     ESTADO INICIAL
  ===================================== */

  card.setAttribute(
    "tabindex",
    "0"
  );

  card.setAttribute(
    "aria-expanded",
    "false"
  );

  showPage(0);

});
