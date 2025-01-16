<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quiz - SangPoint</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="payment-container">
        <h2>Choose your timer duration:</h2>
        
        <!-- Phone Number Input -->
        <label for="phone-number">Enter your phone number (starting with +254):</label>
        <input type="text" id="phone-number" placeholder="e.g. +254XXXXXXXXX" required />
        
        <h3>Select Timer Duration:</h3>
        <select id="timer-duration">
            <option value="30">30 seconds - Ksh 50</option>
            <option value="40">40 seconds - Ksh 100</option>
            <option value="50">50 seconds - Ksh 150</option>
            <option value="70">70 seconds - Ksh 200</option>
            <option value="100">100 seconds - Ksh 400</option>
        </select>
        
        <button class="button" onclick="initiatePayment()">Proceed with Payment</button>
    </div>

    <div id="quiz-container" style="display:none;">
        <h2>Section A</h2>
        <p class="timer" id="timer">Time: 30</p>
        <div id="questions"></div>
        <button class="button" onclick="submitQuiz()">Submit</button>
    </div>

    <script>
        const questions = [
            "What is 2 + 2?",
            "What is the capital of Kenya?",
            // Add more questions here
        ];
        let timeLeft = 30;

        // Payment handling (simulating STK Push)
        function initiatePayment() {
            const phoneNumber = document.getElementById('phone-number').value;
            const selectedTimer = document.getElementById('timer-duration').value;
            const paymentAmount = calculatePayment(selectedTimer);

            // Validate phone number format
            const phonePattern = /^\+254\d{9}$/;
            if (!phonePattern.test(phoneNumber)) {
                alert('Invalid phone number. It must start with +254 followed by 9 digits.');
                return;
            }

            // Simulate a payment process here (replace this with actual Mpesa STK Push API logic)
            if (paymentAmount) {
                alert(`You are about to pay Ksh ${paymentAmount} for a ${selectedTimer} second timer.`);
                processPayment(paymentAmount, selectedTimer, phoneNumber);
            } else {
                alert('Please select a valid timer duration.');
            }
        }

        function calculatePayment(timerDuration) {
            // Return payment amounts based on selected timer
            switch (timerDuration) {
                case '30': return 50;
                case '40': return 100;
                case '50': return 150;
                case '70': return 200;
                case '100': return 400;
                default: return 0;
            }
        }

        function processPayment(amount, duration, phoneNumber) {
            // Replace this with your actual backend API call
            fetch('/api/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount, phoneNumber, timerDuration: duration }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(`Payment of Ksh ${amount} successful. Starting the quiz with a ${duration} second timer.`);
                    
                    // Hide the payment section and show the quiz
                    document.getElementById('payment-container').style.display = 'none';
                    document.getElementById('quiz-container').style.display = 'block';

                    // Start the quiz timer
                    timeLeft = duration;
                    startTimer();
                    renderQuestions();
                } else {
                    alert('Payment failed. Please try again.');
                }
            })
            .catch(error => {
                console.error('Payment error:', error);
                alert('An error occurred while processing the payment.');
            });
        }

        function startTimer() {
            const timer = document.getElementById('timer');
            const interval = setInterval(() => {
                timeLeft -= 1;
                timer.textContent = `Time: ${timeLeft}`;
                if (timeLeft === 0) {
                    clearInterval(interval);
                    alert('Time is up!');
                    submitQuiz();
                }
            }, 1000);
        }

        function renderQuestions() {
            const container = document.getElementById('questions');
            questions.forEach((q, index) => {
                const questionDiv = document.createElement('div');
                questionDiv.innerHTML = `
                    <p>${index + 1}. ${q}</p>
                    <input type="text" id="answer-${index}" />
                `;
                container.appendChild(questionDiv);
            });
        }

        function submitQuiz() {
            // Collect answers and process results
            alert('Quiz submitted!');
        }
    </script>
</body>
</html>
