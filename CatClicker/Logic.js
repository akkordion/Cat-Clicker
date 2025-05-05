"using strict"

class Logic{
    // instance variables
    //#name;  // id of counter in html file
    #count; // current count
    #total; // total count
    #power; // exponential-power for achievemnts    

    #htmlLogic;
    #htmlRate;
    #htmlMessage;
    #htmlAchievement;

    #rate;
    #multiplier;

    #BonusList; // list of all MysteryEventButtons

    // class constants
	static get #INTERVAL() { return 50; }				// setting the interval to 50 milliseconds
	static get #SECOND_IN_MS() { return 1000; }  		// one second in milliseconds
	static get #BONUS_INTERVAL() { return 90; }			// bonus button appearance interval
	static get DEFAULT_MESSAGE_DURATION() { return 5; }	// in seconds
	static get #BASE() { return 10; }					// exponential base for achievenments


    // constructor
    constructor(name, pps, messageBox, achievementBox) {
		this.#count = 0;
		//this.#name = name;

		this.#htmlLogic = document.getElementById(name);
		this.#htmlRate = document.getElementById(pps);
		this.#htmlMessage = document.getElementById(messageBox);
		this.#htmlAchievement = document.getElementById(achievementBox);
		
		this.#rate = 1;
		this.#multiplier = 1;
		this.#initCounter();
		this.#bonusCounter();

		this.#BonusList = [];

		this.#total = 0;
		this.#power = 1;
	}

    // cheat code
    ILOVEYOUBABY(){
        this.#count = 50000;
    }

    // method: get
    get rate(){ return this.#rate; }
	get count(){ return this.#count; }

    // methods
    // method: changeCount --> changes count by increment; if increment >= 0, increases total too
	changeCount(increment){
		this.#count += increment;
		if (increment >= 0){ this.#total += increment; }
	}

	// method: changePPS --> change pps-rate by increment
	changeRate(increment){ this.#rate += increment; }

	// method: changeMultiplier --> changes multiplier TO newMutli (not /by/)
	changeMultiplier(newMulti){ this.#multiplier = newMulti; }

    #updateCounter() {
		// pps in terms of ms... potatos per millisecond!
		this.#count += (this.#rate * this.#multiplier) * (Logic.#INTERVAL/Logic.#SECOND_IN_MS);
		this.#total += (this.#rate * this.#multiplier) * (Logic.#INTERVAL/Logic.#SECOND_IN_MS);
		
		// given code...
		this.#htmlLogic.innerText = `${Math.round(this.#count)} POINTS`; // Display the counter
		this.#htmlRate.innerText = `per second: ${(this.#rate * this.#multiplier)}`;

		// whenever we have a power of 10 potatos in our count, we print an achievement message!
		let roundedTotal = Math.round(this.#total);
		let powerOfTen = (Logic.#BASE)**(this.#power);
		let output;

		if (roundedTotal == powerOfTen){
			output = `Congratulations! You've earned a total of ${powerOfTen} points!`;
			this.showMessage(output, Logic.DEFAULT_MESSAGE_DURATION, true);
			this.#power++;
		}	
	}

    #initCounter(){ setInterval(this.#updateCounter.bind(this), Logic.#INTERVAL); }

    // method: changeCount --> changes count by increment; if increment >= 0, increases total too
	changeCount(increment){
		this.#count += increment;
		if (increment >= 0){ this.#total += increment; }
	}

    /* method: showMessage --> shows a regular or achievement message, time in seconds */
	showMessage(theMessage, time=Logic.DEFAULT_MESSAGE_DURATION, achievement = false) {
		let theElement = this.#htmlMessage;
		if (achievement)
			theElement = this.#htmlAchievement;
		theElement.innerHTML = theMessage;
		theElement.classList.remove("hidden");
		//The following statement will make theElement invisible again after [time] seconds
		setTimeout(() => {theElement.classList.add("hidden");}, time*Logic.#SECOND_IN_MS);
	}

    // method: bonusCounter --> start counter + call bonusEvent every Counter.#BONUS_INTERVAL secs
	#bonusCounter(){ setInterval(this.#bonusEvent.bind(this), 3*Logic.#SECOND_IN_MS); }
	
	// method: bonusEvent --> the event where a random bonus button from the list appears
	#bonusEvent(){
		let index = Math.floor( (Math.random() * (this.#BonusList.length)));
		let bb = this.#BonusList[index];
		bb.showBonus();
	}

    // method: addBonusButton --> adds button to list of bonus buttons
	addBonusButton(bb){ this.#BonusList.push(bb); }
}