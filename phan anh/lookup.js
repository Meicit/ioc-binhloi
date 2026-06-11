// Liên thông dịch vụ kết nối tài nguyên từ tệp cấu hình cùng cấp
import { db } from "./firebase-config.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Lắng nghe sự kiện người dân nhấp chuột vào nút "Kiểm tra hồ sơ"
document.getElementById('searchBtn').addEventListener('click', async () => {
    const inputElement = document.getElementById('trackingCodeInput');
    const trackingCode = inputElement.value.trim().toUpperCase(); // Tự động ép in hoa để khớp mã lưu trữ

    const errorBox = document.getElementById('errorBox');
    const resultBox = document.getElementById('resultBox');

    // Reset trạng thái ẩn hiện của các khung UI trước mỗi lượt tra cứu mới
    errorBox.classList.add('hidden');
    resultBox.classList.add('hidden');

    // Kiểm tra nếu ô nhập liệu trống
    if (trackingCode === "") {
        alert("⚠️ Vui lòng nhập Mã tra cứu gồm 8 ký tự!");
        inputElement.focus();
        return;
    }

    try {
        // 1. Khởi tạo lệnh truy vấn logic tìm kiếm bản ghi trong bảng "complaints" có trường trackingCode trùng khớp
        const q = query(collection(db, "complaints"), where("trackingCode", "==", trackingCode));
        
        // Tiến hành quét và lấy dữ liệu bất đồng bộ từ Firestore
        const querySnapshot = await getDocs(q);

        // 2. Trường hợp mã tra cứu không tồn tại trong hệ thống cơ sở dữ liệu
        if (querySnapshot.empty) {
            errorBox.innerText = "❌ Mã phản ánh không tồn tại trong hệ thống. Vui lòng kiểm tra lại chính xác các ký tự!";
            errorBox.classList.remove('hidden');
            return;
        }

        // 3. Trích xuất dữ liệu của bản ghi tìm thấy (Vì mã độc bản nên cấu trúc snapshot chỉ có 1 tài liệu)
        let docData = null;
        querySnapshot.forEach((doc) => {
            docData = doc.data();
        });

        // 4. Đổ dữ liệu thô vào các vùng hiển thị tương ứng trên cây DOM của file lookup.html
        document.getElementById('nameDisplay').innerText = docData.fullname;
        
        // Chuẩn hóa chuỗi thời gian quốc tế (ISO) sang định dạng ngày giờ Việt Nam trực quan
        const dateFormatted = new Date(docData.createdAt).toLocaleString('vi-VN');
        document.getElementById('timeDisplay').innerText = dateFormatted;
        
        document.getElementById('contentDisplay').innerText = docData.content;

        // 5. Xử lý phân khu hiển thị hình ảnh hiện trường kiến nghị
        const imgContainer = document.getElementById('imgContainer');
        if (docData.imageUrl && docData.imageUrl.trim() !== "") {
            document.getElementById('imageDisplay').src = docData.imageUrl;
            imgContainer.classList.remove('hidden'); // Hiện khung ảnh nếu có link ảnh lưu trên Storage
        } else {
            imgContainer.classList.add('hidden');    // Ẩn đi nếu đơn là văn bản thuần túy
        }

        // 6. Điều chỉnh màu sắc động cho thẻ trạng thái xử lý (Hệ màu tương phản Glassmorphism)
        const statusEl = document.getElementById('statusDisplay');
        statusEl.innerText = docData.status;
        
        if (docData.status === "Đã hoàn thành") {
            statusEl.className = "px-3 py-1 rounded-lg uppercase tracking-wide text-[10px] text-white bg-emerald-600 shadow-sm shadow-emerald-600/10";
        } else if (docData.status === "Đang xử lý") {
            statusEl.className = "px-3 py-1 rounded-lg uppercase tracking-wide text-[10px] text-white bg-amber-500 shadow-sm shadow-amber-500/10";
        } else { // Trạng thái mặc định: Đang tiếp nhận
            statusEl.className = "px-3 py-1 rounded-lg uppercase tracking-wide text-[10px] text-white bg-blue-600 shadow-sm shadow-blue-600/10";
        }

        // 7. Kiểm tra và kết xuất nội dung phản hồi chính thức từ cán bộ ban ngành xã
        const replyEl = document.getElementById('replyDisplay');
        if (docData.replyContent && docData.replyContent.trim() !== "") {
            replyEl.innerText = docData.replyContent;
            replyEl.classList.remove('italic', 'text-slate-400');
        } else {
            // Nội dung giữ chỗ mặc định khi cán bộ chuyên trách chưa nhập phản hồi
            replyEl.innerText = "Hiện tại hồ sơ đang trong quá trình rà soát, kiểm tra hiện trường thực tế theo quy định. Kết quả xác minh sẽ được cập nhật sớm nhất.";
            replyEl.classList.add('italic');
        }

        // Kích hoạt hiển thị toàn bộ khối kết quả phẳng lên màn hình người dùng
        resultBox.classList.remove('hidden');

    } catch (error) {
        console.error("Lỗi xảy ra trong quá trình truy vấn dữ liệu Firestore:", error);
        alert("⚠️ Kết nối mạng bị gián đoạn. Không thể liên thông với máy chủ dữ liệu lúc này!");
    }
});
