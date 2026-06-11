// Liên thông các dịch vụ kết nối tài nguyên từ tệp cấu hình cùng cấp
import { db, storage } from "./firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

/**
 * Hàm phát sinh Mã phản ánh ngẫu nhiên (Tracking Code)
 * Định dạng: 8 ký tự bao gồm chữ cái in hoa (A-Z) và số (0-9)
 */
function generateTrackingCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Lắng nghe sự kiện gửi biểu mẫu phản ánh từ giao diện phan-anh.html
document.getElementById('complaintForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Ngăn chặn hành vi tải lại trang mặc định

    const submitBtn = document.getElementById('submitBtn');
    const fullname = document.getElementById('fullname').value.trim();
    const cccd = document.getElementById('cccd').value.trim();
    const email = document.getElementById('email').value.trim();
    const content = document.getElementById('content').value.trim();
    const imageFile = document.getElementById('imageFile').files[0];

    // 1. Kiểm tra định dạng số CCCD (Phải đủ và đúng 12 chữ số)
    const cccdRegex = /^\d{12}$/;
    if (!cccdRegex.test(cccd)) {
        alert("⚠️ Số Căn cước công dân không hợp lệ! Vui lòng nhập đúng và đủ 12 chữ số.");
        document.getElementById('cccd').focus();
        return;
    }

    // Khóa trạng thái nút bấm tránh người dân click spam
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Hệ thống đang tải dữ liệu lên...</span>`;

    try {
        let imageUrl = "";

        // 2. Xử lý tải hình ảnh lên Cloud Storage nếu có chọn tệp
        if (imageFile) {
            console.log("Đang tiến hành chuẩn bị tải hình ảnh lên Firebase Storage...");
            try {
                const fileExtension = imageFile.name.split('.').pop();
                const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExtension}`;
                const storageRef = ref(storage, `complaints/${uniqueFileName}`);
                
                const uploadResult = await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(uploadResult.ref);
                console.log("Tải ảnh thành công! URL ảnh công khai: ", imageUrl);
            } catch (storageError) {
                console.error("Lỗi phân khu Storage:", storageError);
                throw new Error(`[Lỗi Tải Ảnh Storage] -> ${storageError.message}. Hãy kiểm tra lại cấu hình Storage Rules hoặc CORS.`);
            }
        }

        // 3. Khởi tạo cấu trúc bản ghi tài liệu dữ liệu Firestore
        const trackingCode = generateTrackingCode();
        const complaintData = {
            trackingCode: trackingCode,
            fullname: fullname,
            cccd: cccd,
            email: email,
            content: content,
            imageUrl: imageUrl,
            status: "Đang tiếp nhận",
            replyContent: "",
            createdAt: new Date().toISOString()
        };

        // 4. Liên thông ghi bản ghi mới vào Bộ sưu tập "complaints" trên Firestore
        console.log("Đang tiến hành ghi dữ liệu chữ vào Firestore Database...");
        try {
            await addDoc(collection(db, "complaints"), complaintData);
            console.log("Ghi dữ liệu Firestore thành công với mã tra cứu: ", trackingCode);
        } catch (firestoreError) {
            console.error("Lỗi phân khu Firestore Database:", firestoreError);
            throw new Error(`[Lỗi Ghi Bản Ghi Firestore] -> ${firestoreError.message}. Hãy kiểm tra lại Firestore Rules.`);
        }

        // 5. Đổ Mã tra cứu vào giao diện Modal và kích hoạt hiển thị bung màn hình khi mọi thứ hoàn hảo
        document.getElementById('trackingCodeDisplay').innerText = trackingCode;
        const modal = document.getElementById('successModal');
        const card = document.getElementById('modalCard');
        modal.classList.remove('opacity-0', 'pointer-events-none');
        card.classList.remove('scale-95');

    } catch (globalError) {
        // BẬT THÔNG BÁO LỖI CHI TIẾT RA MÀN HÌNH NẾU BỊ TREO NGẦM
        console.error("Lỗi toàn cục tiến trình:", globalError);
        alert(`❌ Hệ thống lỗi kết nối:\n${globalError.message}`);
    } finally {
        // Mở khóa lại nút bấm để người dùng có thể chỉnh sửa dữ liệu hoặc bấm lại
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Xác nhận gửi phản ánh</span> 🚀`;
    }
});
