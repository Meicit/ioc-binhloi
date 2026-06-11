// Hàm chuyển đổi File ảnh sang chuỗi văn bản Base64
function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Bên trong sự kiện form.addEventListener('submit', ...)
let base64Image = "";
if (imageFile) {
    // Nếu file ảnh lớn hơn 800KB, hãy cảnh báo để tránh vượt hạn mức 1MB của Firestore
    if (imageFile.size > 800 * 1024) {
        alert("⚠️ Ảnh quá lớn! Vui lòng chọn ảnh dưới 800KB để hệ thống xử lý.");
        return;
    }
    base64Image = await convertFileToBase64(imageFile); // Biến ảnh thành chữ
}

const complaintData = {
    trackingCode: trackingCode,
    fullname: fullname,
    content: content,
    imageUrl: base64Image, // Lưu chuỗi chữ Base64 này thẳng vào Firestore
    createdAt: new Date().toISOString()
};
