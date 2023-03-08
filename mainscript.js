var resources = new Map();



function generateMain() {
    newGame();
}

function newGame() {
    initNewGameVar();
    displayResources(resources);
    showStory();
    addLog("A puppy leaves the noisy and polluted city and sets up a camp away from the city for puppies to go. First they must scavange for food.")
}

function initNewGameVar() {
    resources.set("dogFood", 0);
}

function displayResources() {
    document.getElementById("dogFoodDisplay").textContent = resources.get("dogFood");
}

function gameTick() {

}

function showCamp() {
    hideWindows();
    document.getElementById("campWindow").hidden = false;
}

function showSettings() {
    hideWindows();
    document.getElementById("settingsWindow").hidden = false;
}

function showStory() {
    hideWindows();
    document.getElementById("storyWindow").hidden = false;
}

function hideWindows() {
    document.getElementById("campWindow").hidden = true;
    document.getElementById("settingsWindow").hidden = true;
    document.getElementById("storyWindow").hidden = true;
}

function resetGame() {
    if (confirm("Are you sure you want to COMPLETELY reset all progress?")) {
        newGame();
    }
}

function addLog(text) {
    const storyBox = document.getElementById("storyBox");
    storyBox.textContent = storyBox.textContent + "> " + text +  " \n";
}