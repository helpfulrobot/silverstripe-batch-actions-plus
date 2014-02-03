/*jslint browser: true, nomen: true,  white: true */

/**
 * 
 */
(function($) {

	'use strict';

	$.entwine('ss.tree', function($){

		$('#Form_BatchActionsForm').entwine({

			Processed: false,

			/**
			 * Function: onsubmit
			 * 
			 * Parameters:
			 *  (Event) e
			 */
			onsubmit: function(e) {
				e.preventDefault();

				var self = this, 
					actionEvent = e,
					type, button, dialog,
					ids = this.getIDs(), 
					tree = this.getTree(),
					id = 'ss-ui-dialog-' + new Date().getTime(),
					selectValue = $('#Form_BatchActionsForm_Action').val();
				
				if(selectValue !== 'admin/pages/batchactions/moveto' || this.getProcessed() === true){
					this.setProcessed(false); //reset
					this._super(e);
				} else {
					// if no nodes are selected, return with an error
					if(!ids || !ids.length) {
						alert(ss.i18n._t('CMSMAIN.SELECTONEPAGE'));
						return false;
					}

					// apply callback, which might modify the IDs
					type = this.find(':input[name=Action]').val();
					if(this.getActions()[type]){
						ids = this.getActions()[type].apply(this, [ids]);
					}
				
					// write (possibly modified) IDs back into to the hidden field
					this.setIDs(ids);

					// Reset failure states
					tree.find('li').removeClass('failed');

					button = this.find(':submit:first');
					button.addClass('loading');

					// Set-up the dialog for the move form (see CMSBatchActions_MoveToController.php)
					dialog = $('#ss-ui-dialog-' + id);

					if(!dialog.length) {
						dialog = $('<div class="ss-ui-dialog" id="' + id + '" />');
						$('body').append(dialog);
					}

					dialog.ssdialog({
						iframeUrl: $('base').attr('href')+'admin/batchmoveto?PageIDs='+this.getIDs(), 
						autoOpen: true, 
						dialogExtraClass: 'batch-actions',
						width: 600,
						height: 320,
						modal:true,
						position: { 
							my: "center", 
							at: "center", 
							of: window 
						}
					});

					dialog.find('iframe').on('load', function(e) {
						var contents = $(this).contents(),
							i = 0,
							cmsTree = $('.cms-tree'),
							close = contents.find('input.close-dialog');

						if(close.length > 0){
							dialog.ssdialog('close');

							// Update visual sitetree
							for (i = 0; i < ids.length; i = i + 1) {
								cmsTree.updateNodesFromServer([ids[i]]);
							}

							//Hack because self._super() doesn't work
							self.setProcessed(true);
							self.trigger('submit');
						}
					});
				}
			}
		});
	});
	
}(jQuery));