let selectedFiles = [];


// CLOCK

function updateClock() {

    let now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();

    let ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;

    if (hours === 0) {
        hours = 12;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    document.getElementById("clock").innerText =
        hours + ":" + minutes + " " + ampm;
}

updateClock();

setInterval(updateClock, 1000);


// SECTIONS

function openSection(section) {

    document.getElementById("sectionTitle").innerText = section;

    if (section === "Settings") {

        document.getElementById("settingsPanel").style.display = "block";

    } else {

        document.getElementById("settingsPanel").style.display = "none";

    }
}


// FILES

function filesAdded() {

    let input = document.getElementById("fileInput");

    for (let i = 0; i < input.files.length; i++) {

        selectedFiles.push(input.files[i]);

    }

    displayFiles();

    input.value = "";
}


function displayFiles() {

    let list = document.getElementById("fileList");

    list.innerHTML = "";

    if (selectedFiles.length === 0) {

        list.innerHTML =
            '<div class="empty">No files added yet.</div>';

        return;
    }


    selectedFiles.forEach(function(file, index) {

        let fileDiv = document.createElement("div");

        fileDiv.className = "file";

        fileDiv.innerHTML =
            "<span>📄 " + file.name + "</span>" +
            '<button class="remove" onclick="removeFile(' +
            index +
            ')">Remove</button>';

        list.appendChild(fileDiv);

    });
}


function removeFile(index) {

    selectedFiles.splice(index, 1);

    displayFiles();
}


// SEARCH

function searchFiles() {

    let searchText =
        document.getElementById("search").value.toLowerCase();

    let files =
        document.querySelectorAll(".file");

    files.forEach(function(file) {

        let name = file.innerText.toLowerCase();

        if (name.includes(searchText)) {

            file.style.display = "flex";

        } else {

            file.style.display = "none";

        }

    });
}


// SETTINGS

function changeTheme() {

    document.body.classList.toggle("light");

}


function clearFiles() {

    selectedFiles = [];

    displayFiles();

}