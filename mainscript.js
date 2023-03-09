var resources = new Map();
var jobs = new Map();
var elements = new Map();
var production = new Map();

function generateMain() {
    newGame();
}

function newGame() {
    initNewGameVar();
    displayResources(resources);
    showStory();
    addLog("A puppy leaves the noisy and polluted city and sets up a camp away from the city for puppies to go. First they must scavenge for food.")
}

function initNewGameVar() {
    elements = new Map([
        ["campWindow", document.getElementById("campWindow")],
        ["storyWindow", document.getElementById("storyWindow")],
        ["settingsWindow", document.getElementById("settingsWindow")],
        ["cityWindow", document.getElementById("cityWindow")],
        ["storyBox", document.getElementById("storyBox")],
    ]);
    resources.set("dogFood", 0);
    resources.set("puppies", 1);
    jobs.set("cityScavenge", 0);
    jobs.set("unemployed", 1);
}

function displayResources() {
    document.getElementById("dogFoodDisplay").textContent = resources.get("dogFood");
    document.getElementById("puppiesDisplay").textContent = jobs.get("unemployed") + "/" + resources.get("puppies");
}

function gameTick() {

}


function showCamp() {

    hideWindows();
    elements.get("campWindow").hidden = false;
}

function showSettings() {
    hideWindows();
    elements.get("settingsWindow").hidden = false;
}

function showStory() {
    hideWindows();
    elements.get("storyWindow").hidden = false;
}

function showCity() {
    hideWindows();
    elements.get("cityWindow").hidden = false;
}

function hideWindows() {
    elements.get("campWindow").hidden = true;
    elements.get("settingsWindow").hidden = true;
    elements.get("storyWindow").hidden = true;
    elements.get("cityWindow").hidden = true;
}

function resetGame() {
    if (confirm("Are you sure you want to COMPLETELY reset all progress?")) {
        newGame();
    }
}

function changeResource(name, amount) {
    resources.set(name, resources.get(name) + amount);
    if (resources.get(name) < 0) {
        console.log("Warning: Resource '" + name + "' is negative");
    }
}

function changeJobs(name, amount) {
    jobs.set(name, jobs.get(name) + amount);
    if (jobs.get(name) < 0) {
        console.log("Warning: Job '" + name + "' is negative");
    }
}

function addLog(text) {
    elements("storyBox").textContent = elements("storyBox").textContent + "> " + text +  " \n";
}

function changeCityScavenge(amount) {
    if (jobs.get("cityScavenge") >= -1*amount && jobs.get("unemployed") >= amount){
        changeJobs("cityScavenge", amount);
        changeJobs("unemployed", -amount );
        document.getElementById("cityScavengeLabel").textContent = "Scavenge (" + jobs.get("cityScavenge") + ")";
    }
    
}