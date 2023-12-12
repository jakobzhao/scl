let dropdownValues = [
  "All",
  "Airplane",
  "Balloon",
  "Bird_Animal",
  "CATV-TELCO",
  "Car/Pole",
  "Crane in Wires",
  "Dig Up",
  "Earthquake",
  "Equip_Fail",
  "Fire - Brush",
  "Fire - Building",
  "Landslide",
  "Lightning",
  "No Cause Found",
  "OK on arrival-SCL OK",
  "OK on arrival-SCL OK-No Cause Found",
  "Operating Error",
  "Other - Comments Required",
  "Planned Outage",
  "Sabotage",
  "Tree",
  "Unknown/No Cause Found",
  "Unselected",
  "Vandalism",
];

// Get the dropdown menu element
let dropdownMenu = document.querySelector(".scrollable-dropdown");

// Populate the dropdown menu with values
dropdownValues.forEach(function (value, index) {
  var listItem = document.createElement("li");
  listItem.innerHTML =
    '<a class="dropdown-item" href="#" data-index="' +
    (index + 1) +
    '">' +
    value +
    "</a>";
  dropdownMenu.appendChild(listItem);
});

// Update the button text when a dropdown item is clicked
dropdownMenu.addEventListener("click", function (event) {
  if (event.target.classList.contains("dropdown-item")) {
    document.getElementById("causationButton").textContent =
      event.target.textContent;
  }
});

function toggleOverlay() {
  var overlay = document.getElementById("equity-matrix");
  var currentDisplay = overlay.style.display;
  // Toggle the visibility based on the current state
  overlay.style.display = currentDisplay === "block" ? "none" : "block";
  // if style is none:
  // update
  if (overlay.style.display == "none") {
    // add a div that contains the env and also the legend
    displaySelectedRadio();
  } else {
    // clear text
    let displayDiv = document.getElementById("displayWhenCollapsed");
    displayDiv.innerHTML = "";
    // clear bar
    let colorBar = document.getElementById("cloneColorBar");
    if (colorBar) {
      colorBar.remove();
    }
  }
}

function displaySelectedRadio() {
  let radios = document.querySelectorAll('input[name="population_category"]');
  let selectedRadio = Array.from(radios).find((radio) => radio.checked);
  if (selectedRadio) {
    let labelElement = document.querySelector(
      'label[for="' + selectedRadio.id + '"]'
    );
    let labelText = labelElement ? labelElement.innerText : "";

    // get color bar
    let colorBar = document.getElementById("legend-color-bar");
    let clone = colorBar.cloneNode(true);
    clone.id = "cloneColorBar";
    let displayDiv = document.getElementById("displayWhenCollapsed");
    displayDiv.innerHTML = labelText;
    displayDiv.after(clone);
  }
}
