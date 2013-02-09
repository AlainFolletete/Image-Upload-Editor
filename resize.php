<?php

/**
 * The MIT License (MIT)
 * Copyright © 2013 - Alain Folletete
 * @link http://github.com/AlainFolletete
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Step 0: Load image
$imagePath = realpath(dirname(__FILE__).'/'.$_POST['file']);

// Security check
if ($imagePath == false || strpos($imagePath, dirname(__FILE__).'/uploads/') === false) {
	die(json_encode(array(
		'status' => 'KO',
		'error' => 'File not found !'
	)));
}

if (!file_exists($imagePath)) {
	die(json_encode(array(
		'status' => 'KO',
		'error' => 'File not found !'
	)));
}

$hasBeenChanged = false;
$imageInfos = getimagesize($imagePath);
$mime_explode = explode('/', $imageInfos['mime']);
$extension = array_pop($mime_explode);

if ($extension == 'jpg') {
	$extension = 'jpeg';
}

$function = 'imagecreatefrom'.$extension;
if (!function_exists($function)) {
	die(json_encode(array(
		'status' => 'KO',
		'error' => 'Unrecognized format'
	)));
}

$image = $function($imagePath);

// Step 1: Crop image
$cropInfos = $_POST['crop'];
if ($cropInfos['w'] > 0 && $cropInfos['h'] > 0) {
	// Create new image
	$nothing = imagecreatetruecolor($cropInfos['w'], $cropInfos['h']);

	// Copy selection into new image
	imagecopy($nothing, $image, 0, 0, $cropInfos['x'], $cropInfos['y'], $cropInfos['w'], $cropInfos['h']);

	$image = $nothing;

	$hasBeenChanged = true;
}

// Step 2: Rotate
if ($_POST['angle'] > 0 && $_POST['angle'] <= 360) {
	$image = imagerotate($image, abs($_POST['angle'] - 360), 0);

	$hasBeenChanged = true;
}

// Step 3: Save
$function = 'image'.$extension;

if ($hasBeenChanged && !$function($image, $imagePath)) {
	die(json_encode(array(
		'status' => 'KO',
		'error' => 'Cannot save image'
	)));
}

die(json_encode(array(
	'status' => 'OK'
)));
