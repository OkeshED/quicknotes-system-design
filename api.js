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

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            deleteNote(note.id, deleteButton);
        });

        listItem.appendChild(title);
        listItem.appendChild(body);
        listItem.appendChild(deleteButton);

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
        setStatus(
            "Title must be 100 characters or fewer.",
            "error"
        );
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

async function deleteNote(noteId, deleteButton) {
    deleteButton.disabled = true;
    setStatus("Deleting note...");

    try {
    const response = await request(`${API_URL}/${noteId}`, {
    method: "DELETE"
});

        /*
         * JSONPlaceholder simulates DELETE requests but does not
         * permanently store changes. We therefore remove the note
         * from our local array after a successful response so the
         * current page reflects the user's action.
         */

        notes = notes.filter(function (note) {
            return note.id !== noteId;
        });

        renderNotes(notes);

        if (notes.length === 0) {
            setStatus("Note deleted. No notes available.", "success");
        } else {
            setStatus(
                `Note deleted (status ${response.status}, id ${noteId}).`,
                "success"
            );
        }
    } catch (error) {
        console.error(error);
        setStatus(
            "Could not delete the note. Please try again.",
            "error"
        );

        deleteButton.disabled = false;
    }
}

loadButton.addEventListener("click", loadNotes);

noteForm.addEventListener("submit", createNote);
