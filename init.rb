ActionView::Base.send(:include, SwfUploadHelper)
ActionController::Base.send(:include, SwfUpload)

ActionView::Helpers::AssetTagHelper.register_javascript_expansion :swf_upload => %w(jsProgressBarHandler swfupload swfupload_plugin)