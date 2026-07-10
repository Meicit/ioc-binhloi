import { db } from "./firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Hàm chuyên trách nén ảnh bằng HTML5 Canvas ngầm
function compressImageToBase64(file, maxWidth = 600, quality = 0.6) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Tính toán tỷ lệ để co chiều rộng về mức tối đa cho phép
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Xuất ảnh ra định dạng chuỗi nén JPEG siêu nhẹ
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

function generateTrackingCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) { code += chars.charAt(Math.floor(Math.random() * chars.length)); }
    return code;
}

document.getElementById('complaintForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    
    // Lấy dữ liệu từ giao diện
    const fullname = document.getElementById('fullname').value.trim();
    const cccd = document.getElementById('cccd').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    const phone = document.getElementById('phone').value.trim(); // TRƯỜNG SỐ ĐIỆN THOẠI MỚI
    const receiveMethod = document.getElementById('receiveMethod').value.trim();
    const content = document.getElementById('content').value.trim();
    const imageFile = document.getElementById('imageFile').files[0];

    // Kiểm tra tính hợp lệ CCCD
    const cccdRegex = /^\d{12}$/;
    if (!cccdRegex.test(cccd)) {
        alert("⚠️ Số Căn cước công dân không hợp lệ! Vui lòng nhập đúng và đủ 12 chữ số.");
        document.getElementById('cccd').focus();
        return;
    }
    
    // Kiểm tra tính hợp lệ Số điện thoại (Bắt đầu bằng số 0, dài 10 số)
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(phone)) {
        alert("⚠️ Số điện thoại không hợp lệ! Vui lòng kiểm tra lại (VD: 0912345678).");
        document.getElementById('phone').focus();
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Hệ thống đang tối ưu ảnh và tải lên...</span>`;

    try {
        let finalImageData = "";

        // Tiến hành kích hoạt nén ảnh nếu người dân có chọn file đính kèm
        if (imageFile) {
            console.log("Phát hiện tệp ảnh gốc. Đang tiến hành thuật toán nén Canvas...");
            finalImageData = await compressImageToBase64(imageFile, 600, 0.6);
            console.log("Nén ảnh Base64 hoàn tất thành công!");
        }

        const trackingCode = generateTrackingCode();
        
        // Cập nhật object dữ liệu để lưu lên Firestore
        const complaintData = {
            trackingCode: trackingCode,
            fullname: fullname,
            cccd: cccd,
            email: email,
            phone: phone,                   // Lưu Số điện thoại
            address: address,               // Lưu Địa chỉ liên hệ
            receiveMethod: receiveMethod,   // Lưu Hình thức nhận kết quả
            content: content,
            imageUrl: finalImageData,
            status: "Đang tiếp nhận",
            replyContent: "",
            createdAt: new Date().toISOString()
        };

        // In ra console để kiểm tra chắc chắn dữ liệu đã lấy đúng trước khi gửi
        console.log("Chuẩn bị gửi dữ liệu:", complaintData);

        // Ghi dữ liệu vào Firestore
        await addDoc(collection(db, "complaints"), complaintData);

        document.getElementById('trackingCodeDisplay').innerText = trackingCode;
        const modal = document.getElementById('successModal');
        const card = document.getElementById('modalCard');
        modal.classList.remove('opacity-0', 'pointer-events-none');
        card.classList.remove('scale-95');

    } catch (globalError) {
        console.error("Lỗi tiến trình gửi đơn:", globalError);
        alert(`❌ Không thể gửi phản ánh. Vui lòng kiểm tra lại Firestore Rules!\nChi tiết: ${globalError.message}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Xác nhận gửi phản ánh</span> 🚀`;
    }
});
