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
        // create an Object Store
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
        exCategory.value = "";
        exDate.value = "";
        exNotes.value = "";
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

    let expenses_list = document.getElementById("expenses-list");

    cursorRequest.onsuccess = (e) => {
        let cursor = e.target.result;
        if (cursor) {
            console.log(cursor);
            
            expenses_list.innerHTML += `<tr>
                <td>${cursor.value.title}</td>
                <td>${cursor.value.amount}</td>
                <td>${cursor.value.date}</td>
                <td>${cursor.value.category}</td>
                <td>${cursor.value.note}</td>
                <td><button>Remove</button></td>
            </tr>`;
            cursor.continue();
        }
    };
}