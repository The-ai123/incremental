var resources = new Map();
var jobs = new Map();
var elements = new Map();
var production = new Map();
var productionSecond = new Map();
var tick = 0;
var resourceMultipliers = new Map();
var jobProduction = new Map();
var varNametoDisplayName = new Map();
var jobMultipliers = new Map();
var storyFlags = new Map();
var miscMultipliers = new Map();
var jobConsumption = new Map();
var buildingCost = new Map();
var buildings = new Map();

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
        //camp
        ["woodGathererLabel", document.getElementById("woodGathererLabel")],
        ["houseArea", document.getElementById("houseArea")],
        ["houseLabel", document.getElementById("houseLabel")],
        //city
        ["cityScavengeLabel", document.getElementById("cityScavengeLabel")],
        ["cityScavengeArea", document.getElementById("cityScavengeArea")],
        ["cityRecruitLabel", document.getElementById("cityRecruitLabel")],
        ["cityRecruitArea", document.getElementById("cityRecruitArea")],
        //resource display
        ["foodDisplay", document.getElementById("foodDisplay")],
        ["rabbitsDisplay", document.getElementById("rabbitsDisplay")],
        ["housingDisplay", document.getElementById("housingDisplay")],
        ["housingDisplayBox", document.getElementById("housingDisplayBox")],
        ["woodDisplay", document.getElementById("woodDisplay")],

    ]);

    resources.set("food", 50);
    resources.set("rabbits", 1);
    resources.set("housing", 10);
    resources.set("wood", 0);
   
    jobs.set("unemployed", 1);
    jobs.set("rabbits", 1);
    jobs.set("cityScavenge", 0);
    jobs.set("cityRecruit", 0);
    jobs.set("woodGatherer", 0);


    jobProduction.set("cityScavenge", new Map([["food", .05]]));
    jobProduction.set("rabbits", new Map([["food", -.01]]));
    jobProduction.set("cityRecruit", new Map([["rabbits", .1]]));
    jobProduction.set("woodGatherer", new Map([["wood", .03]]));

    jobMultipliers.set("cityScavenge", new Map());


    production.set("food", new Map());
    production.set("rabbits", new Map());

    //resource real names
    varNametoDisplayName.set("food", "Food");

    //job real names
    varNametoDisplayName.set("cityScavenge", "Scavenge");
    varNametoDisplayName.set("cityRecruit", "Recruit");
    varNametoDisplayName.set("wood", "Wood");
    varNametoDisplayName.set("woodGatherer", "Gather Wood");
    varNametoDisplayName.set("house", "Build House");

    //defining multipliers
    miscMultipliers.set("housing", 1);

    buildingCost.set("house",new Map([["wood",5]]));

    storyFlags.set("recruit", false);
    storyFlags.set("recruit2", false);
    storyFlags.set("breed", false);
    storyFlags.set("housing", false);
}



function gameTick() {

    
    

    //current order is variableMultipliers>jobs>jobproduction>jobmultipliers>resources>multipliers
    if (resources.get("rabbits") > resources.get("housing") && storyFlags.get("housing")) {
        const multi = miscMultipliers.get("housing") * Math.pow(.9, resources.get("rabbits") - resources.get("housing"));
        setResourceMultiplier("rabbits", "housing", multi);
    } else {
        setResourceMultiplier("rabbits", "housing", 1);
    }

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
        if (resourceMultipliers.has(key)) {
            let multi = 1;
            for (let [source, multiplier] of resourceMultipliers.get(key)) {
                multi = multi * multiplier;
            }
            sum = sum * multi;
        }
        
        productionSecond.set(key, sum*10);
        changeResource(key, sum);
    }
    if (tick % 3 == 0) {
        displayResources();
    }
    if (tick % 50 == 0) {
        displayProduction();   
    }
    //update rabbits and unemployment
    if (resources.get("food") < 0) {
        resources.set("food", 0);
        changeResource("rabbits",-resources.get("rabbits")*.5)
    }
    if (resources.get("rabbits") < 1) {
        resources.set("rabbits", 1);
    }
    jobs.set("rabbits", round(resources.get("rabbits"), 0))
    let sum = 0;
    for (let [job, value] of jobs) {
        if (job != "rabbits" && job != "unemployed") {
            sum += value;
            if (sum > jobs.get("rabbits")) {
                const diff = sum - jobs.get("rabbits");
                sum -= diff;
                value -= diff;
            }
        }
    }
    jobs.set("unemployed", jobs.get("rabbits") - sum);
    
    storyChecks();
    tick++;
}

