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
        const output = document.getElementById("output");

        // Yangi URL elementini yaratish
        const div = document.createElement("div");
        div.classList.add("url-item");

        // Faylni ko‘rsatish
        if (data.entry.type.startsWith("image")) {
            const img = document.createElement("img");
            img.src = data.entry.url;
            img.alt = "Uploaded Image";
            img.style.maxWidth = "100%";
            div.appendChild(img);
        } else if (data.entry.type.startsWith("video")) {
            const video = document.createElement("video");
            video.src = data.entry.url;
            video.controls = true;
            video.style.maxWidth = "100%";
            div.appendChild(video);
        }

        // URL
        const a = document.createElement("a");
        a.href = data.entry.url;
        a.target = "_blank";
        a.textContent = data.entry.url;
        div.appendChild(a);

        // O'chirish tugmasi
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "O'chirish";
        removeBtn.classList.add("remove-btn");
        removeBtn.onclick = async () => {
            try {
                const deleteRes = await fetch(`/upload/${data.entry.id}`, {
                    method: "DELETE"
                });
                if (!deleteRes.ok) throw new Error("Serverda faylni o'chirishda xatolik yuz berdi!");

                // Elementni DOM dan o‘chirish
                div.remove();
            } catch (err) {
                alert(err.message);
            }
        };
        div.appendChild(removeBtn);

        // Faqat yangi URL ko‘rsin
        output.prepend(div);

        // Fayl inputni tozalash
        fileInput.value = "";

    } catch (err) {
        alert("Xatolik: " + err.message);
    }
}

// Barchasini tozalash funksiyasi
function clearList() {
    document.getElementById("output").innerHTML = "";
}
