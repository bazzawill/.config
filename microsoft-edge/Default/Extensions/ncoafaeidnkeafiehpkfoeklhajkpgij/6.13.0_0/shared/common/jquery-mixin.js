!function jQueryMixinIIFE(t){var e=Okta.fn.other.string.stripWhitespace;t.fn.extend({textTrimmed:function(){return e(this.text())},inputFilter:function(t){this.on("input keydown keyup drag",function(){t(this.value)?(this.oldValue=this.value,this.oldSelectionStart=this.selectionStart,this.oldSelectionEnd=this.selectionEnd):this.hasOwnProperty("oldValue")?(this.value=this.oldValue,this.setSelectionRange(this.oldSelectionStart,this.oldSelectionEnd)):this.value=""})}})}($okta);