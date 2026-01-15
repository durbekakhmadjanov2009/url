const dropArea = document.getElementById("drop-area");
const dropText = dropArea.querySelector('p');
const fileInput = document.getElementById("file");
const uploadBtn = document.getElementById("upload-btn");
const output = document.getElementById("output");

let selectedFile = null;
let previewElement = null; // Preview uchun element

// --- Matnga bosilganda file explorer ochish ---
dropText.addEventListener('click', () => fileInput.click());

// --- Drag & Drop ---
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.add('hover');
    });
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.remove('hover');
    });
});

dropArea.addEventListener('drop', e => {
    const files = e.dataTransfer.files;
    if (files.length) {
        handleFileSelection(files[0]);
    }
});

// --- Fayl input orqali tanlash ---
fileInput.addEventListener('change', () => {
    if (fileInput.files.length) handleFileSelection(fileInput.files[0]);
});

// --- Faylni tanlash va preview ko‘rsatish funksiyasi ---
function handleFileSelection(file) {
    selectedFile = file;
    dropText.textContent = `Tanlangan fayl: ${file.name}`;

    // Eski previewni olib tashlash
    if (previewElement) previewElement.remove();

    // Yangi preview yaratish
    if (file.type.startsWith("image")) {
        const img = document.createElement("img");
        img.style.maxWidth = "100%";
        img.style.maxHeight = "200px";
        img.style.borderRadius = "5px";
        img.src = URL.createObjectURL(file);
        previewElement = img;
        dropArea.appendChild(img);
    } else if (file.type.startsWith("video")) {
        const video = document.createElement("video");
        video.style.maxWidth = "100%";
        video.style.maxHeight = "200px";
        video.controls = true;
        video.src = URL.createObjectURL(file);
        previewElement = video;
        dropArea.appendChild(video);
    }
}

// --- Yuklash tugmasi ---
uploadBtn.addEventListener('click', async () => {
    if (!selectedFile) return alert("Fayl kerak!");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
        const res = await fetch("/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Serverda xatolik yuz berdi!");

        const data = await res.json();
        addFileToDOM(data.entry);

        // Tozalash
        selectedFile = null;
        fileInput.value = "";
        dropText.textContent = 'Faylni shu yerga torting yoki tanlang';

        if (previewElement) previewElement.remove();
        previewElement = null;
    } catch (err) {
        alert(err.message);
    }
});

// --- DOM-ga fayl qo'shish ---
function addFileToDOM(entry) {
    const div = document.createElement("div");
    div.classList.add("url-item");

    if (entry.type.startsWith("image")) {
        const img = document.createElement("img");
        img.src = entry.url;
        img.alt = "Uploaded Image";
        div.appendChild(img);
    } else if (entry.type.startsWith("video")) {
        const video = document.createElement("video");
        video.src = entry.url;
        video.controls = true;
        div.appendChild(video);
    }

    const a = document.createElement("a");
    a.href = entry.url;
    a.target = "_blank";
    a.textContent = entry.url;
    div.appendChild(a);

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "O'chirish";
    removeBtn.classList.add("remove-btn");
    removeBtn.onclick = async () => {
        try {
            const deleteRes = await fetch(`/upload/${entry.id}`, { method: "DELETE" });
            if (!deleteRes.ok) throw new Error("Serverda faylni o'chirishda xatolik yuz berdi!");
            div.remove();
        } catch (err) {
            alert(err.message);
        }
    };
    div.appendChild(removeBtn);

    output.prepend(div);
}

// --- Sahifa yuklanganda barcha fayllarni olish ---
window.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("/files");
        if (!res.ok) throw new Error("Serverdan URL larni olishda xatolik!");
        const files = await res.json();
        files.reverse().forEach(entry => addFileToDOM(entry));
    } catch (err) {
        console.error(err.message);
    }
});

// --- Barchasini tozalash ---
function clearList() {
    output.innerHTML = "";
}
