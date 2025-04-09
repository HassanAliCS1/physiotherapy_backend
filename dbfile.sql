CREATE DATABASE IF NOT EXISTS physiotherapy_db;

USE physiotherapy_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    password VARCHAR(255) NOT NULL,
    level INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Feedback Table
CREATE TABLE IF NOT EXISTS users_feedbacks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pain_level INT NOT NULL,
    swelling INT NOT NULL,
    stiffness INT NOT NULL,
    fatigue_level INT NOT NULL, 
    strength_perception INT NOT NULL, 
    functional_improvement INT NOT NULL, 
    exercise_tolerance INT NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User Initial Pain Table
CREATE TABLE IF NOT EXISTS users_initial_pain (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type_of_injury ENUM('shoulder', 'knee') NOT NULL,
    injury_occured ENUM('LESS_THAN_2_WEEKS', 'TWO_WEEKS_TO_1_MONTH', 'ONE_TO_3_MONTHS','THREE_TO_6_MONTHS','SIX_PLUS_MONTHS') NOT NULL,
    diagnosed_by_medical_professional BOOLEAN NOT NULL,
    pain_level INT NOT NULL,
    stiffness INT NOT NULL,
    swelling INT NOT NULL,
    has_pain_during_daily_activities BOOLEAN NOT NULL,
    had_surgery BOOLEAN NOT NULL,
    surgery_date DATE,
    is_get_physiotherapy_before BOOLEAN NOT NULL,
    is_previous_physiotherapy_completed BOOLEAN,
    physiothrtapy_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Users Email Verification Tokens Table
CREATE TABLE IF NOT EXISTS users_email_verification_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Users Forgot Password OTP Table
CREATE TABLE IF NOT EXISTS users_forgot_password_otps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    otp TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Users Scores Table
CREATE TABLE IF NOT EXISTS users_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    score INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);