function updateClock() {
    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    document.getElementById("clock").textContent =
        hours + ":" + minutes;
}


function openScreen(name) {

    document.getElementById("home").classList.add("hidden");

    document.getElementById("screen").classList.remove("hidden");

    document.getElementById("screenTitle").textContent = name;

    document.getElementById("screenContent").innerHTML = `
        <h3>${name}</h3>
        <p>
            This section is part of the E-NJOY interface prototype.
        </p>
        <p>
            The actual hardware and full functionality will be developed later.
        </p>
    `;
}


function goHome() {

    document.getElementById("screen").classList.add("hidden");

    document.getElementById("home").classList.remove("hidden");
}


updateClock();

setInterval(updateClock, 1000);