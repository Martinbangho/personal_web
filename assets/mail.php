<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $recaptchaSecret = '6LeLuxwrAAAAAD1loiKz31BZ6HZKl_P0GvGVVdkp';
    $recaptchaResponse = isset($_POST['recaptcha_response']) ? $_POST['recaptcha_response'] : '';

    // Debug: log all POST data
    error_log('POST data: ' . print_r($_POST, true));

    // Check if reCAPTCHA response is present
    if (empty($recaptchaResponse)) {
        error_log('reCAPTCHA token missing.');
        header('Location: https://bangho.cz/chyba.html');
        exit;
    }

    // Verify reCAPTCHA v3
    $verifyUrl = "https://www.google.com/recaptcha/api/siteverify";
    $data = [
        'secret' => $recaptchaSecret,
        'response' => $recaptchaResponse,
        'remoteip' => $_SERVER['REMOTE_ADDR']
    ];
    $options = [
        'http' => [
            'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
            'method'  => 'POST',
            'content' => http_build_query($data),
        ]
    ];
    $context  = stream_context_create($options);
    $response = file_get_contents($verifyUrl, false, $context);
    error_log('reCAPTCHA raw response: ' . $response);
    $responseKeys = json_decode($response, true);

    if (!isset($responseKeys['success']) || !$responseKeys['success']) {
        error_log('reCAPTCHA failed: ' . $response);
        header('Location: https://bangho.cz/chyba.html');
        exit;
    }
    if (!isset($responseKeys['score']) || $responseKeys['score'] < 0.5) {
        error_log('reCAPTCHA low score: ' . (isset($responseKeys['score']) ? $responseKeys['score'] : 'N/A'));
        header('Location: https://bangho.cz/chyba.html');
        exit;
    }

    $from = 'martin@bangho.cz';
    $sendTo = 'martin@bangho.cz';
    $subject = 'Kontaktní formulář - WEB';
    $fields = array('fname' => 'Jméno', 'lname' => 'Přijmení', 'email' => 'E-mail', 'message' => 'Zpráva'); 
    $okMessage = 'Tvoje zpráva byla odeslána. Dám vědět hned jak se k mailu dostanu. :)';
    $errorMessage = 'Došlo k chybě, zkus to znovu!';

    error_reporting(0);

    try
    {
        if(count($_POST) == 0) throw new \Exception('Kontaktní formulář není správně vyplněn');

        $emailText = "Nová zpráva z kontaktního formuláře - WEB\n";
        foreach ($_POST as $key => $value) {
            if (isset($fields[$key])) {
                $emailText .= "$fields[$key]: $value\n";
            }
        }

        $headers = array(
            'Content-Type: text/plain; charset="UTF-8";',
            'From: ' . $from,
            'Reply-To: ' . (isset($_POST['email']) ? $_POST['email'] : $from),
            'Return-Path: ' . $from,
        );

        $mailSent = mail($sendTo, $subject, $emailText, implode("\n", $headers));
        if (!$mailSent) {
            error_log('Mail sending failed.');
            throw new \Exception('Mail sending failed.');
        }

        $responseArray = array('type' => 'success', 'message' => $okMessage);
    }
    catch (\Exception $e)
    {
        $responseArray = array('type' => 'danger', 'message' => $errorMessage);
    }

    if ($responseArray['type'] == 'success') {
        // success redirect
        header('Location: https://bangho.cz/odeslano.html');
    }
    else {
        //error redirect
        header('Location: https://bangho.cz/chyba.html');
    }
}
?>
