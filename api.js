const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const status = document.getElementById("status");
const notesList = document.getElementById("notes-list");

async function request(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return response;
}

function setStatus(message, type = "") {
    status.textContent = message;
    status.className = type ? `status-${type}` : "";
}

function renderNotes(notes) {
    notesList.innerHTML = "";

    if (notes.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.textContent = "No notes available.";
        notesList.appendChild(emptyMessage);
        return;
    }

    notes.forEach(function (note) {
        const listItem = document.createElement("li");
        listItem.className = "note";

        const title = document.createElement("h3");
        title.textContent = note.title;

        const body = document.createElement("p");
        body.textContent = note.body;

        listItem.appendChild(title);
        listItem.appendChild(body);

        notesList.appendChild(listItem);
    });
}

async function loadNotes() {
    loadButton.disabled = true;
    setStatus("Loading notes...");

    try {
        const response = await request(`${API_URL}?_limit=10`);
        const notes = await response.json();

        renderNotes(notes);

        if (notes.length === 0) {
            setStatus("No notes returned from the server.");
        } else {
            setStatus(
                `Loaded ${notes.length} notes from the server.`,
                "success"
            );
        }
    } catch (error) {
        console.error(error);
        setStatus(
            "Could not load notes. Please try again.",
            "error"
        );
    } finally {
        loadButton.disabled = false;
    }
}

loadButton.addEventListener("click", loadNotes);
