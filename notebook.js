function renderNotes() {
  chrome.storage.local.get({ notes: [] }, (data) => {
    const notesContainer = document.getElementById("notes");
    notesContainer.innerHTML = "";

    data.notes.forEach((note, i) => {
      const div = document.createElement("div");
      div.className = "note";
      div.innerHTML = `<strong>${note.type.toUpperCase()}:</strong><br>${note.content}`;
      notesContainer.appendChild(div);
    });
  });
}

document.addEventListener("DOMContentLoaded", renderNotes);
