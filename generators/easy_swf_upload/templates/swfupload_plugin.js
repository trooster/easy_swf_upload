var SwfuCookie = {
	set: function(name, value, daysToExpire) {
		var expire = ''
		if (daysToExpire != undefined) {
			var d = new Date()
			d.setTime(d.getTime() + (86400000 * parseFloat(daysToExpire)))
			expire = '; expires=' + d.toGMTString()
		}
		return (document.cookie = escape(name) + '=' + escape(value || '') + expire)
	},
	get: function(name) {
		var cookie = document.cookie.match(new RegExp('(^|;)\\s*' + escape(name) + '=([^;\\s]*)'))
		return (cookie ? unescape(cookie[2]) : null)
	},
	erase: function(name) {
		var cookie = Cookie.get(name) || true
		Cookie.set(name, '', -1)
		return cookie
	},
	accept: function() {
		if (typeof navigator.cookieEnabled == 'boolean') {
			return navigator.cookieEnabled
		}
		Cookie.set('_test', '1')
		return (Cookie.erase('_test') === '1')
	}
}

var total_file_size = 0
var total_uploaded = 0

var FlashUploader = Class.create({
	initialize: function(block, index) {
		this.index = index
		this.swfUploadBlock = block
		this.container = block.down('.uploadContainer')
		this.postParams = new Hash()
		this.postParams.set('authenticity_token', this.swfUploadBlock.down('.token').innerHTML)
		this.postParams.set(this.swfUploadBlock.down('.session_key').innerHTML, this.swfUploadBlock.down('.session_id').innerHTML)

		this.settings = {
			upload_url: this.swfUploadBlock.down('.url').innerHTML,
			post_params: this.postParams.toObject(),
			use_query_string: true,

			file_size_limit: this.swfUploadBlock.down('.fileSizeLimit').innerHTML,
			file_types: this.swfUploadBlock.down('.filetypes').innerHTML,
			file_types_description: "",
			file_upload_limit: 0,

			file_dialog_complete_handler: this.fileDialogComplete.bind(this),
			file_queue_error_handler: this.fileQueueError.bind(this),
			file_queued_handler:this.fileQueued.bind(this),
			upload_start_handler: this.uploadStart.bind(this),
			upload_progress_handler: this.uploadProgress.bind(this),
			upload_error_handler: this.uploadError.bind(this),
			upload_success_handler: this.uploadSuccess.bind(this),
			upload_complete_handler: this.uploadComplete.bind(this),
			button_placeholder_id: this.swfUploadBlock.down('.embedArea').down('div').readAttribute('id'),
			button_width: this.swfUploadBlock.down('.buttonWidth').innerHTML,
			button_height: this.swfUploadBlock.down('.buttonHeight').innerHTML,
			button_image_url: this.swfUploadBlock.down('.buttonImageUrl').innerHTML,
			button_text: '<span class="button">' + this.swfUploadBlock.down('.buttonText').innerHTML + '</span>',
			button_text_style: '.button { '+ this.swfUploadBlock.down('.buttonStyle').innerHTML +' }',
			button_text_top_padding: 0,
			button_text_left_padding: 0,
			button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
			button_cursor: SWFUpload.CURSOR.HAND,
			button_action: (this.swfUploadBlock.down('.singleFile').innerHTML == 'true') ? SWFUpload.BUTTON_ACTION.SELECT_FILE : SWFUpload.BUTTON_ACTION.SELECT_FILES,
			flash_url: "/flash/swfupload.swf",
			debug: false
		}

		this.swfu = new SWFUpload(this.settings)
		this.currentFileIndex = 0
	},

	cancelQueue: function(id) {
	},

	fileDialogComplete: function(filesSelected, filesQueued) {
		window.TotalPB = new JS_BRAMUS.jsProgressBar($('totalUploaded'), 0);
		window.TotalPB.setPercentage(0, true)
		$('totalUploaded').show()
		this.swfu.startUpload()
	},
	
	fileQueueError: function(file, errorCode, message) {
		alert(file.name.escapeHTML() + ': ' + message)
	},
	
	fileQueued: function(file) {
		var template = new Template('<li id="#{id}"><h6>#{title}</h6><span id="#{id}_progress">[ Loading Progress Bar ]</span></li>')
		this.container.insert(template.evaluate({id: this.fileDomId(file), title: file.name.escapeHTML()}))
		eval("window.PB_" + this.fileDomId(file) + " = new JS_BRAMUS.jsProgressBar($('" + this.fileDomId(file) + "_progress'), '0')")
		total_file_size += file.size
	},

	uploadStart: function(file) {
	},

	uploadProgress: function(file, bytesLoaded, bytesTotal) {
		eval("window.PB_" + this.fileDomId(file) + ".setPercentage('" + Math.round(bytesLoaded * 100 / bytesTotal) + "')")
		window.TotalPB.setPercentage(Math.round((total_uploaded + bytesLoaded) * 100 / total_file_size))
	},

	uploadError: function(file, errorCode, message) {
		alert(file.name.escapeHTML() + ': ' + message)
		total_uploaded += file.size
		if (this.swfu.getStats().files_queued > 0) {
			this.swfu.startUpload()
		}
	},
	uploadSuccess: function(file, serverData) {
		this.uploadProgress(file, file.size, file.size)
		total_uploaded += file.size
		$(this.fileDomId(file)).fade({duration: 0.5, afterFinish: function(obj) {
			obj.element.remove()
		}.bind(this)})
		try {
			eval(serverData)
		} catch (e) {
			alert(e)
		}
	},
	uploadComplete: function(file) {
		if (this.swfu.getStats().files_queued > 0) {
			this.swfu.startUpload()
		} else {
			total_file_size = 0
			total_uploaded = 0
			$('totalUploaded').fade({duration: 0.5, afterFinish: function(obj) {
				obj.element.hide()
			}.bind(this)})
		}
	},

	fileDomId: function(file){
		return 'fu_' + this.index + '_file_' + file.index
	}
})
FlashUploader.init = function() {
	$$('.swfUploadArea').each(function(element, index) {
		if (!element.flashUploader) {
			element.flashUploader = new FlashUploader(element, index)
		}
	})
}

Event.observe(window, 'load', function(){
	FlashUploader.init()
})
