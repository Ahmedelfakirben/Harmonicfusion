/* -------------------------------------------------------------
 * HARMONIC FUSION - INTERACTIVE SCRIPTS
 * Custom Logic for Navigation, Audio Player, Web Audio API,
 * Members Toggle, Scroll Reveal, and Warning Console.
 * ------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       1. STICKY HEADER & MOBILE NAV TOGGLE
       ========================================== */
    const header = document.querySelector('.header');
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky Header Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Dynamic Active State on Scroll based on Section positions
        const scrollPosition = window.scrollY + 120;
        document.querySelectorAll('section, header').forEach(section => {
            if (section.id && scrollPosition >= section.offsetTop && scrollPosition < section.offsetTop + section.offsetHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${section.id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    // Mobile Navigation Toggle
    mobileNavToggle.addEventListener('click', () => {
        mobileNavToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close Mobile Menu on Nav Link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNavToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close Menu clicking outside
    document.addEventListener('click', (e) => {
        if (!header.contains(e.target) && navMenu.classList.contains('active')) {
            mobileNavToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });


    /* ==========================================
       2. SCROLL REVEAL (INTERSECTION OBSERVER)
       ========================================== */
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Unobserve once revealed to keep layout simple
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });


    /* ==========================================
       3. MEMBER PHOTO / CARICATURE TOGGLE
       ========================================== */
    const memberToggle = document.getElementById('memberToggle');
    const photoModeLbl = document.querySelector('.photo-mode-lbl');
    const caricatureModeLbl = document.querySelector('.caricature-mode-lbl');
    const memberCards = document.querySelectorAll('.member-card');

    memberToggle.addEventListener('click', () => {
        const isCaricature = memberToggle.classList.toggle('active');
        
        if (isCaricature) {
            photoModeLbl.classList.remove('active');
            caricatureModeLbl.classList.add('active');
            playSynthBeep(330, 'triangle', 0.1); // Fun UI feedback sound!
        } else {
            caricatureModeLbl.classList.remove('active');
            photoModeLbl.classList.add('active');
            playSynthBeep(440, 'triangle', 0.1);
        }

        // Swapping images inside all cards
        memberCards.forEach(card => {
            const realImg = card.querySelector('.real-img');
            const cartoonImg = card.querySelector('.cartoon-img');
            
            if (isCaricature) {
                realImg.classList.add('hidden');
                cartoonImg.classList.remove('hidden');
            } else {
                cartoonImg.classList.add('hidden');
                realImg.classList.remove('hidden');
            }
        });
    });


    /* ==========================================
       4. INTERACTIVE MUSIC PLAYER & REPERTOIRE
       ========================================== */
    const tracks = [
        { id: 1, title: 'ROKHSSA', genre: 'Polka Pop', src: 'Audio/01 01 - Harmonic Fusion - Rokhssa.mp3' },
        { id: 2, title: 'YOUR SMILE', genre: 'Reggae Fusion', src: 'Audio/02 02 - Harmonic Fusion - your Smile.mp3' },
        { id: 3, title: 'PARTAGER MOI', genre: 'Acoustique Duo', src: 'Audio/03 03 - Harmonic Fusion - Partager moi.mp3' },
        { id: 4, title: 'NIYA GHARKA', genre: 'Pop Rock', src: 'Audio/04 04 - Harmonic Fusion - Nia GharQa.mp3' },
        { id: 5, title: 'NUEVA ESPERANZA', genre: 'Latino Instrumental', src: 'Audio/05 05 - Harmonic Fusion - Nueva Esperanza.mp3' }
    ];

    let currentTrackIndex = 0;
    let isPlaying = false;
    let audio = new Audio();

    const tracklistEl = document.getElementById('tracklist');
    const vinylRecord = document.getElementById('vinylRecord');
    const visualizer = document.getElementById('visualizer');
    
    // Player interface buttons
    const btnPlay = document.getElementById('btnPlay');
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const heroPlayBtn = document.getElementById('heroPlayBtn');
    
    // Playing indicator details
    const playerTrackTitle = document.getElementById('playerTrackTitle');
    const playerTrackGenre = document.getElementById('playerTrackGenre');
    const heroPlayingIndicator = document.querySelector('.playing-indicator');
    const heroTrackTitle = document.querySelector('.preview-track-title');
    const heroTrackGenre = document.querySelector('.preview-track-genre');
    
    // Progress Counters
    const timeCurrent = document.getElementById('timeCurrent');
    const timeDuration = document.getElementById('timeDuration');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');

    // Populate tracklist dynamically
    function populateTracklist() {
        tracklistEl.innerHTML = '';
        tracks.forEach((track, index) => {
            const trackItem = document.createElement('div');
            trackItem.className = `track-item ${index === currentTrackIndex ? 'active' : ''}`;
            trackItem.dataset.index = index;
            
            trackItem.innerHTML = `
                <div class="track-left">
                    <span class="track-number">${String(track.id).padStart(2, '0')}</span>
                    <span class="track-title font-outfit">${track.title}</span>
                </div>
                <div class="track-right">
                    <span class="badge track-badge">${track.genre}</span>
                    <span class="play-small-icon">▶</span>
                </div>
            `;
            
            trackItem.addEventListener('click', () => {
                selectTrack(index);
            });
            tracklistEl.appendChild(trackItem);
        });
    }

    // Helper: format time in MM:SS
    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${String(secs).padStart(2, '0')}`;
    }

    // Select track index
    function selectTrack(index) {
        currentTrackIndex = index;
        const track = tracks[currentTrackIndex];
        
        // Load the new audio source
        audio.src = track.src;
        audio.load();
        
        // Reset progress bar elements
        progressFill.style.width = '0%';
        timeCurrent.textContent = formatTime(0);
        
        // Update Title & Genre details
        playerTrackTitle.textContent = track.title;
        playerTrackGenre.textContent = track.genre;
        if (heroTrackTitle) heroTrackTitle.textContent = track.title;
        if (heroTrackGenre) heroTrackGenre.textContent = track.genre;
        
        // Highlight active track
        const items = tracklistEl.querySelectorAll('.track-item');
        items.forEach((item, idx) => {
            item.classList.toggle('active', idx === currentTrackIndex);
        });

        // Trigger dynamic audio synth sound to indicate switching track!
        playSynthBeep(220 + index * 40, 'sine', 0.15);
        
        // Auto play selected track
        startPlayback();
    }

    // Start playback
    function startPlayback() {
        isPlaying = true;
        
        // Play native HTML5 Audio object
        audio.play().catch(e => {
            console.log("Lecture audio bloquée ou échouée.", e);
            pausePlayback();
        });
        
        // Ensure hero video is muted to prevent clashing sound
        if (heroVideo && !heroVideo.muted) {
            heroVideo.muted = true;
            const soundMuteIcon = heroVideoMuteBtn.querySelector('.sound-icon-mute');
            const soundOnIcon = heroVideoMuteBtn.querySelector('.sound-icon-on');
            if (soundMuteIcon && soundOnIcon) {
                soundOnIcon.classList.add('hidden');
                soundMuteIcon.classList.remove('hidden');
            }
        }
        
        // Visual spin & active indicators
        vinylRecord.classList.add('spinning');
        visualizer.classList.add('active');
        if (heroPlayingIndicator) heroPlayingIndicator.classList.add('active');
        
        // Swap control icons (Player Main)
        btnPlay.querySelector('.icon-play-main').classList.add('hidden');
        btnPlay.querySelector('.icon-pause-main').classList.remove('hidden');
        
        // Swap control icons (Hero Small)
        if (heroPlayBtn) {
            const playIcon = heroPlayBtn.querySelector('.icon-play');
            const pauseIcon = heroPlayBtn.querySelector('.icon-pause');
            if (playIcon) playIcon.classList.add('hidden');
            if (pauseIcon) pauseIcon.classList.remove('hidden');
        }
    }

    // Pause playback
    function pausePlayback() {
        isPlaying = false;
        
        audio.pause();
        
        vinylRecord.classList.remove('spinning');
        visualizer.classList.remove('active');
        if (heroPlayingIndicator) heroPlayingIndicator.classList.remove('active');
        
        btnPlay.querySelector('.icon-play-main').classList.remove('hidden');
        btnPlay.querySelector('.icon-pause-main').classList.add('hidden');
        
        if (heroPlayBtn) {
            const playIcon = heroPlayBtn.querySelector('.icon-play');
            const pauseIcon = heroPlayBtn.querySelector('.icon-pause');
            if (playIcon) playIcon.classList.remove('hidden');
            if (pauseIcon) pauseIcon.classList.add('hidden');
        }
    }

    // Next Track
    function nextTrack() {
        let index = currentTrackIndex + 1;
        if (index >= tracks.length) index = 0;
        selectTrack(index);
    }

    // Prev Track
    function prevTrack() {
        let index = currentTrackIndex - 1;
        if (index < 0) index = tracks.length - 1;
        selectTrack(index);
    }

    // Toggle Play State
    function togglePlay() {
        if (isPlaying) {
            pausePlayback();
            playSynthBeep(261.63, 'square', 0.08); // C4 beep
        } else {
            startPlayback();
            playSynthBeep(329.63, 'sine', 0.08); // E4 beep
        }
    }

    // Native HTML5 Audio Event Listeners for seamless updates
    audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        const percent = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = `${percent}%`;
        timeCurrent.textContent = formatTime(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
        timeDuration.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('ended', () => {
        nextTrack();
    });

    // Click on progress bar to scrub real audio
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percent = Math.max(0, Math.min(100, (clickX / width) * 100));
        
        if (audio.duration) {
            audio.currentTime = (percent / 100) * audio.duration;
            progressFill.style.width = `${percent}%`;
            timeCurrent.textContent = formatTime(audio.currentTime);
        }
        
        playSynthBeep(440, 'triangle', 0.05); // quick scrub sound
    });

    // Wire player listeners
    btnPlay.addEventListener('click', togglePlay);
    if (heroPlayBtn) {
        heroPlayBtn.addEventListener('click', togglePlay);
    }
    btnNext.addEventListener('click', nextTrack);
    btnPrev.addEventListener('click', prevTrack);

    // Initial populate and pre-load first track
    populateTracklist();
    audio.src = tracks[0].src;
    audio.load();


    /* ==========================================
       5. WEB AUDIO API SYNTHESIZER (WOW EFFECT)
       ========================================== */
    let audioCtx = null;

    function initAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    // Generate synth notes directly in user's speakers!
    function playSynthBeep(frequency = 440, type = 'sine', duration = 0.1) {
        try {
            initAudioContext();
            
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = type;
            osc.frequency.value = frequency;
            
            // Envelope (Anti-click)
            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
            
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            console.warn("Audio Context blocked by browser permission policy.", e);
        }
    }

    // Complex synth melody for mascot click
    function playCosmicSnailFanfare() {
        try {
            initAudioContext();
            const now = audioCtx.currentTime;
            
            const notes = [
                { f: 261.63, d: 0.1, t: now },         // C4
                { f: 329.63, d: 0.1, t: now + 0.1 },   // E4
                { f: 392.00, d: 0.1, t: now + 0.2 },   // G4
                { f: 523.25, d: 0.2, t: now + 0.3 }    // C5 (Victory chord!)
            ];
            
            notes.forEach(note => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.type = 'triangle';
                osc.frequency.value = note.f;
                
                gain.gain.setValueAtTime(0, note.t);
                gain.gain.linearRampToValueAtTime(0.1, note.t + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, note.t + note.d);
                
                osc.start(note.t);
                osc.stop(note.t + note.d);
            });
        } catch (e) {
            console.warn(e);
        }
    }


    /* ==========================================
       6. RADIO GHOULALA SPACE CONSOLE STICKER
       ========================================== */
    const snailMascot = document.getElementById('snailMascot');
    const transmissionText = document.getElementById('transmissionText');
    const transmissionScreen = document.getElementById('transmissionScreen');

    const transmissionQuotes = [
        ">> [TRANSMISSION] L'escargot spatial Ghoulala vous salue ! Préparez-vous à une dose de transe collective Gholala !",
        ">> [TRANSMISSION GHOULALA] 'لا بد من القيد أن ينكسر ولا بد من غولالتنا أن تنتصر... إنه الفتنة ! 🔥'",
        ">> [ALERTE RADIALE] Énergie spirituelle Gnawa détectée à 999% ! Vos pieds vont danser de manière incontrôlable !",
        ">> [CONSEIL COSMIQUE] Ne luttez pas contre la folie Gholala. Elle est scientifiquement éprouvée pour induire un bonheur inexplicable !",
        ">> [BULLETIN DE BORD] Le Tremplin Boulevard est conquis. Prochaine étape : La constellation du Snail. Toujours avec notre chaabi-polka !",
        ">> [RADIO TRANSMISSION] 'Baba Hamuda' résonne à travers les étoiles. La transe est en marche, ouvrez vos cœurs !",
        ">> [HISTORIQUE] Fondé en 2006 à Tétouan. Vitesse de croisière : 180 BPM de pur bonheur Gnawi-Latino ! Retrouvez nos vibrations dans notre café culturel 'Espace Radio Gholala' au cœur de la médina.",
        ">> [AVERTISSEMENT GHOULALA] Produit hautement addictif. Les effets secondaires incluent des sourires permanents et des hochements de tête !"
    ];

    snailMascot.addEventListener('click', () => {
        // Trigger synthetic fanfare
        playCosmicSnailFanfare();
        
        // Random transmissions
        const randomIndex = Math.floor(Math.random() * transmissionQuotes.length);
        const quote = transmissionQuotes[randomIndex];
        
        // Screen text effect
        transmissionText.textContent = '';
        transmissionScreen.classList.add('flashing-screen');
        
        setTimeout(() => {
            transmissionScreen.classList.remove('flashing-screen');
        }, 150);

        // Simulated terminal typewriter effect
        let charIndex = 0;
        function type() {
            if (charIndex < quote.length) {
                transmissionText.textContent += quote.charAt(charIndex);
                charIndex++;
                setTimeout(type, 18);
            }
        }
        type();
    });


    /* ==========================================
       7. CONTACT FORM VALIDATION & INTERACTIVES
       ========================================== */
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formButton = contactForm.querySelector('button[type="submit"]');
        const formName = document.getElementById('formName').value;
        const formEmail = document.getElementById('formEmail').value;
        
        formButton.disabled = true;
        formButton.textContent = 'Transmission en cours... 🛸';
        
        playSynthBeep(523.25, 'triangle', 0.2); // C5 alert
        
        setTimeout(() => {
            // Success response
            formStatus.className = 'form-status-box success';
            formStatus.textContent = `Merci ${formName} ! Votre demande a été interceptée par le satellite Harmonic Fusion. Nous vous répondrons très vite à ${formEmail} !`;
            formStatus.classList.remove('hidden');
            
            // Success synth chime!
            playSynthBeep(659.25, 'sine', 0.1); // E5
            setTimeout(() => playSynthBeep(783.99, 'sine', 0.2), 100); // G5
            
            // Reset form
            contactForm.reset();
            formButton.disabled = false;
            formButton.textContent = 'Transmettre au Groupe 🚀';
        }, 1200);
    });

    /* ==========================================
       8. INSTAGRAM GRID HOVER INTERACTIVES
       ========================================== */
    const instagramCards = document.querySelectorAll('.instagram-post-card');
    instagramCards.forEach((card, index) => {
        card.addEventListener('mouseenter', () => {
            // Play a soft, high-pitched ascending note for each card to create an interactive sonic wave!
            playSynthBeep(440 + index * 60, 'sine', 0.08);
        });
    });


    /* ==========================================
       9. DYNAMIC PHOTO GALLERY & LIGHTBOX CONTROLLER
       ========================================== */
    const triggerCards = Array.from(document.querySelectorAll('.gallery-trigger'));
    
    // Lightbox DOM elements
    const lightboxModal = document.getElementById('galleryLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    
    let activeLightboxIndex = 0;

    // Open Lightbox
    function openLightbox(index) {
        activeLightboxIndex = index;
        const card = triggerCards[index];
        const src = card.getAttribute('data-img-src');
        const caption = card.getAttribute('data-caption');
        
        // Update lightbox media and details
        lightboxImg.src = src;
        lightboxImg.alt = caption;
        lightboxCaption.textContent = caption;
        lightboxCounter.textContent = `${index + 1} / ${triggerCards.length}`;
        
        // Add active classes for entrance animation
        lightboxModal.classList.add('active');
        lightboxModal.setAttribute('aria-hidden', 'false');
        
        // Premium soft open UI tone
        playSynthBeep(523.25, 'sine', 0.12); // C5 chime
        
        // Lock page background scrolling
        document.body.style.overflow = 'hidden';
    }

    // Close Lightbox
    function closeLightbox() {
        lightboxModal.classList.remove('active');
        lightboxModal.setAttribute('aria-hidden', 'true');
        
        // Premium soft close UI tone
        playSynthBeep(392.00, 'sine', 0.1); // G4 chime
        
        // Unlock scrolling
        document.body.style.overflow = '';
    }

    // Show Prev Image with premium fade/scale transition
    function showPrevImage() {
        let newIndex = activeLightboxIndex - 1;
        if (newIndex < 0) newIndex = triggerCards.length - 1;
        
        lightboxImg.style.transform = 'scale(0.95)';
        lightboxImg.style.opacity = '0';
        
        setTimeout(() => {
            openLightbox(newIndex);
            lightboxImg.style.transform = 'scale(1)';
            lightboxImg.style.opacity = '1';
            playSynthBeep(440 + newIndex * 20, 'sine', 0.06);
        }, 150);
    }

    // Show Next Image with premium fade/scale transition
    function showNextImage() {
        let newIndex = activeLightboxIndex + 1;
        if (newIndex >= triggerCards.length) newIndex = 0;
        
        lightboxImg.style.transform = 'scale(0.95)';
        lightboxImg.style.opacity = '0';
        
        setTimeout(() => {
            openLightbox(newIndex);
            lightboxImg.style.transform = 'scale(1)';
            lightboxImg.style.opacity = '1';
            playSynthBeep(440 + newIndex * 20, 'sine', 0.06);
        }, 150);
    }

    // Wire up trigger card click events
    triggerCards.forEach((card, index) => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            openLightbox(index);
        });
    });

    // Lightbox Control Event Listeners
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', showPrevImage);
    lightboxNext.addEventListener('click', showNextImage);

    // Close on background modal overlay clicks
    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
            closeLightbox();
        }
    });

    // Keyboard bindings (Arrows & Escape)
    document.addEventListener('keydown', (e) => {
        if (!lightboxModal.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            showPrevImage();
        } else if (e.key === 'ArrowRight') {
            showNextImage();
        }
    });

    // ==========================================
    // 10. DYNAMIC LOAD MORE CONTROLLER
    // ==========================================
    const btnLoadMore = document.getElementById('btnLoadMorePhotos');
    const hiddenPosts = document.querySelectorAll('.hidden-post');
    
    if (btnLoadMore) {
        btnLoadMore.addEventListener('click', () => {
            // Interactive double synth success note
            playSynthBeep(523.25, 'triangle', 0.15); // C5 chime
            setTimeout(() => playSynthBeep(659.25, 'triangle', 0.15), 80); // E5 chime
            
            // Staggered fade-in reveal for the 8 hidden posts
            hiddenPosts.forEach((post, idx) => {
                // Clear inline style display none
                post.style.display = '';
                
                // Force browser reflow to reset transitions
                void post.offsetWidth;
                
                // Stagger transition classes for maximum polish
                setTimeout(() => {
                    post.classList.add('show-post');
                }, idx * 80); // Stagger 80ms delay between elements
            });
            
            // Smoothly dissolve load more button
            btnLoadMore.style.opacity = '0';
            btnLoadMore.style.transform = 'scale(0.95)';
            btnLoadMore.style.pointerEvents = 'none';
            setTimeout(() => {
                btnLoadMore.style.display = 'none';
            }, 400);
        });
    }

    /* ==========================================
       11. HERO VIDEO AUDIO CONTROLLER
       ========================================== */
    const heroVideo = document.getElementById('heroVideo');
    const heroVideoMuteBtn = document.getElementById('heroVideoMuteBtn');
    
    if (heroVideo && heroVideoMuteBtn) {
        const soundMuteIcon = heroVideoMuteBtn.querySelector('.sound-icon-mute');
        const soundOnIcon = heroVideoMuteBtn.querySelector('.sound-icon-on');
        
        heroVideoMuteBtn.addEventListener('click', () => {
            if (heroVideo.muted) {
                // Unmute video
                heroVideo.muted = false;
                soundMuteIcon.classList.add('hidden');
                soundOnIcon.classList.remove('hidden');
                
                // If the site's background music player is currently playing, pause it to prevent clash
                if (isPlaying) {
                    pausePlayback();
                }
                
                // Audio synth chime to confirm activation
                playSynthBeep(440, 'sine', 0.1);
            } else {
                // Mute video
                heroVideo.muted = true;
                soundOnIcon.classList.add('hidden');
                soundMuteIcon.classList.remove('hidden');
                
                playSynthBeep(330, 'sine', 0.08);
            }
        });
    }

});
