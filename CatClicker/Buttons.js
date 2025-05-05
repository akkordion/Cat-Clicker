"using strict"

// abstract class Button
class Button {
    // instance variables
    #name;
    #logic;
    #htmlButton;

	// class constants
	//static get TEXT_ATTRIBUTE() { return "-text"; }

    // constructor
    constructor(name, logic){
        // want to mimic behaviour of an abstract class
        if (this.constructor.name == "Button"){
            throw new Error("Cannot build an instance of " + this.constructor.name);
        }

        // instantiate variables
        this.#name = name;
        this.#logic = logic;
        this.#htmlButton = document.getElementById(name);

        // add a "click"-event listener to button
        this.#htmlButton.addEventListener('click', this.clicked.bind(this));
    }
    
    // method: get
    get name(){ return this.#name; }
	get logic() { return this.#logic; }
	get htmlButton() { return this.#htmlButton; }


    // // method: updateText
    // updateText(newText){ 
	// 	document.getElementById(this.name + Button.TEXT_ATTRIBUTE).innerHTML = newText; 
	// }
	
    // abstract method: clicked
    clicked(){
        throw new Error("method-clciked() needs to be implemented in " + this.constructor.name);
    }
} // end Button


class CatButton extends Button {
    // instance variables

    // constants
    static get CLICK_MESSAGE_DURATION() { return 0.2; }
	static get CLICK_INCR() { return 1; }

    // constructor
    constructor(name, logic){
		super(name, logic);
	}

    // method: clickAction --> when button clicked, get +1 potato and show a message
	clicked(){
		// super.logic.showMessage("+1", CatButton.CLICK_MESSAGE_DURATION, false);
		super.logic.changeCount(CatButton.CLICK_INCR);
	}
} // end CatButton

// abstract class: PurchaseButton --> represents any button that is clicked to purchase something
class PurchaseButton extends Button {
	#num;	// number of purchases
	#cost	// current cost
	
	// constructor
	constructor(name, logic, price){
		super(name, logic);
		this.#cost = price;
		this.#num = 0;
	}

	// methods: get
	get NUM_PURCHASES() { return this.#num; }

	/* method: purchase(costRateIncr)
		--> if there exist enough funds, purchases something ("something" being dependant on subclass)
		--> Q: what happens during every purchase? 
		    A: funds are reduced by cost, cost of next purchases incr by costRate, num of purchases increases */
	purchase(costRate){
		let currP = super.logic.count;	// current potato count
		let success = false;				// has this been a successful purchase?
		let output; 

		// we can only continue with the purchase if we have enough funds to cover the cost
		if (currP >= this.#cost){
			// 1. purchase-cost is removed from our potato funds
			super.logic.changeCount(this.#cost * -1);

			// 2. purchase-cost for future purchases increases by rate of costRateIncr
			this.#cost = Math.round(this.#cost * costRate);

			// 3. increase number of purchases
			this.#num++;

			// 4. output text is updated
			output = this.toString();
            let n = document.getElementById(super.name+'Text');
            n.innerHTML = output; 

            // purchase complete!
            success = true;
		}
		return success;
	}

	// method: toString --> updates output-text to match current state
	toString(){
		let output = `BOUGHT: ${this.#num}<br/>COST: ${this.#cost}`;
		return output;
	}
} // end PurchaseButton

// feeding different foods increases auto-pets by x
// food: feed jim --> prices increase rapidly (it's the inflation + tariffs...)
// toys: spend quality time playing --> increases more
class ItemButton extends PurchaseButton {
    // instance variables
    #incr;
    #upgradePow;

    // constants
	static get COST_FACTOR_INCR() { return 1.5; }

    // constructor --> when creating object, name MUST match element-id
	constructor(name, logic, initial, incr){
		super(name, logic, initial);
        this.#incr = incr;
        this.#upgradePow = 1;
	}

    // method: get
    get item_pow() { return super.NUM_PURCHASES * this.#incr; }

    // method: set
    setUpgradePower(value){ this.#upgradePow = value; }

    // methods
    clicked(){
        let purchased = super.purchase(ItemButton.COST_FACTOR_INCR);
        let rate;

        // change per second rate
        if (purchased) {
            rate = (this.#incr) * this.#upgradePow;
            super.logic.changeRate(rate);
            //super.logic.showMessage("HELLO", 5, false);
        }
    }
} // end ItemButton

// purchasing upgrades enhances the effects of food
// hired help: bakery employess improve food quality
// marketable plush: increases fame and potency of treats
class UpgradeButton extends PurchaseButton {
    // instance variables
	#multi	// upgrade multiplier value
	#item;// building button instance associated with instnace of UpgradeButton

	// constants
	static get COST_FACTOR_INCR() { return 5; }

	// consrtuctor
	constructor(name, logic, initialp, improve, i){
		super(name, logic, initialp);
		this.#multi = improve;
		this.#item = i;
	}
	/* method: clickAction()
		--> when an upgrade is clicked, we purchase it (if we have enough funds)
		--> for n upgrades, the associated building's power increases by n*multi */
	clicked(){
		let upgradePower = super.NUM_PURCHASES * this.#multi;	// calculate total power of upgrades
		if (upgradePower == 0){ upgradePower++; } 				// default multiplier is x1 (i.e. no effect)

		let rate = this.#item.item_pow * upgradePower;				// calculate PPS-rate of associated building
		let purchased = super.purchase(UpgradeButton.COST_FACTOR_INCR);	// attempt to purchase upgrade

		// if we buy the upgrade before its building, upgrades are applied once building is bought 
		if (purchased){
			// 1. change pps rate of associated building
			super.logic.changeRate(rate*-1);				// remove previous calls rate chage
			upgradePower = super.NUM_PURCHASES * this.#multi; // calculate new upgrade power
			this.#item.setUpgradePower(upgradePower);		// set new upgrade power
			rate = this.#item.item_pow * upgradePower; 	// calculate new rate
			super.logic.changeRate(rate);					// apply new rate
		}
	}
} // end UpgradeButton

// literally a mystery event --> can improve or damage 
class BonusButton extends Button {
	// instance variables
	#multiplier // pps increases by curr x multiplier
	#duration	// duration of bonus multiplier, in seconds

	// constants
	static get #SECONDS_IN_MS(){ return 1000; }
	static get #TIME_ON_SCREEN() { return 10; }		// how long does bonus remain on screen?
	static get #CLICK_MESSAGE_TIME() { return 5; }	// how long does its description last?

	// construcor
	constructor(name, logic, multiplier, duration){
		super(name, logic);
		this.#multiplier = multiplier;
		this.#duration = duration;
	}
    
	// method: showBonus --> reveals bonus button, hides after alotted time is over
	showBonus(){
		let button = super.htmlButton;
		button.classList.remove("hidden");
		setTimeout(() => {button.classList.add("hidden");}, BonusButton.#TIME_ON_SCREEN*BonusButton.#SECONDS_IN_MS);
	}

	/* method: clickAction()
		--> if bonus button is clicked, apply multiplier to PPS-rate for limited time */
	clicked(){
		// hide bonus button
		let button = super.htmlButton;
		button.classList.add("hidden");

		// show message of bonus description 
		let message = super.name + `! POINTS multiplier x${this.#multiplier} for ${this.#duration} seconds.`
		super.logic.showMessage(message, BonusButton.#CLICK_MESSAGE_TIME, true);
		this.changeImage();

		// apply multiplier
		super.logic.changeMultiplier(this.#multiplier);
		setTimeout(() => {super.logic.changeMultiplier(1);}, this.#duration*BonusButton.#SECONDS_IN_MS);
	}

    changeImage(){
        var other = document.getElementById(super.name);
        var image = document.getElementById('Cat');
        let myname = "images/";

        if (image.src.match("images/default-render.jpg")) {
            myname+=super.name;
            myname+=".png";
            image.src = myname;
        }
        else {
            image.src = "images/default-render.jpg";
        }
    }
} // end BonusButton

