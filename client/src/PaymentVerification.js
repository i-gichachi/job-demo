import React, { useState } from 'react';
import './PaymentVerification.css';

function PaymentVerification() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const initiatePayment = async () => {
        setIsProcessing(true)

        try {
            const response = await fetch('/stk-push', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone_number: phoneNumber, amount: 1 })
            })
            const data = await response.json()

            if (response.ok) {
                alert('Please check your phone to complete the M-Pesa transaction.')
            } else {
                alert('Error: ' + data.message)
                setIsProcessing(false)
            }
        } catch (error) {
            alert('An error occurred: ' + error.message)
            setIsProcessing(false)
        }
    }

    return (
        <div className="payment-verification">
            <h2>Verify Your Account via M-Pesa</h2>
            <div className="payment-form">
                <input
                    type="tel"
                    className="phone-input"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isProcessing}
                />
                <button className="pay-button" onClick={initiatePayment} disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : 'Pay with M-Pesa'}
                </button>
            </div>
            {isProcessing && <p className="processing-message">Please complete the M-Pesa transaction on your phone...</p>}
        </div>
    );
}

export default PaymentVerification;