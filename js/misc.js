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
}

$(window).ready(function () {
  $("#loader").fadeOut("slow");

  $("#nextTimeSwitcher input").on("click", function () {
    if ($("#nextTimeSwitcher input:checked").val() === "on") {
      localStorage.setItem("popState", "shown");
    } else {
      localStorage.setItem("popState", "notShown");
    }
  });

  if (localStorage.getItem("popState") != "shown") {
    console.log("show welcome panel");
    $("#welcome").modal("show");
  } else {
    console.log("hide welcome panel");
    $("#welcome").modal("hide");
  }
  $("#welcome-close").click(function (
    e // You are clicking the close button
  ) {
    $("#welcome").fadeOut(); // Now the pop up is hiden.
    $("#welcome").modal("hide");
  });
});

$(".showFrontPage").on("click", function () {
  $("#welcome").modal("show");
  localStorage.setItem("popState", "notShown");
});

// $("#loader").fadeOut("slow");

document.querySelectorAll(".em_factor").forEach((factor) => {
  factor.addEventListener("mouseenter", (event) => {
    const tooltip = document.getElementById("tooltip");
    const offsetX = 10; // Horizontal offset
    const offsetY = 20; // Vertical offset

    tooltip.style.display = "block";
    // Get the value from the associated input element
    let targetContent = document.querySelector(`#${event.target.htmlFor}`).value;

    // Use a switch statement for better readability
    switch (targetContent) {
      case "1":
        tooltip.textContent = "Percentile ranking of disparities in environmental health, such as unequal exposure to hazards, unequal access to resources, and variations of health outcomes.";
        break;
      case "2":
        tooltip.textContent = "Count of vehicles at major roads within 500 meters divided by distance in meters.";
        break;
      case "3":
        tooltip.textContent = "Count of hazardous waste facilities within 5 kilometers.";
        break;
      case "4":
        tooltip.textContent = "Level of risk or vulnerability that a region or area faces regarding various natural hazards.";
        break;
      case "5": // transportation insecurity
        tooltip.textContent = "Percentile ranking for housing type & transportation.";
        break;
      case "6": // sociol vulnerability
        tooltip.textContent = "CDC/ATSDR Social Vulnerability Index, possible scores range from 0 (lowest vulnerability) to 1 (highest vulnerability). Indicates the degree to which a community exhibits certain social conditions, including high poverty, low percentage of vehicle access, or crowded households.";
        break;
      case "7": // socioeconomic factor
        tooltip.textContent = "Ranking of Socioeconomic Factor, which measures educational attainment, poverty, housing tenure, access to broadband, and housing cost burden within a community.";
        break;
      case "8":
        tooltip.textContent = "Percentage of a household’s income that is spent on housing costs (including rent, mortgage, property taxes, and utility bills).";
        break;
      case "9":
        tooltip.textContent = "Share of households where no on over the age of 14 can speak English very well.";
        break;
      case "10":
        tooltip.textContent = "Percent of Black or African American, within the Census Tract, alone.";
        break;
      case "11":
        tooltip.textContent = "Measured in micrograms of particulate matter per cubic meter of air. This is the level of inhalable particles, 2.5 micrometers or smaller. For reference, the general accepted level is 10 micrograms/m³(annual mean), as set by WHO.";
        break;
      case "12":
        tooltip.textContent = "Measures the concentration of tiny particles in the air that come from diesel engine exhaust.";
        break;
      case "13":
        tooltip.textContent = "Percentage disability of census tract.";
        break;
      // Add more cases as needed
      default:
        tooltip.textContent = "Default tooltip text.";
    }
  });

  factor.addEventListener("mouseleave", () => {
    document.getElementById("tooltip").style.display = "none";
  });
});
