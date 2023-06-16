sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    'use strict';

    return {
        onListNavigationExtension: function(oEvent) {
            var oBindingContext = oEvent.getSource().getBindingContext();
            var oObject = oBindingContext.getObject();
            var sNavigationProperty;
            console.log(oObject)
            switch (oObject.custtype){
                case "BK":
                    sNavigationProperty = "to_Bakery";
                    break;
            }

            if (sNavigationProperty) {
                
                var oExtensionAPI = this.extensionAPI;
                var oNavigationController = oExtensionAPI.getNavigationController();
                var oModel = oBindingContext.getModel();
                var transportOrder = oObject.transportOrder;
                var sPath = "/ZSCM_I_Bakery_L2(transportOrder='"+transportOrder+"')";
                var oTarget = new sap.ui.model.Context(oModel, sPath);
                oNavigationController.navigateInternal(oTarget);
                return true;
                           
            }
            return false;
                
        },  
    };
});