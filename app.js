const BASE_URL = "https://api.fxratesapi.com/latest?api_key=fxr_live_348ec77ed76f3c9e1ac6cda903688a2fd6f8";
const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("form button");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg");
const amountInput = document.querySelector("#amount");

// Populate dropdowns with currency options
for (let select of dropdowns) {
    for (let currCode in countryList) {
        let newOption = document.createElement("option"); //adding 'option' in 'select'
        newOption.innerText = currCode;
        newOption.value = currCode;

        // Set default selections (USD -> INR)
        if (select.name === "from" && currCode === "USD") {
            newOption.selected = "selected";
        } else if (select.name === "to" && currCode === "INR") {
            newOption.selected = "selected";
        }

        select.append(newOption);
    }

    select.addEventListener("change", (evt) => {
        updateFlag(evt.target);  //updateFlag() the target of whats changed
    });
}


// Update the flag when currency is changed
const updateFlag = (element) => {
    let currCode = element.value;
    let countryCode = countryList[currCode];
    let newSrc = `https://flagsapi.com/${countryCode}/shiny/64.png`;
    let img = element.parentElement.querySelector("img");  //selecting the parent ele to access the img; i.e:select-container
    img.src = newSrc;
};


// Event Listeners
btn.addEventListener("click", (evt) => {
  evt.preventDefault();  //doesnt reload page
  updateExchangeRate();
});



// Function to update the exchange rate
const updateExchangeRate = async () => {
    let amtVal = amountInput.value;

    // Input validation
    if (isNaN(amtVal) || amtVal <= 0) {
        msg.innerText = "Please enter a valid amount.";
        return;
    }

    msg.innerText = ""; // Clear previous messages

    try {
        // Fetch exchange rates
        const response = await fetch(BASE_URL);
        const data = await response.json();
        
        // Check if the response is ok (status in the range 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Check if rates exist in the response
        if (!data.rates) {
            throw new Error("Rates data is not available.");
        }

        // Get the rates from the response
        const rates = data.rates;

        // Calculate conversion
        let fromRate = fromCurr.value === 'USD' ? 1 : rates[fromCurr.value];
        let toRate = rates[toCurr.value];

        // Calculate final amount through USD as base
        let finalAmount = (amtVal / fromRate) * toRate;

        // Display with 2 decimal places
        msg.innerText = `${amtVal} ${fromCurr.value} = ${finalAmount.toFixed(2)} ${toCurr.value}`;
    } catch (error) {
        if (error.message.includes("429")) {
            msg.innerText = "Too many requests. Please try again later.";
        } else {
            msg.innerText = `Error: ${error.message}`;
        }
        console.error(error);
    }
};


// Exchange icon click handler
const exchangeIcon = document.querySelector(".fa-right-left");
exchangeIcon.addEventListener("click", () => {
    // Swap the values
    let tempCode = fromCurr.value;
    fromCurr.value = toCurr.value;
    toCurr.value = tempCode;

    // Update flags
    updateFlag(fromCurr);
    updateFlag(toCurr);

    // Update exchange rate
    updateExchangeRate();
});


// Initial update
window.addEventListener("load", () => {
    updateExchangeRate();
});
