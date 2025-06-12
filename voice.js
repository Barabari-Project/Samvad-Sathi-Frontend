document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const recordButton = document.getElementById('record-button');
    const micIcon = document.getElementById('mic-icon');
    const spinner = document.getElementById('spinner');
    const timeDisplay = document.getElementById('time-display');
    const visualizer = document.getElementById('visualizer');
    const statusText = document.getElementById('status-text');
    const actionButtons = document.getElementById('action-buttons');
    const retryButton = document.getElementById('retry-button');
    const submitButton = document.getElementById('submit-button');
    const themeToggle = document.getElementById('theme-toggle');

    // --- Theme Management ---
    const getThemePreference = () => {
        // Check if user has a saved preference
        const savedTheme = localStorage.getItem('theme');
        
        // Return saved preference, or system preference, or default to 'dark'
        if (savedTheme) {
            return savedTheme;
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        } else {
            return 'light';
        }
    };            const setTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    };

    // Initialize theme
    setTheme(getThemePreference());            // Theme toggle event listener
    themeToggle.addEventListener('click', () => {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Add a brief animation effect for feedback
        themeToggle.classList.add('animate-pulse');
        setTimeout(() => themeToggle.classList.remove('animate-pulse'), 300);
        
        setTheme(newTheme);
        
        // Log for debugging
        console.log(`Theme changed to: ${newTheme}`);
    });

    // --- State Variables from Prototype & UI ---
    let isRecording = false;
    let isRecordingComplete = false;
    let time = 0;
    let timerInterval = null;
    const visualizerBars = 48;

    // Recorder.js specific variables
    let recorder, audioCtx, micStream, wavBlob, mp3Blob;

    // --- Core Functions (Combined & Adapted) ---

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };
    
    const createVisualizerBars = () => {
        visualizer.innerHTML = '';
        for (let i = 0; i < visualizerBars; i++) {
            const bar = document.createElement('div');
            bar.className = 'w-1 rounded-full transition-all duration-300 bg-black/10 dark:bg-white/10 h-1.5';
            visualizer.appendChild(bar);
        }
    };
    
    const updateUI = () => {
        const bars = visualizer.children;
        if (isRecording) {
            recordButton.className = "group w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 bg-red-500/20";
            micIcon.classList.add('hidden');
            spinner.classList.remove('hidden');
            spinner.classList.add('animate-spin');
            timeDisplay.className = "font-mono text-sm transition-opacity duration-300 text-black/70 dark:text-white/70";
            actionButtons.className = "mt-3 flex gap-2 opacity-0 transition-opacity duration-300 pointer-events-none";
            for (let i = 0; i < bars.length; i++) {
                const bar = bars[i];
                bar.className = "w-1 rounded-full transition-all duration-300 bg-red-500/50 dark:bg-red-400/50 pulse-bar";
                bar.style.height = `${20 + Math.random() * 50}%`;
                bar.style.animationDelay = `${i * 0.02}s`;
            }
        } else if (isRecordingComplete) {
            recordButton.className = "group w-16 h-16 rounded-xl flex items-center justify-center transition-colors bg-none hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer";
            micIcon.classList.remove('hidden');
            spinner.classList.add('hidden');
            spinner.classList.remove('animate-spin');
            timeDisplay.className = "font-mono text-sm transition-opacity duration-300 text-black/70 dark:text-white/70";
            actionButtons.className = "mt-3 flex gap-2 opacity-100 transition-opacity duration-300 pointer-events-auto";
            for (let i = 0; i < bars.length; i++) {
                bars[i].className = "w-0.5 rounded-full transition-all duration-300 bg-black/30 dark:bg-white/30 h-2";
                bars[i].style.height = '4px';
                bars[i].style.animationDelay = '';
            }
        } else { // Idle state
            recordButton.className = "group w-24 h-24 rounded-xl flex items-center justify-center transition-all duration-300 bg-none hover:bg-black/10 dark:hover:bg-white/10";
            micIcon.classList.remove('hidden');
            spinner.classList.add('hidden');
            spinner.classList.remove('animate-spin');
            timeDisplay.textContent = "00:00";
            timeDisplay.className = "font-mono text-lg transition-opacity duration-300 text-black/30 dark:text-white/30";
            statusText.textContent = "Click to speak";
            actionButtons.className = "mt-3 flex gap-2 opacity-0 transition-opacity duration-300 pointer-events-none";
            createVisualizerBars();
        }
    };

    const resetState = () => {
        isRecording = false;
        isRecordingComplete = false;
        time = 0;
        mp3Blob = null;
        wavBlob = null;
        recorder = null;
        if (micStream) micStream.getTracks().forEach(t => t.stop());
        micStream = null;
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = null;
        updateUI();
    };

    const startRecording = async () => {
        resetState();
        isRecording = true;
        statusText.textContent = "Requesting mic access...";
        updateUI();

        try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const input = audioCtx.createMediaStreamSource(micStream);
            recorder = new Recorder(input, { numChannels: 1 });
            recorder.record();
            statusText.textContent = "Listening...";
            
            timerInterval = setInterval(() => {
                time++;
                timeDisplay.textContent = formatTime(time);
            }, 1000);

        } catch (err) {
            console.error('Error accessing microphone:', err);
            statusText.textContent = "Mic access denied.";
            resetState();
        }
    };

    const stopRecording = () => {
        if (!recorder) return;
        
        isRecording = false;
        statusText.textContent = "Processing audio...";
        if (timerInterval) clearInterval(timerInterval);
        
        recorder.stop();
        micStream.getTracks().forEach(t => t.stop());
        
        recorder.exportWAV(blob => {
            wavBlob = blob;
            convertToMP3(wavBlob); // This will handle the final state update
        });
    };

    async function convertToMP3(blob) {
        statusText.textContent = '🎵 Converting to MP3…';
        const arrayBuffer = await blob.arrayBuffer();
        const pcm = new Int16Array(arrayBuffer);
        const sampleRate = audioCtx.sampleRate;
        const channels = 1;
        const lameEncoder = new lamejs.Mp3Encoder(channels, sampleRate, 320);
        const mp3Data = [];

        const chunkSize = 1152;
        for (let i = 0; i < pcm.length; i += chunkSize) {
            const chunk = pcm.subarray(i, i + chunkSize);
            const mp3buf = lameEncoder.encodeBuffer(chunk);
            if (mp3buf.length > 0) {
                mp3Data.push(mp3buf);
            }
        }
        const mp3buf = lameEncoder.flush();
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }

        mp3Blob = new Blob(mp3Data, { type: 'audio/mpeg' });
        statusText.textContent = 'Ready to submit!';
        isRecordingComplete = true;
        updateUI();
    }

    const handleSubmitClick = async () => {
        if (!mp3Blob) {
            alert('No MP3 recording available to submit.');
            return;
        }
        statusText.textContent = '📤 Sending to server…';

        const formData = new FormData();
        formData.append('file', mp3Blob, 'recording.mp3');

        try {
            const res = await fetch('https://ai.backend.barabaricollective.org/transcribe', {
                method: 'POST',
                body: formData
            });
            if (!res.ok) throw new Error(`Server responded with ${res.status}`);

            const json = await res.json();
            if (json.transcript) {
                statusText.textContent = `✅ Transcript:\n${json.transcript}`;
            } else {
                statusText.textContent = `✅ Server response:\n${JSON.stringify(json, null, 2)}`;
            }
        } catch (err) {
            statusText.textContent = `❌ Error: ${err.message}`;
            console.error(err);
        } finally {
            // Hide buttons but keep the message
            actionButtons.className = "mt-3 flex gap-2 opacity-0 transition-opacity duration-300 pointer-events-none";
        }
    };
    
    // --- Event Listeners ---
    
    recordButton.addEventListener('click', () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    });

    retryButton.addEventListener('click', startRecording);
    submitButton.addEventListener('click', handleSubmitClick);

    // --- Initialization ---
    createVisualizerBars();
    updateUI();
});