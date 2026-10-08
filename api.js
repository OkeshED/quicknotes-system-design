const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const status = document.getElementById("status");
const notesList = document.getElementById("notes-list");

const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitButton = document.getElementById("submit-btn");

let notes = [];

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

function renderNotes(list) {
    notesList.innerHTML = "";

    if (list.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.textContent = "No notes available.";
        notesList.appendChild(emptyMessage);
        return;
    }

    list.forEach(function (note) {
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
        notes = await response.json();

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

async function createNote(event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title) {
        setStatus("Title is required.", "error");
        titleInput.focus();
        return;
    }

    if (title.length > 100) {
        setStatus("Title must be 100 characters or fewer.", "error");
        titleInput.focus();
        return;
    }

    submitButton.disabled = true;
    setStatus("Creating note...");

    try {
        const response = await request(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                body: body,
                userId: 1
            })
        });

        const newNote = await response.json();

        notes.unshift(newNote);
        renderNotes(notes);

        setStatus(
            `Note created (status ${response.status}, id ${newNote.id}).`,
            "success"
        );

        noteForm.reset();
    } catch (error) {
        console.error(error);
        setStatus(
            "Could not create the note. Please try again.",
            "error"
        );
    } finally {
        submitButton.disabled = false;
    }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);
