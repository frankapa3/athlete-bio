// Συνάρτηση για την εναλλαγή των ενοτήτων (SPA Logic)
async function showSection(sectionId) {
    // 1. Διαχείριση Πλευρικού Μενού (Aside)
    // Κρύβουμε όλα τα υπομενού του aside
    const allAsideGroups = document.querySelectorAll('.aside-content');
    allAsideGroups.forEach(group => group.classList.add('hidden'));

    // Εμφανίζουμε μόνο το υπομενού που αντιστοιχεί στην επιλογή του Nav
    const targetAside = document.getElementById('sub-' + sectionId);
    if (targetAside) {
        targetAside.classList.remove('hidden');
    }

    // 2. Διαχείριση Κύριου Περιεχομένου (Main)
    const mainArea = document.getElementById('content-area');
    
    // Καθαρίζουμε το περιεχόμενο πριν φορτώσουμε το νέο
    mainArea.innerHTML = '<h2>Φόρτωση...</h2>';

    switch(sectionId) {
        case 'bio':
            renderBio(mainArea);
            break;
        case 'photos':
            renderPhotos(mainArea);
            break;
        case 'awards':
            await fetchAndRenderTable('/api/achievements', 'Διακρίσεις', mainArea);
            break;
        case 'links':
            await fetchAndRenderTable('/api/links', 'Σύνδεσμοι', mainArea);
            break;
        case 'admin':
            renderAdmin(mainArea);
            break;
        default:
            mainArea.innerHTML = '<h2>Καλώς ήρθατε</h2><p>Επιλέξτε μια ενότητα.</p>';
    }
}

// --- Στατικό Περιεχόμενο (Bio & Photos) ---

function renderBio(container) {
    container.innerHTML = `
        <h2>Βιογραφία</h2>
        <p>Ο Μίλτος Τεντόγλου (Γρεβενά, 18 Μαρτίου 1998) είναι Έλληνας πρωταθλητής του άλματος εις μήκος...</p>
        <p>Θεωρείται ένας από τους κορυφαίους αθλητές στην ιστορία του αγωνίσματος.</p>
    `;
}

function renderPhotos(container) {
    // Χρήση Flexbox (ορίζεται στο CSS)
    container.innerHTML = `
        <h2>Φωτογραφίες</h2>
        <div class="photo-container">
            <div class="photo-item"><img src="images/photo1.jpg" alt="Αγώνας 1"><p>Χρυσό στο Παρίσι</p></div>
            <div class="photo-item"><img src="images/photo2.jpg" alt="Αγώνας 2"><p>Προπόνηση</p></div>
            <div class="photo-item"><img src="images/photo3.jpg" alt="Αγώνας 3"><p>Απονομή</p></div>
        </div>
    `;
}

// --- Δυναμικό Περιεχόμενο (Fetch από JSON) ---

async function fetchAndRenderTable(endpoint, title, container) {
    try {
        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.length === 0) {
            container.innerHTML = `<h2>${title}</h2><p>Δεν βρέθηκαν δεδομένα.</p>`;
            return;
        }

        // Δημιουργία Πίνακα
        let html = `<h2>${title}</h2><table class="data-table"><thead><tr>`;
        
        // Δυναμικά headers από τα κλειδιά του JSON
        Object.keys(data[0]).forEach(key => {
            if(key !== 'id') html += `<th>${key.toUpperCase()}</th>`;
        });
        html += `</tr></thead><tbody>`;

        // Δεδομένα πίνακα
        data.forEach(item => {
            html += `<tr>`;
            Object.entries(item).forEach(([key, value]) => {
                if(key !== 'id') html += `<td>${value}</td>`;
            });
            html += `</tr>`;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `<h2>Σφάλμα</h2><p>Αδυναμία φόρτωσης δεδομένων.</p>`;
    }
}

// --- Διαχείριση (Admin & Authentication) ---

function renderAdmin(container) {
    container.innerHTML = `
        <h2>Διαχείριση Εφαρμογής</h2>
        <div id="login-form">
            <input type="text" id="username" placeholder="Όνομα χρήστη (admin)">
            <input type="password" id="password" placeholder="Κωδικός (1234)">
            <button onclick="handleLogin()">Είσοδος</button>
        </div>
        <div id="admin-actions" class="hidden">
            <p>Είστε συνδεδεμένος ως Διαχειριστής.</p>
            <button onclick="handleLogout()">Αποσύνδεση</button>
            <hr>
            <h3>Προσθήκη Νέας Διάκρισης</h3>
            <input type="text" id="new-award" placeholder="Περιγραφή">
            <button onclick="addAward()">Προσθήκη</button>
        </div>
    `;
}

async function handleLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
    });

    if (response.ok) {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('admin-actions').classList.remove('hidden');
        alert('Επιτυχής σύνδεση!');
    } else {
        alert('Λάθος στοιχεία πρόσβασης.');
    }
}

async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    showSection('admin');
    alert('Αποσυνδεθήκατε.');
}

// Συνάρτηση για προσθήκη νέας Διάκρισης
async function addAward() {
    const description = document.getElementById('new-award').value;
    if (!description) return alert("Δώσε μια περιγραφή!");

    const newAward = {
        year: new Date().getFullYear().toString(),
        event: description,
        medal: "Υπό επεξεργασία"
    };

    try {
        const response = await fetch('/api/achievements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAward)
        });

        if (response.ok) {
            alert("Η διάκριση προστέθηκε επιτυχώς!");
            document.getElementById('new-award').value = ''; // Καθαρισμός input
        } else {
            alert("Σφάλμα κατά την αποθήκευση. Μήπως δεν είστε συνδεδεμένος;");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}