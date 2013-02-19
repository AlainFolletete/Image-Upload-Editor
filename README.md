# Image Upload Editor

## Introduction

This library combines [Plupload](https://github.com/moxiecode/plupload) and [Jcrop](https://github.com/tapmodo/Jcrop) libraries in order to build a tool allow to upload an image and crop and / or rotate.

## Requirements

  - jQuery
  - PHP

## Demo

Soon !

## Using

    $(function() {
        imageUploadEditor.init({
            reset_crop_button: '#reset-crop',
            rotate_button: '.rotate', // It's a class, many buttons
            send_button: '#send',

            original_block: '#original',
            preview_block: '#preview',

            progress_text: '#progress',

            resize_url: 'resize.php',
            resize_data: {},
            jcrop: {
                keySupport: false,
                onChange: function(coords) { imageUploadEditor.updatePreview(coords); },
                onSelect: function(coords) { imageUploadEditor.updatePreview(coords); },
                onRelease: function() { imageUploadEditor.releaseCrop(); }
            },
            uploader: {
                runtimes : 'html5',
                browse_button : 'browse',
                container: 'uploader',
                max_file_size : '10mb',
                url : 'upload.php',
                multi_selection: false,
                filters : [
                    {title : "Image files", extensions : "jpg,gif,png"}
                ]
            }
        });
    });
