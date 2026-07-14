const API_BASE = "https://xabinhhung.gov.vn/api_phananh";

function compressImageToBase64(file, maxWidth = 600, quality = 0.6) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width; let height = img.height;
                if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
                canvas.width = width; canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

function generateTrackingCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; let code = "";
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
}

document.getElementById('complaintForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    
    const fullname = document.getElementById('fullname').value.trim();
    const cccd = document.getElementById('cccd').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    const phone = document.getElementById('phone').value.trim(); 
    const receiveMethod = document.getElementById('receiveMethod').value.trim();
    const content = document.getElementById('content').value.trim();
    const imageFile = document.getElementById('imageFile').files[0];

    if (!/^\d{12}$/.test(cccd)) { alert("⚠️ Số Căn cước công dân không hợp lệ!"); return; }
    if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(phone)) { alert("⚠️ Số điện thoại không hợp lệ!"); return; }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Hệ thống đang tải lên...</span>`;

    try {
        let finalImageData = "";
        if (imageFile) finalImageData = await compressImageToBase64(imageFile, 600, 0.6);

        const trackingCode = generateTrackingCode();
        const complaintData = {
            trackingCode, fullname, cccd, email, phone, address, receiveMethod, content,
            imageUrl: finalImageData, status: "Đang tiếp nhận", replyContent: "",
            createdAt: new Date().toISOString()
        };

        const response = await fetch(`${API_BASE}/submit.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(complaintData)
        });

        if (!response.ok) throw new Error("Máy chủ phản hồi lỗi");

        document.getElementById('trackingCodeDisplay').innerText = trackingCode;
        document.getElementById('successModal').classList.remove('opacity-0', 'pointer-events-none');
        document.getElementById('modalCard').classList.remove('scale-95');
    } catch (error) {
        alert(`❌ Lỗi: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Xác nhận gửi phản ánh</span> 🚀`;
    }
});
