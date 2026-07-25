/* =========================================================
   video.js — Click-to-Play für die Video-Sektion

   Vor dem Klick lädt die Seite nichts vom Videoanbieter. Erst
   der Klick ersetzt die Fassade durch den echten Player.

   QUELLE WECHSELN — nur im HTML, hier nichts anfassen:
     YouTube      data-video-yt="<VIDEO-ID>"
     Eigenes MP4  data-video-mp4="assets/video/datei.mp4"
   Ist beides gesetzt, gewinnt das MP4: selbst gehostet läuft
   zuverlässiger und ohne Fremd-Cookie.
   ========================================================= */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', initVideoFacade);

  function initVideoFacade() {
    var facade = document.getElementById('video-facade');
    if (!facade) return;

    facade.addEventListener('click', function () {
      var mp4 = facade.dataset.videoMp4;
      var yt  = facade.dataset.videoYt;
      var player = mp4 ? buildLocalPlayer(mp4, facade) : (yt ? buildYouTube(yt) : null);
      if (!player) return;

      var stage = facade.parentNode;
      stage.replaceChild(player, facade);

      /* Der Fokus lag auf der Fassade, die es jetzt nicht mehr
         gibt — ohne dieses Nachziehen landet er am Seitenanfang. */
      player.setAttribute('tabindex', '-1');
      player.focus({ preventScroll: true });
    }, { once: true });
  }

  /* Selbst gehostet: spielt sofort, stumm bleibt es nicht — wer
     klickt, will hören. playsinline verhindert, dass iOS in den
     Vollbildmodus zwingt. */
  function buildLocalPlayer(src, facade) {
    var video = document.createElement('video');
    video.className = 'video-embed';
    video.src = src;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');

    var poster = facade.querySelector('.video-poster');
    if (poster) video.poster = poster.currentSrc || poster.src;

    return video;
  }

  function buildYouTube(id) {
    /* nocookie-Domain und keine verwandten Videos am Ende:
       so bleibt es bei unserem Laden. */
    var params = 'autoplay=1&rel=0&modestbranding=1&playsinline=1';
    var frame = document.createElement('iframe');
    frame.className = 'video-embed';
    frame.src = 'https://www.youtube-nocookie.com/embed/' +
                encodeURIComponent(id) + '?' + params;
    frame.title = 'Gelateria Reina – Video';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.setAttribute('allowfullscreen', '');
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    return frame;
  }
})();
