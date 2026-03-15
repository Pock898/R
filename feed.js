// Check Authentication
auth.onAuthStateChanged((user) => {
    if (!user) {
        document.getElementById('auth-warning').style.display = 'flex';
    } else {
        document.getElementById('auth-warning').style.display = 'none';
        loadVideos();
    }
});

// Load Videos from Firebase
async function loadVideos() {
    const feedContainer = document.getElementById('videoFeed');
    feedContainer.innerHTML = '<div class="loading">Loading videos...</div>';

    try {
        const snapshot = await db.collection('videos').orderBy('createdAt', 'desc').limit(20).get();
        
        if (snapshot.empty) {
            feedContainer.innerHTML = '<div class="loading">No videos yet. Be the first to upload!</div>';
            return;
        }

        feedContainer.innerHTML = '';
        
        snapshot.forEach((doc) => {
            const video = doc.data();
            createVideoCard(video, doc.id);
        });

        setupAutoPlay();
    } catch (error) {
        console.error('Error loading videos:', error);
        feedContainer.innerHTML = '<div class="loading">Error loading videos</div>';
    }
}

// Create Video Card
function createVideoCard(video, videoId) {
    const feedContainer = document.getElementById('videoFeed');
    const card = document.createElement('div');
    card.classList.add('video-card');
    card.setAttribute('data-video-id', videoId);

    card.innerHTML = `
        <video class="video-player" src="${video.videoURL}" loop playsinline poster="${video.thumbnailURL || ''}"></video>
        <div class="play-icon"><i class="fas fa-play"></i></div>
        
        <div class="video-info">
            <div class="username">${video.username || '@user'}</div>            <div class="caption">${video.caption || ''}</div>
        </div>

        <div class="overlay-sidebar">
            <div class="action-btn like-btn" onclick="toggleLike('${videoId}', this)">
                <i class="far fa-heart"></i>
                <span class="like-count">${video.likesCount || 0}</span>
            </div>
            <div class="action-btn" onclick="openComments('${videoId}')">
                <i class="fas fa-comment-dots"></i>
                <span class="comment-count">${video.commentsCount || 0}</span>
            </div>
            <div class="action-btn" onclick="shareVideo('${videoId}')">
                <i class="fas fa-share"></i>
                <span>Share</span>
            </div>
        </div>
    `;

    feedContainer.appendChild(card);

    // Video Play/Pause on Click
    const videoElement = card.querySelector('.video-player');
    const playIcon = card.querySelector('.play-icon');
    
    videoElement.addEventListener('click', () => {
        if (videoElement.paused) {
            videoElement.play();
            playIcon.style.display = 'none';
        } else {
            videoElement.pause();
            playIcon.style.display = 'block';
        }
    });
}

// Auto Play Logic
function setupAutoPlay() {
    const videos = document.querySelectorAll('.video-player');
    
    let observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.play().catch(e => console.log('Auto-play prevented'));
                entry.target.currentTime = 0;
            } else {
                entry.target.pause();
            }
        });
    }, { threshold: 0.6 });
    videos.forEach(video => observer.observe(video));
}

// Like Function
async function toggleLike(videoId, btn) {
    const user = auth.currentUser;
    if (!user) {
        alert('Please login to like videos');
        return;
    }

    btn.classList.toggle('liked');
    const icon = btn.querySelector('i');
    const countSpan = btn.querySelector('.like-count');
    let count = parseInt(countSpan.innerText) || 0;

    if (btn.classList.contains('liked')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        count++;
        
        // Update Firebase
        await db.collection('videos').doc(videoId).update({
            likesCount: firebase.firestore.FieldValue.increment(1)
        });
        
        // Add to likes collection
        await db.collection('likes').add({
            videoId: videoId,
            userId: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        count--;
        
        await db.collection('videos').doc(videoId).update({
            likesCount: firebase.firestore.FieldValue.increment(-1)
        });
    }

    countSpan.innerText = count;
}

// Share Function
function shareVideo(videoId) {
    const url = window.location.origin + '/video.html?id=' + videoId;
        if (navigator.share) {
        navigator.share({
            title: 'Check out this video!',
            url: url
        });
    } else {
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    }
}

// Open Comments (Placeholder)
function openComments(videoId) {
    alert('Comments feature coming soon! Video ID: ' + videoId);
}