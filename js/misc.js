let dropdownValues = [
    'All',
    'Airplane',
    'Balloon',
    'Bird_Animal',
    'CATV-TELCO',
    'Car/Pole',
    'Crane in Wires',
    'Dig Up',
    'Earthquake',
    'Equip_Fail',
    'Fire - Brush',
    'Fire - Building',
    'Landslide',
    'Lightning',
    'No Cause Found',
    'OK on arrival-SCL OK',
    'OK on arrival-SCL OK-No Cause Found',
    'Operating Error',
    'Other - Comments Required',
    'Planned Outage',
    'Sabotage',
    'Tree',
    'Unknown/No Cause Found',
    'Unselected',
    'Vandalism'
  ];

  // Get the dropdown menu element
  let dropdownMenu = document.querySelector('.scrollable-dropdown');

  // Populate the dropdown menu with values
  dropdownValues.forEach(function(value, index) {
    var listItem = document.createElement('li');
    listItem.innerHTML = '<a class="dropdown-item" href="#" data-index="' + (index + 1) + '">' + value + '</a>';
    dropdownMenu.appendChild(listItem);
  });

  // Update the button text when a dropdown item is clicked
  dropdownMenu.addEventListener('click', function(event) {
    if (event.target.classList.contains('dropdown-item')) {
      document.getElementById('causationButton').textContent = event.target.textContent;
    }
  });