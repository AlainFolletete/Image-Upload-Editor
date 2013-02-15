/**
 * The MIT License (MIT)
 * Copyright © 2013 - Alain Folletete - v1.0
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

var imageUploadEditor = {
	rotation: 0,
	jcrop_api: null,
	image: null,
	uploader: null,
	bounds: {
		x: null,
		y: null
	},

	conf: {
		reset_crop_button: '#reset-crop',
		rotate_button: '.rotate', // It's a class, many buttons
		send_button: '#send',

		original_block: '#original',
		preview_block: '#preview',

		progress_text: '#progress',

		resize_url: 'resize.php',
		jcrop: {
			onChange: function(coords) { imageUploadEditor.updatePreview(coords); },
			onSelect: function(coords) { imageUploadEditor.updatePreview(coords); }
		},
		uploader: {
			runtimes : 'html5',
			browse_button : 'browse',
			container: 'uploader',
			max_file_size : '10mb',
			url : 'upload.php',
			flash_swf_url : 'js/plupload/plupload.flash.swf',
			multi_selection: false,
			filters : [
				{title : "Image files", extensions : "jpg,gif,png"}
			]
		}
	},

	init: function(conf) {
		this.conf = $.extend({}, this.conf, conf);

		// Override configuration
		for(key in conf) {
			this.conf[key] = conf[key];
		}

		// Init
		this.initUploader();
		this.initTools();
		this.initDom();
	},

	initUploader: function() {
		this.uploader = new plupload.Uploader(this.conf.uploader);

		this.uploader.bind('UploadProgress', function(up, file) {
			$(imageUploadEditor.conf.progress_text).html('In progress... '+file.percent+'%');
		});

		this.uploader.bind('UploadComplete', function(up, file) {
			$(imageUploadEditor.conf.progress_text).html('Transfer complete !');
			$('#'+imageUploadEditor.conf.uploader.browse_button).html('Change file');
		});

		this.uploader.bind('FileUploaded', function(up, file, response) {
			imageUploadEditor.image = $.parseJSON(response.response);

			$(imageUploadEditor.conf.original_block).append($('<img />').attr('src', imageUploadEditor.image.file_uri));
			$('#preview-container').append(
				$('<img />')
					.attr('src', imageUploadEditor.image.file_uri)
					.css('max-width', $(imageUploadEditor.conf.preview_block).width()+'px')
					.css('max-height', $(imageUploadEditor.conf.preview_block).height()+'px')
			);

			// Init Jcrop
			imageUploadEditor.initJcrop();

			// Callback event
			imageUploadEditor.event.uploadComplete();
		});

		this.uploader.bind('QueueChanged', function(up) {
			if (imageUploadEditor.isJcropActive()) {
				imageUploadEditor.resetJcrop();

				$('#preview-container').css('width', '').css('height', '').css('margin', '0');
				$(imageUploadEditor.conf.preview_block+' img').attr('style', '').css('max-width', $(imageUploadEditor.conf.preview_block).width()+'px').css('max-height', $(imageUploadEditor.conf.preview_block).height()+'px');
			}

			imageUploadEditor.uploader.start();
		});

		this.uploader.init();
	},

	initJcrop: function() {
		this.conf.jcrop.trueSize = [this.image.size[0],this.image.size[1]];

		// Initialise jCrop on original image
		$(imageUploadEditor.conf.original_block+' img').Jcrop(this.conf.jcrop, function() {
			imageUploadEditor.jcrop_api = this;
			bounds = imageUploadEditor.jcrop_api.getBounds();
			imageUploadEditor.bounds.x = bounds[0];
			imageUploadEditor.bounds.y = bounds[1];
		});
	},
	isJcropActive: function() {
		return (this.jcrop_api != null);
	},
	resetJcrop: function() {
		this.jcrop_api.destroy();
	},

	initTools: function() {
		// Rotate tools
		$(imageUploadEditor.conf.rotate_button).click(function(e) {
			e.preventDefault();

			// Check direction
			if ($(this).data('direction') == 'left') {
				if (imageUploadEditor.rotation == 0) {
					imageUploadEditor.rotation = 360;
				}
				imageUploadEditor.rotation -= 90;
			}
			else if ($(this).data('direction') == 'right') {
				imageUploadEditor.rotation += 90;
				if (imageUploadEditor.rotation == 360) {
					imageUploadEditor.rotation = 0;
				}
			}
			else if ($(this).data('direction') == 'reset') {
				imageUploadEditor.rotation = 0;
			}

			$(imageUploadEditor.conf.preview_block).css('rotation', imageUploadEditor.rotation+'deg')
				.css('-webkit-transform', 'rotate('+imageUploadEditor.rotation+'deg)')
				.css('-moz-transform', 'rotate('+imageUploadEditor.rotation+'deg)');
		});

		// Reset crop
		$(imageUploadEditor.conf.reset_crop_button).click(function(e) {
			e.preventDefault();

			// Relase crop selection
			imageUploadEditor.jcrop_api.release();

			//
			$(imageUploadEditor.conf.preview_block+' img').attr('style', '').css('max-width', $(imageUploadEditor.conf.preview_block).width()+'px').css('max-height', $(imageUploadEditor.conf.preview_block).height()+'px');
			$('#preview-container').css('width', '').css('height', '').css('margin', '0');
		});

		// Send
		$(imageUploadEditor.conf.send_button).click(function() {
			var selection = imageUploadEditor.jcrop_api.tellSelect();

			$.ajax({
				type: "POST",
				url: imageUploadEditor.conf.resize_url,
				data: {
					crop: {
						x: selection.x,
						x2: selection.x2,
						y: selection.y,
						y2: selection.y2,
						w: selection.w,
						h: selection.h
					},
					angle: imageUploadEditor.rotation,
					file: imageUploadEditor.image.file_uri
				}
			}).done(function( msg ) {
				document.location.href = imageUploadEditor.image.file_uri;
			});

		});
	},

	initDom: function() {
		// Add container in preview box
		$(imageUploadEditor.conf.preview_block).append($('<div></div>').attr('id', 'preview-container'));
	},

	updatePreview: function(coords) {
		if (parseInt(coords.w) > 0 && parseInt(coords.h) > 0) {
			var cropRatio = coords.w / coords.h;

			var innerWidth = cropRatio >= 1 ? $(imageUploadEditor.conf.preview_block).width() : ($(imageUploadEditor.conf.preview_block).width() * cropRatio);
			var innerHeight = cropRatio < 1 ? $(imageUploadEditor.conf.preview_block).height() : ($(imageUploadEditor.conf.preview_block).height() / cropRatio);

			$('#preview-container').css({
				width: Math.ceil(innerWidth) + 'px',
				height: Math.ceil(innerHeight) + 'px',
				marginLeft: ($(imageUploadEditor.conf.preview_block).width() - innerWidth) / 2 + 'px',
				overflow: 'hidden'
			});

			var rx = innerWidth / coords.w;
			var ry = innerHeight / coords.h;

			$(imageUploadEditor.conf.preview_block+' img').css({
				width: Math.round(rx * this.bounds.x) + 'px',
				height: Math.round(ry * this.bounds.y) + 'px',
				marginLeft: '-' + Math.round(rx * coords.x) + 'px',
				marginTop: '-' + Math.round(ry * coords.y) + 'px',
				maxWidth: 'none',
				maxHeight: 'none'
			});

			// Callback
			imageUploadEditor.event.updatePreview();
		}
	},

	bind: function(key, callback) {
		imageUploadEditor.event[key] = callback;
	},

	event: {
		updatePreview: function() {},
		uploadComplete: function() {}
	}
};
