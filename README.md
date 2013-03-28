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
            reset_editor_button: '#reset',

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
            },
            txt: {
                in_progress : 'In progress...',
                transfer_complete : 'Transfer complete',
                change_file : 'Change file',
                select_file : 'Select file'
            }
        });
    });

## Event

In order to use a event, you need bind a callback function on this event:

    imageUploadEditor.bind('uploadComplete', function() {
        // My code
    });

### List of events

  - updatePreview: called when preview is updated
  - uploadComplete: when upload of file has been finish
  - imageSaved: after apply modifications on image
  - resetEditor: called when you click on reset editor button
