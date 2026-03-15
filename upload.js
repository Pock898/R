let selectedFile = null;
const user = auth.currentUser;

// Check Authentication
if (!user) {
    window.location.href = 'login.html';
}

// Upload Area Click
document.getElementById('uploadArea').addEventListener('click', () => {
    document.getElementById('videoInput').click();
});

// File Selection
document.getElementById('videoInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
        selectedFile = file;
        const preview = document.getElementById('previewVideo');
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
        document.getElementById('uploadBtn').disabled = false;
    }
});

// Upload Form Submit
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
        alert('Please select a video first');
        return;
    }

    const caption = document.getElementById('caption').value;
    const hashtags = document.getElementById('hashtags').value;
    const uploadBtn = document.getElementById('uploadBtn');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const statusMsg = document.getElementById('statusMsg');

    uploadBtn.disabled = true;
    progressBar.style.display = 'block';
    statusMsg.innerText = 'Uploading...';

    try {
        // Create unique filename
        const filename = `videos/${user.uid}_${Date.now()}_${selectedFile.name}`;
        
        // Upload to Firebase Storage        const storageRef = storage.ref(filename);
        const uploadTask = storageRef.put(selectedFile);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressFill.style.width = progress + '%';
            },
            (error) => {
                console.error('Upload error:', error);
                statusMsg.innerText = 'Upload failed: ' + error.message;
                uploadBtn.disabled = false;
            },
            async () => {
                // Get download URL
                const videoURL = await uploadTask.snapshot.ref.getDownloadURL();
                
                // Save to Firestore
                await db.collection('videos').add({
                    userId: user.uid,
                    username: user.displayName || '@user',
                    videoURL: videoURL,
                    thumbnailURL: '',
                    caption: caption,
                    hashtags: hashtags.split(' ').filter(tag => tag.startsWith('#')),
                    likesCount: 0,
                    commentsCount: 0,
                    sharesCount: 0,
                    viewsCount: 0,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Update user video count
                await db.collection('users').doc(user.uid).update({
                    videoCount: firebase.firestore.FieldValue.increment(1)
                });

                statusMsg.innerText = 'Upload successful!';
                statusMsg.style.color = '#00f2ea';
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        );
    } catch (error) {
        console.error('Error:', error);
        statusMsg.innerText = 'Error: ' + error.message;
        uploadBtn.disabled = false;
    }});