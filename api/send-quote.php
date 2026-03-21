<?php

// Get form data
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

// Validate required fields
if (empty($name) || empty($phone) || empty($message)) {
    header('Location: /error.html');
    exit;
}

// Email configuration
$to = 'quotes@twinriversllc.org';
$subject = 'New Fence Quote Request';

// Email body
$body = "New quote request from website\n\n";
$body .= "Name: " . $name . "\n";
$body .= "Phone: " . $phone . "\n";
$body .= "Project: " . $message . "\n";

// Email headers
$headers = "From: noreply@twinriversllc.org\r\n";
$headers .= "Reply-To: " . $phone . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Send email
$success = mail($to, $subject, $body, $headers);

// Redirect
if ($success) {
    header('Location: /thank-you.html');
} else {
    header('Location: /error.html');
}

exit;

?>
