CKEDITOR.plugins.add('ItemInfo',
{
    requires: ['richcombo'], //, 'styles' ],
    init: function (editor) {
        var config = editor.config,
           lang = editor.lang.format;

        // Create style objects for all defined styles.
        editor.ui.addRichCombo('ItemInfo',
           {
               label: "Item Info",
               title: "Item Info",
               voiceLabel: "Insert tokens",
               className: 'cke_format',
               multiSelect: false,

               panel:
               {
                   css: [config.contentsCss, CKEDITOR.getUrl(CKEDITOR.skin.getPath('editor') + 'editor.css')],
                   voiceLabel: lang.panelVoiceLabel
               },

               init: function () {
                   this.startGroup("Item Info");
                   //this.add('value', 'drop_text', 'drop_label');
                   for(var i=0;i<window.glams.ItemInfo.length;i++){
                       this.add('<%#' + window.glams.ItemInfo[i].KeyName + '#%>', window.glams.ItemInfo[i].KeyName, window.glams.ItemInfo[i].KeyName);
                   }                       
               },

               onClick: function (value) {
                   editor.focus();
                   editor.fire('saveSnapshot');
                   editor.insertHtml(value);
                   editor.fire('saveSnapshot');
               }
           });
    }
});