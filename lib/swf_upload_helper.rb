module SwfUploadHelper
  def swf_upload_area(options)
    session_key = RAILS_GEM_VERSION < "2.3.0" ? ActionController::Base.session[0][:session_key] : ActionController::Base.session_options[:key]
    
    %Q{<div class="swfUploadArea">
        <div class="url" style="display:none">#{options[:url]}</div>
        <div class="token" style="display:none">#{CGI::escape(form_authenticity_token)}</div>
        <div class="session_key" style="display:none">#{CGI::escape(session_key)}</div>
        <div class="session_id" style="display:none">#{cookies[session_key]}</div>
        <div class="filetypes" style="display:none">#{options[:filetypes]}</div>
        <div class="singleFile" style="display:none">#{options[:single_file] ? 'true' : 'false'}</div>
        <div class="buttonText" style="display:none">#{options[:button_text]}</div>        
        <div class="buttonStyle" style="display:none">#{options[:button_style]}</div>
        <div class="buttonImageUrl" style="display:none">#{options[:button_image_url]}</div>
        <div class="buttonWidth" style="display:none">#{options[:button_width] ? options[:button_width] : 180}</div>
        <div class="buttonHeight" style="display:none">#{options[:button_height] ? options[:button_height] : 18}</div>
        <div class="embedArea">
            <div id="swfUploadButton"></div>
        </div>
        <ul class="uploadContainer">
        </ul>
    </div>}
  end
end
