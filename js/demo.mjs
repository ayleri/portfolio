class ProjectDemo extends HTMLElement {
  connectedCallback() {
    this.preview = this.querySelector('.demo-preview');
    this.player = this.querySelector('.demo-player');
    this.status = this.querySelector('.demo-status');
    this.preview.hidden = false;
    this.events = new AbortController();
    const options = { signal: this.events.signal };
    this.preview.addEventListener('click', () => this.activate(), options);
    this.closest('[data-panel]')?.addEventListener('panelhide', () => this.reset(), options);
    window.addEventListener('pagehide', () => this.reset(), options);
  }

  activate() {
    if (this.closest('[hidden]') || this.player.firstElementChild) return;
    const content = this.querySelector('template').content.cloneNode(true);
    const frame = content.querySelector('iframe');
    if (frame) {
      const url = new URL(frame.getAttribute('src'), location.href);
      url.searchParams.set('autoplay', '1');
      frame.src = url.href;
    }
    this.player.append(content);
    this.preview.hidden = true;
    this.player.hidden = false;
    this.status.textContent = '';

    const video = this.player.querySelector('video');
    if (video) {
      this.setupControls(video);
      video.addEventListener('error', () => {
        if (video.isConnected) this.status.textContent = 'This demo couldn’t load. Try the open video link below.';
      }, { once: true });
      video.focus();
      video.play().catch(() => {
        if (video.isConnected && !video.error) {
          this.status.textContent = 'Use the video controls to start playback.';
        }
      });
    } else {
      frame.focus();
    }
  }

  setupControls(video) {
    this.playbackEvents = new AbortController();
    const on = (target, event, handler) => target.addEventListener(event, handler, { signal: this.playbackEvents.signal });
    const controls = this.player.querySelector('.demo-controls');
    const stage = this.querySelector('.demo-stage');
    const toggle = controls.querySelector('.demo-toggle');
    const seek = controls.querySelector('.demo-seek');
    const time = controls.querySelector('.demo-time');
    const mute = controls.querySelector('.demo-mute');
    const volume = controls.querySelector('.demo-volume');
    const fullscreen = controls.querySelector('.demo-fullscreen');
    const captions = controls.querySelector('.demo-captions');
    const formatTime = seconds => {
      const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
      const hours = Math.floor(total / 3600);
      const minutes = Math.floor(total / 60) % 60;
      return `${hours ? `${hours}:${String(minutes).padStart(2, '0')}` : minutes}:${String(total % 60).padStart(2, '0')}`;
    };
    const updateTime = () => {
      const ready = Number.isFinite(video.duration) && video.duration > 0;
      seek.disabled = !ready;
      seek.value = ready ? String(video.currentTime / video.duration * 1000) : '0';
      seek.style.setProperty('--range-fill', `${Number(seek.value) / 10}%`);
      time.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
      seek.setAttribute('aria-valuetext', `${formatTime(video.currentTime)} of ${formatTime(video.duration)}`);
    };
    const updatePlayback = () => {
      toggle.setAttribute('aria-label', video.paused ? 'Play' : 'Pause');
      toggle.querySelector('.demo-icon-play').toggleAttribute('hidden', !video.paused);
      toggle.querySelector('.demo-icon-pause').toggleAttribute('hidden', video.paused);
    };
    const updateVolume = () => {
      const silent = video.muted || video.volume === 0;
      mute.setAttribute('aria-label', silent ? 'Unmute' : 'Mute');
      mute.setAttribute('aria-pressed', String(silent));
      mute.querySelector('.demo-volume-waves').toggleAttribute('hidden', silent);
      mute.querySelector('.demo-volume-cross').toggleAttribute('hidden', !silent);
      volume.value = String(video.muted ? 0 : video.volume);
      volume.style.setProperty('--range-fill', `${Number(volume.value) * 100}%`);
    };
    const togglePlayback = () => {
      if (video.paused) {
        video.play().catch(() => {
          if (video.isConnected) this.status.textContent = 'Playback couldn’t start. Try the open video link below.';
        });
      } else video.pause();
    };
    const toggleFullscreen = async () => {
      try {
        if (document.fullscreenElement === stage) await document.exitFullscreen();
        else if (stage.requestFullscreen) await stage.requestFullscreen();
        else video.webkitEnterFullscreen?.();
      } catch {
        if (video.isConnected) this.status.textContent = 'Fullscreen is unavailable. You can use the open video link below.';
      }
    };
    on(toggle, 'click', togglePlayback);
    on(video, 'click', togglePlayback);
    on(seek, 'input', () => {
      if (Number.isFinite(video.duration)) video.currentTime = Number(seek.value) / 1000 * video.duration;
      updateTime();
    });
    on(mute, 'click', () => {
      if (video.volume === 0) video.volume = 1;
      video.muted = !video.muted;
    });
    on(volume, 'input', () => {
      video.volume = Number(volume.value);
      video.muted = video.volume === 0;
    });
    on(fullscreen, 'click', toggleFullscreen);
    on(document, 'fullscreenchange', () => fullscreen.setAttribute('aria-label', document.fullscreenElement === stage ? 'Exit fullscreen' : 'Enter fullscreen'));
    if (!document.fullscreenEnabled && !video.webkitEnterFullscreen) fullscreen.hidden = true;
    if (captions) {
      on(captions, 'click', () => {
        const enabled = captions.getAttribute('aria-pressed') !== 'true';
        for (const track of video.textTracks) track.mode = enabled ? 'showing' : 'hidden';
        captions.setAttribute('aria-pressed', String(enabled));
      });
    }
    on(video, 'keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === ' ' || event.key.toLowerCase() === 'k') togglePlayback();
      else if (event.key.toLowerCase() === 'f' && !fullscreen.hidden) toggleFullscreen();
      else if (event.key.toLowerCase() === 'm') mute.click();
      else if (['ArrowLeft', 'ArrowRight'].includes(event.key) && Number.isFinite(video.duration)) {
        video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + (event.key === 'ArrowLeft' ? -5 : 5)));
      } else return;
      event.preventDefault();
    });
    for (const event of ['timeupdate', 'durationchange', 'loadedmetadata', 'emptied']) on(video, event, updateTime);
    for (const event of ['play', 'pause', 'ended']) on(video, event, updatePlayback);
    on(video, 'playing', () => { this.status.textContent = ''; });
    on(video, 'volumechange', updateVolume);
    updateTime();
    updatePlayback();
    updateVolume();
    video.controls = false;
    video.tabIndex = 0;
    controls.hidden = false;
  }

  reset() {
    this.playbackEvents?.abort();
    const video = this.player.querySelector('video');
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    this.player.replaceChildren();
    this.player.hidden = true;
    this.preview.hidden = false;
    this.status.textContent = '';
  }

  disconnectedCallback() {
    this.reset();
    this.events.abort();
  }
}

customElements.define('project-demo', ProjectDemo);
