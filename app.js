(() => {
  'use strict';

  /* ------------------------------------------------------------------
     Word banks
     ------------------------------------------------------------------ */
  const WORD_BANK = {
    beginner: [
      'the', 'and', 'cat', 'dog', 'sun', 'run', 'big', 'red', 'hat', 'sit',
      'cup', 'pen', 'map', 'bus', 'car', 'top', 'hot', 'cold', 'fun', 'play',
      'jump', 'walk', 'talk', 'book', 'tree', 'fish', 'bird', 'milk', 'rain', 'snow',
      'wind', 'home', 'door', 'ball', 'game', 'song', 'blue', 'green', 'gold', 'road',
      'hand', 'foot', 'head', 'nose', 'face', 'love', 'help', 'good', 'nice', 'make',
      'look', 'find', 'give', 'come', 'went', 'stop', 'swim', 'sing', 'read', 'write',
      'bed', 'box', 'bag', 'toy', 'pig', 'cow', 'hen', 'ant', 'bee', 'sky',
      'moon', 'star', 'lake', 'hill', 'farm', 'food', 'cake', 'milk', 'rice', 'soup',
      'step', 'ride', 'kick', 'sleep', 'smile', 'happy', 'water', 'house', 'mouse', 'apple',
      'bread', 'chair', 'table', 'clock', 'paper', 'light', 'night', 'friend', 'family', 'under'
    ],
    moderate: [
      'garden', 'window', 'pencil', 'journey', 'market', 'library', 'whisper', 'balance', 'captain', 'cheerful',
      'curious', 'dolphin', 'evening', 'farmer', 'giant', 'harvest', 'island', 'jungle', 'kitchen', 'lantern',
      'mountain', 'napkin', 'orange', 'picture', 'quiet', 'rabbit', 'shadow', 'teacher', 'umbrella', 'village',
      'wonder', 'yellow', 'bridge', 'castle', 'dragon', 'engine', 'forest', 'guitar', 'hammer', 'insect',
      'jacket', 'kitten', 'ladder', 'magnet', 'number', 'ocean', 'parade', 'rocket', 'silver', 'tunnel',
      'valley', 'wagon', 'anchor', 'basket', 'candle', 'desert', 'empire', 'flower', 'golden', 'helmet',
      'invent', 'kingdom', 'listen', 'monster', 'nature', 'office', 'planet', 'question', 'remember', 'season',
      'thunder', 'travel', 'upward', 'vacation', 'weather', 'explore', 'freedom', 'gather', 'history', 'imagine',
      'justice', 'knowledge', 'language', 'machine', 'narrow', 'outside', 'package', 'quickly', 'reason', 'stretch',
      'trouble', 'visitor', 'bicycle', 'chimney', 'diamond', 'elephant', 'fantasy', 'grocery', 'holiday', 'kingfisher'
    ],
    hard: [
      'extraordinary', 'phenomenon', 'ambiguous', 'bureaucracy', 'catastrophe', 'conscientious', 'entrepreneur', 'hypothesis', 'idiosyncrasy', 'juxtaposition',
      'labyrinth', 'meticulous', 'nostalgia', 'onomatopoeia', 'paradigm', 'quintessential', 'rhythm', 'silhouette', 'surveillance', 'tangible',
      'unanimous', 'vulnerable', 'whimsical', 'zealous', 'acquaintance', 'camaraderie', 'deteriorate', 'eloquent', 'facetious', 'gregarious',
      'hierarchy', 'impeccable', 'jurisdiction', 'kaleidoscope', 'legitimate', 'mischievous', 'necessity', 'obstinate', 'perseverance', 'questionnaire',
      'reminiscent', 'sophisticated', 'temperamental', 'ubiquitous', 'vocabulary', 'xenophobia', 'acquiesce', 'ambivalent', 'benevolent', 'chronological',
      'disparity', 'exaggerate', 'fluorescent', 'guarantee', 'hypothetical', 'incandescent', 'knowledgeable', 'luxurious', 'metaphorical', 'nonchalant',
      'opportunity', 'pharmaceutical', 'quarantine', 'rhetorical', 'skepticism', 'tranquility', 'unprecedented', 'vulnerability', 'wilderness', 'zucchini',
      'architecture', 'bibliography', 'consequence', 'democracy', 'encyclopedia', 'fascinating', 'geography', 'hemisphere', 'imagination', 'laboratory',
      'magnificent', 'neighborhood', 'orchestra', 'psychology', 'resilience', 'spectacular', 'technology', 'university', 'variety', 'worthwhile',
      'accommodate', 'bureaucratic', 'conspicuous', 'dilemma', 'endeavor', 'forthcoming', 'harmonious', 'inevitable', 'judicious', 'magnitude'
    ]
  };

  // Remove any accidental duplicates inside each bank.
  Object.keys(WORD_BANK).forEach((key) => {
    WORD_BANK[key] = Array.from(new Set(WORD_BANK[key]));
  });

  const MODES = {
    beginner: { label: 'Beginner', words: 60 },
    moderate: { label: 'Moderate', words: 45 },
    hard:     { label: 'Hard',     words: 30 }
  };

  /* ------------------------------------------------------------------
     Elements
     ------------------------------------------------------------------ */
  const $ = (id) => document.getElementById(id);

  const screens = {
    menu: $('menu-screen'),
    game: $('game-screen'),
    results: $('results-screen')
  };

  const passageEl = $('passage');
  const inputEl = $('typing-input');
  const timerEl = $('timer');
  const timerBox = timerEl.parentElement;
  const modeLabelEl = $('mode-label');
  const liveMistakesEl = $('live-mistakes');

  /* ------------------------------------------------------------------
     State
     ------------------------------------------------------------------ */
  const usedPassages = new Set();   // passages already shown this session
  let duration = 60;                // seconds per round
  let mode = 'beginner';
  let passage = '';
  let spans = [];
  let startTime = null;
  let timerId = null;
  let finished = false;
  let mistakes = 0;                 // every incorrect character typed
  let keystrokes = 0;               // every character typed (for accuracy)
  let prevLength = 0;

  /* ------------------------------------------------------------------
     Passage generation
     ------------------------------------------------------------------ */
  function shuffle(array) {
    const a = array.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildPassage(modeKey) {
    const bank = WORD_BANK[modeKey];
    const count = MODES[modeKey].words;
    const picked = [];

    // Draw from shuffled copies of the bank so words don't repeat
    // until the whole bank has been used.
    while (picked.length < count) {
      picked.push(...shuffle(bank));
    }
    return picked.slice(0, count).join(' ');
  }

  function generateUniquePassage(modeKey) {
    let text = buildPassage(modeKey);
    let attempts = 0;
    while (usedPassages.has(text) && attempts < 100) {
      text = buildPassage(modeKey);
      attempts++;
    }
    usedPassages.add(text);
    return text;
  }

  /* ------------------------------------------------------------------
     Screen helpers
     ------------------------------------------------------------------ */
  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      el.hidden = key !== name;
    });
  }

  function formatTime(totalSeconds) {
    const s = Math.max(0, Math.ceil(totalSeconds));
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  }

  /* ------------------------------------------------------------------
     Round lifecycle
     ------------------------------------------------------------------ */
  function startRound(modeKey) {
    mode = modeKey;
    passage = generateUniquePassage(mode);

    finished = false;
    startTime = null;
    mistakes = 0;
    keystrokes = 0;
    prevLength = 0;
    stopTimer();

    modeLabelEl.textContent = MODES[mode].label;
    liveMistakesEl.textContent = '0';
    timerEl.textContent = formatTime(duration);
    timerBox.classList.remove('low');

    renderPassage();

    inputEl.value = '';
    inputEl.readOnly = false;
    inputEl.maxLength = passage.length;

    showScreen('game');
    passageEl.scrollTop = 0;
    updateHighlight();
    inputEl.focus();
  }

  function startTimer() {
    startTime = performance.now();
    timerId = setInterval(tick, 100);
  }

  function stopTimer() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function tick() {
    const elapsed = (performance.now() - startTime) / 1000;
    const remaining = duration - elapsed;
    timerEl.textContent = formatTime(remaining);
    timerBox.classList.toggle('low', remaining <= 10);
    if (remaining <= 0) {
      finishRound('time');
    }
  }

  function finishRound(reason) {
    if (finished) return;
    finished = true;
    stopTimer();
    inputEl.readOnly = true;

    const typed = inputEl.value;
    let correctChars = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === passage[i]) correctChars++;
    }

    const elapsedSeconds = startTime === null
      ? duration
      : Math.min((performance.now() - startTime) / 1000, duration);
    const minutes = Math.max(elapsedSeconds, 1) / 60;

    // Standard WPM: 5 characters = 1 word.
    const wpm = Math.round(correctChars / 5 / minutes);
    const accuracy = keystrokes === 0
      ? 100
      : Math.max(0, Math.round(((keystrokes - mistakes) / keystrokes) * 100));

    $('results-title').textContent = reason === 'completed' ? 'Passage complete!' : "Time's up!";
    $('results-sub').textContent = `${MODES[mode].label} mode`;
    $('result-wpm').textContent = wpm;
    $('result-mistakes').textContent = mistakes;
    $('result-accuracy').textContent = `${accuracy}%`;

    showScreen('results');
    $('again-btn').focus();
  }

  /* ------------------------------------------------------------------
     Rendering the passage
     ------------------------------------------------------------------ */
  function renderPassage() {
    passageEl.textContent = '';
    spans = [];
    const fragment = document.createDocumentFragment();
    for (const ch of passage) {
      const span = document.createElement('span');
      span.textContent = ch;
      fragment.appendChild(span);
      spans.push(span);
    }
    passageEl.appendChild(fragment);
  }

  function updateHighlight() {
    const typed = inputEl.value;
    for (let i = 0; i < spans.length; i++) {
      let cls = '';
      if (i < typed.length) {
        cls = typed[i] === passage[i] ? 'correct' : 'wrong';
      } else if (i === typed.length) {
        cls = 'current';
      }
      if (spans[i].className !== cls) spans[i].className = cls;
    }
    keepCurrentVisible(spans[Math.min(typed.length, spans.length - 1)]);
  }

  function keepCurrentVisible(span) {
    if (!span) return;
    const top = span.offsetTop;
    const bottom = top + span.offsetHeight;
    const viewTop = passageEl.scrollTop;
    const viewBottom = viewTop + passageEl.clientHeight;
    if (top < viewTop || bottom > viewBottom) {
      passageEl.scrollTop = Math.max(0, top - span.offsetHeight);
    }
  }

  /* ------------------------------------------------------------------
     Typing handler
     ------------------------------------------------------------------ */
  inputEl.addEventListener('input', () => {
    if (finished) return;

    const value = inputEl.value;

    if (startTime === null && value.length > 0) {
      startTimer();
    }

    // Count only newly typed characters (backspacing is never penalized).
    if (value.length > prevLength) {
      for (let i = prevLength; i < value.length; i++) {
        keystrokes++;
        if (value[i] !== passage[i]) mistakes++;
      }
      liveMistakesEl.textContent = String(mistakes);
    }
    prevLength = value.length;

    updateHighlight();

    if (value.length >= passage.length) {
      finishRound('completed');
    }
  });

  // Keep the practice honest: no pasting or dropping text.
  ['paste', 'drop'].forEach((evt) => {
    inputEl.addEventListener(evt, (e) => e.preventDefault());
  });

  // Clicking the passage returns focus to the typing box.
  passageEl.addEventListener('click', () => inputEl.focus());

  /* ------------------------------------------------------------------
     Menu and buttons
     ------------------------------------------------------------------ */
  document.querySelectorAll('.mode-card').forEach((card) => {
    card.addEventListener('click', () => startRound(card.dataset.mode));
  });

  document.querySelectorAll('.time-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      duration = Number(btn.dataset.seconds);
      document.querySelectorAll('.time-btn').forEach((b) => {
        b.setAttribute('aria-pressed', String(b === btn));
      });
    });
  });

  $('quit-btn').addEventListener('click', () => {
    finished = true;
    stopTimer();
    showScreen('menu');
  });

  $('again-btn').addEventListener('click', () => startRound(mode));
  $('change-mode-btn').addEventListener('click', () => showScreen('menu'));

  showScreen('menu');
})();
