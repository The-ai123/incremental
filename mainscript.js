var resources = new Map();
var jobs = new Map();
var elements = new Map();
var production = new Map();
var productionSecond = new Map();
var tick = 0;
var ResourceMultipliers = new Map();
var jobProduction = new Map();

//On load function
function generateMain() {
    newGame();
    const intervalID = setInterval(gameTick, 100);
}

//Starts a new game
function newGame() {
    initNewGameVar();
    displayResources(resources);
    showStory();
    addLog("A puppy leaves the noisy and polluted city and sets up a camp away from the city for puppies to go. First they must scavenge for food.")
}

//reset variables
function initNewGameVar() {
    elements = new Map([
        //navigator
        ["campWindow", document.getElementById("campWindow")],
        ["storyWindow", document.getElementById("storyWindow")],
        ["settingsWindow", document.getElementById("settingsWindow")],
        ["cityWindow", document.getElementById("cityWindow")],
        //story
        ["storyBox", document.getElementById("storyBox")],
        //city
        ["cityScavengeLabel", document.getElementById("cityScavengeLabel")],
        //resource display
        ["dogFoodDisplay", document.getElementById("dogFoodDisplay")],
        ["puppiesDisplay", document.getElementById("puppiesDisplay")],
    ]);

    resources.set("dogFood", 0);
    resources.set("puppies", 1);

    jobs.set("cityScavenge", 0);
    jobs.set("unemployed", 1);

    jobProduction.set("cityScavenge", new Map());
    jobProduction.get("cityScavenge").set("dogFood")

    production.set("dogFood", new Map());
}

//update resource display
function displayResources() {
    elements.get("dogFoodDisplay").textContent = round(resources.get("dogFood"), 2);   
    elements.get("puppiesDisplay").textContent = round(jobs.get("unemployed"), 0) + "/" + round(resources.get("puppies"), 0);


}

function round(value, decimal) {
    return Math.floor(value * Math.pow(10, decimal)) / Math.pow(10, decimal);
}

function displayProduction() {
    elements.get("dogFoodDisplay").title = productionString("dogFood",3);
}

function productionString(resource, decimals) {
    const value = productionSecond.get(resource);
    console.log(value);
    console.log(round(value, decimals))
    if (round(value, decimals) != value) {
        return "+" + round(value, decimals) + ".../s";
    } else {
        return "+" + round(value, decimals) + "/s";
    }
}

function gameTick() {

    //current order is jobs>jobproduction>jobmultipliers>resources>multipliers
    //job production
    for (let [key, value] of jobProduction) {

    }

    //for every resource in production
    for (let [key, value] of production) {
        //for every source of production
        let sum = 0;
        for (let [key2, value2] of value) {
            sum += value2;
        }
        productionSecond.set(key, sum*10);
        changeResource(key, sum);
    }
    if (tick % 3 == 0) {
        displayResources();
    }
    if (tick % 10 == 0) {
        displayProduction();   
    }
    tick++;
}

//show camp tab
function showCamp() {
    hideWindows();
    elements.get("campWindow").hidden = false;
}

//show settings tab
function showSettings() {
    hideWindows();
    elements.get("settingsWindow").hidden = false;
}

//show story tab
function showStory() {
    hideWindows();
    elements.get("storyWindow").hidden = false;
}

//show city tab
function showCity() {
    hideWindows();
    elements.get("cityWindow").hidden = false;
}

//hide all windows
function hideWindows() {
    elements.get("campWindow").hidden = true;
    elements.get("settingsWindow").hidden = true;
    elements.get("storyWindow").hidden = true;
    elements.get("cityWindow").hidden = true;
}

//reset game
function resetGame() {
    if (confirm("Are you sure you want to COMPLETELY reset all progress?")) {
        newGame();
    }
}

//change a specified resource by a certain amount
function changeResource(name, amount) {
    resources.set(name, resources.get(name) + amount);
    //give a warning if a resource goes below 0, this probably shouldn't happen
    if (resources.get(name) < 0) {
        console.log("Warning: Resource '" + name + "' is negative");
    }
}

//change a specified job by a certain amount
function changeJobs(name, amount) {
    jobs.set(name, jobs.get(name) + amount);
    //give a warning if a resource goes below 0, this probably shouldn't happen
    if (jobs.get(name) < 0) {
        console.log("Warning: Job '" + name + "' is negative");
    }
}

//Write text in the story box
function addLog(text) {
    elements.get("storyBox").textContent = elements.get("storyBox").textContent + "> " + text +  " \n";
}

//change the amount of people scavenging
function changeCityScavenge(amount) {
    if (jobs.get("cityScavenge") >= -1*amount && jobs.get("unemployed") >= amount){
        changeJobs("cityScavenge", amount);
        changeJobs("unemployed", -amount );
        elements.get("cityScavengeLabel").textContent = "Scavenge (" + jobs.get("cityScavenge") + ")";
        setProduction("dogFood", "cityScavenge", jobs.get("cityScavenge")*.01);
    }   
}

function setProduction(resource, source, amount, increment) {
    if (increment) {
        production.set(resource, production.get(resource).set(source, production.get(resource) + amount));
    } else {
        production.set(resource, production.get(resource).set(source, amount));
    }
}