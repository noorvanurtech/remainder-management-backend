export const demoHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GlassForce Razorpay Interactive Demo</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <style>
        :root {
            --bg-color: #090d16;
            --card-bg: rgba(17, 25, 40, 0.65);
            --border-color: rgba(255, 255, 255, 0.08);
            --primary: #6366f1;
            --primary-glow: rgba(99, 102, 241, 0.15);
            --primary-hover: #4f46e5;
            --success: #10b981;
            --success-glow: rgba(16, 185, 129, 0.15);
            --error: #ef4444;
            --error-glow: rgba(239, 68, 68, 0.15);
            --text-main: #f3f4f6;
            --text-muted: #9ca3af;
            --input-bg: #111827;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Outfit', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 2rem 1rem;
            background-image: 
                radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.12) 0px, transparent 50%),
                radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.08) 0px, transparent 50%);
        }

        header {
            text-align: center;
            margin-bottom: 2.5rem;
            max-width: 800px;
        }

        header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #a5b4fc, #6366f1, #34d399);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
        }

        header p {
            color: var(--text-muted);
            font-size: 1.1rem;
        }

        .container {
            max-width: 1200px;
            width: 100%;
            display: grid;
            grid-template-columns: 1.2fr 1fr;
            gap: 2rem;
        }

        @media (max-width: 900px) {
            .container {
                grid-template-columns: 1fr;
            }
        }

        .card {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        }

        .card h2 {
            font-size: 1.4rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.75rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .form-group {
            margin-bottom: 1.25rem;
        }

        .form-group label {
            display: block;
            font-size: 0.9rem;
            color: var(--text-muted);
            margin-bottom: 0.5rem;
            font-weight: 500;
        }

        .form-group input, .form-group select {
            width: 100%;
            background-color: var(--input-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 0.75rem 1rem;
            color: var(--text-main);
            font-size: 0.95rem;
            font-family: inherit;
            transition: all 0.3s ease;
        }

        .form-group input:focus, .form-group select:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px var(--primary-glow);
        }

        .btn {
            width: 100%;
            background-color: var(--primary);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.85rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;
        }

        .btn:hover {
            background-color: var(--primary-hover);
            transform: translateY(-1px);
        }

        .btn:active {
            transform: translateY(0);
        }

        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .console {
            background-color: #05070c;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            height: 350px;
            overflow-y: auto;
            padding: 1.25rem;
            font-family: 'Fira Code', monospace;
            font-size: 0.85rem;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .log-entry {
            line-height: 1.4;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .log-info { color: #60a5fa; }
        .log-success { color: var(--success); }
        .log-error { color: var(--error); }
        .log-time { color: #536471; font-size: 0.75rem; margin-right: 0.5rem; }

        .tag {
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            text-transform: uppercase;
        }

        .tag-success {
            background-color: var(--success-glow);
            color: var(--success);
            border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .card-helper {
            margin-top: 1.5rem;
            background-color: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1rem;
        }

        .card-helper h3 {
            font-size: 0.95rem;
            margin-bottom: 0.5rem;
            color: #f3f4f6;
        }

        .credential-grid {
            display: grid;
            grid-template-columns: 1.5fr 1fr 1fr;
            gap: 0.5rem;
            font-family: 'Fira Code', monospace;
            font-size: 0.8rem;
            background: #000;
            padding: 0.75rem;
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .copy-btn {
            background: none;
            border: none;
            color: var(--primary);
            cursor: pointer;
            font-size: 0.8rem;
            text-decoration: underline;
            padding: 0;
            font-weight: 500;
        }

        .copy-btn:hover {
            color: var(--text-main);
        }

        /* Modal Styles */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(5, 7, 12, 0.85);
            backdrop-filter: blur(8px);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            padding: 1rem;
        }

        .modal-content {
            background-color: #0d121f;
            border: 1px solid var(--border-color);
            border-radius: 20px;
            width: 100%;
            max-width: 450px;
            padding: 2.5rem;
            text-align: center;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            animation: modalSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes modalSlide {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .modal-icon {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto 1.5rem auto;
        }

        .modal-icon-success {
            background-color: var(--success-glow);
            color: var(--success);
            border: 2px solid rgba(16, 185, 129, 0.3);
        }

        .modal-icon-error {
            background-color: var(--error-glow);
            color: var(--error);
            border: 2px solid rgba(239, 68, 68, 0.3);
        }

        .modal-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.75rem;
        }

        .modal-message {
            color: var(--text-muted);
            font-size: 0.95rem;
            margin-bottom: 1.5rem;
            line-height: 1.5;
        }

        .modal-details {
            background-color: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 0.75rem;
            margin-bottom: 2rem;
            text-align: left;
            font-family: 'Fira Code', monospace;
            font-size: 0.8rem;
        }

        .modal-details div {
            margin-bottom: 0.25rem;
            overflow-wrap: break-word;
        }

        .modal-details div:last-child {
            margin-bottom: 0;
        }

        .modal-details span {
            color: var(--text-muted);
        }
    </style>
</head>
<body>

<header>
    <h1>GlassForce Payment Sandbox</h1>
    <p>Test the integrated Razorpay checkout flows in real time using the API endpoints.</p>
</header>

<div class="container">
    <div class="card">
        <h2>🛠️ Payment Configuration</h2>
        
        <div class="form-group">
            <label for="jwtToken">JWT Authorization Token (Bearer)</label>
            <input type="text" id="jwtToken" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
                <label for="locationId">Location ID (Mongoose ObjectID)</label>
                <input type="text" id="locationId" placeholder="65b839f99f352bbca2b4d96c" value="65e123f99f352bbca2b40001">
            </div>

            <div class="form-group">
                <label for="jobType">Job Type</label>
                <select id="jobType">
                    <option value="HOME_REPAIR">Home Repair (HOME_REPAIR)</option>
                    <option value="WORKSHOP_REPAIR" selected>Workshop Repair (WORKSHOP_REPAIR)</option>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label for="paymentType">Payment Type (Advance vs Full)</label>
            <select id="paymentType">
                <option value="FULL" selected>Full Payment (FULL)</option>
                <option value="ADVANCE">Advance Deposit (ADVANCE)</option>
            </select>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button id="btnOptionA" class="btn" style="background-color: var(--primary);">
                ⚡ Option A: All-in-One Checkout & Pay
            </button>
        </div>

        <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <p style="font-size: 0.85rem; color: var(--text-muted);">
                <strong>Option A:</strong> Performs checkout and immediately opens the Razorpay frame.
            </p>
        </div>

        <div class="card-helper">
            <h3>💳 Razorpay Sandbox Test Cards</h3>
            <div class="credential-grid">
                <div>Card: 4111 1111 1111 1111</div>
                <div>Expiry: 12/28</div>
                <div>CVV: 123</div>
            </div>
            <div style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-muted); display: flex; justify-content: space-between;">
                <span>Any test OTP (e.g. 123456) will verify successfully.</span>
                <button class="copy-btn" onclick="navigator.clipboard.writeText('4111111111111111')">Copy Card</button>
            </div>
        </div>
    </div>

    <div class="card" style="display: flex; flex-direction: column; gap: 1.5rem;">
        <h2>
            <span>💻 Terminal Logs</span>
            <button id="btnClearLogs" class="copy-btn" style="font-size: 0.85rem; text-decoration: none;">Clear Logs</button>
        </h2>
        
        <div id="console" class="console">
            <div class="log-entry">
                <span class="log-time">[System]</span>
                <span class="log-info">Ready to start. Enter your JWT Bearer token above, ensure items exist in your cart, and click checkout.</span>
            </div>
        </div>
    </div>
</div>

<!-- SUCCESS MODAL -->
<div id="successModal" class="modal-overlay">
    <div class="modal-content">
        <div class="modal-icon modal-icon-success">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        </div>
        <div class="modal-title" style="color: var(--success);">Payment Success!</div>
        <div class="modal-message">Your payment signature has been cryptographically verified and your Job status updated.</div>
        <div class="modal-details">
            <div><span>Payment ID:</span> <span id="mSuccessPaymentId" style="color: #fff;"></span></div>
            <div><span>Order ID:</span> <span id="mSuccessOrderId" style="color: #fff;"></span></div>
            <div><span>Job ID:</span> <span id="mSuccessJobId" style="color: #fff;"></span></div>
            <div><span>New Status:</span> <span id="mSuccessStatus" class="tag tag-success"></span></div>
        </div>
        <button class="btn" style="background-color: var(--success);" onclick="closeModals()">Great!</button>
    </div>
</div>

<!-- FAILURE MODAL -->
<div id="failureModal" class="modal-overlay">
    <div class="modal-content">
        <div class="modal-icon modal-icon-error">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </div>
        <div class="modal-title" style="color: var(--error);">Payment Failed</div>
        <div class="modal-message">The payment verification failed or was declined.</div>
        <div class="modal-details" style="border-color: rgba(239,68,68,0.2);">
            <div><span>Error Reason:</span> <span id="mFailureReason" style="color: var(--error);"></span></div>
        </div>
        <button class="btn" style="background-color: var(--error);" onclick="closeModals()">Dismiss</button>
    </div>
</div>

<script>
    const jwtTokenInput = document.getElementById('jwtToken');
    const locationIdInput = document.getElementById('locationId');
    const jobTypeSelect = document.getElementById('jobType');
    const paymentTypeSelect = document.getElementById('paymentType');
    const consoleContainer = document.getElementById('console');
    const btnOptionA = document.getElementById('btnOptionA');
    const btnClearLogs = document.getElementById('btnClearLogs');

    // Modals
    const successModal = document.getElementById('successModal');
    const failureModal = document.getElementById('failureModal');
    
    // Modal Text Hooks
    const mSuccessPaymentId = document.getElementById('mSuccessPaymentId');
    const mSuccessOrderId = document.getElementById('mSuccessOrderId');
    const mSuccessJobId = document.getElementById('mSuccessJobId');
    const mSuccessStatus = document.getElementById('mSuccessStatus');
    const mFailureReason = document.getElementById('mFailureReason');

    // Retrieve cached token
    const cachedToken = localStorage.getItem('gf_demo_token') || '';
    jwtTokenInput.value = cachedToken;

    jwtTokenInput.addEventListener('change', () => {
        localStorage.setItem('gf_demo_token', jwtTokenInput.value.trim());
    });

    function closeModals() {
        successModal.style.display = 'none';
        failureModal.style.display = 'none';
    }

    function showSuccess(paymentId, orderId, jobId, status) {
        mSuccessPaymentId.textContent = paymentId;
        mSuccessOrderId.textContent = orderId;
        mSuccessJobId.textContent = jobId;
        mSuccessStatus.textContent = status;
        successModal.style.display = 'flex';
    }

    function showFailure(reason) {
        mFailureReason.textContent = reason;
        failureModal.style.display = 'flex';
    }

    function log(message, type = 'info') {
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'log-time';
        timeSpan.textContent = '[' + time + ']';
        
        const msgSpan = document.createElement('span');
        msgSpan.className = 'log-' + type;
        msgSpan.innerHTML = message;
        
        entry.appendChild(timeSpan);
        entry.appendChild(msgSpan);
        consoleContainer.appendChild(entry);
        consoleContainer.scrollTop = consoleContainer.scrollHeight;
    }

    btnClearLogs.addEventListener('click', () => {
        consoleContainer.innerHTML = '';
        log('Console logs cleared.', 'info');
    });

    btnOptionA.addEventListener('click', async () => {
        const token = jwtTokenInput.value.trim();
        if (!token) {
            log('Error: Please provide a JWT Authorization Token to authenticate request.', 'error');
            showFailure('Missing JWT Authorization Token. Paste your session token in the input field.');
            return;
        }

        const locationId = locationIdInput.value.trim();
        const jobType = jobTypeSelect.value;
        const paymentType = paymentTypeSelect.value;

        log('Triggering Option A: All-in-One Checkout and Payment...', 'info');

        try {
            log('Sending POST request to /api/v1/carts/checkout...', 'info');
            
            const checkoutRes = await fetch('/api/v1/carts/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ locationId, jobType, paymentType })
            });

            const checkoutData = await checkoutRes.json();
            
            if (checkoutRes.status !== 201 && checkoutRes.status !== 200) {
                const errMsg = checkoutData.message || 'Unknown checkout error';
                log('Checkout Failed: ' + errMsg, 'error');
                showFailure('Checkout API Error: ' + errMsg);
                return;
            }

            log('Checkout Succeeded! Job created: <strong style="color:#f3f4f6">' + checkoutData.data.job._id + '</strong>', 'success');
            log('Razorpay Order Created: <strong style="color:#f3f4f6">' + checkoutData.data.paymentOrder.orderId + '</strong>', 'success');

            const order = checkoutData.data.paymentOrder;
            
            log('Launching Razorpay Checkout frame...', 'info');

            const options = {
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: "GlassForce",
                description: "Booking Payment (" + order.paymentType + ")",
                order_id: order.orderId,
                handler: async function (response) {
                    log('Razorpay checkout completed successfully!', 'success');
                    log('Signature: <span style="font-size:0.75rem">' + response.razorpay_signature + '</span>', 'info');
                    log('Payment ID: ' + response.razorpay_payment_id, 'info');
                    log('Submitting verification tokens to /api/v1/payments/verify...', 'info');

                    try {
                        const verifyRes = await fetch('/api/v1/payments/verify', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + token
                            },
                            body: JSON.stringify({
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature
                            })
                        });

                        const verifyData = await verifyRes.json();
                        if (verifyRes.status === 200) {
                            log('Payment verified! Database updated successfully. Status: <span class="tag tag-success">' + verifyData.data.paymentStatus + '</span>', 'success');
                            showSuccess(
                                response.razorpay_payment_id, 
                                response.razorpay_order_id, 
                                verifyData.data._id, 
                                verifyData.data.paymentStatus
                            );
                        } else {
                            const errText = verifyData.message || 'Signature rejected';
                            log('Verification API Rejected Payment: ' + errText, 'error');
                            showFailure('Verification API Rejected: ' + errText);
                        }
                    } catch (e) {
                        log('Verification Request Failed: ' + e.message, 'error');
                        showFailure('Network verification error: ' + e.message);
                    }
                },
                prefill: {
                    name: "Test Customer",
                    email: "customer@glassforce.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#6366f1"
                },
                modal: {
                    ondismiss: function() {
                        log('Razorpay checkout frame closed by user.', 'error');
                        showFailure('User cancelled checkout flow.');
                    }
                }
            };

            const rzp = new Razorpay(options);
            rzp.open();

        } catch (err) {
            log('Error processing flow: ' + err.message, 'error');
            showFailure('Internal Flow Error: ' + err.message);
        }
    });
</script>
</body>
</html>`;
