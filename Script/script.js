let db;
const exTitle = document.getElementById("title");
const exAmount = document.getElementById("amount");
const exDate = document.getElementById("date");
const exCategory = document.getElementById("category");
const exNotes = document.getElementById("notes");

window.addEventListener("DOMContentLoaded", () => {
    let reques = indexedDB.open("expenses", 1);
    reques.onupgradeneeded = function (event) {
        let db = event.target.result;
        let userStore = db.createObjectStore("expense", {
            keyPath: 'id',
            autoIncrement: true
        });
        userStore.createIndex('date', 'date', { unique: false });
        userStore.createIndex('category', 'category', { unique: false });
    }
    reques.onsuccess = (e) => {
        db = e.target.result;
        console.log("Database successfully opened", db);
        getAllExpands();
    }
    reques.onerror = (e) => {
        console.log("Some error happend", e.target.error);
    }
});
document.querySelector("#expense-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!db) {
        console.error("⛔ Database not ready yet");
        return;
    }
    //Create a transaction
    let transaction = db.transaction("expense", "readwrite");
    let store = transaction.objectStore("expense");
    // Add some data
    const expense = {
        "title": exTitle.value,
        "amount": parseFloat(exAmount.value),
        "date": exDate.value,
        "category": exCategory.value,
        "note": exNotes.value
    };

    let addRequest = store.add(expense);

    addRequest.onsuccess = () => {
        alert("✅ Expense added");
        exTitle.value = "";
        exAmount.value = "";
        exCategory.value = "Food";
        exDate.value = "";
        exNotes.value = "";
        getAllExpands();
    }
    addRequest.onerror = (e) => {
        console.error("❌ Error saving expense", e);
    }
});

function getAllExpands() {
    if (!db) {
        console.log("⛔ Database not ready yet");
        return;
    }
    let tx = db.transaction("expense", "readonly");
    let store = tx.objectStore("expense");
    let cursorRequest = store.openCursor();

    let expenses_list = document.querySelector("#expenses-list");
    expenses_list.innerHTML = "";
        
    cursorRequest.onsuccess = (e) => {
        let cursor = e.target.result;

        if (cursor) {
            expenses_list.innerHTML += `<tr>               
                <td><button class='remove' data-id=${cursor.value.id}>Remove</button></td>
                <td>${cursor.value.note}</td>
                <td>${cursor.value.category}</td>
                <td>${cursor.value.date}</td>
                <td>${cursor.value.amount}</td>
                <td>${cursor.value.title}</td>
            </tr>`;
            cursor.continue();
        }
    };
}

// Event Delegate => Use parent element for access to the childs
document.getElementById("expenses-list").addEventListener("click", (e) => {
    if (e.target.classList.contains("remove")) {
        if (!db) return;
        const id = Number(e.target.dataset.id);
        let tx = db.transaction("expense", "readwrite");
        let store = tx.objectStore("expense");
        const deleteRequest = store.delete(id);
        deleteRequest.onsuccess = () => {
            console.log(`✅ Record with ID ${id} deleted`);
            db = indexedDB.open("expenses", 1);
        }
        deleteRequest.onerror = () => {
            console.log("❌ Failed to delete record");
        }
        deleteRequest.oncomplete = () => {
            getAllExpands();
        }
    }
});
