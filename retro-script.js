// Retro Arcade JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Audio elements
    const bgMusic = document.getElementById('bgMusic');
    const audioToggle = document.getElementById('audioToggle');
    const audioIcon = document.getElementById('audioIcon');
    
    // Audio state
    let isPlaying = false;
    let isMuted = false;
    let audioContext = null;
    let musicNodes = [];
    
    // 8-bit melody notes (frequencies in Hz)
    const melody = [
        { freq: 523.25, duration: 0.5 }, // C5
        { freq: 659.25, duration: 0.5 }, // E5
        { freq: 783.99, duration: 0.5 }, // G5
        { freq: 1046.5, duration: 0.5 }, // C6
        { freq: 783.99, duration: 0.5 }, // G5
        { freq: 659.25, duration: 0.5 }, // E5
        { freq: 523.25, duration: 1.0 }, // C5
        { freq: 587.33, duration: 0.5 }, // D5
        { freq: 659.25, duration: 0.5 }, // E5
        { freq: 698.46, duration: 0.5 }, // F5
        { freq: 783.99, duration: 1.0 }, // G5
        { freq: 659.25, duration: 0.5 }, // E5
        { freq: 523.25, duration: 1.0 }, // C5
    ];
    
    // Create 8-bit music using Web Audio API
    function create8BitMusic() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            return true;
        } catch (e) {
            console.log('Web Audio API not supported');
            return false;
        }
    }
    
    // Play a single note
    function playNote(frequency, startTime, duration, volume = 0.1) {
        if (!audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // 8-bit style square wave
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(frequency, startTime);
        
        // Volume envelope for 8-bit sound
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
        
        return { oscillator, gainNode };
    }
    
    // Play the 8-bit melody
    function play8BitMelody() {
        if (!audioContext || audioContext.state === 'suspended') {
            audioContext?.resume();
        }
        
        let currentTime = audioContext.currentTime;
        
        melody.forEach((note, index) => {
            const nodes = playNote(note.freq, currentTime, note.duration, 0.05);
            if (nodes) {
                musicNodes.push(nodes);
            }
            currentTime += note.duration;
        });
        
        // Schedule next loop
        const totalDuration = melody.reduce((sum, note) => sum + note.duration, 0);
        setTimeout(() => {
            if (isPlaying && !isMuted) {
                play8BitMelody();
            }
        }, totalDuration * 1000);
    }
    
    // Stop all music nodes
    function stopMusic() {
        musicNodes.forEach(({ oscillator, gainNode }) => {
            try {
                oscillator.stop();
            } catch (e) {
                // Already stopped
            }
        });
        musicNodes = [];
    }
    
    // Initialize audio
    function initAudio() {
        // Initialize Web Audio API
        if (create8BitMusic()) {
            console.log('8-bit music system initialized');
            // Don't auto-play due to browser policies
            isPlaying = false;
            isMuted = true;
            updateAudioButton();
        } else {
            console.log('Audio not available');
            audioToggle.style.display = 'none';
        }
    }
    
    // Update audio button appearance
    function updateAudioButton() {
        if (isMuted || !isPlaying) {
            audioIcon.textContent = '🔇';
            audioToggle.classList.add('muted');
        } else {
            audioIcon.textContent = '🔊';
            audioToggle.classList.remove('muted');
        }
    }
    
    // Toggle audio
    function toggleAudio() {
        if (!audioContext) {
            create8BitMusic();
        }
        
        if (isPlaying && !isMuted) {
            // Stop music
            stopMusic();
            isPlaying = false;
            isMuted = true;
            updateAudioButton();
        } else {
            // Start music
            if (audioContext.state === 'suspended') {
                audioContext.resume().then(() => {
                    isPlaying = true;
                    isMuted = false;
                    updateAudioButton();
                    play8BitMelody();
                });
            } else {
                isPlaying = true;
                isMuted = false;
                updateAudioButton();
                play8BitMelody();
            }
        }
    }
    
    // Audio button event listener
    audioToggle.addEventListener('click', toggleAudio);
    
    // Keyboard controls
    document.addEventListener('keydown', function(e) {
        switch(e.key.toLowerCase()) {
            case 'm':
                toggleAudio();
                break;
            case ' ':
                e.preventDefault();
                toggleAudio();
                break;
        }
    });
    
    // Add click sound effect
    function playClickSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Fallback: no sound
        }
    }
    
    // Add click sound to audio button
    audioToggle.addEventListener('click', playClickSound);
    
    // Add hover effects
    const gameFrame = document.querySelector('.game-frame');
    const title = document.querySelector('.title');
    
    // Game frame hover effect
    if (gameFrame) {
        gameFrame.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        gameFrame.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
    
    // Title click effect
    if (title) {
        title.addEventListener('click', function() {
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = 'neonFlicker 2s infinite alternate';
            }, 10);
            playClickSound();
        });
    }
    
    // Add more particles on click
    function createParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.position = 'fixed';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1001';
        
        // Random color
        const colors = ['#00FFFF', '#FF00FF', '#39FF14', '#FFFF00'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = color;
        particle.style.boxShadow = `0 0 10px ${color}`;
        
        document.body.appendChild(particle);
        
        // Animate particle
        particle.style.animation = 'particleExplode 1s ease-out forwards';
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1000);
    }
    
    // Add particle explosion CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes particleExplode {
            0% {
                transform: scale(1) translate(0, 0);
                opacity: 1;
            }
            100% {
                transform: scale(0) translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Click anywhere to create particles
    document.addEventListener('click', function(e) {
        if (e.target !== audioToggle && !e.target.closest('.game-frame iframe')) {
            createParticle(e.clientX, e.clientY);
        }
    });
    
    // Initialize everything
    initAudio();
    
    // Console message
    console.log(`
    🎮 JUEGOS SEGURA - Retro Arcade 🎮
    ================================
    Controls:
    - M or Space: Toggle music
    - Click anywhere: Create particles
    - Click title: Reset neon effect
    
    Welcome to the retro gaming zone!
    `);
    
    // Add loading effect
    const container = document.querySelector('.container');
    if (container) {
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            container.style.transition = 'all 1s ease-out';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Konami Code Easter Egg
    let konamiCode = [];
    const konamiSequence = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    
    document.addEventListener('keydown', function(e) {
        konamiCode.push(e.code);
        
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.length === konamiSequence.length) {
            let match = true;
            for (let i = 0; i < konamiSequence.length; i++) {
                if (konamiCode[i] !== konamiSequence[i]) {
                    match = false;
                    break;
                }
            }
            
            if (match) {
                activateKonamiMode();
                konamiCode = [];
            }
        }
    });
    
    function activateKonamiMode() {
        // Special effects for Konami code
        document.body.style.animation = 'rainbow 2s ease-in-out';
        
        // Add rainbow animation
        const rainbowStyle = document.createElement('style');
        rainbowStyle.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(rainbowStyle);
        
        // Show message
        const message = document.createElement('div');
        message.textContent = '🎉 KONAMI CODE ACTIVATED! 🎉';
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 2rem;
            color: #FFFF00;
            text-shadow: 0 0 20px #FFFF00;
            z-index: 10000;
            animation: pulse 1s ease-in-out 3;
        `;
        document.body.appendChild(message);
        
        setTimeout(() => {
            document.body.style.animation = '';
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
        
        console.log('🎉 Konami Code activated! You found the easter egg!');
    }
});
