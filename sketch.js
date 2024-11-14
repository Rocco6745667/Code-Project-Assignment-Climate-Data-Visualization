//Rocco Ali
//218008847
//DATT 2400 Code Project Assignment: Climate Data Visualization

let table;
let climateData = [];
let regions = ['NHem', 'SHem', 'Glob']; // List of regions
let selectedRegion = 'NHem'; // Default region

let minYear, maxYear, minTemp, maxTemp;
let currentYearIndex = 0;
let radius = 200;
let angleStep;
let isPaused = false; // Pause state
let pauseButton;
let lerpAmount = 0; // To handle smooth transitions

let sound; // Variable to store the music
let gui; // GUI object
let controls = {
  startYear: 1880, // Default start year
  endYear: 2023,   // Default end year
  highlightYear: 2000, // Default highlight year
  region: 'NHem' // Default region for the GUI
};

function preload() {
  table = loadTable('data/data.csv', 'csv', 'header');
  sound = loadSound('data/musica.mp3'); // Load your music file
}

function setup() {
  createCanvas(650, 650);
  colorMode(HSB); // Use HSB for smoother color transitions
  noStroke();
  
  // Initialize the GUI
  gui = new dat.GUI();
  gui.add(controls, 'startYear', 1880, 2023).step(1).onChange(updateDataRange);
  gui.add(controls, 'endYear', 1880, 2023).step(1).onChange(updateDataRange);
  gui.add(controls, 'highlightYear', 1880, 2023).step(1).onChange(updateDataRange);
  gui.add(controls, 'region', regions).onChange(updateRegion); // Add region selector
  
  // Create a button to pause and resume the animation
  pauseButton = createButton('Pause');
  pauseButton.position(20, 20);
  pauseButton.mousePressed(togglePause);

  // Start the music and loop it
  sound.loop();

  // Load and process the initial data
  loadData();
  updateDataRange();
}

function loadData() {
  // Extract and parse data for the selected region
  climateData = []; // Clear previous data
  let years = table.getColumn('Year').map(Number);
  let temps = table.getColumn(controls.region).map(Number); // Use the selected region

  // Store climate data as an array of objects
  for (let i = 0; i < years.length; i++) {
    climateData.push({ year: years[i], temp: temps[i] });
  }
  
  // Determine min and max values for mapping
  minYear = min(years);
  maxYear = max(years);
  minTemp = min(temps);
  maxTemp = max(temps);
  
  angleStep = TWO_PI / climateData.length; // Calculate angle step
}

function draw() {
  background(0);
  translate(width / 2, height / 2); // Center the visualization

  // Draw each data point up to the current index with smooth transitions
  for (let i = 0; i < climateData.length; i++) {
    let year = climateData[i].year;

    // Only draw data points within the selected range
    if (year < controls.startYear || year > controls.endYear) {
      continue;
    }

    let angle = i * angleStep;
    let temp = climateData[i].temp;
    
    // Map temperature to color
    let hue = map(temp, minTemp, maxTemp, 180, 0); // Blue to red

    // Smooth transition using lerp
    let x = lerp(0, radius * cos(angle), lerpAmount);
    let y = lerp(0, radius * sin(angle), lerpAmount);

    // Highlight the specified year with a larger, brighter circle
    if (year === controls.highlightYear) {
      fill(hue, 100, 100);
      ellipse(x, y, 15, 15); // Larger ellipse for highlight
    } else {
      fill(hue, 100, 100);
      ellipse(x, y, 10, 10); // Regular ellipse
    }
  }
  
  if (!isPaused) {
    // Increment lerpAmount for smooth transition
    lerpAmount += 0.005;
    
    if (lerpAmount >= 1) {
      lerpAmount = 0; // Reset lerpAmount for the next point
      currentYearIndex++;
      
      // Reset the index when all data points are drawn to loop the animation
      if (currentYearIndex >= climateData.length) {
        currentYearIndex = 0;
      }
    }
  }

  // Draw the legend
  drawLegend();
}

// Function to toggle the pause state and control the music
function togglePause() {
  isPaused = !isPaused;
  pauseButton.html(isPaused ? 'Resume' : 'Pause');

  if (isPaused) {
    sound.pause(); // Pause the music
  } else {
    sound.loop(); // Resume and loop the music
  }
}

// Function to update the data range and redraw
function updateDataRange() {
  redraw();
}

// Function to update the region and reload data
function updateRegion() {
  loadData();
  redraw();
}

// Function to draw the legend
function drawLegend() {
  push();
  translate(-width / 2 + 20, -height / 2 + 60);

  fill(255);
  textSize(12);
  text('Legend', 0, 0);

  textSize(10);
  text('Temperature Range:', 0, 20);
  
  for (let i = 0; i < 100; i++) {
    let hue = map(i, 0, 100, 180, 0);
    fill(hue, 100, 100);
    rect(i, 30, 1, 10);
  }
  
  fill(255);
  text('Cooler', 0, 50);
  text('Warmer', 85, 50);

  textSize(10);
  text('Highlighted Year:', 0, 70);
  fill(0, 100, 100);
  ellipse(10, 85, 15, 15);
  fill(255);
  text(`${controls.highlightYear}`, 30, 90);

  textSize(10);
  text('Region: ' + controls.region, 0, 110); // Display the selected region

  pop();
}
