const express = require('express')
app = express()

const cors = require("cors")

const port = process.env.PORT || 3000
const majorVersion = 0
const minorVersion = 1

// Use Express to publish static HTML, CSS, and JavaScript files that run in the browser.
app.use(express.json())
app.use(express.static(__dirname + '/public'))

// Add sites that can speak to the server, NEED TO ADD AZURE WEBSITE
app.use(cors({ origin: [
	'http://localhost:3000', 
	'https://health-risk-calculator-unp-node-f5hygtdhemhxc6ef.centralus-01.azurewebsites.net/'
	]
}))

// ----------   GENERAL SERVER ROUTES   ----------
// The app.get functions below are being processed in Node.js running on the server.

app.get('/api/ping', (request, response) => {
	console.log('Calling "/api/ping"')
	response.type('text/plain')
	response.send(`ping response v${majorVersion}.${minorVersion}`)
})

// ----------   CUSTOM SERVER ROUTES   ----------

app.post('/api/calculate/blood-pressure', (request, response) => {
	const { systolic, diastolic } = request.body;

	const validationError = validateBloodPressure(systolic, diastolic);
	if (validationError) {
		response.status(400).json({ error: validationError });
		return;
	}

	let bloodPressureCategory = ''
	if (systolic < 120 && diastolic < 80) {
		bloodPressureCategory = 'Normal'
	}
	else if (systolic < 130 && diastolic < 80) {
		bloodPressureCategory = 'Elevated'
	}
	else if (systolic < 140 || diastolic < 90) {
		bloodPressureCategory = 'High Blood Pressure (Hypertension) Stage 1'
	}
	else if (systolic >= 180 || diastolic >= 120) {
		bloodPressureCategory = 'Hypertensive Crisis (Consult your doctor immediately)'
	}
	else if (systolic >= 140 || diastolic >= 90) {
		bloodPressureCategory = 'High Blood Pressure (Hypertension) Stage 2'
	}
	else {
		bloodPressureCategory = 'Uncategorized'
	}
	
	response.json({ category: bloodPressureCategory })
})
function validateBloodPressure(systolic, diastolic) {
	// TODO: Implement Validation Logic
	return null; // Return null if valid, or an error message string if invalid
}

app.post('/api/calculate/bmi', (request, response) => {
	const { heightFeet, heightInches, weightPounds } = request.body

	const validationError = validateBMICalculations(heightFeet, heightInches, weightPounds);
	if (validationError) {
		response.status(400).json({ error: validationError });
		return;
	}

	const totalHeightInches = (heightFeet * 12) + heightInches
	const bmi = (weightPounds / (totalHeightInches * totalHeightInches)) * 703
	const roundedBmi = parseFloat(bmi.toFixed(2))

	let bmiCategory = ''
	if (roundedBmi < 18.5) {
		bmiCategory = 'Underweight'
	}
	else if (roundedBmi < 24.9) {
		bmiCategory = 'Normal weight'
	}
	else if (roundedBmi < 29.9) {
		bmiCategory = 'Overweight'
	}
	else {
		bmiCategory = 'Obesity'
	}

	response.json({ bmi: roundedBmi, category: bmiCategory });
})
function validateBMICalculations(heightFeet, heightInches, weightPounds) {
	// TODO: Implement Validation Logic
	return null; // Return null if valid, or an error message string if invalid
}

app.post('/api/calculate/risk-score', (request, response) => {
	const { age, bmiCategory, bloodPressureCategory, familyDiseaseList } = request.body

	const validationError = validateRiskScoreCalculations(age, bmi, bloodPressureCategory, familyDiseaseList);
	if (validationError) {
		response.status(400).json({ error: validationError });
		return;
	}

	let ageRiskScore = 0
	if (age < 30) {
		ageRiskScore += 0
	}
	else if (age < 45) {
		ageRiskScore += 10
	}
	else if (age < 60) {
		ageRiskScore += 20
	}
	else {
		ageRiskScore += 30
	}

	let bmiRiskScore = 0
	if (bmiCategory === 'Underweight') {
		bmiRiskScore += 0 // NOTE: Underweight is not considered a risk factor in this scoring system
	}
	else if (bmiCategory === 'Normal weight') {
		bmiRiskScore += 0
	}
	else if (bmiCategory === 'Overweight') {
		bmiRiskScore += 30
	}
	else if (bmiCategory === 'Obesity') {
		bmiRiskScore += 75
	}

	let bloodPressureRiskScore = 0
	if (bloodPressureCategory === 'Normal') {
		bloodPressureRiskScore += 0
	}
	else if (bloodPressureCategory === 'Elevated') {
		bloodPressureRiskScore += 15
	}
	else if (bloodPressureCategory === 'High Blood Pressure (Hypertension) Stage 1') {
		bloodPressureRiskScore += 30
	}
	else if (bloodPressureCategory === 'High Blood Pressure (Hypertension) Stage 2') {
		bloodPressureRiskScore += 75
	}
	else if (bloodPressureCategory === 'Hypertensive Crisis (Consult your doctor immediately)') {
		bloodPressureRiskScore += 100
	}

	let familyDiseaseRiskScore = 0
	if (familyDiseaseList.includes('diabetes')) {
		familyDiseaseRiskScore += 10
	}
	if (familyDiseaseList.includes('cancer')) {
		familyDiseaseRiskScore += 10
	}
	if (familyDiseaseList.includes("Alzheimer's")) {
		familyDiseaseRiskScore += 10
	}

	let riskScore = ageRiskScore + bmiRiskScore + bloodPressureRiskScore + familyDiseaseRiskScore
	let riskCategory = ''
	if (riskScore <= 20) {
		riskCategory = 'low risk'
	}
	else if (riskScore <= 50) {
		riskCategory = 'moderate risk'
	}
	else if (riskScore <= 75) {
		riskCategory = 'high risk'
	}
	else {
		riskCategory = 'uninsurable'
	}

	response.json({ riskScore: riskScore, category: riskCategory, ageRiskScore: ageRiskScore, bmiRiskScore: bmiRiskScore, 
					bloodPressureRiskScore: bloodPressureRiskScore, familyDiseaseRiskScore: familyDiseaseRiskScore })
})
function validateRiskScoreCalculations(age, bmiCategory, bloodPressureCategory, familyDiseaseList) {
	// TODO: Implement Validation Logic
	return null; // Return null if valid, or an error message string if invalid
}

// ----------   ERROR HANDLING ROUTES   ----------
// Custom 404 page.
app.use((request, response) => {
  response.type('text/plain')
  response.status(404)
  response.send('404 - Not Found')
})

// Custom 500 page.
app.use((err, request, response, next) => {
  console.error(err.message)
  response.type('text/plain')
  response.status(500)
  response.send('500 - Server Error')
})

app.listen(port, () => console.log(
  `Express started at \"http://localhost:${port}\"\n` +
  `press Ctrl-C to terminate.`)
)
