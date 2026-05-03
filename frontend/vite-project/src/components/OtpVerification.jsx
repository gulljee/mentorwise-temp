import React, { useState } from 'react';

export default function OtpVerification({ email, onSuccess, onCancel }) {
    const [otpCode, setOtpCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState('');

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otpCode }),
            });

            const data = await res.json();
            
            if (res.status === 403 && data.isPendingApproval) {
                setError(data.message);
                setIsLoading(false);
                // Optionally trigger a callback for the "wait" popup if needed, 
                // but showing it as an error message is also effective.
                return;
            }

            if (!res.ok) {
                setError(data.message || "Invalid or expired OTP");
                setIsLoading(false);
                return;
            }

            onSuccess(data); // pass data back
        } catch (err) {
            setError("Server error. Try again later.");
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setResendMessage('');
        setError('');

        try {
            const res = await fetch("http://localhost:5000/api/auth/resend-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setResendMessage("Verification code resent successfully.");
            } else {
                setError(data.message || "Failed to resend code.");
            }
        } catch (err) {
            setError("Server error. Try again later.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-surface-container-lowest rounded-xl shadow-sm text-center">
            <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">
                Verify Your Email
            </h2>
            <p className="text-on-surface-variant text-sm mb-6 max-w-sm">
                We've sent a 6-digit verification code to <span className="font-bold text-primary">{email}</span>. Please enter it below.
            </p>

            <form onSubmit={handleVerify} className="w-full max-w-sm space-y-4">
                <div>
                    <input
                        type="text"
                        maxLength="6"
                        placeholder="000000"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full bg-surface-container border-none text-center rounded-lg p-4 text-3xl tracking-[0.5em] font-mono text-primary placeholder-outline/30 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        required
                    />
                </div>

                {error && <p className="text-error text-xs">{error}</p>}
                {resendMessage && <p className="text-green-600 text-xs">{resendMessage}</p>}

                <button
                    type="submit"
                    disabled={isLoading || otpCode.length !== 6}
                    className="w-full text-white font-bold py-3 mt-2 rounded-lg shadow-lg hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, #003466 0%, #1a4b84 100%)" }}
                >
                    {isLoading ? "Verifying..." : "Verify Code"}
                </button>
            </form>

            <div className="mt-6 flex flex-col gap-2 w-full max-w-sm">
                <button
                    type="button"
                    onClick={handleResend}
                    className="text-primary text-xs font-bold hover:underline"
                >
                    Didn't receive the code? Resend
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-on-surface-variant text-xs mt-2 hover:underline"
                    >
                        Go Back
                    </button>
                )}
            </div>
        </div>
    );
}