//story progress
function storyChecks() {
    if (storyFlags.get("recruit") == false && resources.get("food") > 50) {
        storyFlags.set("recruit", true);
        addLog("Maybe more rabbits will join if there is more food...")
        changeResource("rabbits", 1);
    }
    if (storyFlags.get("recruit2") == false && resources.get("food") > 55) {
        storyFlags.set("recruit2", true);
        addLog("If there are enough rabbits, they might start breeding")
        changeResource("rabbits", 1);
    }
    if (storyFlags.get("breed") == false && resources.get("food") > 60) {
        storyFlags.set("breed", true);
        addLog("The rabbits have started breeding, they breed faster if they are not assigned to a task");
        changeResource("rabbits", 1);
        setJobProduction("rabbits", "rabbits", .01);
        setJobProduction("unemployed", "rabbits", .05);
    }
    if (storyFlags.get("housing") == false && resources.get("rabbits") >= resources.get("housing")) {
        storyFlags.set("housing", true);
        elements.get("housingDisplayBox").style.display = "";
        elements.get("houseArea").style.display = "inline-block";
        addLog("Rabbits need a place to live, without enough housing, population growth recieves a soft cap");
    }
}


//update resource display
function displayResources() {
    elements.get("foodDisplay").textContent = round(resources.get("food"), 2);
    elements.get("rabbitsDisplay").textContent = round(jobs.get("unemployed"), 0) + "/" + round(resources.get("rabbits"), 0);
    elements.get("housingDisplay").textContent = round(jobs.get("rabbits"), 0) + "/" + round(resources.get("housing"), 0);
    elements.get("woodDisplay").textContent = round(resources.get("wood"), 2);


}

//round to a certain decimal place
function round(value, decimal) {
    return Math.floor(value * Math.pow(10, decimal)) / Math.pow(10, decimal);
}

//update production tooltips
function displayProduction() {
    elements.get("foodDisplay").title = productionString("food", 3);
    elements.get("rabbitsDisplay").title = productionString("rabbits", 3);
    elements.get("woodDisplay").title = productionString("wood", 3);
    elements.get("cityScavengeArea").title = jobProductionString("cityScavenge");
}

//generate string for job production tooltip
function jobProductionString(jobName) {
    let string = ""
    for (let [resource, value] of jobProduction.get(jobName)) {
        string += (value*10) + " " + varNametoDisplayName.get(resource) + "/sec\n";
    }
    return string;
}

//generate string for the production tooltip
function productionString(resource, decimals) {
    let value = productionSecond.get(resource);
    let prefix = "";
    if (value >= 0) {
        prefix = "+"
    } else{
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
    if (!production.has(resource)) {
        production.set(resource, new Map([[source, amount]]));
        console.log("New resource ' " + resource + " ' added to production")
    } else {
        if (increment) {
            production.set(resource, production.get(resource).set(source, production.get(resource) + amount));
        } else {
            production.set(resource, production.get(resource).set(source, amount));
        }
    }
}

function setJobProduction(job, resource, amount, increment) {
    if (!jobProduction.has(job)) {
        jobProduction.set(job, new Map([[resource, amount]]));
        console.log("New job ' " + job + " ' added to jobProduction")
    } else {
        if (increment) {
            jobProduction.set(job, jobProduction.get(job).set(resource, jobProduction.get(resource) + amount));
        } else {
            jobProduction.set(job, jobProduction.get(job).set(resource, amount));
        }
    }
}

function setJobMultiplier(job, source, multiplier, increment) {
    if (!jobMultipliers.has(job)) {
        jobMultipliers.set(job, new Map([[source, multiplier]]));
        console.log("New job ' " + job + " ' added to jobMultipliers")
    } else {
        if (increment) {
            jobMultipliers.set(job, jobMultipliers.get(job).set(source, jobMultipliers.get(source) + multiplier));
        } else {
            jobMultipliers.set(job, jobMultipliers.get(job).set(source, multiplier));
        }
    }
}

function setResourceMultiplier(resource, source, multiplier, increment) {
    if (!resourceMultipliers.has(resource)) {
        resourceMultipliers.set(resource, new Map([[source, multiplier]]));
        console.log("New resource ' " + resource + " ' added to resourceMultipliers")
    } else {
        if (increment) {
            resourceMultipliers.set(resource, resourceMultipliers.get(resource).set(source, resourceMultipliers.get(source) + multiplier));
        } else {
            resourceMultipliers.set(resource, resourceMultipliers.get(resource).set(source, multiplier));
        }
    }
}

function build(building, amount) {
    if (!buildings.has(building)){
        buildings.set(building, 0);
        console.log("New building ' " + building + " ' added to buildings")//in case I misspell something
    }
    if (buildings.get(building) >= -amount) {
        let ok = true;
        for (let [resource, key] of buildingCost.get(building)) {
            if (resources.get(resource) < key) {
                ok = false;//potential time save if loop terminates here
            }
        }
        if (ok) {
            buildings.set(building, buildings.get(building) + amount);
            for (let [resource, key] of buildingCost.get(building)) {
                changeResource(resource, key);
            }
            elements.get(building + "Label").textContent = varNametoDisplayName.get(building) + " (" + buildings.get(building) + ")"; 
        }
    }

}