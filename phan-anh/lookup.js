import { db } from "./firebase-config.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.getElementById('searchBtn').addEventListener('click', async () => {
    const inputElement = document.getElementById('trackingCodeInput');
    const trackingCode = inputElement.value.trim().toUpperCase();

    const errorBox = document.getElementById('errorBox');
    const resultBox = document.getElementById('resultBox');

    errorBox.classList.add('hidden');
    resultBox.classList.add('hidden');

    if (trackingCode === "") {
        alert("⚠️ Vui lòng nhập Mã tra cứu gồm 8 ký tự!");
        inputElement.focus();
        return;
    }

    try {
        const q = query(collection(db, "complaints"), where("trackingCode", "==", trackingCode));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            errorBox.innerText = "❌ Mã phản ánh không tồn tại trong hệ thống. Vui lòng kiểm tra lại!";
            errorBox.classList.remove('hidden');
            return;
        }

        let docData = null;
        querySnapshot.forEach((doc) => { docData = doc.data(); });

        document.getElementById('nameDisplay').innerText = docData.fullname;
        document.getElementById('timeDisplay').innerText = new Date(docData.createdAt).toLocaleString('vi-VN');
        document.getElementById('contentDisplay').innerText = docData.content;

        // Xử lý đọc chuỗi văn bản Base64 hiển thị ngược lại thành hình ảnh
        const imgContainer = document.getElementById('imgContainer');
        if (docData.imageUrl && docData.imageUrl.trim() !== "") {
            document.getElementById('imageDisplay').src = docData.imageUrl;
            imgContainer.classList.remove('hidden');
        } else {
            imgContainer.classList.add('hidden');
        }

        const statusEl = document.getElementById('statusDisplay');
        statusEl.innerText = docData.status;
        if (docData.status === "Đã hoàn thành") {
            statusEl.className = "px-3 py-1 rounded-lg uppercase tracking-wide text-[10px] text-white bg-emerald-600 shadow-sm";
        } else if (docData.status === "Đang xử lý") {
            statusEl.className = "px-3 py-1 rounded-lg uppercase tracking-wide text-[10px] text-white bg-amber-500 shadow-sm";
        } else {
            statusEl.className = "px-3 py-1 rounded-lg uppercase tracking-wide text-[10px] text-white bg-blue-600 shadow-sm";
        }

        const replyEl = document.getElementById('replyDisplay');
        if (docData.replyContent && docData.replyContent.trim() !== "") {
            replyEl.innerText = docData.replyContent; replyEl.classList.remove('italic');
        } else {
            replyEl.innerText = "Hiện tại hồ sơ đang trong quá trình rà soát, kiểm tra hiện trường thực tế theo quy định. Kết quả xác minh sẽ được cập nhật sớm nhất.";
            replyEl.classList.add('italic');
        }

        resultBox.classList.remove('hidden');

    } catch (error) {
        console.error("Lỗi xảy ra trong quá trình truy vấn dữ liệu Firestore:", error);
        alert("⚠️ Không thể liên thông với máy chủ dữ liệu lúc này!");
    }
});
