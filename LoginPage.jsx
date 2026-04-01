/* Container */
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f2fe, #f0f9ff, #eef2ff);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* Box */
.login-box {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  padding: 2.5rem;
  color: #1e293b;
}

/* Header */
.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 2rem;
  font-weight: bold;
  color: #1e293b;
}

.login-subtitle {
  color: #64748b;
}

/* Form */
.form-group {
  margin-bottom: 1.4rem;
}

.form-label {
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
  display: block;
  color: #475569;
}

/* Input */
.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 0.75rem 2.5rem;
  border-radius: 10px;
  border: 1px solid #cbd5f5;
  background: #f8fafc;
  color: #1e293b;
  outline: none;
  transition: 0.3s;
}

.form-input:focus {
  border: 1px solid #3b82f6;
  box-shadow: 0 0 6px rgba(59, 130, 246, 0.4);
  background: white;
}

/* Icons */
.input-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

/* Password toggle */
.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #64748b;
}

/* Error */
.error-text {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 5px;
}

/* Button */
.submit-btn {
  width: 100%;
  padding: 0.9rem;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(0,0,0,0.15);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Spinner */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(0,0,0,0.2);
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Footer */
.login-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
}
