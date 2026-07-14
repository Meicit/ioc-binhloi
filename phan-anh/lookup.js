const API_BASE = "https://xabinhhung.gov.vn/api_phananh";

document.getElementById('searchBtn').addEventListener('click', async () => {
    const trackingCode = document.getElementById('trackingCodeInput').value.trim().toUpperCase();
    const errorBox = document.getElementById('errorBox');
    const resultBox = document.getElementById('resultBox');

    errorBox.classList.add('hidden'); resultBox.classList.add('hidden');

    if (trackingCode === "") { alert("⚠️ Vui lòng nhập Mã tra cứu!"); return; }

    try {
        const response = await fetch(`${API_BASE}/lookup.php?code=${trackingCode}`);
        if (!response.ok) {
            errorBox.innerText = "❌ Mã phản ánh không tồn tại!"; errorBox.classList.remove('hidden'); return;
        }

        const docData = await response.json();

        document.getElementById('nameDisplay').innerText = docData.fullname;
        document.getElementById('timeDisplay').innerText = new Date(docData.createdAt).toLocaleString('vi-VN');
        document.getElementById('contentDisplay').innerText = docData.content;

        const imgContainer = document.getElementById('imgContainer');
        if (docData.imageUrl && docData.imageUrl !== "") {
            document.getElementById('imageDisplay').src = docData.imageUrl;
            imgContainer.classList.remove('hidden');
        } else {
            imgContainer.classList.add('hidden');
        }

        const statusEl = document.getElementById('statusDisplay');
        statusEl.innerText = docData.status;
        if (docData.status === "Đã hoàn thành") statusEl.className = "px-3 py-1 rounded-lg uppercase text-[10px] text-white bg-emerald-600";
        else if (docData.status === "Đang xử lý") statusEl.className = "px-3 py-1 rounded-lg uppercase text-[10px] text-white bg-amber-500";
        else statusEl.className = "px-3 py-1 rounded-lg uppercase text-[10px] text-white bg-blue-600";

        const replyEl = document.getElementById('replyDisplay');
        if (docData.replyContent && docData.replyContent !== "") {
            replyEl.innerText = docData.replyContent; replyEl.classList.remove('italic');
        } else {
            replyEl.innerText = "Hồ sơ đang rà soát. Kết quả sẽ cập nhật sớm nhất.";
            replyEl.classList.add('italic');
        }

        resultBox.classList.remove('hidden');
    } catch (error) {
        alert("⚠️ Không thể kết nối với máy chủ!");
    }
});
