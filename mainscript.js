var resources = new Map();
var jobs = new Map();
var elements = new Map();
var production = new Map();
var productionSecond = new Map();
var tick = 0;
var ResourceMultipliers = new Map();
var jobProduction = new Map();
var varNametoDisplayName = new Map();
var jobMultipliers = new Map();
var storyFlags = new Map();

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
    addLog("A rabbit leaves the noisy and polluted city and sets up a camp away from the city. First they must scavenge for food.")
}

//reset variables
function initNewGameVar() {
    elements = new Map([
        //navigator
        ["campWindow", document.getElementById("campWindow")],
        ["storyWindow", document.getElementById("storyWindow")],
        ["settingsWindow", document.getElementById("settingsWindow")],
        ["cityWindow", document.getElementById("cityWindow")],
        ["storyNav", document.getElementById("storyNav")],
        //story
        ["storyBox", document.getElementById("storyBox")],
        //city
        ["cityScavengeLabel", document.getElementById("cityScavengeLabel")],
        ["cityScavengeArea", document.getElementById("cityScavengeArea")],
        ["cityRecruitLabel", document.getElementById("cityRecruitLabel")],
        ["cityRecruitArea", document.getElementById("cityRecruitArea")],
        //resource display
        ["foodDisplay", document.getElementById("foodDisplay")],
        ["rabbitsDisplay", document.getElementById("rabbitsDisplay")],
    ]);

    resources.set("food", 50);
    resources.set("rabbits", 1);
   
    jobs.set("unemployed", 1);
    jobs.set("rabbits", 1);
    jobs.set("cityScavenge", 0);
    jobs.set("cityRecruit", 0);

    jobProduction.set("cityScavenge", new Map([["food", .05]]));
    jobProduction.set("rabbits", new Map([["food", -.01]]));
    jobProduction.set("cityRecruit", new Map([["rabbits", .1]]));

    jobMultipliers.set("cityScavenge", new Map());


    production.set("food", new Map());
    production.set("rabbits", new Map());

    //resource real names
    varNametoDisplayName.set("food", "Food");

    //job real names
    varNametoDisplayName.set("cityScavenge", "Scavenge");
    varNametoDisplayName.set("cityRecruit", "Recruit");

    storyFlags.set("recruit", false);
}



function gameTick() {

    //current order is jobs>jobproduction>jobmultipliers>resources>multipliers
    //job production
    //for every job, multiply it's production by amount of workers
    for (let [job, valuemap] of jobProduction) {
        //create job multiplier
        let multi = 1;
        if (jobMultipliers.has(job)) {
            for (let [source, multiplier] of jobMultipliers.get(job)) {
                multi = multi * multiplier;
            }
        }     
        //add to production
        for (let [resource, value] of valuemap) {
            setProduction(resource, job, jobs.get(job) * value * multi);
        }
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
    //update rabbits and unemployment
    jobs.set("rabbits", round(resources.get("rabbits"), 0))
    let sum = 0;
    for (let [job, value] of jobs) {
        if (job != "rabbits" && job != "unemployed") {
            sum += value;
        }
    }
    jobs.set("unemployed", jobs.get("rabbits") - sum);

    storyChecks();
    tick++;
}

function storyChecks() {
    if (storyFlags.get("recruit") == false && resources.get("food") > 50) {
        storyFlags.set("recruit", true);
        elements.get("cityRecruitArea").style.display = "inline-block";
        addLog("Maybe more rabbits will join if there is more food...")
    }
}


//update resource display
function displayResources() {
    elements.get("foodDisplay").textContent = round(resources.get("food"), 2);
    elements.get("rabbitsDisplay").textContent = round(jobs.get("unemployed"), 0) + "/" + round(resources.get("rabbits"), 0);


}

//round to a certain decimal place
function round(value, decimal) {
    return Math.floor(value * Math.pow(10, decimal)) / Math.pow(10, decimal);
}

//update production tooltips
function displayProduction() {
    elements.get("foodDisplay").title = productionString("food", 3);
    elements.get("cityScavengeArea").title = jobProductionString("cityScavenge");
}

//generate string for job production tooltip
function jobProductionString(jobName) {
    let string = ""
    for (let [resource, value] of jobProduction.get(jobName)) {
        string += value + " " + varNametoDisplayName.get(resource) + "/sec\n";
    }
    return string;
}

//generate string for the production tooltip
function productionString(resource, decimals) {
    let value = productionSecond.get(resource);
    let prefix = "";
    if (value > 0) {
        prefix = "+"
    } else {
        prefix = "-"
        value = -value;
    }
    if (round(value, decimals) == 0 && value != 0) {
        return prefix + round(value, decimals) + ".../s";
    } else {
        return prefix + round(value, decimals) + "/s";
    }
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
    elements.get("storyNav").value = "Story";
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
    elements.get("storyBox").textContent = elements.get("storyBox").textContent + "> " + text + " \n";
    if (elements.get("storyWindow").hidden == true) {
        elements.get("storyNav").value = "Story(!)";
    }
}

//change the amount of people scavenging
function changeCityScavenge(amount) {
    if (jobs.get("cityScavenge") >= -1*amount && jobs.get("unemployed") >= amount){
        changeJobs("cityScavenge", amount);
        changeJobs("unemployed", -amount );
        elements.get("cityScavengeLabel").textContent = "Scavenge (" + jobs.get("cityScavenge") + ")";
    }   
}

function incrementJobs(job, amount) {
    if (jobs.get(job) >= -1 * amount && jobs.get("unemployed") >= amount) {
        changeJobs(job, amount);
        changeJobs("unemployed", -amount);
        elements.get(job + "Label").textContent = varNametoDisplayName.get(job) + " (" + jobs.get(job) + ")";
    }
}

function setProduction(resource, source, amount, increment) {
    if (increment) {
        production.set(resource, production.get(resource).set(source, production.get(resource) + amount));
    } else {
        production.set(resource, production.get(resource).set(source, amount));
    }
}