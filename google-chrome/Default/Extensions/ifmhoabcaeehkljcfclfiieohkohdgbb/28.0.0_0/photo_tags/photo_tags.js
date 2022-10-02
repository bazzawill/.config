X.ready( 'photo_tags', function() {
	FX.add_option('photo_tags', {
		"section": "General"
		, "title": "Show Photo Tags"
		, "description": "Display the descriptive tags (captions) that Facebook automatically puts on photos when you hover over them."
		, "default": false
	});
	FX.on_option('photo_tags', function() {
		FX.on_selector('img[alt^="May be"]', function($img) {
			$img.closest('a').attr('sfx_photo_tags',$img.attr('alt')).addClass('sfx_photo_tags');
		});
	});
});
