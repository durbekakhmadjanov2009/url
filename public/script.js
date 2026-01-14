async function uploadFile() {
    const fileInput = document.getElementById("file");
    const file = fileInput.files[0];

    if (!file) return alert("Fayl kerak!");

    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        if (!res.ok) throw new Error("Serverda xatolik yuz berdi!");

        const data = await res.json();
        document.getElementById("output").textContent = JSON.stringify(data, null, 2);
    } catch (err) {
        alert("Xatolik: " + err.message);
    }
}
